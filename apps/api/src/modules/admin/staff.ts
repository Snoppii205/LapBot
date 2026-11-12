import {
  adminRoles,
  STAFF_MIN_PASSWORD_LENGTH,
  type AdminRole,
  type AdminStaffMember
} from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';

export async function listStaff(): Promise<AdminStaffMember[]> {
  const result = await pool.query(
    `SELECT id AS admin_id, username, display_name, role, is_active, last_login_at, created_at
     FROM admin_users
     ORDER BY (role = 'SUPER_ADMIN') DESC, username ASC`
  );
  return result.rows.map(r => ({
    admin_id: r.admin_id as string,
    username: r.username as string,
    display_name: (r.display_name as string) || (r.username as string),
    role: r.role as AdminRole,
    is_active: Boolean(r.is_active),
    last_login_at: r.last_login_at ? new Date(r.last_login_at).toISOString() : null,
    created_at: new Date(r.created_at).toISOString()
  }));
}

export async function createStaff(
  adminId: string,
  input: { username: string; password: string; display_name: string; role: AdminRole }
): Promise<AdminStaffMember> {
  const username = input.username.trim();
  const displayName = input.display_name.trim() || username;
  if (!username || username.length < 3 || username.length > 80) {
    throw new AppError(400, 'INVALID_USERNAME', 'Tên đăng nhập từ 3 đến 80 ký tự.');
  }
  if (!input.password || input.password.length < STAFF_MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      'INVALID_PASSWORD',
      `Mật khẩu nhân sự tối thiểu ${STAFF_MIN_PASSWORD_LENGTH} ký tự.`
    );
  }
  if (!adminRoles.includes(input.role)) {
    throw new AppError(400, 'INVALID_ROLE', 'Vai trò không hợp lệ.');
  }

  const existing = await pool.query('SELECT id FROM admin_users WHERE username = $1', [username]);
  if (existing.rowCount) throw conflict('USERNAME_EXISTS', 'Tên đăng nhập này đã tồn tại.');

  const passwordHash = await hashPassword(input.password);
  const inserted = await pool.query(
    `INSERT INTO admin_users(username, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4) RETURNING id, username, display_name, role, is_active, last_login_at, created_at`,
    [username, passwordHash, displayName, input.role]
  );

  await pool.query(
    `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
     VALUES ('ADMIN', $1, 'STAFF_CREATE', 'STAFF', $2, $3)`,
    [adminId, inserted.rows[0]!.id, JSON.stringify({ username, role: input.role })]
  );

  const r = inserted.rows[0]!;
  return {
    admin_id: r.id as string,
    username: r.username as string,
    display_name: r.display_name as string,
    role: r.role as AdminRole,
    is_active: Boolean(r.is_active),
    last_login_at: null,
    created_at: new Date(r.created_at).toISOString()
  };
}

