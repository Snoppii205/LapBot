import { createHash, randomBytes } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AdminProfile, AdminRole } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { config } from '../../config.js';
import { AppError } from '../../lib/errors.js';
import { cookieValue } from './guest.js';
import { verifyPassword } from '../../lib/password.js';

const cookieName = 'lapbot_admin';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export async function login(
  username: string,
  password: string,
  reply: FastifyReply
): Promise<AdminProfile> {
  const result = await pool.query(
    'SELECT id, username, password_hash, display_name, role, last_login_at FROM admin_users WHERE username = $1 AND is_active = true',
    [username]
  );
  if (!result.rowCount || !(await verifyPassword(password, result.rows[0].password_hash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  const row = result.rows[0];
  const adminId = row.id as string;
  const token = randomBytes(32).toString('hex');

  await pool.query(
    "INSERT INTO admin_sessions(admin_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '8 hours')",
    [adminId, digest(token)]
  );
  await pool.query(
    'UPDATE admin_users SET last_login_at = now(), updated_at = now() WHERE id = $1',
    [adminId]
  );

  reply.header(
    'Set-Cookie',
    `${cookieName}=${token}; Path=/api/v1/admin; HttpOnly; SameSite=Lax; Max-Age=28800${
      config.nodeEnv === 'production' ? '; Secure' : ''
    }`
  );

  return {
    admin_id: adminId,
    username: row.username as string,
    display_name: (row.display_name as string) || (row.username as string),
    role: (row.role as AdminRole) || 'SUPER_ADMIN',
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null
  };
}

export async function adminSession(
  request: FastifyRequest,
  requiredRole?: AdminRole
): Promise<AdminProfile> {
  const token = cookieValue(request, cookieName);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    throw new AppError(401, 'ADMIN_REQUIRED', 'Cần đăng nhập quản trị viên.');
  }

  const result = await pool.query(
    `SELECT u.id AS admin_id, u.username, u.display_name, u.role, u.last_login_at
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.is_active = true`,
    [digest(token)]
  );

  if (!result.rowCount) {
    throw new AppError(401, 'ADMIN_REQUIRED', 'Phiên quản trị viên đã hết hạn.');
  }

  const row = result.rows[0];
  const role = (row.role as AdminRole) || 'SUPER_ADMIN';

  if (requiredRole && requiredRole === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Bạn không có quyền thực hiện thao tác quản trị cấp cao này.'
    );
  }

  return {
    admin_id: row.admin_id as string,
    username: row.username as string,
    display_name: (row.display_name as string) || (row.username as string),
    role,
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null
  };
}

export async function logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = cookieValue(request, cookieName);
  if (token) {
    await pool.query('DELETE FROM admin_sessions WHERE token_hash = $1', [digest(token)]);
  }
  reply.header(
    'Set-Cookie',
    `${cookieName}=; Path=/api/v1/admin; HttpOnly; SameSite=Lax; Max-Age=0${
      config.nodeEnv === 'production' ? '; Secure' : ''
    }`
  );
}
