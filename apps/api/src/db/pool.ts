import pg from 'pg';
import { config } from '../config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
});

pool.on('error', err => {
  process.stderr.write(`[pg-pool] Unexpected error on idle PostgreSQL client: ${err.message}\n`);
});