export async function patchStaff(
  adminId: string,
  targetStaffId: string,
  patch: { display_name?: string; role?: AdminRole; is_active?: boolean; password?: string }
): Promise<AdminStaffMember> {
  const targetRes = await pool.query('SELECT * FROM admin_users WHERE id = $1', [targetStaffId]);
  if (!targetRes.rowCount) throw notFound();
  const target = targetRes.rows[0]!;

  if (patch.is_active === false && targetStaffId === adminId) {
    throw new AppError(
      400,
      'CANNOT_DEACTIVATE_SELF',
      'Bạn không thể tự vô hiệu hóa tài khoản của chính mình.'
    );
  }

  if ((patch.is_active === false || patch.role === 'STAFF') && target.role === 'SUPER_ADMIN') {
    const superAdminCountRes = await pool.query(
      "SELECT COUNT(*) AS count FROM admin_users WHERE role = 'SUPER_ADMIN' AND is_active = true AND id <> $1",
      [targetStaffId]
    );
    if (Number(superAdminCountRes.rows[0]?.count || 0) === 0) {
      throw new AppError(
        400,
        'LAST_SUPER_ADMIN',
        'Hệ thống cần ít nhất một tài khoản SUPER_ADMIN đang hoạt động.'
      );
    }
  }

  const fields: string[] = [];
  const args: unknown[] = [targetStaffId];

  if (patch.display_name !== undefined) {
    const d = patch.display_name.trim();
    if (d.length > 100) throw new AppError(400, 'INVALID_NAME', 'Tên hiển thị tối đa 100 ký tự.');
    args.push(d);
    fields.push(`display_name = $${args.length}`);
  }

  if (patch.role !== undefined) {
    if (!adminRoles.includes(patch.role))
      throw new AppError(400, 'INVALID_ROLE', 'Vai trò không hợp lệ.');
    args.push(patch.role);
    fields.push(`role = $${args.length}`);
  }

  if (patch.is_active !== undefined) {
    args.push(patch.is_active);
    fields.push(`is_active = $${args.length}`);
  }

  if (patch.password !== undefined && patch.password.trim()) {
    if (patch.password.length < STAFF_MIN_PASSWORD_LENGTH) {
      throw new AppError(
        400,
        'INVALID_PASSWORD',
        `Mật khẩu tối thiểu ${STAFF_MIN_PASSWORD_LENGTH} ký tự.`
      );
    }
    const newHash = await hashPassword(patch.password);
    args.push(newHash);
    fields.push(`password_hash = $${args.length}`);
  }

  if (!fields.length) throw new AppError(400, 'NO_CHANGES', 'Chưa có thông tin thay đổi.');
  fields.push('updated_at = now()');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(
      `UPDATE admin_users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, username, display_name, role, is_active, last_login_at, created_at`,
      args
    );

    if (patch.is_active === false || patch.password !== undefined) {
      await client.query('DELETE FROM admin_sessions WHERE admin_id = $1', [targetStaffId]);
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'STAFF_PATCH', 'STAFF', $2, $3)`,
      [
        adminId,
        targetStaffId,
        JSON.stringify({
          role: patch.role,
          is_active: patch.is_active,
          display_name: patch.display_name
        })
      ]
    );

    await client.query('COMMIT');
    const r = updated.rows[0]!;
    return {
      admin_id: r.id as string,
      username: r.username as string,
      display_name: (r.display_name as string) || (r.username as string),
      role: r.role as AdminRole,
      is_active: Boolean(r.is_active),
      last_login_at: r.last_login_at ? new Date(r.last_login_at).toISOString() : null,
      created_at: new Date(r.created_at).toISOString()
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function changeOwnPassword(
  adminId: string,
  input: { current_password: string; new_password: string }
): Promise<void> {
  if (!input.new_password || input.new_password.length < STAFF_MIN_PASSWORD_LENGTH) {
    throw new AppError(
      400,
      'INVALID_PASSWORD',
      `Mật khẩu mới tối thiểu ${STAFF_MIN_PASSWORD_LENGTH} ký tự.`
    );
  }

  const adminRes = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [
    adminId
  ]);
  if (!adminRes.rowCount) throw notFound();

  const valid = await verifyPassword(input.current_password, adminRes.rows[0]!.password_hash);
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Mật khẩu hiện tại không đúng.');

  const newHash = await hashPassword(input.new_password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newHash, adminId]
    );
    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id)
       VALUES ('ADMIN', $1, 'STAFF_PASSWORD_CHANGE', 'STAFF', $1)`,
      [adminId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function revokeStaffSessions(
  adminId: string,
  targetStaffId: string
): Promise<{ ok: true; revoked_count: number }> {
  if (targetStaffId === adminId) {
    throw new AppError(
      400,
      'CANNOT_REVOKE_SELF',
      'Không thể thu hồi phiên đăng nhập của chính bạn tại đây. Hãy dùng nút Đăng xuất.'
    );
  }

  const targetRes = await pool.query<{ id: string; username: string }>(
    'SELECT id, username FROM admin_users WHERE id = $1',
    [targetStaffId]
  );
  if (!targetRes.rowCount) throw notFound('Không tìm thấy tài khoản nhân sự.');
  const username = targetRes.rows[0]!.username;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleted = await client.query('DELETE FROM admin_sessions WHERE admin_id = $1', [
      targetStaffId
    ]);
    const revokedCount = deleted.rowCount ?? 0;

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'STAFF_SESSION_REVOKE', 'STAFF', $2, $3)`,
      [adminId, targetStaffId, JSON.stringify({ username, revoked_count: revokedCount })]
    );

    await client.query('COMMIT');
    return { ok: true, revoked_count: revokedCount };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
