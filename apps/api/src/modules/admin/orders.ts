import type { AdminAuditEvent, AdminOrderDetail, AdminOrderSummary } from '@lapbot/contracts';
import type { PoolClient } from 'pg';
import { pool } from '../../db/pool.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { view } from '../orders/service.js';

const allowed: Record<string, string[]> = {
  CONFIRMED_COD: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'CANCELLED']
};

export function parseIsoDateParam(
  value: string | undefined,
  fieldName: string
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(Date.parse(`${trimmed}T00:00:00Z`))) {
    throw new AppError(
      400,
      'INVALID_QUERY',
      `Tham số ${fieldName} không đúng định dạng YYYY-MM-DD.`
    );
  }
  return trimmed;
}

async function fetchOrderTimeline(
  orderId: string,
  db: PoolClient | typeof pool = pool
): Promise<AdminAuditEvent[]> {
  const res = await db.query(
    `SELECT a.id, a.actor_type, a.actor_id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
            COALESCE(u.display_name, u.username, c.full_name, 'Khách vãng lai / Hệ thống') AS actor_name
     FROM audit_events a
     LEFT JOIN admin_users u ON a.actor_type = 'ADMIN' AND a.actor_id = u.id
     LEFT JOIN customers c ON a.actor_type = 'CUSTOMER' AND a.actor_id = c.id
     WHERE a.entity_type = 'ORDER' AND a.entity_id = $1
     ORDER BY a.created_at ASC, a.id ASC`,
    [orderId]
  );

  return res.rows.map(r => ({
    id: r.id as string,
    actor_type: r.actor_type as string,
    actor_id: (r.actor_id as string) || null,
    actor_name: r.actor_name as string,
    action: r.action as string,
    entity_type: r.entity_type as string,
    entity_id: (r.entity_id as string) || null,
    metadata:
      typeof r.metadata === 'object' && r.metadata !== null
        ? (r.metadata as Record<string, unknown>)
        : {},
    created_at: new Date(r.created_at).toISOString()
  }));
}

function buildAdminOrderDetail(
  row: Record<string, unknown>,
  timeline: AdminAuditEvent[]
): AdminOrderDetail {
  return {
    ...view(row as Parameters<typeof view>[0]),
    created_at: row.created_at
      ? new Date(row.created_at as string | Date).toISOString()
      : undefined,
    updated_at: row.updated_at
      ? new Date(row.updated_at as string | Date).toISOString()
      : undefined,
    cancelled_at: row.cancelled_at
      ? new Date(row.cancelled_at as string | Date).toISOString()
      : null,
    timeline
  };
}

export async function adminOrder(orderId: string): Promise<AdminOrderDetail> {
  const result = await pool.query('SELECT * FROM orders WHERE id=$1', [orderId]);
  if (!result.rowCount) throw notFound();
  const timeline = await fetchOrderTimeline(orderId);
  return buildAdminOrderDetail(result.rows[0]!, timeline);
}

