import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminStockFilters, type ChatWidget } from '@lapbot/contracts';
import { decodeKeysetCursor, encodeKeysetCursor } from '../src/lib/cursor.js';
import { readSse } from '../src/modules/chat/llm/sse.js';
import { ChatSseParser } from '../../web/src/features/chat/sse.js';
import {
  acceptText,
  beginGate,
  closeGate,
  emitStatus,
  flushText,
  flushWidgets,
  stageWidget
} from '../src/modules/chat/control-gate.js';

function stream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    }
  });
}

test('gateway SSE reads fragmented UTF-8 and multiple frames', async () => {
  const bytes = new TextEncoder().encode(
    'data: {"text":"máy"}\r\n\r\ndata: {"n":1}\n\ndata: [DONE]\n\n'
  );
  const chunks = [...bytes].map(value => new Uint8Array([value]));
  const result: string[] = [];

  for await (const frame of readSse(stream(chunks))) {
    result.push(frame);
  }

  assert.deepEqual(result, ['{"text":"máy"}', '{"n":1}', '[DONE]']);
});

test('gateway SSE rejects truncated event', async () => {
  await assert.rejects(async () => {
    for await (const frame of readSse(stream([new TextEncoder().encode('data: {"x":1}')]))) {
      void frame;
    }
  }, /SSE_TRUNCATED/);
});

test('browser SSE parser handles fragmented CRLF and UTF-8', () => {
  const bytes = new TextEncoder().encode('event: text_delta\r\ndata: {"text":"máy"}\r\n\r\n');
  const parser = new ChatSseParser();
  const frames = [];

  for (const byte of bytes) {
    frames.push(...parser.push(new Uint8Array([byte])));
  }

  assert.deepEqual(frames, [{ event: 'text_delta', data: { text: 'máy' } }]);
});

test('handoff gate rejects late provider text', () => {
  const sent: string[] = [];
  const controller = new AbortController();
  const sessionId = 'test-session';
  const gate = beginGate({
    sessionId,
    turnId: 'test-turn',
    version: 1,
    deadline: Date.now() + 30_000,
    controller,
    send: (_event, data) => sent.push(String(data.text ?? ''))
  });

  acceptText(gate, 'trước');
  flushText(gate);
  const snapshot = closeGate(sessionId);
  acceptText(gate, 'sau');
  flushText(gate);

  assert.equal(controller.signal.aborted, true);
  assert.equal(snapshot?.text, 'trước');
  assert.deepEqual(sent, ['trước']);
});

test('keyset cursor utility roundtrips and rejects malformed structures', () => {
  const sampleId = 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9';
  const sampleIso = '2026-10-19T12:00:00.000Z';
  const encoded = encodeKeysetCursor(sampleIso, sampleId);

  assert.deepEqual(decodeKeysetCursor(encoded), [sampleIso, sampleId]);
  assert.equal(decodeKeysetCursor(undefined), null);

  // Valid base64url JSON but invalid tuple shapes must throw INVALID_CURSOR
  const nonTuple = Buffer.from(JSON.stringify({ a: 1 })).toString('base64url');
  const badUuid = Buffer.from(JSON.stringify([sampleIso, 'not-a-uuid'])).toString('base64url');
  assert.throws(() => decodeKeysetCursor(nonTuple), { code: 'INVALID_CURSOR' });
  assert.throws(() => decodeKeysetCursor(badUuid), { code: 'INVALID_CURSOR' });
  assert.throws(() => decodeKeysetCursor('!!!not-base64-json!!!'), { code: 'INVALID_CURSOR' });
});

test('admin stock filter contract includes unverified variants', () => {
  assert.equal(adminStockFilters.includes('unverified'), true);
});

