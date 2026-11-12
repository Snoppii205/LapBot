import {
  customerTags,
  type AdminCustomerDetail,
  type AdminCustomerPage,
  type AdminCustomerSummary,
  type AdminGuestBuyerPage,
  type AdminGuestBuyerSummary,
  type AdminOrderSummary,
  type CustomerSort,
  type CustomerTag,
  type GuestBuyerFilter
} from '@lapbot/contracts';
import type { PoolClient } from 'pg';
import { pool } from '../../db/pool.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { hashPassword } from '../../lib/password.js';

function normalizeAdminCustomerEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    throw new AppError(400, 'INVALID_EMAIL', 'Địa chỉ email khách hàng không hợp lệ.');
  }
  return email;
}

function normalizeAdminCustomerPhone(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const cleaned = raw.replace(/[\s().-]/g, '').replace(/^\+84/, '0');
  if (!cleaned) return null;
  if (!/^0[35789][0-9]{8}$/.test(cleaned)) {
    throw new AppError(
      400,
      'INVALID_PHONE',
      'Số điện thoại phải gồm đúng 10 chữ số bắt đầu bằng 03, 05, 07, 08 hoặc 09.'
    );
  }
  return cleaned;
}

function normalizeAdminCustomerName(raw: string): string {
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 100) {
    throw new AppError(400, 'INVALID_NAME', 'Họ tên khách hàng phải từ 2 đến 100 ký tự.');
  }
  return name;
}

function isPgUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

function mapCustomerSummaryRow(r: Record<string, unknown>): AdminCustomerSummary {
  const rawTag = r.customer_tag as string | undefined;
  const tag: CustomerTag =
    rawTag && customerTags.includes(rawTag as CustomerTag) ? (rawTag as CustomerTag) : 'STANDARD';
  return {
    customer_id: r.customer_id as string,
    email: r.email as string,
    phone: (r.phone as string) || null,
    full_name: r.full_name as string,
    is_active: Boolean(r.is_active),
    customer_tag: tag,
    admin_note: typeof r.admin_note === 'string' ? r.admin_note : '',
    orders_count: Number(r.orders_count) || 0,
    delivered_orders_count: Number(r.delivered_orders_count) || 0,
    cancelled_orders_count: Number(r.cancelled_orders_count) || 0,
    total_spent_vnd: Number(r.total_spent_vnd) || 0,
    created_at: new Date(r.created_at as string | Date).toISOString()
  };
}

function mapOrderRow(o: Record<string, unknown>, isMember: boolean): AdminOrderSummary {
  const snap = (o.product_snapshot ?? {}) as Record<string, unknown>;
  const productTitle = [snap.brand, snap.model_name]
    .filter(v => typeof v === 'string' && v.trim())
    .join(' ')
    .trim();
  const sku = typeof snap.sku === 'string' ? snap.sku : undefined;
  return {
    order_id: o.order_id as string,
    order_code: o.order_code as string,
    status: o.status as AdminOrderSummary['status'],
    variant_id: o.variant_id as string,
    total_vnd: Number(o.total_vnd),
    created_at: new Date(o.created_at as string | Date).toISOString(),
    updated_at: new Date(o.updated_at as string | Date).toISOString(),
    ...(typeof o.customer_name === 'string' ? { customer_name: o.customer_name } : {}),
    ...(typeof o.customer_phone === 'string' ? { customer_phone: o.customer_phone } : {}),
    ...(productTitle ? { product_title: productTitle } : {}),
    ...(sku ? { sku } : {}),
    ...(typeof o.note === 'string' ? { note: o.note } : {}),
    is_member: isMember
  };
}

