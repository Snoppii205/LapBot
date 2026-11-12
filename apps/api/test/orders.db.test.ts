import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Set TEST_DATABASE_URL to a migrated disposable PostgreSQL database.');
}
process.env.DATABASE_URL = databaseUrl;

const { pool } = await import('../src/db/pool.js');
const { listVariants } = await import('../src/modules/catalog/service.js');
const { previewOrder, confirmOrder, cancelOrder, getOrder } = await import(
  '../src/modules/orders/service.js'
);
const {
  bulkPatchVariants,
  createCatalog,
  deleteCatalog,
  getAdminCatalogMeta,
  listAdminCatalog,
  patchCatalog,
  updateLaptopImages
} = await import('../src/modules/admin/catalog.js');
const { getCustomer, listCustomers, listGuestBuyers, patchCustomer, promoteGuestToCustomer } =
  await import('../src/modules/admin/customers.js');
const { revokeStaffSessions } = await import('../src/modules/admin/staff.js');
const { getStoreSettings, updateStoreSettings } = await import('../src/modules/admin/settings.js');
const { getAiConfig, updateAiConfig } = await import('../src/modules/admin/ai.js');
const { transitionOrder, adminOrders } = await import('../src/modules/admin/orders.js');
const { adminChatSessions, sendAgentMessage } = await import('../src/modules/admin/chat.js');
const { getDashboardStats } = await import('../src/modules/admin/dashboard.js');
const { createTurn } = await import('../src/modules/chat/repository.js');
const { requestHuman, claimChat, releaseChat } = await import('../src/modules/chat/control.js');

