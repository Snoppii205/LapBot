import type { AdminAuditEvent, AdminStoreSettings } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { config } from '../../config.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError } from '../../lib/errors.js';
import { parseIsoDateParam } from './orders.js';

let cachedSettings: AdminStoreSettings | null = null;
let cacheTime = 0;

export async function getStoreSettings(): Promise<AdminStoreSettings> {
  const now = Date.now();
  if (cachedSettings && now - cacheTime < 60000) {
    return cachedSettings;
  }

  const result = await pool.query('SELECT * FROM store_settings WHERE id = 1');
  if (!result.rowCount) {
    const fallback: AdminStoreSettings = {
      store_name: 'LapBot — Chuyên gia Laptop & Trợ lý AI',
      shipping_fee_vnd: config.shippingFeeVnd,
      price_tax_note:
        'Giá niêm yết đã bao gồm VAT. Miễn phí kiểm tra phần cứng 15 bước trước khi giao.',
      shipping_scope:
        'Giao hàng toàn quốc — Cho phép đồng kiểm ngoại quan và cấu hình máy trước khi thanh toán COD.',
      warranty_policy:
        'Bảo hành chính hãng 12 tháng phần cứng, hỗ trợ vệ sinh máy & cài đặt phần mềm trọn đời.',
      return_policy: '1 đổi 1 trong 7 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.',
      support_hours: '08:30 – 21:30 (Thứ 2 – Chủ Nhật)',
      contact_channels: [
        'Hotline: 1900 6868',
        'Zalo OA: LapBot Official',
        'Email: support@lapbot.vn'
      ],
      policy_links: [
        'Chính sách bảo hành 12 tháng: Hỗ trợ phần cứng và vệ sinh máy trọn đời',
        'Quy định đổi trả 7 ngày & Giao hàng COD: Cho phép đồng kiểm máy trước khi thanh toán'
      ],
      updated_at: new Date().toISOString()
    };
    return fallback;
  }

  const row = result.rows[0]!;
  cachedSettings = {
    store_name: row.store_name,
    shipping_fee_vnd: Number(row.shipping_fee_vnd),
    price_tax_note: row.price_tax_note,
    shipping_scope: row.shipping_scope,
    warranty_policy: row.warranty_policy,
    return_policy: row.return_policy,
    support_hours: row.support_hours,
    contact_channels: Array.isArray(row.contact_channels)
      ? row.contact_channels
      : JSON.parse(row.contact_channels || '[]'),
    policy_links: Array.isArray(row.policy_links)
      ? row.policy_links
      : JSON.parse(row.policy_links || '[]'),
    updated_at: new Date(row.updated_at).toISOString()
  };
  cacheTime = now;
  return cachedSettings;
}

export async function updateStoreSettings(
  adminId: string,
  patch: Partial<Omit<AdminStoreSettings, 'updated_at'>>
): Promise<AdminStoreSettings> {
  const current = await getStoreSettings();
  const store_name = patch.store_name !== undefined ? patch.store_name.trim() : current.store_name;
  const shipping_fee_vnd =
    patch.shipping_fee_vnd !== undefined
      ? Number(patch.shipping_fee_vnd)
      : current.shipping_fee_vnd;
  const price_tax_note =
    patch.price_tax_note !== undefined ? patch.price_tax_note.trim() : current.price_tax_note;
  const shipping_scope =
    patch.shipping_scope !== undefined ? patch.shipping_scope.trim() : current.shipping_scope;
  const warranty_policy =
    patch.warranty_policy !== undefined ? patch.warranty_policy.trim() : current.warranty_policy;
  const return_policy =
    patch.return_policy !== undefined ? patch.return_policy.trim() : current.return_policy;
  const support_hours =
    patch.support_hours !== undefined ? patch.support_hours.trim() : current.support_hours;
  const contact_channels =
    patch.contact_channels !== undefined ? patch.contact_channels : current.contact_channels;
  const policy_links = patch.policy_links !== undefined ? patch.policy_links : current.policy_links;

  if (shipping_fee_vnd < 0 || shipping_fee_vnd > 10000000) {
    throw new AppError(400, 'INVALID_FEE', 'Phí giao hàng từ 0 đến 10.000.000 VND.');
  }

  const client = await pool.connect();
  let row: Record<string, unknown>;
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO store_settings(id, store_name, shipping_fee_vnd, price_tax_note, shipping_scope, warranty_policy, return_policy, support_hours, contact_channels, policy_links, updated_by, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
       ON CONFLICT (id) DO UPDATE SET
         store_name = EXCLUDED.store_name,
         shipping_fee_vnd = EXCLUDED.shipping_fee_vnd,
         price_tax_note = EXCLUDED.price_tax_note,
         shipping_scope = EXCLUDED.shipping_scope,
         warranty_policy = EXCLUDED.warranty_policy,
         return_policy = EXCLUDED.return_policy,
         support_hours = EXCLUDED.support_hours,
         contact_channels = EXCLUDED.contact_channels,
         policy_links = EXCLUDED.policy_links,
         updated_by = EXCLUDED.updated_by,
         updated_at = now()
       RETURNING *`,
      [
        store_name,
        shipping_fee_vnd,
        price_tax_note,
        shipping_scope,
        warranty_policy,
        return_policy,
        support_hours,
        JSON.stringify(contact_channels),
        JSON.stringify(policy_links),
        adminId
      ]
    );

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'STORE_SETTINGS_UPDATE', 'STORE_SETTINGS', NULL, $2)`,
      [adminId, JSON.stringify({ settings_id: 1, shipping_fee_vnd, store_name })]
    );

    await client.query('COMMIT');
    row = result.rows[0]!;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  cachedSettings = null;
  cacheTime = 0;
  return {
    store_name: row.store_name as string,
    shipping_fee_vnd: Number(row.shipping_fee_vnd),
    price_tax_note: row.price_tax_note as string,
    shipping_scope: row.shipping_scope as string,
    warranty_policy: row.warranty_policy as string,
    return_policy: row.return_policy as string,
    support_hours: row.support_hours as string,
    contact_channels: Array.isArray(row.contact_channels)
      ? (row.contact_channels as string[])
      : JSON.parse(String(row.contact_channels || '[]')),
    policy_links: Array.isArray(row.policy_links)
      ? (row.policy_links as string[])
      : JSON.parse(String(row.policy_links || '[]')),
    updated_at: new Date(row.updated_at as string | Date).toISOString()
  };
}

