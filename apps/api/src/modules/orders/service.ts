import { createHash, randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import type {
  OrderStatus,
  OrderView,
  PaymentMethod,
  ProductSnapshot,
  ShippingAddressParts
} from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { config } from '../../config.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { getStoreSettings } from '../admin/settings.js';

type Row = {
  id: string;
  session_id: string;
  order_code: string;
  status: OrderStatus;
  variant_id: string;
  product_snapshot: ProductSnapshot;
  unit_price_vnd: number;
  shipping_fee_vnd: number;
  total_vnd: number;
  payment_method?: PaymentMethod;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  note: string;
  quote_expires_at: Date | string;
  confirmed_at: Date | string | null;
  request_hash: string;
  client_request_id: string;
  created_at: Date | string;
};

export type PreviewInput = {
  client_request_id: string;
  variant_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  note?: string;
  payment_method?: PaymentMethod;
  shipping_address_meta?: ShippingAddressParts | null;
  save_default_address?: boolean;
};

function sanitizeShippingMeta(raw?: ShippingAddressParts | null): ShippingAddressParts | null {
  if (!raw || typeof raw !== 'object') return null;
  const clean = (v?: string) =>
    (v ?? '')
      .replace(/\s+/g, ' ')
      .replace(/^[,\s]+|[,\s]+$/g, '')
      .trim();
  const province = clean(raw.province);
  const ward = clean(raw.ward);
  const street_detail = clean(raw.street_detail);
  if (province.length < 2 || ward.length < 2 || street_detail.length < 3) return null;
  const province_code =
    raw.province_code && /^[0-9]{2}$/.test(raw.province_code.trim())
      ? raw.province_code.trim()
      : undefined;
  const ward_code =
    raw.ward_code && /^[0-9]{5}$/.test(raw.ward_code.trim()) ? raw.ward_code.trim() : undefined;
  const district = clean(raw.district);
  const address_type =
    raw.address_type === 'HOME' || raw.address_type === 'OFFICE' || raw.address_type === 'CAMPUS'
      ? raw.address_type
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

function isReusableDeadQuote(row: Row): boolean {
  return (
    !row.confirmed_at &&
    (row.status === 'CANCELLED' ||
      row.status === 'EXPIRED' ||
      new Date(row.quote_expires_at).getTime() <= Date.now())
  );
}

async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL statement_timeout = '3s'");
    await client.query("SET LOCAL lock_timeout = '1s'");
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      ['55P03', '57014'].includes(String(error.code))
    ) {
      throw new AppError(503, 'DB_BUSY', 'Hệ thống đang bận. Vui lòng thử lại.');
    }
    throw error;
  } finally {
    client.release();
  }
}

export function normalize(input: PreviewInput) {
  const customer_name = input.customer_name.trim();
  const shipping_address = input.shipping_address.trim();
  const note = (input.note ?? '').trim();
  const customer_phone = input.customer_phone.replace(/[\s().-]/g, '').replace(/^\+84/, '0');
  const fields: Record<string, string> = {};
  if (customer_name.length < 2 || customer_name.length > 100)
    fields.customer_name = 'Tên cần 2–100 ký tự.';
  if (!/^0[35789][0-9]{8}$/.test(customer_phone))
    fields.customer_phone = 'Số điện thoại di động không đúng định dạng.';
  const addrParts = shipping_address
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  if (shipping_address.length < 12 || shipping_address.length > 500 || addrParts.length < 3) {
    fields.shipping_address =
      'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà, tên đường.';
  }
  if (note.length > 500) fields.note = 'Ghi chú tối đa 500 ký tự.';
  if (Object.keys(fields).length)
    throw new AppError(400, 'INVALID_CHECKOUT', 'Vui lòng kiểm tra thông tin giao hàng.', fields);
  const payment_method: PaymentMethod = input.payment_method === 'VIETQR' ? 'VIETQR' : 'COD';
  return {
    variant_id: input.variant_id,
    customer_name,
    customer_phone,
    shipping_address,
    note,
    payment_method
  };
}