test('real PostgreSQL enforces stock, idempotency, ownership, price and revision', async t => {
  const laptop = await pool.query(
    `INSERT INTO laptops(brand, model_name) VALUES ($1, $2) RETURNING id`,
    ['Test', 'Concurrent SKU']
  );
  const laptopId = laptop.rows[0].id as string;

  const variant = await pool.query(
    `INSERT INTO laptop_variants(laptop_id, sku, cpu, gpu, ram_gb, ssd_gb, screen, color, usage_category, price_vnd, stock, stock_verified)
     VALUES ($1, $2, 'CPU', 'GPU', 16, 512, '15 inch', 'Black', 'office_study', 10000000, 1, true)
     RETURNING id`,
    [laptopId, `TEST-${randomUUID()}`]
  );
  const variantId = variant.rows[0].id as string;

  const sessionIds: string[] = [];
  for (let i = 0; i < 2; i++) {
    const result = await pool.query(
      `INSERT INTO chat_sessions(guest_token_hash, expires_at)
       VALUES ($1, now() + interval '30 days') RETURNING id`,
      [randomBytes(32).toString('hex')]
    );
    sessionIds.push(result.rows[0].id);
  }

  const admin = await pool.query(
    'INSERT INTO admin_users(username, password_hash) VALUES ($1, $2) RETURNING id',
    [`test-${randomUUID()}`, 'test-only']
  );
  const adminId = admin.rows[0].id as string;

  const extraLaptopIds: string[] = [];
  const extraCustomerIds: string[] = [];
  const extraAdminIds: string[] = [];

  t.after(async () => {
    if (extraCustomerIds.length > 0) {
      await pool.query('UPDATE orders SET customer_id = NULL WHERE customer_id = ANY($1::uuid[])', [
        extraCustomerIds
      ]);
      await pool.query(
        'UPDATE chat_sessions SET customer_id = NULL WHERE customer_id = ANY($1::uuid[])',
        [extraCustomerIds]
      );
    }
    await pool.query(
      'UPDATE chat_sessions SET active_preview_id = NULL, last_order_id = NULL WHERE id = ANY($1::uuid[])',
      [sessionIds]
    );
    await pool.query(
      `UPDATE chat_sessions SET active_preview_id = NULL, last_order_id = NULL
       WHERE active_preview_id IN (SELECT id FROM orders WHERE variant_id IN (SELECT id FROM laptop_variants WHERE sku LIKE 'TEST-%'))
          OR last_order_id IN (SELECT id FROM orders WHERE variant_id IN (SELECT id FROM laptop_variants WHERE sku LIKE 'TEST-%'))`
    );
    await pool.query(
      'DELETE FROM audit_events WHERE entity_id = $1 OR entity_id = ANY($2::uuid[]) OR actor_id = ANY($2::uuid[]) OR actor_id = $3',
      [variantId, sessionIds, adminId]
    );
    if (extraCustomerIds.length > 0) {
      await pool.query('DELETE FROM audit_events WHERE entity_id = ANY($1::uuid[])', [
        extraCustomerIds
      ]);
      await pool.query('DELETE FROM customer_sessions WHERE customer_id = ANY($1::uuid[])', [
        extraCustomerIds
      ]);
      await pool.query('DELETE FROM customers WHERE id = ANY($1::uuid[])', [extraCustomerIds]);
    }
    if (extraAdminIds.length > 0) {
      await pool.query(
        'DELETE FROM audit_events WHERE entity_id = ANY($1::uuid[]) OR actor_id = ANY($1::uuid[])',
        [extraAdminIds]
      );
      await pool.query('DELETE FROM admin_sessions WHERE admin_id = ANY($1::uuid[])', [
        extraAdminIds
      ]);
      await pool.query('DELETE FROM admin_users WHERE id = ANY($1::uuid[])', [extraAdminIds]);
    }
    await pool.query('DELETE FROM chat_messages WHERE session_id = ANY($1::uuid[])', [sessionIds]);
    await pool.query(
      `DELETE FROM chat_messages WHERE turn_id IN (SELECT id FROM chat_turns WHERE request_hash = 'hash-ai-off-test')`
    );
    await pool.query('DELETE FROM chat_turns WHERE session_id = ANY($1::uuid[])', [sessionIds]);
    await pool.query(`DELETE FROM chat_turns WHERE request_hash = 'hash-ai-off-test'`);
    await pool.query('DELETE FROM orders WHERE session_id = ANY($1::uuid[])', [sessionIds]);
    await pool.query(
      `DELETE FROM orders WHERE variant_id IN (SELECT id FROM laptop_variants WHERE sku LIKE 'TEST-%')`
    );
    await pool.query('DELETE FROM chat_sessions WHERE id = ANY($1::uuid[])', [sessionIds]);

    if (extraLaptopIds.length > 0) {
      await pool.query('DELETE FROM laptop_images WHERE laptop_id = ANY($1::uuid[])', [
        extraLaptopIds
      ]);
      await pool.query('DELETE FROM laptop_variants WHERE laptop_id = ANY($1::uuid[])', [
        extraLaptopIds
      ]);
      await pool.query('DELETE FROM laptops WHERE id = ANY($1::uuid[])', [extraLaptopIds]);
    }
    await pool.query(`DELETE FROM laptop_variants WHERE sku LIKE 'CRUD-%' OR sku LIKE 'TEST-%'`);
    await pool.query(
      `DELETE FROM laptops WHERE (brand = 'TestBrand' AND model_name = 'Model X') OR (brand = 'Test' AND model_name = 'Concurrent SKU')`
    );
    await pool.query('DELETE FROM laptop_variants WHERE id = $1', [variantId]);
    await pool.query('DELETE FROM laptops WHERE id = $1', [laptopId]);

    await pool.query(
      `UPDATE store_settings SET updated_by = NULL WHERE updated_by = $1 OR updated_by IN (SELECT id FROM admin_users WHERE username LIKE 'test-%' AND password_hash = 'test-only')`,
      [adminId]
    );
    await pool.query(
      `UPDATE ai_settings SET updated_by = NULL WHERE updated_by = $1 OR updated_by IN (SELECT id FROM admin_users WHERE username LIKE 'test-%' AND password_hash = 'test-only')`,
      [adminId]
    );
    await pool.query(
      `DELETE FROM chat_messages WHERE sender_admin_id = $1 OR sender_admin_id IN (SELECT id FROM admin_users WHERE username LIKE 'test-%' AND password_hash = 'test-only')`,
      [adminId]
    );
    await pool.query(
      `UPDATE chat_sessions SET control_mode = 'AI', assigned_admin_id = NULL WHERE assigned_admin_id = $1 OR assigned_admin_id IN (SELECT id FROM admin_users WHERE username LIKE 'test-%' AND password_hash = 'test-only')`,
      [adminId]
    );
    await pool.query('DELETE FROM admin_users WHERE id = $1', [adminId]);
    await pool.query(
      `DELETE FROM admin_users WHERE username LIKE 'test-%' AND password_hash = 'test-only'`
    );
    await pool.end();
  });

  const makeInput = () => ({
    client_request_id: randomUUID(),
    variant_id: variantId,
    customer_name: 'Nguyen Van A',
    customer_phone: '0912345678',
    shipping_address: '123 Nguyen Trai, Phuong Thuong Dinh, Ha Noi'
  });

  // 1. Concurrent confirmation on stock = 1: exactly one wins
  const a = await previewOrder(sessionIds[0]!, makeInput());
  const b = await previewOrder(sessionIds[1]!, makeInput());
  const outcomes = await Promise.allSettled([
    confirmOrder(a.order.order_id, sessionIds[0]!),
    confirmOrder(b.order.order_id, sessionIds[1]!)
  ]);
  assert.equal(outcomes.filter(value => value.status === 'fulfilled').length, 1);
  assert.equal(outcomes.filter(value => value.status === 'rejected').length, 1);

  const winner = outcomes[0].status === 'fulfilled' ? a : b;
  const winnerSession = outcomes[0].status === 'fulfilled' ? sessionIds[0]! : sessionIds[1]!;
  const loserSession = winnerSession === sessionIds[0] ? sessionIds[1]! : sessionIds[0]!;

  // 2. Idempotent confirm & cancel, strict session ownership, atomic stock restore
  for (let i = 0; i < 3; i++) {
    assert.equal(
      (await confirmOrder(winner.order.order_id, winnerSession)).status,
      'CONFIRMED_COD'
    );
  }
  assert.equal(
    (await pool.query('SELECT stock FROM laptop_variants WHERE id = $1', [variantId])).rows[0]
      .stock,
    0
  );
  await assert.rejects(getOrder(winner.order.order_id, loserSession));

  for (let i = 0; i < 3; i++) {
    assert.equal((await cancelOrder(winner.order.order_id, winnerSession)).status, 'CANCELLED');
  }
  assert.equal(
    (await pool.query('SELECT stock FROM laptop_variants WHERE id = $1', [variantId])).rows[0]
      .stock,
    1
  );

  // 3. Single active preview per session + price change & revision conflict checks
  const oldPreview = await previewOrder(sessionIds[0]!, makeInput());
  const newerInput = makeInput();
  const newerPreview = await previewOrder(sessionIds[0]!, newerInput);
  await assert.rejects(confirmOrder(oldPreview.order.order_id, sessionIds[0]!));
  assert.equal((await previewOrder(sessionIds[0]!, newerInput)).created, false);
  assert.equal(
    (await getOrder(newerPreview.order.order_id, sessionIds[0]!)).status,
    'PENDING_CONFIRMATION'
  );

  const quoted = await previewOrder(sessionIds[1]!, makeInput());
  await pool.query('UPDATE laptop_variants SET price_vnd = 11000000 WHERE id = $1', [variantId]);
  await assert.rejects(confirmOrder(quoted.order.order_id, sessionIds[1]!), {
    code: 'PRICE_CHANGED'
  });
  await assert.rejects(patchCatalog('variants', variantId, 1, { stock: 10 }, randomUUID()), {
    code: 'REVISION_CONFLICT'
  });

  // 4. HITL chat control transitions & version monotonicity
  const waiting = await requestHuman(sessionIds[0]!, 1);
  assert.equal(waiting.control_version, 2);
  assert.equal((await requestHuman(sessionIds[0]!, 1)).control_version, 2);

  const claimed = await claimChat(sessionIds[0]!, 2, adminId);
  assert.equal(claimed.control_mode, 'AGENT');
  assert.equal((await claimChat(sessionIds[0]!, 2, adminId)).control_version, 3);
  assert.equal((await releaseChat(sessionIds[0]!, 3, adminId)).control_mode, 'AI');

  // 5. Admin Product CRUD: createCatalog stock_verified default, duplicate SKU 409, image sync, and safe delete vs archive
  const createdLaptop = (await createCatalog(
    'laptops',
    { brand: 'TestBrand', model_name: 'Model X', image_url: '/api/v1/catalog/images/1/acer.jpg' },
    adminId
  )) as { id: string; revision: number };
  extraLaptopIds.push(createdLaptop.id);

  const dupSku = `CRUD-${randomUUID()}`;
  const createdVariant = (await createCatalog(
    'variants',
    {
      laptop_id: createdLaptop.id,
      sku: dupSku,
      cpu: 'Core Ultra 7',
      gpu: 'RTX 4060',
      ram_gb: 16,
      ssd_gb: 512,
      screen: '16 inch',
      color: 'Silver',
      usage_category: 'programming',
      price_vnd: 25000000,
      stock: 3
    },
    adminId
  )) as { id: string; stock_verified: boolean; revision: number };
  assert.equal(createdVariant.stock_verified, true);

  await assert.rejects(
    createCatalog(
      'variants',
      {
        laptop_id: createdLaptop.id,
        sku: dupSku,
        cpu: 'Core Ultra 7',
        gpu: 'RTX 4060',
        ram_gb: 16,
        ssd_gb: 512,
        screen: '16 inch',
        color: 'Silver',
        usage_category: 'programming',
        price_vnd: 25000000,
        stock: 1
      },
      adminId
    ),
    { code: 'SKU_EXISTS' }
  );

  const imgSync = await updateLaptopImages(
    createdLaptop.id,
    [{ image_url: '/api/v1/catalog/images/1/acer.jpg', caption: 'Front' }],
    adminId
  );
  assert.equal(imgSync.revision, createdLaptop.revision + 1);

  // Hard delete succeeds when 0 orders reference the laptop/SKU
  const hardDeleted = await deleteCatalog('laptops', createdLaptop.id, adminId);
  assert.equal(hardDeleted.mode, 'deleted');

  // Soft archive occurs when variant has historical orders (variantId has orders from steps 1-3)
  const softArchived = await deleteCatalog('variants', variantId, adminId);
  assert.equal(softArchived.mode, 'archived');

  // 6. Store settings & AI config audit logging without UUID cast crash, and AI-off auto-escalation
  const prevSettings = await getStoreSettings();
  const prevAi = await getAiConfig();
  await updateStoreSettings(adminId, { support_hours: prevSettings.support_hours });
  await updateAiConfig(adminId, { max_tokens_per_call: prevAi.max_tokens_per_call });

  const forwarded = await createTurn(
    sessionIds[0]!,
    randomUUID(),
    'hash-ai-off-test',
    'Cho mình gặp nhân viên nhé',
    null,
    true
  );
  assert.equal(forwarded.turn.status, 'FORWARDED');

  // 7. Admin Order Lifecycle (CONFIRMED_COD -> PROCESSING -> SHIPPING -> CANCELLED restores stock + 1 & records timeline note)
  await pool.query(
    'UPDATE laptop_variants SET is_active = true, stock = 2, stock_verified = true WHERE id = $1',
    [variantId]
  );
  const shipQuote = await previewOrder(sessionIds[0]!, makeInput());
  const shipConfirmed = await confirmOrder(shipQuote.order.order_id, sessionIds[0]!);
  assert.equal(shipConfirmed.status, 'CONFIRMED_COD');
  assert.equal(
    (await pool.query('SELECT stock FROM laptop_variants WHERE id = $1', [variantId])).rows[0]
      .stock,
    1
  );

  await transitionOrder(
    shipConfirmed.order_id,
    'CONFIRMED_COD',
    'PROCESSING',
    adminId,
    'Đã kiểm phần cứng 15 bước'
  );
  await transitionOrder(
    shipConfirmed.order_id,
    'PROCESSING',
    'SHIPPING',
    adminId,
    'Bàn giao ViettelPost'
  );
  const failedDelivery = await transitionOrder(
    shipConfirmed.order_id,
    'SHIPPING',
    'CANCELLED',
    adminId,
    'Khách đi công tác không nhận kịp, hoàn kho nguyên seal'
  );
  assert.equal(failedDelivery.status, 'CANCELLED');
  assert.ok(failedDelivery.cancelled_at);
  assert.equal(
    (await pool.query('SELECT stock FROM laptop_variants WHERE id = $1', [variantId])).rows[0]
      .stock,
    2
  );
  assert.ok(
    (failedDelivery.timeline ?? []).some(ev => ev.metadata.note === 'Bàn giao ViettelPost')
  );

  const dbToday = (await pool.query<{ d: string }>('SELECT CURRENT_DATE::text AS d')).rows[0]!.d;
  const filteredOrders = await adminOrders(
    'CANCELLED',
    20,
    undefined,
    shipConfirmed.order_code,
    dbToday,
    dbToday
  );
  assert.equal(filteredOrders.items.length, 1);

  // 8. Admin HITL Chat: counts_by_mode + agent SKU/COD widget push
  const sessionList = await adminChatSessions(
    undefined,
    20,
    undefined,
    undefined,
    sessionIds[0]!.slice(0, 8)
  );
  assert.ok(sessionList.counts_by_mode);
  assert.ok(typeof sessionList.counts_by_mode.waiting === 'number');

  const currentChat = await pool.query('SELECT control_version FROM chat_sessions WHERE id = $1', [
    sessionIds[0]!
  ]);
  await claimChat(sessionIds[0]!, Number(currentChat.rows[0].control_version), adminId);

  const pushedMsg = await sendAgentMessage(
    sessionIds[0]!,
    adminId,
    randomUUID(),
    'Em mở sẵn phiếu đặt hàng COD cho anh nhé!',
    { variant_id: variantId, widget_type: 'address_form' }
  );
  assert.equal(pushedMsg.widgets.length, 1);
  assert.equal(pushedMsg.widgets[0]?.widget_type, 'address_form');

  // 9. Admin Dashboard top_products array contract
  const stats = await getDashboardStats();
  assert.ok(Array.isArray(stats.top_products));

  // 10. Dedicated payment_method ('VIETQR' vs 'COD') & dead-quote idempotency revival
  const reusableReqId = randomUUID();
  const initialQuote = await previewOrder(sessionIds[0]!, {
    ...makeInput(),
    client_request_id: reusableReqId,
    payment_method: 'COD',
    note: 'Giao buổi sáng'
  });
  assert.equal(initialQuote.order.payment_method, 'COD');
  assert.equal(initialQuote.order.note, 'Giao buổi sáng');

  const cancelledQuote = await cancelOrder(initialQuote.order.order_id, sessionIds[0]!);
  assert.equal(cancelledQuote.status, 'CANCELLED');

  // Re-submitting with the same client_request_id after unconfirmed quote cancellation revives it cleanly
  const revivedQuote = await previewOrder(sessionIds[0]!, {
    ...makeInput(),
    client_request_id: reusableReqId,
    payment_method: 'VIETQR',
    note: 'Đổi sang chuyển khoản VietQR'
  });
  assert.equal(revivedQuote.order.order_id, initialQuote.order.order_id);
  assert.equal(revivedQuote.order.status, 'PENDING_CONFIRMATION');
  assert.equal(revivedQuote.order.payment_method, 'VIETQR');
  assert.equal(revivedQuote.order.note, 'Đổi sang chuyển khoản VietQR');

  // 11. Storefront Catalog facets/sort/offset + Admin Catalog Meta, Cover Image Sync & Bulk Patch
  const publicPage = await listVariants({
    min_ssd_gb: 512,
    sort: 'ram_desc',
    limit: 5,
    offset: 0
  });
  assert.equal(typeof publicPage.total_count, 'number');
  assert.ok(publicPage.total_count >= publicPage.items.length);
  assert.ok(publicPage.facets && Array.isArray(publicPage.facets.brands));
  assert.ok(publicPage.items.every(item => item.ssd_gb >= 512));

  const catalogMeta = await getAdminCatalogMeta();
  assert.ok(typeof catalogMeta.summary.laptops_total === 'number');
  assert.ok(typeof catalogMeta.summary.variants_total === 'number');
  assert.ok(Array.isArray(catalogMeta.brands) && catalogMeta.brands.length > 0);
  assert.ok(Array.isArray(catalogMeta.laptop_options) && catalogMeta.laptop_options.length > 0);

  const bulkLaptop = (await createCatalog(
    'laptops',
    {
      brand: 'TestBrand',
      model_name: 'Bulk Model',
      image_url: '/api/v1/catalog/images/1/acer.jpg'
    },
    adminId
  )) as { id: string; revision: number };
  extraLaptopIds.push(bulkLaptop.id);

  // Patching laptop image_url syncs position #1 in laptop_images
  const patchedCover = (await patchCatalog(
    'laptops',
    bulkLaptop.id,
    bulkLaptop.revision,
    { image_url: 'https://cdn.example.com/updated-cover.jpg' },
    adminId
  )) as { revision: number; images?: Array<{ image_url: string }> };
  assert.equal(patchedCover.images?.[0]?.image_url, 'https://cdn.example.com/updated-cover.jpg');

  const bulkV1 = (await createCatalog(
    'variants',
    {
      laptop_id: bulkLaptop.id,
      sku: `CRUD-BULK-1-${randomUUID()}`,
      cpu: 'Core i5-13420H',
      gpu: 'Iris Xe',
      ram_gb: 16,
      ssd_gb: 512,
      screen: '14 inch',
      color: 'Silver',
      usage_category: 'office_study',
      price_vnd: 20_000_000,
      stock: 0,
      stock_verified: false
    },
    adminId
  )) as { id: string; revision: number };

  const bulkStockRes = await bulkPatchVariants([bulkV1.id], 'set_stock', 7, adminId);
  assert.equal(bulkStockRes.updated_count, 1);
  assert.equal(bulkStockRes.items[0]?.stock, 7);
  assert.equal(bulkStockRes.items[0]?.stock_verified, true);
  assert.equal(bulkStockRes.items[0]?.revision, bulkV1.revision + 1);

  const bulkPriceRes = await bulkPatchVariants([bulkV1.id], 'adjust_price_pct', -10, adminId);
  assert.equal(bulkPriceRes.items[0]?.price_vnd, 18_000_000);
  assert.equal(bulkPriceRes.items[0]?.revision, bulkV1.revision + 2);

  const adminVariantsPage = await listAdminCatalog('variants', 10, undefined, undefined, {
    laptop_id: bulkLaptop.id,
    sort: 'price_desc',
    offset: 0
  });
  assert.equal(adminVariantsPage.total_count, 1);
  assert.equal(adminVariantsPage.items[0]?.id, bulkV1.id);

  // 12. Admin CRM 360°: Guest COD Buyer Detection -> Promote Guest to Member -> Customer Patch & Password Reset -> Staff Revoke
  await cancelOrder(revivedQuote.order.order_id, sessionIds[0]!);
  const uniqueDigits = String(Math.floor(10_000_000 + Math.random() * 89_999_999));
  const guestPhone = `09${uniqueDigits}`;
  const crmGuestQuote = await previewOrder(sessionIds[0]!, {
    client_request_id: randomUUID(),
    variant_id: variantId,
    customer_name: 'Tran Minh Khach',
    customer_phone: guestPhone,
    shipping_address: '88 Le Loi, Phuong Ben Nghe, TP HCM'
  });
  const crmGuestConfirmed = await confirmOrder(crmGuestQuote.order.order_id, sessionIds[0]!);
  assert.equal(crmGuestConfirmed.status, 'CONFIRMED_COD');

  const guestsBefore = await listGuestBuyers({
    q: guestPhone,
    filter: 'unlinked',
    limit: 10,
    offset: 0
  });
  assert.equal(guestsBefore.total_count, 1);
  assert.equal(guestsBefore.items[0]?.phone, guestPhone);
  assert.equal(guestsBefore.items[0]?.matched_member_id, null);

  const promotedEmail = `promoted.${randomUUID()}@lapbot.test`;
  const promoted = await promoteGuestToCustomer(adminId, {
    phone: guestPhone,
    email: promotedEmail,
    password: 'GuestPromoted123!',
    customer_tag: 'CORPORATE',
    admin_note: 'Nâng cấp từ khách vãng lai COD'
  });
  extraCustomerIds.push(promoted.customer_id);
  assert.equal(promoted.phone, guestPhone);
  assert.equal(promoted.customer_tag, 'CORPORATE');
  assert.equal(promoted.unlinked_phone_orders_count, 0);
  assert.ok(promoted.orders.some(o => o.order_id === crmGuestConfirmed.order_id));

  // Insert an active customer session and verify password reset revokes it
  await pool.query(
    `INSERT INTO customer_sessions(customer_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '7 days')`,
    [promoted.customer_id, randomBytes(32).toString('hex')]
  );
  const patchedCustomer = await patchCustomer(adminId, promoted.customer_id, {
    customer_tag: 'VIP',
    admin_note: 'Đã mua máy thành công, ưu tiên bảo hành nhanh',
    new_password: 'NewSecurePassword456!'
  });
  assert.equal(patchedCustomer.customer_tag, 'VIP');
  assert.equal(patchedCustomer.admin_note, 'Đã mua máy thành công, ưu tiên bảo hành nhanh');
  const remainingCustSessions = await pool.query(
    'SELECT id FROM customer_sessions WHERE customer_id = $1',
    [promoted.customer_id]
  );
  assert.equal(remainingCustSessions.rowCount, 0);

  const vipPage = await listCustomers(guestPhone, undefined, 10, undefined, {
    customer_tag: 'VIP',
    sort: 'newest',
    offset: 0
  });
  assert.equal(vipPage.total_count, 1);
  assert.ok(
    vipPage.kpi && typeof vipPage.kpi.vip_members === 'number' && vipPage.kpi.vip_members >= 1
  );

  const fullDetail = await getCustomer(promoted.customer_id);
  assert.equal(fullDetail.customer_id, promoted.customer_id);
  assert.ok(Array.isArray(fullDetail.chat_sessions));

  // Staff force-logout blocks self-revoke and revokes another staff's sessions
  await assert.rejects(revokeStaffSessions(adminId, adminId), { code: 'CANNOT_REVOKE_SELF' });

  const targetStaff = await pool.query<{ id: string }>(
    `INSERT INTO admin_users(username, password_hash, role) VALUES ($1, 'test-only', 'STAFF') RETURNING id`,
    [`staff-${randomUUID()}`]
  );
  const targetStaffId = targetStaff.rows[0]!.id;
  extraAdminIds.push(targetStaffId);
  await pool.query(
    `INSERT INTO admin_sessions(admin_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 day')`,
    [targetStaffId, randomBytes(32).toString('hex')]
  );
  const revokeRes = await revokeStaffSessions(adminId, targetStaffId);
  assert.equal(revokeRes.ok, true);
  assert.equal(revokeRes.revoked_count, 1);
});
