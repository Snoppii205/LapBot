import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  AI_HUMAN_WAIT_MAX_SEC,
  AI_HUMAN_WAIT_MIN_SEC,
  AI_MAX_TOKENS_MAX,
  AI_MAX_TOKENS_MIN,
  AI_TURN_TIMEOUT_MAX_MS,
  AI_TURN_TIMEOUT_MIN_MS,
  adminAuditActions,
  adminAuditEntityTypes
} from '@lapbot/contracts';
import { catalogImageUrl } from '../../web/src/lib/catalog-image.js';

process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';

test('catalogImageUrl allows trusted HTTPS, local catalog images, admin uploads and static assets while blocking unsafe URLs', () => {
  assert.equal(
    catalogImageUrl('https://cdn.example.com/laptop.jpg'),
    'https://cdn.example.com/laptop.jpg'
  );
  assert.equal(
    catalogImageUrl('/api/v1/catalog/images/1/acer.jpg'),
    '/api/v1/catalog/images/1/acer.jpg'
  );
  assert.equal(
    catalogImageUrl('/api/v1/catalog/uploads/fe1868c4-d19c-4dbc-89b1-795ad7f946b9.png'),
    '/api/v1/catalog/uploads/fe1868c4-d19c-4dbc-89b1-795ad7f946b9.png'
  );
  assert.equal(
    catalogImageUrl('/assets/retro-os/lapbot-copilot-mascot.jpg'),
    '/assets/retro-os/lapbot-copilot-mascot.jpg'
  );

  assert.equal(catalogImageUrl('http://insecure.example.com/a.jpg'), null);
  assert.equal(catalogImageUrl('javascript:alert(1)'), null);
  assert.equal(catalogImageUrl('//evil.example.com/a.jpg'), null);
  assert.equal(catalogImageUrl('/api/v1/admin/secret'), null);
  assert.equal(catalogImageUrl(''), null);
  assert.equal(catalogImageUrl(null), null);
});