async function fetchCustomerDetailWithQueryable(
  queryable: Pick<PoolClient, 'query'>,
  customerId: string
): Promise<AdminCustomerDetail> {
  const result = await queryable.query(
    `SELECT
       c.id AS customer_id, c.email, c.phone, c.full_name, c.default_shipping_address,
       c.is_active, c.customer_tag, c.admin_note, c.created_at,
       COUNT(o.id)::int AS orders_count,
       COUNT(o.id) FILTER (WHERE o.status = 'DELIVERED')::int AS delivered_orders_count,
       COUNT(o.id) FILTER (WHERE o.status = 'CANCELLED')::int AS cancelled_orders_count,
       COALESCE(SUM(o.total_vnd) FILTER (WHERE o.status = 'DELIVERED'), 0)::bigint AS total_spent_vnd
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [customerId]
  );

  if (!result.rowCount) throw notFound('Không tìm thấy tài khoản khách hàng.');
  const row = result.rows[0] as Record<string, unknown>;
  const phone = (row.phone as string) || null;

  const runOrders = () =>
    queryable.query(
      `SELECT id AS order_id, order_code, status, variant_id, total_vnd,
              customer_name, customer_phone, note, product_snapshot, created_at, updated_at
       FROM orders
       WHERE customer_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 50`,
      [customerId]
    );
  const runChats = () =>
    queryable.query(
      `SELECT s.id AS session_id, s.control_mode, s.needs_human, s.updated_at,
              (SELECT COUNT(*)::int FROM chat_messages m WHERE m.session_id = s.id) AS messages_count
       FROM chat_sessions s
       WHERE s.customer_id = $1
       ORDER BY s.updated_at DESC, s.id DESC
       LIMIT 20`,
      [customerId]
    );
  const runUnlinked = () =>
    phone
      ? queryable.query<{ cnt: number }>(
          'SELECT COUNT(*)::int AS cnt FROM orders WHERE customer_id IS NULL AND customer_phone = $1',
          [phone]
        )
      : Promise.resolve({ rows: [{ cnt: 0 }] });

  let ordersData: Awaited<ReturnType<typeof runOrders>>;
  let chatData: Awaited<ReturnType<typeof runChats>>;
  let unlinkedRes: Awaited<ReturnType<typeof runUnlinked>>;

  if (queryable === pool) {
    [ordersData, chatData, unlinkedRes] = await Promise.all([
      runOrders(),
      runChats(),
      runUnlinked()
    ]);
  } else {
    ordersData = await runOrders();
    chatData = await runChats();
    unlinkedRes = await runUnlinked();
  }

  return {
    ...mapCustomerSummaryRow(row),
    default_shipping_address: (row.default_shipping_address as string) || '',
    orders: ordersData.rows.map(o => mapOrderRow(o as Record<string, unknown>, true)),
    chat_sessions: chatData.rows.map(s => ({
      session_id: s.session_id as string,
      control_mode: (s.control_mode as 'AI' | 'AGENT') || 'AI',
      needs_human: Boolean(s.needs_human),
      messages_count: Number(s.messages_count) || 0,
      updated_at: new Date(s.updated_at as string | Date).toISOString()
    })),
    unlinked_phone_orders_count: Number(unlinkedRes.rows[0]?.cnt ?? 0)
  };
}

export async function listCustomers(
  q?: string,
  isActive?: boolean,
  limit = 50,
  cursor?: string,
  extra?: {
    customer_tag?: CustomerTag;
    sort?: CustomerSort;
    offset?: number;
  }
): Promise<AdminCustomerPage> {
  const boundary = decodeKeysetCursor(cursor);
  if (boundary && extra?.offset !== undefined) {
    throw new AppError(400, 'INVALID_QUERY', 'Không dùng đồng thời cursor và offset.');
  }

  const baseArgs: unknown[] = [];
  const baseClauses: string[] = ['true'];

  if (isActive !== undefined) {
    baseArgs.push(isActive);
    baseClauses.push(`c.is_active = $${baseArgs.length}`);
  }

  if (extra?.customer_tag) {
    baseArgs.push(extra.customer_tag);
    baseClauses.push(`c.customer_tag = $${baseArgs.length}`);
  }

  if (q && q.trim()) {
    baseArgs.push(`%${q.trim().replace(/[\\%_]/g, '\\$&')}%`);
    baseClauses.push(
      `(c.email ILIKE $${baseArgs.length} ESCAPE '\\' OR c.full_name ILIKE $${baseArgs.length} ESCAPE '\\' OR c.phone ILIKE $${baseArgs.length} ESCAPE '\\' OR c.admin_note ILIKE $${baseArgs.length} ESCAPE '\\')`
    );
  }

  const sortMode: CustomerSort = boundary ? 'newest' : (extra?.sort ?? 'newest');
  let orderBySql = 'c.created_at DESC, c.id DESC';
  if (sortMode === 'spent_desc') {
    orderBySql = 'total_spent_vnd DESC, orders_count DESC, c.created_at DESC, c.id DESC';
  } else if (sortMode === 'orders_desc') {
    orderBySql = 'orders_count DESC, total_spent_vnd DESC, c.created_at DESC, c.id DESC';
  } else if (sortMode === 'cancelled_desc') {
    orderBySql = 'cancelled_orders_count DESC, orders_count DESC, c.created_at DESC, c.id DESC';
  }

  const itemArgs = [...baseArgs];
  const itemClauses = [...baseClauses];
  if (boundary) {
    itemArgs.push(boundary[0], boundary[1]);
    itemClauses.push(
      `(c.created_at, c.id) < ($${itemArgs.length - 1}::timestamptz, $${itemArgs.length}::uuid)`
    );
  }

  const effectiveOffset = boundary ? 0 : (extra?.offset ?? 0);
  itemArgs.push(limit + 1);
  let tailSql = `LIMIT $${itemArgs.length}`;
  if (!boundary && effectiveOffset > 0) {
    itemArgs.push(effectiveOffset);
    tailSql += ` OFFSET $${itemArgs.length}`;
  }

  const itemsSql = `
    SELECT
      c.id AS customer_id, c.email, c.phone, c.full_name, c.is_active, c.customer_tag, c.admin_note, c.created_at,
      COUNT(o.id)::int AS orders_count,
      COUNT(o.id) FILTER (WHERE o.status = 'DELIVERED')::int AS delivered_orders_count,
      COUNT(o.id) FILTER (WHERE o.status = 'CANCELLED')::int AS cancelled_orders_count,
      COALESCE(SUM(o.total_vnd) FILTER (WHERE o.status = 'DELIVERED'), 0)::bigint AS total_spent_vnd
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    WHERE ${itemClauses.join(' AND ')}
    GROUP BY c.id
    ORDER BY ${orderBySql}
    ${tailSql}
  `;

  const countSql = `SELECT COUNT(*)::int AS total FROM customers c WHERE ${baseClauses.join(' AND ')}`;

  const kpiSql = `
    SELECT
      (SELECT COUNT(*)::int FROM customers) AS total_members,
      (SELECT COUNT(*)::int FROM customers WHERE is_active = true) AS active_members,
      (SELECT COUNT(*)::int FROM customers WHERE is_active = false) AS locked_members,
      (SELECT COUNT(*)::int FROM customers WHERE customer_tag IN ('VIP', 'CORPORATE')) AS vip_members,
      (SELECT COUNT(*)::int FROM customers WHERE customer_tag = 'WATCHLIST') AS watchlist_members,
      (SELECT COUNT(DISTINCT customer_phone)::int FROM orders WHERE customer_id IS NULL) AS guest_buyers_count,
      (SELECT COALESCE(SUM(total_vnd), 0)::bigint FROM orders WHERE customer_id IS NOT NULL AND status = 'DELIVERED') AS total_member_revenue_vnd
  `;

  const [result, countRes, kpiRes] = await Promise.all([
    pool.query(itemsSql, itemArgs),
    pool.query<{ total: number }>(countSql, baseArgs),
    pool.query(kpiSql)
  ]);

  const rows = result.rows.slice(0, limit);
  const hasMore = result.rows.length > limit;
  const last = rows.at(-1);
  const totalCount = Number(countRes.rows[0]?.total ?? 0);
  const k = kpiRes.rows[0] ?? {};

  return {
    items: rows.map(r => mapCustomerSummaryRow(r as Record<string, unknown>)),
    next_cursor:
      hasMore && last && sortMode === 'newest' && extra?.offset === undefined
        ? encodeKeysetCursor(last.created_at, last.customer_id)
        : null,
    total_count: totalCount,
    next_offset: !boundary && hasMore ? effectiveOffset + rows.length : null,
    kpi: {
      total_members: Number(k.total_members) || 0,
      active_members: Number(k.active_members) || 0,
      locked_members: Number(k.locked_members) || 0,
      vip_members: Number(k.vip_members) || 0,
      watchlist_members: Number(k.watchlist_members) || 0,
      guest_buyers_count: Number(k.guest_buyers_count) || 0,
      total_member_revenue_vnd: Number(k.total_member_revenue_vnd) || 0
    }
  };
}

export async function getCustomer(customerId: string): Promise<AdminCustomerDetail> {
  return fetchCustomerDetailWithQueryable(pool, customerId);
}

async function linkGuestRecordsByPhone(
  client: PoolClient,
  customerId: string,
  phone: string
): Promise<number> {
  const linkedOrders = await client.query<{ session_id: string }>(
    `UPDATE orders
     SET customer_id = $1, updated_at = now()
     WHERE customer_id IS NULL AND customer_phone = $2
     RETURNING session_id`,
    [customerId, phone]
  );
  const sessionIds = Array.from(new Set(linkedOrders.rows.map(r => r.session_id).filter(Boolean)));
  if (sessionIds.length > 0) {
    await client.query(
      `UPDATE chat_sessions
       SET customer_id = $1, updated_at = now()
       WHERE customer_id IS NULL AND id = ANY($2::uuid[])`,
      [customerId, sessionIds]
    );
  }
  return linkedOrders.rowCount ?? 0;
}

export async function createAdminCustomer(
  adminId: string,
  input: {
    email: string;
    password: string;
    full_name: string;
    phone?: string | null;
    default_shipping_address?: string;
    customer_tag?: CustomerTag;
    admin_note?: string;
    link_guest_orders?: boolean;
  }
): Promise<AdminCustomerDetail> {
  const email = normalizeAdminCustomerEmail(input.email);
  const fullName = normalizeAdminCustomerName(input.full_name);
  const phone = normalizeAdminCustomerPhone(input.phone);
  if (!input.password || input.password.length < 8 || input.password.length > 128) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Mật khẩu khách hàng phải từ 8 đến 128 ký tự.');
  }
  const address = (input.default_shipping_address ?? '').replace(/\s+/g, ' ').trim();
  if (address.length > 500) {
    throw new AppError(400, 'INVALID_ADDRESS', 'Địa chỉ giao hàng mặc định tối đa 500 ký tự.');
  }
  const tag: CustomerTag = input.customer_tag ?? 'STANDARD';
  if (!customerTags.includes(tag)) {
    throw new AppError(400, 'INVALID_TAG', 'Nhãn phân loại khách hàng không hợp lệ.');
  }
  const adminNote = (input.admin_note ?? '').trim();
  if (adminNote.length > 2000) {
    throw new AppError(400, 'INVALID_NOTE', 'Ghi chú nội bộ tối đa 2000 ký tự.');
  }

  const passwordHash = await hashPassword(input.password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const emailDup = await client.query('SELECT id FROM customers WHERE LOWER(email) = LOWER($1)', [
      email
    ]);
    if (emailDup.rowCount) {
      throw conflict('EMAIL_EXISTS', 'Địa chỉ email này đã được đăng ký cho tài khoản khác.');
    }
    if (phone) {
      const phoneDup = await client.query('SELECT id FROM customers WHERE phone = $1', [phone]);
      if (phoneDup.rowCount) {
        throw conflict(
          'PHONE_EXISTS',
          'Số điện thoại này đã được gắn với một tài khoản thành viên khác.'
        );
      }
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO customers(email, phone, password_hash, full_name, default_shipping_address, customer_tag, admin_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [email, phone, passwordHash, fullName, address, tag, adminNote]
    );
    const customerId = inserted.rows[0]!.id;

    let linkedCount = 0;
    if (phone && input.link_guest_orders !== false) {
      linkedCount = await linkGuestRecordsByPhone(client, customerId, phone);
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'CUSTOMER_CREATE', 'CUSTOMER', $2, $3)`,
      [
        adminId,
        customerId,
        JSON.stringify({ email, phone, customer_tag: tag, linked_orders: linkedCount })
      ]
    );

    const detail = await fetchCustomerDetailWithQueryable(client, customerId);
    await client.query('COMMIT');
    return detail;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (isPgUniqueViolation(err)) {
      throw conflict('CUSTOMER_EXISTS', 'Email hoặc số điện thoại này đã tồn tại trên hệ thống.');
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function patchCustomer(
  adminId: string,
  customerId: string,
  patch: {
    is_active?: boolean;
    full_name?: string;
    email?: string;
    phone?: string | null;
    default_shipping_address?: string;
    customer_tag?: CustomerTag;
    admin_note?: string;
    new_password?: string;
    link_phone_orders?: boolean;
  }
): Promise<AdminCustomerDetail> {
  const fields: string[] = [];
  const args: unknown[] = [customerId];
  const changedMeta: Record<string, unknown> = {};

  if (patch.full_name !== undefined) {
    const val = normalizeAdminCustomerName(patch.full_name);
    args.push(val);
    fields.push(`full_name = $${args.length}`);
    changedMeta.full_name = val;
  }

  let normalizedEmail: string | undefined;
  if (patch.email !== undefined) {
    normalizedEmail = normalizeAdminCustomerEmail(patch.email);
    args.push(normalizedEmail);
    fields.push(`email = $${args.length}`);
    changedMeta.email = normalizedEmail;
  }

  let normalizedPhone: string | null | undefined;
  if (patch.phone !== undefined) {
    normalizedPhone = normalizeAdminCustomerPhone(patch.phone);
    args.push(normalizedPhone);
    fields.push(`phone = $${args.length}`);
    changedMeta.phone = normalizedPhone;
  }

  if (patch.default_shipping_address !== undefined) {
    const addr = patch.default_shipping_address.replace(/\s+/g, ' ').trim();
    if (addr.length > 500) {
      throw new AppError(400, 'INVALID_ADDRESS', 'Địa chỉ giao hàng mặc định tối đa 500 ký tự.');
    }
    args.push(addr);
    fields.push(`default_shipping_address = $${args.length}`);
    changedMeta.default_shipping_address = addr;
  }

  if (patch.customer_tag !== undefined) {
    if (!customerTags.includes(patch.customer_tag)) {
      throw new AppError(400, 'INVALID_TAG', 'Nhãn phân loại khách hàng không hợp lệ.');
    }
    args.push(patch.customer_tag);
    fields.push(`customer_tag = $${args.length}`);
    changedMeta.customer_tag = patch.customer_tag;
  }

  if (patch.admin_note !== undefined) {
    const note = patch.admin_note.trim();
    if (note.length > 2000) {
      throw new AppError(400, 'INVALID_NOTE', 'Ghi chú nội bộ tối đa 2000 ký tự.');
    }
    args.push(note);
    fields.push(`admin_note = $${args.length}`);
    changedMeta.admin_note_updated = true;
  }

  if (patch.is_active !== undefined) {
    args.push(patch.is_active);
    fields.push(`is_active = $${args.length}`);
    changedMeta.is_active = patch.is_active;
  }

  const hasPasswordReset = Boolean(
    patch.new_password !== undefined && patch.new_password.length > 0
  );
  if (hasPasswordReset) {
    if (patch.new_password!.length < 8 || patch.new_password!.length > 128) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Mật khẩu đặt lại phải từ 8 đến 128 ký tự.');
    }
    const newHash = await hashPassword(patch.new_password!);
    args.push(newHash);
    fields.push(`password_hash = $${args.length}`);
  }

  if (!fields.length && !patch.link_phone_orders) {
    throw new AppError(400, 'NO_CHANGES', 'Chưa có thông tin thay đổi.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingRes = await client.query<{ id: string; phone: string | null }>(
      'SELECT id, phone FROM customers WHERE id = $1 FOR UPDATE',
      [customerId]
    );
    if (!existingRes.rowCount) throw notFound('Không tìm thấy tài khoản khách hàng.');

    if (normalizedEmail !== undefined) {
      const dup = await client.query(
        'SELECT id FROM customers WHERE LOWER(email) = LOWER($1) AND id <> $2',
        [normalizedEmail, customerId]
      );
      if (dup.rowCount)
        throw conflict('EMAIL_EXISTS', 'Địa chỉ email này đã thuộc về khách hàng khác.');
    }

    if (normalizedPhone !== undefined && normalizedPhone !== null) {
      const dup = await client.query('SELECT id FROM customers WHERE phone = $1 AND id <> $2', [
        normalizedPhone,
        customerId
      ]);
      if (dup.rowCount)
        throw conflict('PHONE_EXISTS', 'Số điện thoại này đã thuộc về khách hàng khác.');
    }

    let currentPhone = normalizedPhone !== undefined ? normalizedPhone : existingRes.rows[0]!.phone;

    if (fields.length > 0) {
      fields.push('updated_at = now()');
      const updated = await client.query<{ phone: string | null }>(
        `UPDATE customers SET ${fields.join(', ')} WHERE id = $1 RETURNING phone`,
        args
      );
      currentPhone = updated.rows[0]?.phone ?? null;
    }

    if (patch.is_active === false || hasPasswordReset) {
      await client.query('DELETE FROM customer_sessions WHERE customer_id = $1', [customerId]);
    }

    if (Object.keys(changedMeta).length > 0) {
      await client.query(
        `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
         VALUES ('ADMIN', $1, 'CUSTOMER_PATCH', 'CUSTOMER', $2, $3)`,
        [adminId, customerId, JSON.stringify(changedMeta)]
      );
    }

    if (hasPasswordReset) {
      await client.query(
        `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
         VALUES ('ADMIN', $1, 'CUSTOMER_PASSWORD_RESET', 'CUSTOMER', $2, $3)`,
        [adminId, customerId, JSON.stringify({ sessions_revoked: true })]
      );
    }

    if (patch.link_phone_orders) {
      if (!currentPhone) {
        throw new AppError(
          400,
          'MISSING_PHONE',
          'Tài khoản khách hàng chưa có số điện thoại để đối chiếu đơn cũ.'
        );
      }
      const linkedCount = await linkGuestRecordsByPhone(client, customerId, currentPhone);
      await client.query(
        `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
         VALUES ('ADMIN', $1, 'CUSTOMER_LINK_ORDERS', 'CUSTOMER', $2, $3)`,
        [adminId, customerId, JSON.stringify({ phone: currentPhone, linked_orders: linkedCount })]
      );
    }

    const detail = await fetchCustomerDetailWithQueryable(client, customerId);
    await client.query('COMMIT');
    return detail;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (isPgUniqueViolation(err)) {
      throw conflict('CUSTOMER_EXISTS', 'Email hoặc số điện thoại này đã được sử dụng.');
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function listGuestBuyers(opts?: {
  q?: string;
  filter?: GuestBuyerFilter;
  sort?: CustomerSort;
  limit?: number;
  offset?: number;
}): Promise<AdminGuestBuyerPage> {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  const filter: GuestBuyerFilter = opts?.filter ?? 'all';
  const sort: CustomerSort = opts?.sort ?? 'newest';

  const args: unknown[] = [];
  const orderWhere: string[] = ['o.customer_id IS NULL'];

  if (opts?.q && opts.q.trim()) {
    args.push(`%${opts.q.trim().replace(/[\\%_]/g, '\\$&')}%`);
    orderWhere.push(
      `(o.customer_phone ILIKE $${args.length} ESCAPE '\\' OR o.customer_name ILIKE $${args.length} ESCAPE '\\' OR o.shipping_address ILIKE $${args.length} ESCAPE '\\' OR o.order_code ILIKE $${args.length} ESCAPE '\\')`
    );
  }

  let postFilterSql = 'WHERE true';
  if (filter === 'high_cancel') {
    postFilterSql = 'WHERE g.cancelled_count >= 2 AND g.cancelled_count > g.delivered_count';
  } else if (filter === 'vip_guest') {
    postFilterSql = 'WHERE g.total_spent_vnd >= 20000000 OR g.delivered_count >= 2';
  } else if (filter === 'unlinked') {
    postFilterSql = 'WHERE cm.id IS NULL';
  }

  let orderBySql = 'g.last_order_at DESC, g.phone ASC';
  if (sort === 'spent_desc') {
    orderBySql = 'g.total_spent_vnd DESC, g.orders_count DESC, g.last_order_at DESC';
  } else if (sort === 'orders_desc') {
    orderBySql = 'g.orders_count DESC, g.total_spent_vnd DESC, g.last_order_at DESC';
  } else if (sort === 'cancelled_desc') {
    orderBySql = 'g.cancelled_count DESC, g.orders_count DESC, g.last_order_at DESC';
  }

  const baseCte = `
    WITH grouped_guests AS (
      SELECT
        o.customer_phone AS phone,
        (ARRAY_AGG(o.customer_name ORDER BY o.created_at DESC, o.id DESC))[1] AS latest_name,
        (ARRAY_AGG(o.shipping_address ORDER BY o.created_at DESC, o.id DESC))[1] AS latest_address,
        COUNT(*)::int AS orders_count,
        COUNT(*) FILTER (WHERE o.status = 'DELIVERED')::int AS delivered_count,
        COUNT(*) FILTER (WHERE o.status = 'CANCELLED')::int AS cancelled_count,
        COUNT(*) FILTER (WHERE o.status IN ('CONFIRMED_COD', 'PROCESSING', 'SHIPPING'))::int AS active_orders_count,
        COALESCE(SUM(o.total_vnd) FILTER (WHERE o.status = 'DELIVERED'), 0)::bigint AS total_spent_vnd,
        MAX(o.created_at) AS last_order_at
      FROM orders o
      WHERE ${orderWhere.join(' AND ')}
      GROUP BY o.customer_phone
    )
  `;

  const itemArgs = [...args, limit + 1];
  let tailSql = `LIMIT $${itemArgs.length}`;
  if (offset > 0) {
    itemArgs.push(offset);
    tailSql += ` OFFSET $${itemArgs.length}`;
  }

  const [rowsRes, countRes] = await Promise.all([
    pool.query(
      `${baseCte}
       SELECT g.*, cm.id AS matched_member_id, cm.email AS matched_member_email
       FROM grouped_guests g
       LEFT JOIN customers cm ON cm.phone = g.phone
       ${postFilterSql}
       ORDER BY ${orderBySql}
       ${tailSql}`,
      itemArgs
    ),
    pool.query<{ total: number }>(
      `${baseCte}
       SELECT COUNT(*)::int AS total
       FROM grouped_guests g
       LEFT JOIN customers cm ON cm.phone = g.phone
       ${postFilterSql}`,
      args
    )
  ]);

  const pageRows = rowsRes.rows.slice(0, limit);
  const hasMore = rowsRes.rows.length > limit;
  const totalCount = Number(countRes.rows[0]?.total ?? 0);
  const phones = pageRows.map(r => r.phone as string);

  const ordersByPhone = new Map<string, AdminOrderSummary[]>();
  if (phones.length > 0) {
    const recentOrdersRes = await pool.query(
      `SELECT id AS order_id, order_code, status, variant_id, total_vnd,
              customer_name, customer_phone, note, product_snapshot, created_at, updated_at
       FROM orders
       WHERE customer_id IS NULL AND customer_phone = ANY($1::text[])
       ORDER BY created_at DESC, id DESC`,
      [phones]
    );
    for (const row of recentOrdersRes.rows) {
      const p = row.customer_phone as string;
      const list = ordersByPhone.get(p) ?? [];
      if (list.length < 5) {
        list.push(mapOrderRow(row as Record<string, unknown>, false));
        ordersByPhone.set(p, list);
      }
    }
  }

  const items: AdminGuestBuyerSummary[] = pageRows.map(r => {
    const delivered = Number(r.delivered_count) || 0;
    const cancelled = Number(r.cancelled_count) || 0;
    const spent = Number(r.total_spent_vnd) || 0;
    let riskFlag: 'HIGH_CANCEL' | 'VIP_GUEST' | 'NORMAL' = 'NORMAL';
    if (cancelled >= 2 && cancelled > delivered) {
      riskFlag = 'HIGH_CANCEL';
    } else if (spent >= 20_000_000 || delivered >= 2) {
      riskFlag = 'VIP_GUEST';
    }
    const phone = r.phone as string;
    return {
      phone,
      latest_name: (r.latest_name as string) || 'Khách vãng lai',
      latest_address: (r.latest_address as string) || '',
      orders_count: Number(r.orders_count) || 0,
      delivered_count: delivered,
      cancelled_count: cancelled,
      active_orders_count: Number(r.active_orders_count) || 0,
      total_spent_vnd: spent,
      last_order_at: new Date(r.last_order_at as string | Date).toISOString(),
      risk_flag: riskFlag,
      matched_member_id: (r.matched_member_id as string) || null,
      matched_member_email: (r.matched_member_email as string) || null,
      recent_orders: ordersByPhone.get(phone) ?? []
    };
  });

  return {
    items,
    total_count: totalCount,
    next_offset: hasMore ? offset + items.length : null
  };
}

export async function promoteGuestToCustomer(
  adminId: string,
  input: {
    phone: string;
    email: string;
    password: string;
    full_name?: string;
    default_shipping_address?: string;
    customer_tag?: CustomerTag;
    admin_note?: string;
  }
): Promise<AdminCustomerDetail> {
  const phone = normalizeAdminCustomerPhone(input.phone);
  if (!phone) {
    throw new AppError(400, 'INVALID_PHONE', 'Số điện thoại khách vãng lai không hợp lệ.');
  }
  const email = normalizeAdminCustomerEmail(input.email);
  if (!input.password || input.password.length < 8 || input.password.length > 128) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Mật khẩu khởi tạo phải từ 8 đến 128 ký tự.');
  }

  const latestGuestRes = await pool.query<{ customer_name: string; shipping_address: string }>(
    `SELECT customer_name, shipping_address
     FROM orders
     WHERE customer_id IS NULL AND customer_phone = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [phone]
  );
  const fallbackName = latestGuestRes.rows[0]?.customer_name ?? 'Khách hàng LapBot';
  const fallbackAddress = latestGuestRes.rows[0]?.shipping_address ?? '';

  const fullName = normalizeAdminCustomerName(
    input.full_name?.trim() ? input.full_name : fallbackName
  );
  const address = (
    input.default_shipping_address !== undefined ? input.default_shipping_address : fallbackAddress
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
  const tag: CustomerTag = input.customer_tag ?? 'STANDARD';
  const adminNote = (input.admin_note ?? '').trim().slice(0, 2000);

  const passwordHash = await hashPassword(input.password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingPhone = await client.query<{ id: string }>(
      'SELECT id FROM customers WHERE phone = $1 FOR UPDATE',
      [phone]
    );
    if (existingPhone.rowCount) {
      throw conflict(
        'PHONE_ALREADY_MEMBER',
        'Số điện thoại này đã có tài khoản thành viên. Hãy mở hồ sơ thành viên đó và bấm "Gộp đơn theo SĐT".'
      );
    }

    const existingEmail = await client.query(
      'SELECT id FROM customers WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (existingEmail.rowCount) {
      throw conflict('EMAIL_EXISTS', 'Địa chỉ email này đã thuộc về một tài khoản khác.');
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO customers(email, phone, password_hash, full_name, default_shipping_address, customer_tag, admin_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [email, phone, passwordHash, fullName, address, tag, adminNote]
    );
    const customerId = inserted.rows[0]!.id;
    const linkedOrders = await linkGuestRecordsByPhone(client, customerId, phone);

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'GUEST_PROMOTE_MEMBER', 'CUSTOMER', $2, $3)`,
      [
        adminId,
        customerId,
        JSON.stringify({ phone, email, linked_orders: linkedOrders, customer_tag: tag })
      ]
    );

    const detail = await fetchCustomerDetailWithQueryable(client, customerId);
    await client.query('COMMIT');
    return detail;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (isPgUniqueViolation(err)) {
      throw conflict('CUSTOMER_EXISTS', 'Email hoặc số điện thoại này đã được đăng ký.');
    }
    throw err;
  } finally {
    client.release();
  }
}