test('tool allowlist and checkout normalization', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { parseTool } = await import('../src/modules/chat/tools/execute.js');
  const { normalize } = await import('../src/modules/orders/service.js');

  assert.deepEqual(parseTool('search_laptop_catalog', '{"max_price":20000000}'), {
    max_price: 20000000
  });
  assert.throws(() => parseTool('place_order', '{}'));
  assert.throws(() => parseTool('search_laptop_catalog', '{"role":"admin"}'));
  assert.throws(() => parseTool('show_checkout_form', '{"variant_id":"bad"}'));

  const normalized = normalize({
    client_request_id: 'x',
    variant_id: 'x',
    customer_name: ' Thuận ',
    customer_phone: '+84 912-345-678',
    shipping_address: ' 123 đường Nguyễn Trãi, Phường Thượng Đình, Hà Nội '
  });
  assert.equal(normalized.customer_phone, '0912345678');
  assert.equal(normalized.payment_method, 'COD');

  const vietQrNormalized = normalize({
    client_request_id: 'x',
    variant_id: 'x',
    customer_name: 'Thuận',
    customer_phone: '0912345678',
    shipping_address: '123 đường Nguyễn Trãi, Phường Thượng Đình, Hà Nội',
    note: 'Gọi trước 15 phút',
    payment_method: 'VIETQR'
  });
  assert.equal(vietQrNormalized.payment_method, 'VIETQR');
  assert.equal(vietQrNormalized.note, 'Gọi trước 15 phút');

  // Missing ward/province (< 3 comma-separated parts) is rejected
  assert.throws(
    () =>
      normalize({
        client_request_id: 'x',
        variant_id: 'x',
        customer_name: 'Thuận',
        customer_phone: '0912345678',
        shipping_address: '123 đường Nguyễn Trãi, Hà Nội'
      }),
    { code: 'INVALID_CHECKOUT' }
  );

  assert.throws(() =>
    normalize({
      client_request_id: 'x',
      variant_id: 'x',
      customer_name: 'A',
      customer_phone: '1',
      shipping_address: 'a'
    })
  );
});

test('API rejects extra checkout fields and invalid Origin before DB access', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();
    const body = {
      client_request_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
      variant_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
      customer_name: 'Test User',
      customer_phone: '0912345678',
      shipping_address: '123 Nguyen Trai, Ha Noi',
      price_vnd: 1
    };

    const extra = await app.inject({
      method: 'POST',
      url: '/api/v1/orders/preview',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: body
    });
    assert.equal(extra.statusCode, 400);

    const badPayment = await app.inject({
      method: 'POST',
      url: '/api/v1/orders/preview',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: {
        client_request_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
        variant_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
        customer_name: 'Test User',
        customer_phone: '0912345678',
        shipping_address: '123 Nguyen Trai, Phuong Thuong Dinh, Ha Noi',
        payment_method: 'CRYPTO'
      }
    });
    assert.equal(badPayment.statusCode, 400);

    const origin = await app.inject({
      method: 'POST',
      url: '/api/v1/orders/preview',
      headers: { origin: 'https://invalid.test', 'content-type': 'application/json' },
      payload: {}
    });
    assert.equal(origin.statusCode, 403);
  } finally {
    await app.close();
  }
});

test('parseCatalogQuery validates usage_category, min_ssd_gb, sort modes, offset, and rejects cursor+offset conflicts', async () => {
  const { catalogSortModes } = await import('@lapbot/contracts');
  const { parseCatalogQuery } = await import('../src/modules/catalog/service.js');
  const filter = parseCatalogQuery({
    usage_category: 'programming',
    min_ssd_gb: '512',
    sort: 'ram_desc',
    offset: '12',
    limit: '5'
  });
  assert.equal(filter.usage_category, 'programming');
  assert.equal(filter.min_ssd_gb, 512);
  assert.equal(filter.sort, 'ram_desc');
  assert.equal(filter.offset, 12);
  assert.equal(filter.limit, 5);

  for (const mode of catalogSortModes) {
    assert.equal(parseCatalogQuery({ sort: mode }).sort, mode);
  }
  assert.equal(parseCatalogQuery({ offset: '0' }).offset, 0);

  assert.throws(() => parseCatalogQuery({ usage_category: 'invalid_usage' }));
  assert.throws(() => parseCatalogQuery({ sort: 'invalid_sort' }), { code: 'INVALID_QUERY' });
  assert.throws(() => parseCatalogQuery({ offset: '-1' }), { code: 'INVALID_QUERY' });

  const sampleCursor = Buffer.from(
    JSON.stringify([15000000, 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9'])
  ).toString('base64url');
  assert.throws(() => parseCatalogQuery({ cursor: sampleCursor, offset: '12' }), {
    code: 'INVALID_QUERY'
  });
});

test('tool definitions and parseTool allow valid consultant tool calls', async () => {
  const { parseTool, toolDefinitions } = await import('../src/modules/chat/tools/execute.js');
  assert.equal(toolDefinitions.length, 5);
  const parsed = parseTool(
    'search_laptop_catalog',
    '{"usage_category":"programming","min_ram_gb":16,"preferred_brand":"Asus"}'
  );
  assert.deepEqual(parsed, {
    usage_category: 'programming',
    min_ram_gb: 16,
    preferred_brand: 'Asus'
  });
  assert.throws(() => parseTool('search_laptop_catalog', '{"usage_category":"invalid"}'));
});

test('password hashing and verification with scrypt', async () => {
  const { hashPassword, verifyPassword } = await import('../src/lib/password.js');
  const hashed = await hashPassword('SuperSecret123!');
  assert.equal(typeof hashed, 'string');
  assert.equal(hashed.startsWith('scrypt$'), true);
  assert.equal(await verifyPassword('SuperSecret123!', hashed), true);
  assert.equal(await verifyPassword('WrongPassword!', hashed), false);
  assert.equal(await verifyPassword('Any', 'invalid-salt-format'), false);
});

test('auth routes reject invalid register payload and enforce JSON origin', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();
    const shortPw = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      headers: { origin: 'http://localhost:5173', 'content-type': 'application/json' },
      payload: { email: 'test@example.com', full_name: 'Test', password: '123' }
    });
    assert.equal(shortPw.statusCode, 400);

    const badOrigin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      headers: { origin: 'https://evil.attacker.com', 'content-type': 'application/json' },
      payload: { email: 'test@example.com', full_name: 'Test', password: '123456' }
    });
    assert.equal(badOrigin.statusCode, 403);
  } finally {
    await app.close();
  }
});