test('uploadAdminImage validates magic bytes (PNG/JPEG/WebP), serves via /catalog/uploads/:filename, and blocks spoofing & traversal', async t => {
  const { UPLOADS_DIR, uploadAdminImage } = await import('../src/modules/admin/images.js');
  const { createApp } = await import('../src/app.js');

  const createdFiles: string[] = [];
  const app = createApp();
  await app.ready();

  t.after(async () => {
    await app.close();
    for (const filename of createdFiles) {
      await rm(join(UPLOADS_DIR, filename), { force: true });
    }
  });

  // Minimal valid magic-byte payloads (>= 12 bytes)
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
  ]);
  const validJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9
  ]);
  const validWebp = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x10, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii')
  ]);

  const adminId = randomUUID();

  const pngRes = await uploadAdminImage(adminId, {
    filename: 'front-cover.png',
    mime_type: 'image/png',
    data_base64: `data:image/png;base64,${validPng.toString('base64')}`
  });
  createdFiles.push(pngRes.filename);
  assert.match(pngRes.url, /^\/api\/v1\/catalog\/uploads\/[0-9a-f-]{36}\.png$/);
  assert.equal(pngRes.size_bytes, validPng.length);

  const jpgRes = await uploadAdminImage(adminId, {
    filename: 'angle.jpg',
    mime_type: 'image/jpeg',
    data_base64: validJpeg.toString('base64')
  });
  createdFiles.push(jpgRes.filename);
  assert.match(jpgRes.url, /^\/api\/v1\/catalog\/uploads\/[0-9a-f-]{36}\.jpg$/);

  const webpRes = await uploadAdminImage(adminId, {
    filename: 'detail.webp',
    mime_type: 'image/webp',
    data_base64: validWebp.toString('base64')
  });
  createdFiles.push(webpRes.filename);
  assert.match(webpRes.url, /^\/api\/v1\/catalog\/uploads\/[0-9a-f-]{36}\.webp$/);

  // Verify GET /api/v1/catalog/uploads/:filename serves exact binary with proper MIME & caching
  const servedPng = await app.inject({ method: 'GET', url: pngRes.url });
  assert.equal(servedPng.statusCode, 200);
  assert.equal(servedPng.headers['content-type'], 'image/png');
  assert.equal(servedPng.headers['cache-control'], 'public, max-age=86400, immutable');
  assert.deepEqual(servedPng.rawPayload, validPng);

  const servedWebp = await app.inject({ method: 'GET', url: webpRes.url });
  assert.equal(servedWebp.statusCode, 200);
  assert.equal(servedWebp.headers['content-type'], 'image/webp');

  // Reject spoofed HTML/SVG disguised as PNG
  const spoofedHtml = Buffer.from('<script>alert("xss")</script>padding-bytes');
  await assert.rejects(
    uploadAdminImage(adminId, {
      filename: 'evil.png',
      mime_type: 'image/png',
      data_base64: spoofedHtml.toString('base64')
    }),
    { code: 'INVALID_IMAGE' }
  );

  // Reject mismatched declared MIME vs actual magic bytes (PNG bytes declared as JPEG)
  await assert.rejects(
    uploadAdminImage(adminId, {
      filename: 'mismatch.jpg',
      mime_type: 'image/jpeg',
      data_base64: validPng.toString('base64')
    }),
    { code: 'INVALID_IMAGE' }
  );

  // Reject traversal & non-UUID filenames on upload static route
  for (const badName of [
    '../package.json',
    '..%2Fsecret.png',
    'not-a-uuid.png',
    `${randomUUID()}.svg`
  ]) {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/catalog/uploads/${badName}`
    });
    assert.equal(res.statusCode, 404);
  }
});

test('bodyless DELETE enforces PUBLIC_ORIGIN without requiring Content-Type: application/json, while POST/PATCH still enforce JSON', async () => {
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();
    const targetId = 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9';

    // Forged origin on DELETE -> 403 FORBIDDEN_ORIGIN
    const badOrigin = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/catalog/laptops/${targetId}`,
      headers: { origin: 'https://evil.example' }
    });
    assert.equal(badOrigin.statusCode, 403);

    // Valid origin on bodyless DELETE without Content-Type -> passes Content-Type hook, reaches adminSession -> 401
    const noContentTypeDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/catalog/laptops/${targetId}`,
      headers: { origin: 'http://localhost:5173' }
    });
    assert.equal(noContentTypeDelete.statusCode, 401);

    // POST without Content-Type: application/json -> still 400 INVALID_CONTENT_TYPE
    const postWithoutJson = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/catalog/laptops',
      headers: { origin: 'http://localhost:5173', 'content-type': 'text/plain' },
      payload: 'plain'
    });
    assert.equal(postWithoutJson.statusCode, 400);
    assert.equal(JSON.parse(postWithoutJson.payload).error.code, 'INVALID_CONTENT_TYPE');
  } finally {
    await app.close();
  }
});

test('admin AI config & variant patch routes enforce DB-aligned bounds and strict schemas', async () => {
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();

    assert.equal(AI_MAX_TOKENS_MIN, 128);
    assert.equal(AI_MAX_TOKENS_MAX, 4096);
    assert.equal(AI_TURN_TIMEOUT_MIN_MS, 10000);
    assert.equal(AI_TURN_TIMEOUT_MAX_MS, 60000);
    assert.equal(AI_HUMAN_WAIT_MIN_SEC, 30);
    assert.equal(AI_HUMAN_WAIT_MAX_SEC, 600);

    // Out-of-bounds max_tokens_per_call (8192 > 4096) must be rejected with 400 before auth/DB
    const outOfRangeTokens = await app.inject({
      method: 'PATCH',
      url: '/api/v1/admin/ai/config',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: { max_tokens_per_call: 8192 }
    });
    assert.equal(outOfRangeTokens.statusCode, 400);

    // Out-of-bounds turn_timeout_ms (1000 < 10000) must be rejected with 400
    const outOfRangeTimeout = await app.inject({
      method: 'PATCH',
      url: '/api/v1/admin/ai/config',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: { turn_timeout_ms: 1000 }
    });
    assert.equal(outOfRangeTimeout.statusCode, 400);

    // Valid variant patch payload (including sku, laptop_id, stock_verified) passes schema validation -> reaches auth (401)
    const validVariantPatch = await app.inject({
      method: 'PATCH',
      url: '/api/v1/admin/catalog/variants/fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        expected_revision: 1,
        sku: 'ASUS-TUF-2026-NEW',
        laptop_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
        stock_verified: true
      }
    });
    assert.equal(validVariantPatch.statusCode, 401);

    // Undeclared property on variant patch -> 400
    const extraVariantProp = await app.inject({
      method: 'PATCH',
      url: '/api/v1/admin/catalog/variants/fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: { expected_revision: 1, injected_field: true }
    });
    assert.equal(extraVariantProp.statusCode, 400);

    // Audit constants cover real backend entity types & actions
    assert.ok(adminAuditEntityTypes.includes('LAPTOP'));
    assert.ok(adminAuditEntityTypes.includes('VARIANT'));
    assert.ok(adminAuditEntityTypes.includes('CHAT_SESSION'));
    assert.ok(adminAuditActions.includes('LAPTOP_DELETE'));
    assert.ok(adminAuditActions.includes('LAPTOP_ARCHIVE'));
    assert.ok(adminAuditActions.includes('IMAGE_UPLOAD'));
    assert.ok(adminAuditActions.includes('STAFF_PASSWORD_CHANGE'));
    assert.ok(adminAuditActions.includes('ORDER_TRANSITION'));
  } finally {
    await app.close();
  }
});

test('parseIsoDateParam and admin order/chat/audit routes validate date filters, operational notes, and widget attachments', async () => {
  const { parseIsoDateParam } = await import('../src/modules/admin/orders.js');
  const { createApp } = await import('../src/app.js');

  assert.equal(parseIsoDateParam(undefined, 'from'), undefined);
  assert.equal(parseIsoDateParam('   ', 'from'), undefined);
  assert.equal(parseIsoDateParam('2026-11-12', 'from'), '2026-11-12');
  assert.throws(() => parseIsoDateParam('12/11/2026', 'from'), { code: 'INVALID_QUERY' });
  assert.throws(() => parseIsoDateParam('2026-13-45', 'to'), { code: 'INVALID_QUERY' });

  const app = createApp();
  try {
    await app.ready();
    const sampleId = 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9';

    // Valid transition payload with note passes schema validation -> reaches auth (401)
    const validTransition = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${sampleId}/transition`,
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        from_status: 'SHIPPING',
        to_status: 'CANCELLED',
        note: 'Khách hẹn giao lại tuần sau, hoàn kho máy nguyên seal.'
      }
    });
    assert.equal(validTransition.statusCode, 401);

    // Transition note exceeding maxLength (500) -> 400 schema rejection
    const tooLongNote = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${sampleId}/transition`,
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        from_status: 'SHIPPING',
        to_status: 'CANCELLED',
        note: 'x'.repeat(501)
      }
    });
    assert.equal(tooLongNote.statusCode, 400);

    // Valid agent message with SKU widget attachment passes schema validation -> reaches auth (401)
    const validWidgetMsg = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/chat/${sampleId}/messages`,
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        client_message_id: sampleId,
        message: 'Em gửi anh phiếu đặt COD mẫu này nhé!',
        attach_variant_id: sampleId,
        widget_type: 'address_form'
      }
    });
    assert.equal(validWidgetMsg.statusCode, 401);

    // Invalid widget_type on agent message -> 400 schema rejection
    const invalidWidgetMsg = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/chat/${sampleId}/messages`,
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        client_message_id: sampleId,
        message: 'Test',
        attach_variant_id: sampleId,
        widget_type: 'evil_widget'
      }
    });
    assert.equal(invalidWidgetMsg.statusCode, 400);
  } finally {
    await app.close();
  }
});

test('admin catalog bulk-patch, catalog meta, CRM 360, guest promotion, and staff session revoke enforce strict schemas and audit constants', async () => {
  const { createApp } = await import('../src/app.js');

  for (const action of [
    'VARIANT_BULK_PATCH',
    'STAFF_SESSION_REVOKE',
    'CUSTOMER_CREATE',
    'CUSTOMER_PASSWORD_RESET',
    'CUSTOMER_LINK_ORDERS',
    'GUEST_PROMOTE_MEMBER',
    'CHAT_SESSION_CLEAN',
    'CHAT_SESSIONS_BULK_CLEAN'
  ] as const) {
    assert.ok(adminAuditActions.includes(action), `Missing audit action ${action}`);
  }

  const app = createApp();
  try {
    await app.ready();
    const sampleId = 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9';
    const headers = { origin: 'http://localhost:5173', 'content-type': 'application/json' };

    // GET /api/v1/admin/catalog/meta reaches adminSession -> 401
    const metaRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/catalog/meta'
    });
    assert.equal(metaRes.statusCode, 401);

    // POST /api/v1/admin/catalog/variants/bulk-patch: valid payload -> 401; invalid action or extra field -> 400
    const validBulk = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/catalog/variants/bulk-patch',
      headers,
      payload: {
        variant_ids: [sampleId],
        action: 'adjust_price_pct',
        value: -5
      }
    });
    assert.equal(validBulk.statusCode, 401);

    const invalidBulkAction = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/catalog/variants/bulk-patch',
      headers,
      payload: {
        variant_ids: [sampleId],
        action: 'drop_all_tables'
      }
    });
    assert.equal(invalidBulkAction.statusCode, 400);

    const emptyBulkIds = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/catalog/variants/bulk-patch',
      headers,
      payload: {
        variant_ids: [],
        action: 'verify_stock'
      }
    });
    assert.equal(emptyBulkIds.statusCode, 400);

    // POST /api/v1/admin/customers: valid -> 401; short password or undeclared field -> 400
    const validCreateCust = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/customers',
      headers,
      payload: {
        email: 'vip@example.com',
        full_name: 'Nguyen Thi B',
        phone: '0912345678',
        password: 'Password123!',
        customer_tag: 'VIP',
        link_guest_orders: true
      }
    });
    assert.equal(validCreateCust.statusCode, 401);

    const badCreateCust = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/customers',
      headers,
      payload: {
        email: 'vip@example.com',
        full_name: 'Nguyen Thi B',
        password: '123',
        is_super_admin: true
      }
    });
    assert.equal(badCreateCust.statusCode, 400);

    // PATCH /api/v1/admin/customers/:id: valid -> 401; invalid customer_tag or extra field -> 400
    const validPatchCust = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/customers/${sampleId}`,
      headers,
      payload: {
        customer_tag: 'WATCHLIST',
        admin_note: 'Đang chờ kiểm tra bảo hành bàn phím',
        link_phone_orders: true
      }
    });
    assert.equal(validPatchCust.statusCode, 401);

    const invalidPatchCust = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/customers/${sampleId}`,
      headers,
      payload: {
        customer_tag: 'UNKNOWN_TAG'
      }
    });
    assert.equal(invalidPatchCust.statusCode, 400);

    // GET /api/v1/admin/customers/guests -> reaches adminSession (401)
    const guestsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/customers/guests?filter=high_cancel&sort=cancelled_desc&limit=25'
    });
    assert.equal(guestsRes.statusCode, 401);

    // POST /api/v1/admin/customers/guests/promote: valid -> 401; extra prop -> 400
    const validPromote = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/customers/guests/promote',
      headers,
      payload: {
        phone: '0987654321',
        email: 'guest.promoted@example.com',
        password: 'SecurePassword123',
        customer_tag: 'CORPORATE'
      }
    });
    assert.equal(validPromote.statusCode, 401);

    const invalidPromote = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/customers/guests/promote',
      headers,
      payload: {
        phone: '0987654321',
        email: 'guest.promoted@example.com',
        password: 'SecurePassword123',
        injected: 1
      }
    });
    assert.equal(invalidPromote.statusCode, 400);

    // POST /api/v1/admin/staff/:id/revoke-sessions (empty JSON body POST with valid origin -> 401; forged origin -> 403)
    const validRevoke = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/staff/${sampleId}/revoke-sessions`,
      headers,
      payload: {}
    });
    assert.equal(validRevoke.statusCode, 401);

    const forgedRevoke = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/staff/${sampleId}/revoke-sessions`,
      headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      payload: {}
    });
    assert.equal(forgedRevoke.statusCode, 403);

    // DELETE /api/v1/admin/chat/:id (valid origin -> 401; forged origin -> 403)
    const validChatDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/chat/${sampleId}`,
      headers: { origin: 'http://localhost:5173' }
    });
    assert.equal(validChatDelete.statusCode, 401);

    const forgedChatDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/chat/${sampleId}`,
      headers: { origin: 'https://evil.example' }
    });
    assert.equal(forgedChatDelete.statusCode, 403);

    // POST /api/v1/admin/chat/cleanup (valid scope -> 401; invalid scope -> 400)
    const validBulkCleanup = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/chat/cleanup',
      headers,
      payload: { scope: 'empty_or_expired' }
    });
    assert.equal(validBulkCleanup.statusCode, 401);

    const invalidBulkCleanup = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/chat/cleanup',
      headers,
      payload: { scope: 'delete_everything' }
    });
    assert.equal(invalidBulkCleanup.statusCode, 400);
  } finally {
    await app.close();
  }
});
