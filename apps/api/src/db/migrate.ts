import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const MIGRATION_LOCK_ID = 73_190_421;

try {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())'
  );
  const directory = fileURLToPath(new URL('../../migrations/', import.meta.url));
  const files = (await readdir(directory))
    .filter(name => /^\d+_[a-z0-9_-]+\.sql$/.test(name))
    .sort();
  const seenVersions = new Map<string, string>();
  for (const file of files) {
    const version = file.slice(0, file.indexOf('_'));
    const prev = seenVersions.get(version);
    if (prev) {
      throw new Error(`Duplicate migration version prefix "${version}": ${prev} and ${file}`);
    }
    seenVersions.set(version, file);
  }

  for (const file of files) {
    const version = file.slice(0, file.indexOf('_'));
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [MIGRATION_LOCK_ID]);
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [
        version
      ]);
      if (applied.rowCount) {
        await client.query('COMMIT');
        continue;
      }
      const sql = await readFile(join(directory, file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [version]);
      await client.query('COMMIT');
      process.stdout.write(`Applied migration ${file}\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