export async function listAuditEvents(filter: {
  entity_type?: string;
  action?: string;
  actor_type?: string;
  q?: string;
  from?: string;
  to?: string;
  limit: number;
  cursor?: string;
}): Promise<{ items: AdminAuditEvent[]; next_cursor: string | null }> {
  const boundary = decodeKeysetCursor(filter.cursor);
  const validFrom = parseIsoDateParam(filter.from, 'from');
  const validTo = parseIsoDateParam(filter.to, 'to');

  const args: unknown[] = [];
  const clauses: string[] = ['true'];

  if (filter.entity_type) {
    args.push(filter.entity_type);
    clauses.push(`a.entity_type = $${args.length}`);
  }
  if (filter.action) {
    args.push(filter.action);
    clauses.push(`a.action = $${args.length}`);
  }
  if (filter.actor_type) {
    args.push(filter.actor_type);
    clauses.push(`a.actor_type = $${args.length}`);
  }
  if (filter.q) {
    args.push(`%${filter.q.trim()}%`);
    clauses.push(
      `(a.action ILIKE $${args.length} OR a.entity_type ILIKE $${args.length} OR u.username ILIKE $${args.length})`
    );
  }
  if (validFrom) {
    args.push(validFrom);
    clauses.push(`a.created_at >= $${args.length}::date`);
  }
  if (validTo) {
    args.push(validTo);
    clauses.push(`a.created_at < ($${args.length}::date + interval '1 day')`);
  }
  if (boundary) {
    args.push(boundary[0], boundary[1]);
    clauses.push(
      `(a.created_at, a.id) < ($${args.length - 1}::timestamptz, $${args.length}::uuid)`
    );
  }

  args.push(filter.limit + 1);
  const sql = `
    SELECT a.id, a.actor_type, a.actor_id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
           COALESCE(u.display_name, u.username, c.full_name, 'Hệ thống') AS actor_name
    FROM audit_events a
    LEFT JOIN admin_users u ON a.actor_type = 'ADMIN' AND a.actor_id = u.id
    LEFT JOIN customers c ON a.actor_type = 'CUSTOMER' AND a.actor_id = c.id
    WHERE ${clauses.join(' AND ')}
    ORDER BY a.created_at DESC, a.id DESC
    LIMIT $${args.length}
  `;

  const result = await pool.query(sql, args);
  const rows = result.rows.slice(0, filter.limit);
  const last = rows.at(-1);

  return {
    items: rows.map(r => ({
      id: r.id as string,
      actor_type: r.actor_type as string,
      actor_id: (r.actor_id as string) || null,
      actor_name: r.actor_name as string,
      action: r.action as string,
      entity_type: r.entity_type as string,
      entity_id: (r.entity_id as string) || null,
      metadata: typeof r.metadata === 'object' && r.metadata !== null ? r.metadata : {},
      created_at: new Date(r.created_at).toISOString()
    })),
    next_cursor:
      result.rows.length > filter.limit && last
        ? encodeKeysetCursor(last.created_at, last.id)
        : null
  };
}
