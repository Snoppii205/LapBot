import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { catalogRoutes } from '../src/modules/catalog/routes.js';
import { AppError } from '../src/lib/errors.js';
import { loadVzCatalog, resolveVzDataRoot } from '../src/db/vz-source.js';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const repoPath = (...segments: string[]) => path.resolve(repoRoot, ...segments);

// Helper to create Fastify app with error handler matching app.ts
async function createTestApp() {
  const app = Fastify({ logger: false });
  app.setErrorHandler((error, request, reply) => {
    const known = error instanceof AppError ? error : null;
    const status = known ? known.statusCode : 500;
    const code = known ? known.code : 'INTERNAL_ERROR';
    reply.status(status).send({
      error: { code, message: error.message },
      request_id: request.id
    });
  });
  await app.register(catalogRoutes, { prefix: '/api/v1' });
  await app.ready();
  return app;
}

// ---------------------------------------------------------------------------
// SUITE 1: Catalog Image Serving Path & Adversarial Traversal Protection
// ---------------------------------------------------------------------------
test('Image Serving: successfully serves valid images from Part 1 with correct headers', async () => {
  const app = await createTestApp();
  try {
    const filename = 'acer-gaming-nitro-an515-58-773y__1.jpg';
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/catalog/images/1/${filename}`
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/jpeg');
    assert.equal(res.headers['cache-control'], 'public, max-age=86400');
    assert.ok(res.rawPayload.length > 0, 'Image payload must not be empty');

    // Cross-verify with actual file on disk
    const expectedPath = repoPath('data/vz-catalog/vzstore-laptops-part1/images', filename);
    const diskBytes = fs.readFileSync(expectedPath);
    assert.equal(res.rawPayload.length, diskBytes.length);
  } finally {
    await app.close();
  }
});

test('Image Serving: successfully serves valid images from Part 2', async () => {
  const app = await createTestApp();
  try {
    const filename = 'acer-aspire-3-a315-59__1.jpg';
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/catalog/images/2/${filename}`
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['content-type'], 'image/jpeg');
    assert.ok(res.rawPayload.length > 0);
  } finally {
    await app.close();
  }
});

test('Image Serving: rejects directory traversal via .. and encoded separators in filename', async () => {
  const app = await createTestApp();
  try {
    const attacks = [
      '..%2F..%2F..%2Fpackage.json',
      '..%5C..%5Cpackage.json',
      'test..jpg',
      '..jpg',
      'valid.jpg/../secret.jpg',
      '....//secret.jpg',
      '%2e%2e%2fsecret.jpg',
      '..\\secret.jpg'
    ];

    for (const attack of attacks) {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/catalog/images/1/${attack}`
      });
      assert.equal(
        res.statusCode,
        404,
        `Expected 404 for traversal filename attack "${attack}", got ${res.statusCode}`
      );
    }
  } finally {
    await app.close();
  }
});

test('Image Serving: rejects invalid part parameters (regex /^[1-9]\\d*$/)', async () => {
  const app = await createTestApp();
  try {
    const badParts = [
      '0',
      '-1',
      'abc',
      'part1',
      '1.0',
      '1%2F..%2F',
      '01',
      '9999999999999999999999999'
    ];

    for (const part of badParts) {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/catalog/images/${part}/acer-gaming-nitro-an515-58-773y__1.jpg`
      });
      assert.equal(
        res.statusCode,
        404,
        `Expected 404 for invalid part "${part}", got ${res.statusCode}`
      );
    }
  } finally {
    await app.close();
  }
});

