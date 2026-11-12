import { createHash, randomBytes } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  CustomerLoginInput,
  CustomerProfile,
  CustomerProfilePatchInput,
  CustomerRegisterInput,
  PasswordChangeInput,
  ShippingAddressParts
} from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { config } from '../../config.js';
import { AppError } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { cookieValue } from './guest.js';

const cookieName = 'lapbot_customer';
const guestCookieName = 'lapbot_guest';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

function normalizePhone(raw?: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s().-]/g, '').replace(/^\+84/, '0');
  if (!cleaned) return null;
  if (!/^0[35789][0-9]{8}$/.test(cleaned)) {
    throw new AppError(
      400,
      'INVALID_PHONE',
      'Số điện thoại di động không hợp lệ (cần đúng 10 số bắt đầu bằng 03/05/07/08/09).',
      { phone: 'Cần đúng 10 chữ số bắt đầu bằng 03, 05, 07, 08 hoặc 09.' }
    );
  }
  return cleaned;
}

function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    throw new AppError(400, 'INVALID_EMAIL', 'Địa chỉ email không đúng định dạng.', {
      email: 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: ten@domain.com).'
    });
  }
  return email;
}

function cleanPart(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
}

function sanitizeAddressMeta(raw: unknown): ShippingAddressParts | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const province = typeof obj.province === 'string' ? cleanPart(obj.province) : '';
  const ward = typeof obj.ward === 'string' ? cleanPart(obj.ward) : '';
  const street_detail = typeof obj.street_detail === 'string' ? cleanPart(obj.street_detail) : '';
  const district = typeof obj.district === 'string' ? cleanPart(obj.district) : '';
  const province_code =
    typeof obj.province_code === 'string' && /^[0-9]{2}$/.test(obj.province_code.trim())
      ? obj.province_code.trim()
      : undefined;
  const ward_code =
    typeof obj.ward_code === 'string' && /^[0-9]{5}$/.test(obj.ward_code.trim())
      ? obj.ward_code.trim()
      : undefined;
  if (!province || !ward || !street_detail) return null;
  const address_type =
    obj.address_type === 'HOME' || obj.address_type === 'OFFICE' || obj.address_type === 'CAMPUS'
      ? obj.address_type
      : undefined;
  return {
    province,
    ward,
    street_detail,
    ...(province_code ? { province_code } : {}),
    ...(ward_code ? { ward_code } : {}),
    ...(district ? { district } : {}),
    ...(address_type ? { address_type } : {})
  };
}

function normalizeStructuredAddress(
  rawText?: string,
  rawMeta?: ShippingAddressParts | null
): { address: string; meta: ShippingAddressParts | null } {
  if (rawMeta) {
    const province = cleanPart(rawMeta.province);
    const ward = cleanPart(rawMeta.ward);
    const street_detail = cleanPart(rawMeta.street_detail);
    const province_code =
      typeof rawMeta.province_code === 'string' && /^[0-9]{2}$/.test(rawMeta.province_code.trim())
        ? rawMeta.province_code.trim()
        : undefined;
    const ward_code =
      typeof rawMeta.ward_code === 'string' && /^[0-9]{5}$/.test(rawMeta.ward_code.trim())
        ? rawMeta.ward_code.trim()
        : undefined;
    const address_type =
      rawMeta.address_type === 'HOME' ||
      rawMeta.address_type === 'OFFICE' ||
      rawMeta.address_type === 'CAMPUS'
        ? rawMeta.address_type
        : undefined;

    if (province.length < 2 || ward.length < 2 || street_detail.length < 3) {
      throw new AppError(
        400,
        'INVALID_ADDRESS',
        'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà, tên đường.',
        {
          default_shipping_address:
            'Cần điền Số nhà/Tên đường (tối thiểu 3 ký tự) kèm Phường/Xã/Đặc khu và Tỉnh/Thành phố chuẩn 2026.'
        }
      );
    }

    const formatted = `${street_detail}, ${ward}, ${province}`;
    if (formatted.length > 500) {
      throw new AppError(
        400,
        'INVALID_ADDRESS',
        'Địa chỉ giao hàng không được vượt quá 500 ký tự.',
        {
          default_shipping_address: 'Địa chỉ tối đa 500 ký tự.'
        }
      );
    }

    return {
      address: formatted,
      meta: {
        province,
        ward,
        street_detail,
        ...(province_code ? { province_code } : {}),
        ...(ward_code ? { ward_code } : {}),
        ...(address_type ? { address_type } : {})
      }
    };
  }

  const trimmed = (rawText ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return { address: '', meta: null };
  }

  const segments = trimmed
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (trimmed.length < 12 || trimmed.length > 500 || segments.length < 3) {
    throw new AppError(
      400,
      'INVALID_ADDRESS',
      'Địa chỉ giao hàng chưa đầy đủ. Vui lòng chọn Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà, tên đường.',
      {
        default_shipping_address:
          'Vui lòng nhập đầy đủ Số nhà/Đường, Phường/Xã/Đặc khu, Tỉnh/Thành phố.'
      }
    );
  }

  return { address: trimmed, meta: null };
}