export function view(row: Row): OrderView {
  return {
    order_id: row.id,
    order_code: row.order_code,
    status: row.status,
    variant_id: row.variant_id,
    product_snapshot: row.product_snapshot as ProductSnapshot,
    unit_price_vnd: row.unit_price_vnd,
    shipping_fee_vnd: row.shipping_fee_vnd,
    total_vnd: row.total_vnd,
    payment_method: row.payment_method === 'VIETQR' ? 'VIETQR' : 'COD',
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    note: row.note,
    quote_expires_at: new Date(row.quote_expires_at).toISOString(),
    confirmed_at: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
    server_time: new Date().toISOString()
  };
}

export async function getOrder(
  orderId: string,
  sessionId: string | null,
  customerId?: string | null
): Promise<OrderView> {
  if (!sessionId && !customerId) throw notFound();
  const result = await pool.query(
    `SELECT * FROM orders
     WHERE id = $1
       AND (($2::uuid IS NOT NULL AND session_id = $2::uuid) OR ($3::uuid IS NOT NULL AND customer_id = $3::uuid))`,
    [orderId, sessionId || null, customerId || null]
  );
  if (!result.rowCount) throw notFound();
  return view(result.rows[0]);
}

export async function previewOrder(
  sessionId: string,
  input: PreviewInput,
  customerId?: string | null
): Promise<{ order: OrderView; created: boolean }> {
  const data = normalize(input);
  const metaJson = sanitizeShippingMeta(input.shipping_address_meta);
  const requestHash = createHash('sha256')
    .update(
      JSON.stringify([
        data.variant_id,
        data.customer_name,
        data.customer_phone,
        data.shipping_address,
        data.note,
        data.payment_method
      ])
    )
    .digest('hex');

  const receipt = await pool.query<Row>(
    'SELECT * FROM orders WHERE session_id = $1 AND client_request_id = $2',
    [sessionId, input.client_request_id]
  );
  if (receipt.rowCount && receipt.rows[0] && !isReusableDeadQuote(receipt.rows[0])) {
    if (receipt.rows[0].request_hash !== requestHash) {
      throw conflict('IDEMPOTENCY_CONFLICT', 'Mã yêu cầu đã dùng với thông tin khác.');
    }
    return { order: view(receipt.rows[0]), created: false };
  }

  const settings = await getStoreSettings().catch(() => null);
  const shippingFee = settings ? settings.shipping_fee_vnd : config.shippingFeeVnd;

  return transaction(async client => {
    await client.query('SELECT id FROM chat_sessions WHERE id = $1 FOR UPDATE', [sessionId]);
    const retry = await client.query<Row>(
      'SELECT * FROM orders WHERE session_id = $1 AND client_request_id = $2',
      [sessionId, input.client_request_id]
    );
    const existingRow = retry.rows[0];
    if (existingRow && !isReusableDeadQuote(existingRow)) {
      if (existingRow.request_hash !== requestHash) {
        throw conflict('IDEMPOTENCY_CONFLICT', 'Mã yêu cầu đã dùng với thông tin khác.');
      }
      return { order: view(existingRow), created: false };
    }

    const product = await client.query(
      `SELECT l.id AS laptop_id, l.brand, l.model_name, l.is_active AS laptop_active,
              v.id AS variant_id, v.sku, v.cpu, v.gpu, v.ram_gb, v.ssd_gb, v.screen, v.color,
              v.price_vnd, v.stock, v.stock_verified, v.is_active AS variant_active
       FROM laptop_variants v
       JOIN laptops l ON l.id = v.laptop_id
       WHERE v.id = $1`,
      [data.variant_id]
    );

    const item = product.rows[0];
    if (!item || !item.laptop_active || !item.variant_active) {
      throw conflict('PRODUCT_UNAVAILABLE', 'Cấu hình hiện không bán.');
    }
    if (!item.stock_verified) {
      throw conflict('STOCK_UNVERIFIED', 'Cấu hình đang chờ xác nhận tồn kho.');
    }
    if (item.stock < 1) {
      throw conflict('OUT_OF_STOCK', 'Cấu hình đã hết hàng.');
    }

    const snapshot: ProductSnapshot = {
      laptop_id: item.laptop_id,
      brand: item.brand,
      model_name: item.model_name,
      sku: item.sku,
      cpu: item.cpu,
      gpu: item.gpu,
      ram_gb: item.ram_gb,
      ssd_gb: item.ssd_gb,
      screen: item.screen,
      color: item.color,
      price_vnd: item.price_vnd
    };

    await client.query(
      `UPDATE orders SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
       WHERE session_id = $1 AND status = 'PENDING_CONFIRMATION'`,
      [sessionId]
    );

    const totalVnd = item.price_vnd + shippingFee;
    let savedRow: Row;

    if (existingRow) {
      const revived = await client.query<Row>(
        `UPDATE orders SET
           customer_id = COALESCE(customer_id, $2),
           request_hash = $3,
           variant_id = $4,
           product_snapshot = $5,
           unit_price_vnd = $6,
           shipping_fee_vnd = $7,
           total_vnd = $8,
           payment_method = $9,
           customer_name = $10,
           customer_phone = $11,
           shipping_address = $12,
           note = $13,
           status = 'PENDING_CONFIRMATION',
           cancelled_at = NULL,
           quote_expires_at = now() + interval '15 minutes',
           updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [
          existingRow.id,
          customerId || null,
          requestHash,
          data.variant_id,
          JSON.stringify(snapshot),
          item.price_vnd,
          shippingFee,
          totalVnd,
          data.payment_method,
          data.customer_name,
          data.customer_phone,
          data.shipping_address,
          data.note
        ]
      );
      savedRow = revived.rows[0]!;
    } else {
      const orderCode = `LB${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString('hex').toUpperCase()}`;
      const inserted = await client.query<Row>(
        `INSERT INTO orders(
           order_code, session_id, customer_id, client_request_id, request_hash, variant_id, product_snapshot,
           unit_price_vnd, shipping_fee_vnd, total_vnd, payment_method, customer_name, customer_phone, shipping_address,
           note, status, quote_expires_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'PENDING_CONFIRMATION', now() + interval '15 minutes')
         RETURNING *`,
        [
          orderCode,
          sessionId,
          customerId || null,
          input.client_request_id,
          requestHash,
          data.variant_id,
          JSON.stringify(snapshot),
          item.price_vnd,
          shippingFee,
          totalVnd,
          data.payment_method,
          data.customer_name,
          data.customer_phone,
          data.shipping_address,
          data.note
        ]
      );
      savedRow = inserted.rows[0]!;
    }

    if (customerId && input.save_default_address !== false) {
      const forceOverwrite = input.save_default_address === true;
      await client.query(
        `UPDATE customers c
         SET
           default_shipping_address = CASE
             WHEN $2::boolean OR c.default_shipping_address = '' THEN $3
             ELSE c.default_shipping_address
           END,
           shipping_address_meta = CASE
             WHEN $2::boolean OR c.default_shipping_address = '' THEN $4::jsonb
             ELSE c.shipping_address_meta
           END,
           phone = CASE
             WHEN ($2::boolean OR c.phone IS NULL)
                  AND NOT EXISTS (SELECT 1 FROM customers other WHERE other.phone = $5 AND other.id <> c.id)
             THEN $5
             ELSE c.phone
           END,
           updated_at = now()
         WHERE c.id = $1`,
        [
          customerId,
          forceOverwrite,
          data.shipping_address,
          metaJson ? JSON.stringify(metaJson) : null,
          data.customer_phone
        ]
      );
    }

    await client.query(
      'UPDATE chat_sessions SET active_preview_id = $2, updated_at = now() WHERE id = $1',
      [sessionId, savedRow.id]
    );

    return { order: view(savedRow), created: true };
  });
}

async function resolveOrderSessionForLock(
  orderId: string,
  sessionId: string | null,
  customerId?: string | null
): Promise<string> {
  if (!sessionId && !customerId) throw notFound();
  if (sessionId && !customerId) return sessionId;
  const check = await pool.query<{ session_id: string }>(
    `SELECT session_id FROM orders
     WHERE id = $1
       AND (($2::uuid IS NOT NULL AND session_id = $2::uuid) OR ($3::uuid IS NOT NULL AND customer_id = $3::uuid))`,
    [orderId, sessionId || null, customerId || null]
  );
  if (!check.rowCount) throw notFound();
  return check.rows[0]!.session_id;
}

export async function confirmOrder(
  orderId: string,
  sessionId: string | null,
  customerId?: string | null
): Promise<OrderView> {
  const lockSessionId = await resolveOrderSessionForLock(orderId, sessionId, customerId);
  const settings = await getStoreSettings().catch(() => null);
  const currentShippingFee = settings ? settings.shipping_fee_vnd : config.shippingFeeVnd;

  const result = await transaction(async client => {
    await client.query('SELECT id FROM chat_sessions WHERE id = $1 FOR UPDATE', [lockSessionId]);
    const orderResult = await client.query(
      `SELECT * FROM orders
       WHERE id = $1
         AND (($2::uuid IS NOT NULL AND session_id = $2::uuid) OR ($3::uuid IS NOT NULL AND customer_id = $3::uuid))
       FOR UPDATE`,
      [orderId, sessionId || null, customerId || null]
    );

    if (!orderResult.rowCount) throw notFound();
    const order = orderResult.rows[0] as Row;
    if (order.confirmed_at) return { order: view(order), expired: false };
    if (order.status !== 'PENDING_CONFIRMATION')
      throw conflict('INVALID_STATE', 'Đơn này không thể xác nhận.');

    if (new Date(order.quote_expires_at).getTime() <= Date.now()) {
      await client.query("UPDATE orders SET status = 'EXPIRED', updated_at = now() WHERE id = $1", [
        orderId
      ]);
      await client.query(
        'UPDATE chat_sessions SET active_preview_id = NULL WHERE id = $1 AND active_preview_id = $2',
        [order.session_id, orderId]
      );
      return { expired: true, order: null };
    }

    const laptop = await client.query(
      'SELECT id, brand, model_name, is_active FROM laptops WHERE id = $1 FOR SHARE',
      [(order.product_snapshot as ProductSnapshot).laptop_id]
    );
    const variant = await client.query('SELECT * FROM laptop_variants WHERE id = $1 FOR UPDATE', [
      order.variant_id
    ]);
    const l = laptop.rows[0],
      v = variant.rows[0];

    if (!l?.is_active || !v?.is_active)
      throw conflict('PRODUCT_UNAVAILABLE', 'Cấu hình hiện không bán.');
    if (!v.stock_verified)
      throw conflict('STOCK_UNVERIFIED', 'Cấu hình đang chờ xác nhận tồn kho.');

    const s = order.product_snapshot as ProductSnapshot;
    if (
      l.brand !== s.brand ||
      l.model_name !== s.model_name ||
      v.sku !== s.sku ||
      v.cpu !== s.cpu ||
      v.gpu !== s.gpu ||
      v.ram_gb !== s.ram_gb ||
      v.ssd_gb !== s.ssd_gb ||
      v.screen !== s.screen ||
      v.color !== s.color
    ) {
      throw conflict('PRODUCT_CHANGED', 'Cấu hình đã thay đổi. Vui lòng xem trước đơn mới.');
    }

    if (v.price_vnd !== order.unit_price_vnd || currentShippingFee !== order.shipping_fee_vnd) {
      throw new AppError(
        409,
        'PRICE_CHANGED',
        'Giá hoặc phí giao hàng đã đổi. Vui lòng xem trước đơn mới.',
        {
          unit_price_vnd: String(v.price_vnd),
          shipping_fee_vnd: String(currentShippingFee),
          total_vnd: String(v.price_vnd + currentShippingFee)
        }
      );
    }

    const stock = await client.query(
      `UPDATE laptop_variants SET stock = stock - 1, revision = revision + 1, updated_at = now()
       WHERE id = $1 AND stock_verified = true AND stock >= 1 AND is_active = true RETURNING id`,
      [order.variant_id]
    );
    if (!stock.rowCount) throw conflict('OUT_OF_STOCK', 'Cấu hình đã hết hàng.');

    const updated = await client.query(
      `UPDATE orders SET
         status = 'CONFIRMED_COD',
         confirmed_at = now(),
         customer_id = COALESCE(customer_id, $2),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [orderId, customerId || null]
    );

    await client.query(
      'UPDATE chat_sessions SET active_preview_id = NULL, last_order_id = $2, updated_at = now() WHERE id = $1',
      [order.session_id, orderId]
    );

    const actorId = customerId || order.session_id;
    const actorType = customerId ? 'CUSTOMER' : 'GUEST';
    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id) VALUES ($1, $2, 'ORDER_CONFIRMED', 'ORDER', $3)`,
      [actorType, actorId, orderId]
    );

    return { order: view(updated.rows[0]), expired: false };
  });

  if (result.expired || !result.order)
    throw conflict('QUOTE_EXPIRED', 'Phiếu xem trước đã hết hạn.');
  return result.order;
}

export async function cancelOrder(
  orderId: string,
  sessionId: string | null,
  customerId?: string | null
): Promise<OrderView> {
  const lockSessionId = await resolveOrderSessionForLock(orderId, sessionId, customerId);
  return transaction(async client => {
    await client.query('SELECT id FROM chat_sessions WHERE id = $1 FOR UPDATE', [lockSessionId]);
    const result = await client.query(
      `SELECT * FROM orders
       WHERE id = $1
         AND (($2::uuid IS NOT NULL AND session_id = $2::uuid) OR ($3::uuid IS NOT NULL AND customer_id = $3::uuid))
       FOR UPDATE`,
      [orderId, sessionId || null, customerId || null]
    );
    if (!result.rowCount) throw notFound();
    const order = result.rows[0] as Row;
    if (order.status === 'CANCELLED') return view(order);
    if (!['PENDING_CONFIRMATION', 'CONFIRMED_COD'].includes(order.status)) {
      throw conflict('INVALID_STATE', 'Đơn này không thể hủy.');
    }

    if (order.confirmed_at) {
      await client.query(
        'UPDATE laptop_variants SET stock = stock + 1, revision = revision + 1, updated_at = now() WHERE id = $1',
        [order.variant_id]
      );
    }

    const updated = await client.query(
      "UPDATE orders SET status = 'CANCELLED', cancelled_at = now(), updated_at = now() WHERE id = $1 RETURNING *",
      [orderId]
    );

    await client.query(
      'UPDATE chat_sessions SET active_preview_id = NULL WHERE id = $1 AND active_preview_id = $2',
      [order.session_id, orderId]
    );

    const actorId = customerId || order.session_id;
    const actorType = customerId ? 'CUSTOMER' : 'GUEST';
    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id) VALUES ($1, $2, 'ORDER_CANCELLED', 'ORDER', $3)`,
      [actorType, actorId, orderId]
    );

    return view(updated.rows[0]);
  });
}

export async function listOrders(
  sessionId: string | null,
  limit: number,
  cursor?: string,
  customerId?: string | null
): Promise<{ items: OrderView[]; next_cursor: string | null }> {
  const boundary = decodeKeysetCursor(cursor);
  if (!sessionId && !customerId) return { items: [], next_cursor: null };

  const args: unknown[] = [sessionId || null, customerId || null];
  let condition = '';
  if (boundary) {
    args.push(...boundary);
    condition = `AND (created_at, id) < ($${args.length - 1}::timestamptz, $${args.length}::uuid)`;
  }
  args.push(limit + 1);

  const result = await pool.query(
    `SELECT * FROM orders
     WHERE (($1::uuid IS NOT NULL AND session_id = $1::uuid) OR ($2::uuid IS NOT NULL AND customer_id = $2::uuid))
       AND confirmed_at IS NOT NULL
       ${condition}
     ORDER BY created_at DESC, id DESC
     LIMIT $${args.length}`,
    args
  );

  const rows = result.rows.slice(0, limit);
  const last = rows.at(-1);

  return {
    items: rows.map(view),
    next_cursor:
      result.rows.length > limit && last ? encodeKeysetCursor(last.created_at, last.id) : null
  };
}