export async function adminOrders(
  status: string | undefined,
  limit: number,
  cursor?: string,
  q?: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  items: AdminOrderSummary[];
  next_cursor: string | null;
  counts_by_status: Record<string, number>;
}> {
  const b = decodeKeysetCursor(cursor);
  const validFrom = parseIsoDateParam(fromDate, 'from');
  const validTo = parseIsoDateParam(toDate, 'to');

  const countsResult = await pool.query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::text AS count FROM orders GROUP BY status`
  );
  const counts_by_status: Record<string, number> = {};
  for (const row of countsResult.rows) {
    counts_by_status[row.status] = Number.parseInt(row.count, 10);
  }

  const args: unknown[] = [];
  const whereClauses: string[] = ['true'];

  if (status) {
    args.push(status);
    whereClauses.push(`o.status = $${args.length}`);
  }

  if (q && q.trim()) {
    args.push(`%${q.trim()}%`);
    const p = `$${args.length}`;
    whereClauses.push(
      `(o.order_code ILIKE ${p} OR o.customer_name ILIKE ${p} OR o.customer_phone ILIKE ${p} OR v.sku ILIKE ${p} OR (l.brand || ' ' || l.model_name) ILIKE ${p})`
    );
  }

  if (validFrom) {
    args.push(validFrom);
    whereClauses.push(`o.created_at >= $${args.length}::date`);
  }

  if (validTo) {
    args.push(validTo);
    whereClauses.push(`o.created_at < ($${args.length}::date + interval '1 day')`);
  }

  if (b) {
    args.push(b[0], b[1]);
    whereClauses.push(
      `(o.created_at, o.id) < ($${args.length - 1}::timestamptz, $${args.length}::uuid)`
    );
  }

  args.push(limit + 1);

  const sql = `
    SELECT
      o.id AS order_id,
      o.order_code,
      o.status,
      o.variant_id,
      o.total_vnd,
      o.payment_method,
      o.created_at,
      o.updated_at,
      o.customer_name,
      o.customer_phone,
      o.note,
      TRIM(CONCAT(l.brand, ' ', l.model_name)) AS product_title,
      v.sku,
      (o.customer_id IS NOT NULL) AS is_member
    FROM orders o
    LEFT JOIN laptop_variants v ON v.id = o.variant_id
    LEFT JOIN laptops l ON l.id = v.laptop_id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT $${args.length}
  `;

  const result = await pool.query(sql, args);
  const rows = result.rows.slice(0, limit);
  const last = rows.at(-1);

  return {
    items: rows.map(row => ({
      order_id: row.order_id as string,
      order_code: row.order_code as string,
      status: row.status,
      variant_id: row.variant_id as string,
      total_vnd: Number(row.total_vnd),
      payment_method: row.payment_method === 'VIETQR' ? 'VIETQR' : 'COD',
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      customer_name: (row.customer_name as string) || '',
      customer_phone: (row.customer_phone as string) || '',
      product_title: (row.product_title as string) || '',
      sku: (row.sku as string) || '',
      note: (row.note as string) || '',
      is_member: Boolean(row.is_member)
    })),
    next_cursor:
      result.rows.length > limit && last
        ? encodeKeysetCursor(last.created_at, last.order_id)
        : null,
    counts_by_status
  };
}

export async function transitionOrder(
  orderId: string,
  from: string,
  to: string,
  adminId: string,
  adminNote?: string
): Promise<AdminOrderDetail> {
  if (!allowed[from]?.includes(to))
    throw new AppError(400, 'INVALID_TRANSITION', 'Chuyển trạng thái không hợp lệ.');
  const trimmedNote = adminNote?.trim() || '';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [orderId]);
    if (!result.rowCount) throw notFound();
    const order = result.rows[0]!;
    if (order.status === to) {
      const timeline = await fetchOrderTimeline(orderId, client);
      await client.query('COMMIT');
      return buildAdminOrderDetail(order, timeline);
    }
    if (order.status !== from)
      throw conflict('ORDER_STATE_CONFLICT', 'Trạng thái đơn đã thay đổi.');
    if (to === 'CANCELLED') {
      await client.query(
        'UPDATE laptop_variants SET stock=stock+1,revision=revision+1,updated_at=now() WHERE id=$1',
        [order.variant_id]
      );
    }
    const changed = await client.query(
      `UPDATE orders SET status=$2,cancelled_at=CASE WHEN $2='CANCELLED' THEN now() ELSE cancelled_at END,
      updated_at=now() WHERE id=$1 RETURNING *`,
      [orderId, to]
    );
    const metaPayload: Record<string, unknown> = { from, to };
    if (trimmedNote) {
      metaPayload.note = trimmedNote;
    }
    await client.query(
      `INSERT INTO audit_events(actor_type,actor_id,action,entity_type,entity_id,metadata)
      VALUES ('ADMIN',$1,'ORDER_TRANSITION','ORDER',$2,$3)`,
      [adminId, orderId, JSON.stringify(metaPayload)]
    );
    const timeline = await fetchOrderTimeline(orderId, client);
    await client.query('COMMIT');
    return buildAdminOrderDetail(changed.rows[0]!, timeline);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
