import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const base = process.env.BENCH_BASE_URL;
const variantId = process.env.BENCH_VARIANT_ID;

if (!base || !variantId || process.env.BENCH_ALLOW_MUTATION !== '1') {
  throw new Error(
    'Set BENCH_BASE_URL, BENCH_VARIANT_ID and BENCH_ALLOW_MUTATION=1 for a disposable seeded DB.'
  );
}

const origin = new URL(base).origin;
const measurements = {
  catalog: [],
  preview: [],
  confirm: []
};

const percentile = values => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1] ?? null;
};

async function call(path, init) {
  const started = performance.now();
  const response = await fetch(new URL(`/api/v1${path}`, base), init);
  const elapsed = performance.now() - started;
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path}: HTTP ${response.status} ${body?.error?.code ?? ''}`);
  }
  return { body, elapsed, response };
}

async function worker(index) {
  for (let i = 0; i < 10; i++) {
    const catalogRes = await call('/catalog/variants?limit=20');
    measurements.catalog.push(catalogRes.elapsed);

    const session = await call('/chat/session', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: '{}'
    });
    const cookie = session.response.headers.get('set-cookie')?.split(';')[0];
    if (!cookie) throw new Error('Guest cookie missing');

    const headers = {
      Origin: origin,
      'Content-Type': 'application/json',
      Cookie: cookie
    };

    const preview = await call('/orders/preview', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        client_request_id: randomUUID(),
        variant_id: variantId,
        customer_name: `Bench User ${index}`,
        customer_phone: '0912345678',
        shipping_address: '123 Benchmark Street, Ha Noi'
      })
    });
    measurements.preview.push(preview.elapsed);

    const confirm = await call(`/orders/${preview.body.order_id}/confirm`, {
      method: 'POST',
      headers,
      body: '{}'
    });
    measurements.confirm.push(confirm.elapsed);
  }
}

await Promise.all(Array.from({ length: 20 }, (_, index) => worker(index)));

for (const [name, values] of Object.entries(measurements)) {
  process.stdout.write(
    `${name}: samples=${values.length}, p95=${percentile(values)?.toFixed(1)} ms\n`
  );
}