function toProfile(row: Record<string, unknown>): CustomerProfile {
  return {
    customer_id: row.id as string,
    email: row.email as string,
    phone: (row.phone as string) || null,
    full_name: row.full_name as string,
    default_shipping_address: (row.default_shipping_address as string) || '',
    shipping_address_meta: sanitizeAddressMeta(row.shipping_address_meta),
    created_at: new Date(row.created_at as Date | string).toISOString()
  };
}

async function mergeGuestOrdersAndChat(
  client: import('pg').PoolClient,
  customerId: string,
  request: FastifyRequest
) {
  const guestToken = cookieValue(request, guestCookieName);
  if (!guestToken || !/^[a-f0-9]{64}$/.test(guestToken)) return;
  const guestHash = digest(guestToken);

  const guestSession = await client.query<{ id: string }>(
    'SELECT id FROM chat_sessions WHERE guest_token_hash = $1',
    [guestHash]
  );
  if (guestSession.rowCount && guestSession.rows[0]) {
    const sessionId = guestSession.rows[0].id;
    await client.query(
      'UPDATE chat_sessions SET customer_id = $1, updated_at = now() WHERE id = $2 AND customer_id IS NULL',
      [customerId, sessionId]
    );
    await client.query(
      'UPDATE orders SET customer_id = $1, updated_at = now() WHERE session_id = $2 AND customer_id IS NULL',
      [customerId, sessionId]
    );
  }
}

export async function customerSession(request: FastifyRequest): Promise<CustomerProfile> {
  const token = cookieValue(request, cookieName);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    throw new AppError(401, 'CUSTOMER_REQUIRED', 'Vui lòng đăng nhập tài khoản.');
  }

  const result = await pool.query(
    `SELECT c.id, c.email, c.phone, c.full_name, c.default_shipping_address, c.shipping_address_meta, c.created_at
     FROM customer_sessions s
     JOIN customers c ON c.id = s.customer_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND c.is_active = true`,
    [digest(token)]
  );

  if (!result.rowCount) {
    throw new AppError(401, 'CUSTOMER_REQUIRED', 'Phiên đăng nhập đã hết hạn.');
  }

  return toProfile(result.rows[0]!);
}

export async function optionalCustomerSession(
  request: FastifyRequest
): Promise<CustomerProfile | null> {
  try {
    return await customerSession(request);
  } catch {
    return null;
  }
}

