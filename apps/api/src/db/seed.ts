import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadVzCatalog, type CatalogCandidate } from './vz-source.js';

const reportPath = fileURLToPath(
  new URL('../../../../diagnostics/vz-import-report.json', import.meta.url)
);
const demoLaptopId = '10000000-0000-4000-8000-000000000001';
const SEED_LOCK_ID = 73_190_422;
const apply = process.argv.includes('--apply');

function stableLaptopId(sourceId: number): string {
  const hash = createHash('sha256').update(`lapbot:vzstore:product:${sourceId}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const catalog = await loadVzCatalog();
const reasons = Object.fromEntries(
  [...new Set(catalog.skipped.map(item => item.reason))].map(reason => [
    reason,
    catalog.skipped.filter(item => item.reason === reason).length
  ])
);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(
  reportPath,
  `${JSON.stringify(
    {
      parts: catalog.parts,
      total: catalog.total,
      eligible: catalog.candidates.length,
      skipped: catalog.skipped,
      reasons,
      stock_policy:
        'source in_stock=false means out_of_stock; true means pending_verification until exact stock is entered by admin',
      sku_policy: 'VZ-PRODUCT-{source id} is an internal identifier, not a verified store SKU'
    },
    null,
    2
  )}\n`
);

process.stdout.write(
  `VZ source: ${catalog.total} products, ${catalog.candidates.length} eligible, ${catalog.skipped.length} skipped. Report: diagnostics/vz-import-report.json\n`
);

if (!apply) process.exit(0);

const rows = catalog.candidates.map((item: CatalogCandidate) => ({
  id: stableLaptopId(item.sourceId),
  sku: item.sku,
  brand: item.brand,
  model_name: item.modelName,
  description: item.description.replace(/\u0000/g, ''),
  image_url: item.imageUrl,
  cpu: item.cpu,
  gpu: item.gpu,
  ram_gb: item.ramGb,
  ssd_gb: item.ssdGb,
  screen: item.screen,
  color: item.color,
  usage_category: item.usageCategory,
  price_vnd: item.priceVnd,
  source_in_stock: item.sourceInStock
}));

const imageRows = catalog.candidates.flatMap(item =>
  item.images.map((image, index) => ({
    laptop_id: stableLaptopId(item.sourceId),
    position: index + 1,
    image_url: image.imageUrl,
    caption: image.caption
  }))
);

const { pool } = await import('./pool.js');
const client = await pool.connect();

try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock($1)', [SEED_LOCK_ID]);

  const demoOrders = await client.query(
    'SELECT count(*)::int AS count FROM orders o JOIN laptop_variants v ON v.id = o.variant_id WHERE v.laptop_id = $1',
    [demoLaptopId]
  );

  if (demoOrders.rows[0].count > 0) {
    await client.query(
      'UPDATE laptop_variants SET is_active = false, stock = 0 WHERE laptop_id = $1',
      [demoLaptopId]
    );
    await client.query('UPDATE laptops SET is_active = false WHERE id = $1', [demoLaptopId]);
  } else {
    await client.query('DELETE FROM laptop_variants WHERE laptop_id = $1', [demoLaptopId]);
    await client.query('DELETE FROM laptops WHERE id = $1', [demoLaptopId]);
  }

  await client.query(
    `INSERT INTO laptops(id, brand, model_name, description, image_url, is_active)
     SELECT id::uuid, brand, model_name, description, image_url, true
     FROM jsonb_to_recordset($1::jsonb) AS p(id text, brand text, model_name text, description text, image_url text)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(rows)]
  );

  await client.query(
    `INSERT INTO laptop_variants(laptop_id, sku, cpu, gpu, ram_gb, ssd_gb, screen, color, usage_category, price_vnd, stock, is_active, source_in_stock, stock_verified)
     SELECT id::uuid, sku, cpu, gpu, ram_gb, ssd_gb, screen, color, usage_category, price_vnd, 0, true, source_in_stock, false
     FROM jsonb_to_recordset($1::jsonb) AS p(
       id text, sku text, cpu text, gpu text, ram_gb integer, ssd_gb integer,
       screen text, color text, usage_category text, price_vnd integer, source_in_stock boolean
     )
     ON CONFLICT (sku) DO UPDATE SET
       source_in_stock = EXCLUDED.source_in_stock,
       gpu = CASE WHEN laptop_variants.gpu = 'Chưa xác minh' THEN EXCLUDED.gpu ELSE laptop_variants.gpu END,
       usage_category = CASE WHEN NOT laptop_variants.stock_verified THEN EXCLUDED.usage_category ELSE laptop_variants.usage_category END,
       revision = laptop_variants.revision + 1,
       updated_at = now()
     WHERE laptop_variants.source_in_stock IS DISTINCT FROM EXCLUDED.source_in_stock
        OR (laptop_variants.gpu = 'Chưa xác minh' AND EXCLUDED.gpu <> 'Chưa xác minh')
        OR (NOT laptop_variants.stock_verified AND laptop_variants.usage_category IS DISTINCT FROM EXCLUDED.usage_category)`,
    [JSON.stringify(rows)]
  );

  await client.query(
    `INSERT INTO laptop_images(laptop_id, position, image_url, caption)
     SELECT laptop_id::uuid, position, image_url, caption
     FROM jsonb_to_recordset($1::jsonb) AS p(laptop_id text, position integer, image_url text, caption text)
     ON CONFLICT (laptop_id, position) DO UPDATE SET
       image_url = EXCLUDED.image_url,
       caption = EXCLUDED.caption
     WHERE laptop_images.image_url IS DISTINCT FROM EXCLUDED.image_url
        OR laptop_images.caption IS DISTINCT FROM EXCLUDED.caption`,
    [JSON.stringify(imageRows)]
  );

  await client.query('COMMIT');
  process.stdout.write(
    `VZ catalog applied. Eligible variants: ${rows.length}; images: ${imageRows.length}; source availability updated.\n`
  );
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