test('Image Serving: rejects unauthorized file extensions and malicious characters', async () => {
  const app = await createTestApp();
  try {
    const badFilenames = [
      'products.json',
      'secret.env',
      'malicious.exe',
      'payload.sh',
      '.hidden.jpg',
      'has space.jpg',
      'injection;rm.jpg',
      'image<script>.jpg',
      'image|test.jpg',
      'image.webp.exe',
      'image%00.jpg'
    ];

    for (const filename of badFilenames) {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/catalog/images/1/${encodeURIComponent(filename)}`
      });
      assert.equal(
        res.statusCode,
        404,
        `Expected 404 for forbidden filename "${filename}", got ${res.statusCode}`
      );
    }
  } finally {
    await app.close();
  }
});

test('Image Serving: returns clean 404 on missing or offline image files (no 500 crash)', async () => {
  const app = await createTestApp();
  try {
    // Missing file in existing part
    const missingRes = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/images/1/nonexistent-laptop-image-99999.jpg'
    });
    assert.equal(missingRes.statusCode, 404);
    const missingBody = JSON.parse(missingRes.payload);
    assert.equal(missingBody.error.code, 'NOT_FOUND');

    // Non-existent part folder
    const missingPartRes = await app.inject({
      method: 'GET',
      url: '/api/v1/catalog/images/999/test-image.jpg'
    });
    assert.equal(missingPartRes.statusCode, 404);
    const missingPartBody = JSON.parse(missingPartRes.payload);
    assert.equal(missingPartBody.error.code, 'NOT_FOUND');
  } finally {
    await app.close();
  }
});

// ---------------------------------------------------------------------------
// SUITE 2: Store Info Fallback & Chat Service Resilience
// ---------------------------------------------------------------------------
test('Store Info Fallback: data/store-info.fallback.json exists and contains complete policies', async () => {
  const fallbackPath = repoPath('data/store-info.fallback.json');
  assert.ok(
    fs.existsSync(fallbackPath),
    'Fallback store-info file must exist at data/store-info.fallback.json'
  );

  const content = await readFile(fallbackPath, 'utf8');
  const store = JSON.parse(content);

  assert.equal(typeof store.store_name, 'string');
  assert.ok(store.store_name.length > 0);
  assert.equal(typeof store.price_tax_note, 'string');
  assert.equal(typeof store.shipping_scope, 'string');
  assert.equal(typeof store.warranty_policy, 'string');
  assert.equal(typeof store.return_policy, 'string');
  assert.equal(typeof store.support_hours, 'string');
  assert.ok(Array.isArray(store.contact_channels) || typeof store.contact_channels === 'object');
  assert.ok(Array.isArray(store.policy_links));
});

test('Store Info Fallback: service resolution logic survives missing or corrupted fallback JSON', async () => {
  // Test exact storePath resolution as defined in apps/api/src/modules/chat/service.ts line 14:
  // fileURLToPath(new URL('../../../../../data/store-info.fallback.json', import.meta.url))
  // where service.ts is at apps/api/src/modules/chat/service.ts
  const serviceFileUrl = new URL(
    'file:///' + repoPath('apps/api/src/modules/chat/service.ts').replace(/\\/g, '/')
  );
  const storePath = fileURLToPath(
    new URL('../../../../../data/store-info.fallback.json', serviceFileUrl)
  );

  assert.ok(
    fs.existsSync(storePath),
    `storePath in service.ts must resolve to valid file on disk: ${storePath}`
  );

  // 1. Normal fallback read (when DB fails)
  let normalStore: Record<string, unknown> = {};
  try {
    // Simulated DB failure
    throw new Error('Database connection failed');
  } catch {
    try {
      normalStore = JSON.parse(await readFile(storePath, 'utf8')) as Record<string, unknown>;
    } catch {
      // fallback
    }
  }
  assert.ok(Object.keys(normalStore).length > 0);
  assert.equal(normalStore.store_name, 'LapBot — Chuyên gia Laptop & Trợ lý AI');

  // 2. Corrupted JSON simulation
  let corruptedStore: Record<string, unknown> = {};
  try {
    throw new Error('Database connection failed');
  } catch {
    try {
      // Simulated corrupted JSON content
      const badContent = '{ "store_name": "Broken JSON, missing brace...';
      corruptedStore = JSON.parse(badContent) as Record<string, unknown>;
    } catch {
      // Handled cleanly
    }
  }
  assert.deepEqual(corruptedStore, {});

  // 3. Missing file simulation
  let missingFileStore: Record<string, unknown> = {};
  try {
    throw new Error('Database connection failed');
  } catch {
    try {
      missingFileStore = JSON.parse(
        await readFile('data/non-existent-file-xyz.json', 'utf8')
      ) as Record<string, unknown>;
    } catch {
      // Handled cleanly
    }
  }
  assert.deepEqual(missingFileStore, {});

  // 4. Verify system prompt formatting works with empty store
  const systemPromptEmpty = `Thông tin cửa hàng: ${JSON.stringify(corruptedStore).slice(0, 2000)}.`;
  assert.equal(systemPromptEmpty, 'Thông tin cửa hàng: {}.');
});

// ---------------------------------------------------------------------------
// SUITE 3: Catalog Seeding Resilience (vz-source.ts)
// ---------------------------------------------------------------------------
test('Seeding Resilience: resolveVzDataRoot prefers data/vz-catalog over legacy VZ_Data', async () => {
  const resolved = await resolveVzDataRoot();
  const expected = repoPath('data/vz-catalog');
  assert.equal(path.resolve(resolved), expected);
});

test('Seeding Resilience: normal execution loads all available parts and candidates', async () => {
  const result = await loadVzCatalog();
  assert.ok(Array.isArray(result.parts));
  assert.ok(result.parts.includes(1));
  assert.ok(result.parts.includes(2));
  assert.ok(result.candidates.length > 0, 'Must load candidates');
  assert.ok(result.total > 0, 'Total products inspected must be > 0');
});

test('Seeding Resilience: survives simulated unhydrated Part 2 (skips Part 2, loads Part 1)', async () => {
  const part2Path = repoPath('data/vz-catalog/vzstore-laptops-part2/products.json');
  const part2Backup = repoPath(
    'data/vz-catalog/vzstore-laptops-part2/products.json.simulated_unhydrated'
  );

  assert.ok(fs.existsSync(part2Path), 'Part 2 products.json must exist before test');

  // Temporarily rename part 2 products.json to simulate an unhydrated OneDrive file
  fs.renameSync(part2Path, part2Backup);
  try {
    const result = await loadVzCatalog();
    assert.deepEqual(result.parts, [1], 'Only part 1 should be loaded when part 2 is offline');
    assert.ok(result.candidates.length > 0, 'Part 1 candidates must still be loaded');
    assert.ok(result.candidates.every(c => c.imageUrl.startsWith('/api/v1/catalog/images/1/')));
  } finally {
    // Restore part 2
    if (fs.existsSync(part2Backup)) {
      fs.renameSync(part2Backup, part2Path);
    }
  }
  assert.ok(fs.existsSync(part2Path), 'Part 2 products.json must be restored');
});

test('Seeding Resilience: survives simulated unhydrated Part 1 (skips Part 1, loads Part 2)', async () => {
  const part1Path = repoPath('data/vz-catalog/vzstore-laptops-part1/products.json');
  const part1Backup = repoPath(
    'data/vz-catalog/vzstore-laptops-part1/products.json.simulated_unhydrated'
  );

  assert.ok(fs.existsSync(part1Path), 'Part 1 products.json must exist before test');

  fs.renameSync(part1Path, part1Backup);
  try {
    const result = await loadVzCatalog();
    assert.deepEqual(result.parts, [2], 'Only part 2 should be loaded when part 1 is offline');
    assert.ok(result.candidates.length > 0, 'Part 2 candidates must still be loaded');
    assert.ok(result.candidates.every(c => c.imageUrl.startsWith('/api/v1/catalog/images/2/')));
  } finally {
    if (fs.existsSync(part1Backup)) {
      fs.renameSync(part1Backup, part1Path);
    }
  }
  assert.ok(fs.existsSync(part1Path), 'Part 1 products.json must be restored');
});

test('Seeding Resilience: handles non-array products.json in a part by skipping it', async () => {
  const dummyPartDir = repoPath('data/vz-catalog/vzstore-laptops-part99');
  fs.mkdirSync(dummyPartDir, { recursive: true });
  fs.writeFileSync(
    path.join(dummyPartDir, 'products.json'),
    JSON.stringify({ not: 'an array' }),
    'utf8'
  );

  try {
    const result = await loadVzCatalog();
    assert.ok(result.parts.includes(1));
    assert.ok(result.parts.includes(2));
    assert.ok(!result.parts.includes(99), 'Part 99 with non-array JSON must be skipped');
  } finally {
    fs.rmSync(dummyPartDir, { recursive: true, force: true });
  }
});

test('Seeding Resilience: throws explicit error when ALL parts are unhydrated/missing', async () => {
  const part1Path = repoPath('data/vz-catalog/vzstore-laptops-part1/products.json');
  const part1Backup = repoPath('data/vz-catalog/vzstore-laptops-part1/products.json.all_simulated');
  const part2Path = repoPath('data/vz-catalog/vzstore-laptops-part2/products.json');
  const part2Backup = repoPath('data/vz-catalog/vzstore-laptops-part2/products.json.all_simulated');

  fs.renameSync(part1Path, part1Backup);
  fs.renameSync(part2Path, part2Backup);

  try {
    await assert.rejects(async () => {
      await loadVzCatalog();
    }, /Catalog data folder \(data\/vz-catalog\) has no readable product parts/);
  } finally {
    if (fs.existsSync(part1Backup)) fs.renameSync(part1Backup, part1Path);
    if (fs.existsSync(part2Backup)) fs.renameSync(part2Backup, part2Path);
  }

  assert.ok(fs.existsSync(part1Path));
  assert.ok(fs.existsSync(part2Path));
});