test('staged widgets never emit before text_delta and are discarded if turn is interrupted before flush', () => {
  const events: Array<{ event: string; data: Record<string, unknown> }> = [];
  const controller = new AbortController();
  const gate = beginGate({
    sessionId: 'session-order',
    turnId: 'turn-order',
    version: 2,
    deadline: Date.now() + 30_000,
    controller,
    send: (event, data) => events.push({ event, data })
  });

  const sampleWidget: ChatWidget = {
    widget_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9',
    schema_version: 1,
    widget_type: 'address_form',
    payload: { variant_id: 'fe1868c4-d19c-4dbc-89b1-795ad7f946b9' }
  };

  emitStatus(gate, 'searching');
  stageWidget(gate, sampleWidget);
  // Widget is staged during tool phase; must NOT be emitted yet
  assert.deepEqual(
    events.map(e => e.event),
    ['status']
  );

  // LLM Call 2 streams text after tool execution
  acceptText(gate, 'Dưới đây là phiếu đặt hàng của bạn.');
  // Flush text + widgets at end of turn
  flushText(gate);
  flushWidgets(gate);

  assert.deepEqual(
    events.map(e => e.event),
    ['status', 'text_delta', 'widget']
  );
  assert.equal(gate.widgets.length, 1);
  assert.equal(gate.stagedWidgets.length, 0);
  closeGate('session-order');

  // Verify interrupted turn drops unstaged/unflushed widgets cleanly
  const events2: string[] = [];
  const gate2 = beginGate({
    sessionId: 'session-interrupt',
    turnId: 'turn-interrupt',
    version: 1,
    deadline: Date.now() + 30_000,
    controller: new AbortController(),
    send: event => events2.push(event)
  });
  stageWidget(gate2, sampleWidget);
  const interruptedSnapshot = closeGate('session-interrupt');
  assert.deepEqual(events2, []);
  assert.deepEqual(interruptedSnapshot?.widgets, []);
});

test('search_laptop_catalog accepts keyword, min_ssd_gb, and sort_by while rejecting invalid values', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { parseTool } = await import('../src/modules/chat/tools/execute.js');

  const parsed = parseTool(
    'search_laptop_catalog',
    JSON.stringify({
      usage_category: 'business_ultrabook',
      max_price: 20000000,
      min_ram_gb: 16,
      min_ssd_gb: 512,
      keyword: 'MacBook M2',
      sort_by: 'best_match'
    })
  );
  assert.deepEqual(parsed, {
    usage_category: 'business_ultrabook',
    max_price: 20000000,
    min_ram_gb: 16,
    min_ssd_gb: 512,
    keyword: 'MacBook M2',
    sort_by: 'best_match'
  });

  assert.throws(() => parseTool('search_laptop_catalog', '{"sort_by":"random_order"}'));
  assert.throws(() => parseTool('search_laptop_catalog', '{"min_ssd_gb":-128}'));
  assert.throws(() => parseTool('search_laptop_catalog', `{"keyword":"${'x'.repeat(81)}"}`));
});