export async function registerCustomer(
  input: CustomerRegisterInput,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<CustomerProfile> {
  const email = normalizeEmail(input.email);
  const fullName = input.full_name.replace(/\s+/g, ' ').trim();
  if (fullName.length < 2 || fullName.length > 100) {
    throw new AppError(400, 'INVALID_NAME', 'Họ và tên cần từ 2 đến 100 ký tự.', {
      full_name: 'Họ và tên cần từ 2 đến 100 ký tự.'
    });
  }
  if (!input.password || input.password.length < 8) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Mật khẩu cần tối thiểu 8 ký tự.', {
      password: 'Mật khẩu cần tối thiểu 8 ký tự.'
    });
  }

  const phone = normalizePhone(input.phone);
  const { address, meta } = normalizeStructuredAddress(
    input.default_shipping_address,
    input.shipping_address_meta
  );

  const existing = await pool.query(
    'SELECT email, phone FROM customers WHERE email = $1 OR (phone IS NOT NULL AND phone = $2)',
    [email, phone]
  );
  if (existing.rowCount) {
    for (const r of existing.rows) {
      if (r.email === email) {
        throw new AppError(409, 'EMAIL_EXISTS', 'Email này đã được đăng ký tài khoản.', {
          email: 'Email này đã được sử dụng. Bạn có thể chuyển sang Đăng nhập.'
        });
      }
      if (phone && r.phone === phone) {
        throw new AppError(
          409,
          'PHONE_EXISTS',
          'Số điện thoại này đã được liên kết với tài khoản khác.',
          {
            phone: 'Số điện thoại này đã được đăng ký.'
          }
        );
      }
    }
  }

  const passwordHash = await hashPassword(input.password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO customers(email, phone, password_hash, full_name, default_shipping_address, shipping_address_meta)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [email, phone, passwordHash, fullName, address, meta ? JSON.stringify(meta) : null]
    );
    const customer = inserted.rows[0]!;
    const customerId = customer.id as string;

    const token = randomBytes(32).toString('hex');
    await client.query(
      "INSERT INTO customer_sessions(customer_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 days')",
      [customerId, digest(token)]
    );

    await mergeGuestOrdersAndChat(client, customerId, request);
    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id)
       VALUES ('CUSTOMER', $1, 'CUSTOMER_REGISTER', 'CUSTOMER', $1)`,
      [customerId]
    );

    await client.query('COMMIT');

    reply.header(
      'Set-Cookie',
      `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
        config.nodeEnv === 'production' ? '; Secure' : ''
      }`
    );

    return toProfile(customer);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function loginCustomer(
  input: CustomerLoginInput,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<CustomerProfile> {
  const idRaw = input.identifier.trim();
  if (!idRaw || !input.password) {
    throw new AppError(400, 'INVALID_INPUT', 'Vui lòng nhập tài khoản và mật khẩu.');
  }

  const isEmail = idRaw.includes('@');
  const normalizedEmail = isEmail ? idRaw.toLowerCase() : '';
  const normalizedPhone = isEmail ? '' : idRaw.replace(/[\s().-]/g, '').replace(/^\+84/, '0');

  const result = await pool.query(
    `SELECT * FROM customers WHERE is_active = true AND (email = $1 OR (phone IS NOT NULL AND phone = $2))`,
    [normalizedEmail, normalizedPhone]
  );

  if (!result.rowCount || !(await verifyPassword(input.password, result.rows[0]!.password_hash))) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Email/Số điện thoại hoặc mật khẩu không chính xác.'
    );
  }

  const customer = result.rows[0]!;
  const customerId = customer.id as string;
  const token = randomBytes(32).toString('hex');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "INSERT INTO customer_sessions(customer_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 days')",
      [customerId, digest(token)]
    );
    await mergeGuestOrdersAndChat(client, customerId, request);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  reply.header(
    'Set-Cookie',
    `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
      config.nodeEnv === 'production' ? '; Secure' : ''
    }`
  );

  return toProfile(customer);
}

export async function logoutCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = cookieValue(request, cookieName);
  if (token) {
    await pool.query('DELETE FROM customer_sessions WHERE token_hash = $1', [digest(token)]);
  }
  const secure = config.nodeEnv === 'production' ? '; Secure' : '';
  reply.header('Set-Cookie', [
    `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    `${guestCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  ]);
}

export async function updateCustomerProfile(
  customerId: string,
  input: CustomerProfilePatchInput
): Promise<CustomerProfile> {
  const fields: string[] = [];
  const args: unknown[] = [customerId];

  if (input.full_name !== undefined) {
    const name = input.full_name.replace(/\s+/g, ' ').trim();
    if (name.length < 2 || name.length > 100) {
      throw new AppError(400, 'INVALID_NAME', 'Họ và tên cần từ 2 đến 100 ký tự.', {
        full_name: 'Họ và tên cần từ 2 đến 100 ký tự.'
      });
    }
    args.push(name);
    fields.push(`full_name = $${args.length}`);
  }

  if (input.phone !== undefined) {
    const phone = normalizePhone(input.phone || undefined);
    if (phone) {
      const existing = await pool.query('SELECT id FROM customers WHERE phone = $1 AND id <> $2', [
        phone,
        customerId
      ]);
      if (existing.rowCount) {
        throw new AppError(
          409,
          'PHONE_EXISTS',
          'Số điện thoại này đã được dùng bởi tài khoản khác.',
          {
            phone: 'Số điện thoại này đã thuộc về tài khoản khác.'
          }
        );
      }
    }
    args.push(phone);
    fields.push(`phone = $${args.length}`);
  }

  if (input.default_shipping_address !== undefined || input.shipping_address_meta !== undefined) {
    const { address, meta } = normalizeStructuredAddress(
      input.default_shipping_address,
      input.shipping_address_meta
    );
    args.push(address);
    fields.push(`default_shipping_address = $${args.length}`);
    args.push(meta ? JSON.stringify(meta) : null);
    fields.push(`shipping_address_meta = $${args.length}`);
  }

  if (!fields.length) {
    throw new AppError(400, 'NO_CHANGES', 'Không có thông tin thay đổi.');
  }
  fields.push('updated_at = now()');

  const updated = await pool.query(
    `UPDATE customers SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    args
  );
  return toProfile(updated.rows[0]!);
}

export async function changeCustomerPassword(
  customerId: string,
  input: PasswordChangeInput,
  request?: FastifyRequest
): Promise<void> {
  if (!input.new_password || input.new_password.length < 8) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Mật khẩu mới cần tối thiểu 8 ký tự.', {
      new_password: 'Mật khẩu mới cần tối thiểu 8 ký tự.'
    });
  }
  if (input.current_password === input.new_password) {
    throw new AppError(400, 'SAME_PASSWORD', 'Mật khẩu mới phải khác mật khẩu hiện tại.', {
      new_password: 'Vui lòng chọn mật khẩu mới khác mật khẩu đang dùng.'
    });
  }

  const customerRes = await pool.query('SELECT password_hash FROM customers WHERE id = $1', [
    customerId
  ]);
  if (!customerRes.rowCount) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản.');

  const valid = await verifyPassword(input.current_password, customerRes.rows[0]!.password_hash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Mật khẩu hiện tại không chính xác.', {
      current_password: 'Mật khẩu hiện tại không chính xác.'
    });
  }

  const newHash = await hashPassword(input.new_password);
  const activeToken = request ? cookieValue(request, cookieName) : null;
  const activeTokenHash =
    activeToken && /^[a-f0-9]{64}$/.test(activeToken) ? digest(activeToken) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE customers SET password_hash = $1, updated_at = now() WHERE id = $2',
      [newHash, customerId]
    );
    await client.query(
      'DELETE FROM customer_sessions WHERE customer_id = $1 AND ($2::text IS NULL OR token_hash <> $2)',
      [customerId, activeTokenHash]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
