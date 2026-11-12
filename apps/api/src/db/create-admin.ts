import { STAFF_MIN_PASSWORD_LENGTH } from '@lapbot/contracts';
import { pool } from './pool.js';
import { hashPassword } from '../lib/password.js';

const BOOTSTRAP_MIN_PASSWORD_LENGTH = Math.max(12, STAFF_MIN_PASSWORD_LENGTH);

const username = process.argv[2]?.trim();
const password = process.env.ADMIN_PASSWORD;

if (!username || username.length < 3 || username.length > 80) {
  throw new Error('Usage: npm run admin:create -- <username>; username must be 3–80 characters');
}
if (!password || password.length < BOOTSTRAP_MIN_PASSWORD_LENGTH) {
  throw new Error(
    `Set ADMIN_PASSWORD to a value of at least ${BOOTSTRAP_MIN_PASSWORD_LENGTH} characters for bootstrapping SUPER_ADMIN`
  );
}

const passwordHash = await hashPassword(password);
delete process.env.ADMIN_PASSWORD;

try {
  await pool.query(
    `INSERT INTO admin_users(username, password_hash, display_name, role)
     VALUES ($1, $2, $1, $3)
     ON CONFLICT (username) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
    [username, passwordHash, 'SUPER_ADMIN']
  );
  process.stdout.write(`Created or updated admin user ${username} (SUPER_ADMIN).\n`);
} finally {
  await pool.end();
}