test('all CSS var(--...) custom properties in apps/web/src are defined', () => {
  const webSrcDir = fileURLToPath(new URL('../../web/src', import.meta.url));
  const collectFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...collectFiles(full));
      else if (/\.(css|ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
  };

  const files = collectFiles(webSrcDir);
  const defined = new Set<string>();
  const used = new Set<string>();

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) {
      if (match[1]) defined.add(match[1]);
    }
    for (const match of content.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
      if (match[1]) used.add(match[1]);
    }
  }

  const missing = [...used].filter(token => !defined.has(token));
  assert.deepEqual(missing, []);
});

test('gateway SSE yields trailing [DONE] frame even without trailing blank line', async () => {
  const bytes = new TextEncoder().encode('data: {"text":"ok"}\n\ndata: [DONE]');
  const result: string[] = [];
  for await (const frame of readSse(stream([bytes]))) {
    result.push(frame);
  }
  assert.deepEqual(result, ['{"text":"ok"}', '[DONE]']);
});

test('formatLaptopTitle removes duplicate leading brand prefix cleanly', async () => {
  const { cleanCpuLabel, cleanGpuLabel, formatLaptopTitle } = await import(
    '../../web/src/lib/format.js'
  );
  assert.equal(
    formatLaptopTitle('Dell', 'Dell Inspiron 16 Plus 7640'),
    'Dell Inspiron 16 Plus 7640'
  );
  assert.equal(formatLaptopTitle('ASUS', 'Asus Vivobook 15 OLED'), 'ASUS Vivobook 15 OLED');
  assert.equal(formatLaptopTitle('Apple', 'MacBook Air 13 M2'), 'Apple MacBook Air 13 M2');
  assert.equal(formatLaptopTitle('Mi', 'MiniBook X'), 'Mi MiniBook X');
  assert.equal(
    cleanCpuLabel('Chưa xác minh', 'Dell Precision 5560 Xeon W-11955M'),
    'Xeon W-11955M'
  );
  assert.equal(cleanCpuLabel('Intel Core i7-13700H', 'Dell Inspiron'), 'Intel Core i7-13700H');
  assert.equal(cleanGpuLabel('Chưa xác minh'), 'Đồ họa tích hợp');
});

test('health endpoint emits hardened security headers', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { status: 'ok' });
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  } finally {
    await app.close();
  }
});

test('openapi.json documents all /api/v1 endpoints with valid OpenAPI 3.0.3 schemas', async () => {
  process.env.DATABASE_URL ??= 'postgres://lapbot:lapbot@localhost:5432/lapbot';
  const { createApp } = await import('../src/app.js');
  const app = createApp();
  try {
    await app.ready();
    const res = await app.inject({ method: 'GET', url: '/api/v1/openapi.json' });
    assert.equal(res.statusCode, 200);
    const spec = res.json() as {
      openapi: string;
      paths: Record<string, Record<string, { summary?: string; 'x-auth-level'?: string }>>;
    };
    assert.equal(spec.openapi, '3.0.3');

    const operations: Array<{ method: string; path: string; summary?: string }> = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      assert.equal(path.includes(':'), false, `Path ${path} must convert :param to {param}`);
      for (const [method, op] of Object.entries(methods)) {
        operations.push({ method, path, summary: op.summary });
        assert.ok(
          op.summary && !op.summary.startsWith(method.toUpperCase()),
          `Missing Vietnamese summary for ${method.toUpperCase()} ${path}`
        );
        assert.ok(op['x-auth-level'], `Missing x-auth-level for ${method.toUpperCase()} ${path}`);
      }
    }
    assert.ok(operations.length >= 60, `Expected at least 60 operations, got ${operations.length}`);

    const serialized = JSON.stringify(spec);
    assert.equal(
      serialized.includes('"type":["'),
      false,
      'OpenAPI 3.0.3 must not contain JSON Schema array union types'
    );
  } finally {
    await app.close();
  }
});
