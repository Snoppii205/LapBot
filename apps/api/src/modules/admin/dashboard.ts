import type { AdminDashboardStats } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { adminOrders } from './orders.js';
import { listAuditEvents } from './settings.js';

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  // 1. Order KPIs
  const orderStatsRes = await pool.query(`
    SELECT
      COALESCE(SUM(total_vnd) FILTER (WHERE status = 'DELIVERED'), 0) AS revenue_delivered,
      COALESCE(SUM(total_vnd) FILTER (WHERE status IN ('CONFIRMED_COD', 'PROCESSING', 'SHIPPING')), 0) AS revenue_pipeline,
      COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS orders_today,
      COUNT(*) AS orders_total,
      COUNT(*) FILTER (WHERE status = 'CONFIRMED_COD') AS count_confirmed,
      COUNT(*) FILTER (WHERE status = 'PROCESSING') AS count_processing,
      COUNT(*) FILTER (WHERE status = 'SHIPPING') AS count_shipping,
      COUNT(*) FILTER (WHERE status = 'DELIVERED') AS count_delivered,
      COUNT(*) FILTER (WHERE status = 'CANCELLED') AS count_cancelled,
      COUNT(*) FILTER (WHERE status = 'PENDING_CONFIRMATION') AS count_pending,
      COUNT(*) FILTER (WHERE status = 'EXPIRED') AS count_expired
    FROM orders
  `);
  const oRow = orderStatsRes.rows[0] || {};

  // 2. Inventory KPIs
  const invStatsRes = await pool.query(`
    SELECT
      COUNT(*) AS variants_total,
      COUNT(*) FILTER (WHERE stock_verified AND stock > 0 AND is_active) AS variants_in_stock,
      COUNT(*) FILTER (WHERE stock_verified AND stock BETWEEN 1 AND 2 AND is_active) AS variants_low_stock,
      COUNT(*) FILTER (WHERE (stock_verified AND stock = 0) OR source_in_stock IS FALSE) AS variants_out_of_stock,
      COUNT(*) FILTER (WHERE NOT stock_verified AND (source_in_stock IS TRUE OR source_in_stock IS NULL)) AS variants_unverified
    FROM laptop_variants
  `);
  const iRow = invStatsRes.rows[0] || {};

  // 3. Support & Chat KPIs
  const chatStatsRes = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE control_mode = 'AI' AND needs_human = true) AS waiting_human,
      COUNT(*) FILTER (WHERE control_mode = 'AGENT') AS active_agent
    FROM chat_sessions
  `);
  const cRow = chatStatsRes.rows[0] || {};

  // 4. AI Telemetry KPIs (24h)
  const aiStatsRes = await pool.query(`
    SELECT
      COUNT(*) AS turns_24h,
      COUNT(*) FILTER (WHERE status = 'FAILED' OR error_code IS NOT NULL) AS turns_error_24h,
      COALESCE(AVG(latency_ms) FILTER (WHERE latency_ms > 0), 0) AS avg_latency
    FROM chat_turns
    WHERE started_at > now() - interval '24 hours'
  `);
  const aRow = aiStatsRes.rows[0] || {};

  // 5. 7 days revenue & orders series
  const sevenDaysRes = await pool.query(`
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      )::date AS day
    )
    SELECT
      d.day::text AS date,
      COALESCE(SUM(o.total_vnd) FILTER (WHERE o.status = 'DELIVERED'), 0) AS revenue_vnd,
      COUNT(o.id) FILTER (WHERE o.status <> 'PENDING_CONFIRMATION') AS order_count
    FROM days d
    LEFT JOIN orders o ON date_trunc('day', o.created_at)::date = d.day
    GROUP BY d.day
    ORDER BY d.day ASC
  `);

  // 6. Recent orders & recent audits
  const recentOrdersData = await adminOrders(undefined, 6);
  const recentAuditsData = await listAuditEvents({ limit: 8 });

  // 7. Low stock / unverified variants list
  const lowStockRes = await pool.query(`
    SELECT v.*, l.brand, l.model_name
    FROM laptop_variants v
    JOIN laptops l ON l.id = v.laptop_id
    WHERE (v.stock_verified AND v.stock <= 2) OR NOT v.stock_verified
    ORDER BY v.stock_verified DESC, v.stock ASC, v.updated_at DESC
    LIMIT 6
  `);

  // 8. Top-selling laptop variants (confirmed / processing / shipping / delivered)
  const topProductsRes = await pool.query(`
    SELECT
      v.id AS variant_id,
      v.sku,
      l.brand,
      l.model_name,
      v.stock,
      COUNT(o.id)::int AS orders_count,
      COALESCE(SUM(o.total_vnd), 0)::bigint AS revenue_vnd
    FROM orders o
    JOIN laptop_variants v ON v.id = o.variant_id
    JOIN laptops l ON l.id = v.laptop_id
    WHERE o.status IN ('CONFIRMED_COD', 'PROCESSING', 'SHIPPING', 'DELIVERED')
    GROUP BY v.id, v.sku, l.brand, l.model_name, v.stock
    ORDER BY revenue_vnd DESC, orders_count DESC
    LIMIT 5
  `);

  return {
    kpi: {
      revenue_delivered_vnd: Number(oRow.revenue_delivered) || 0,
      revenue_pipeline_vnd: Number(oRow.revenue_pipeline) || 0,
      orders_today_count: Number(oRow.orders_today) || 0,
      orders_total_count: Number(oRow.orders_total) || 0,
      orders_by_status: {
        CONFIRMED_COD: Number(oRow.count_confirmed) || 0,
        PROCESSING: Number(oRow.count_processing) || 0,
        SHIPPING: Number(oRow.count_shipping) || 0,
        DELIVERED: Number(oRow.count_delivered) || 0,
        CANCELLED: Number(oRow.count_cancelled) || 0,
        PENDING_CONFIRMATION: Number(oRow.count_pending) || 0,
        EXPIRED: Number(oRow.count_expired) || 0
      },
      variants_total: Number(iRow.variants_total) || 0,
      variants_in_stock: Number(iRow.variants_in_stock) || 0,
      variants_low_stock: Number(iRow.variants_low_stock) || 0,
      variants_out_of_stock: Number(iRow.variants_out_of_stock) || 0,
      variants_unverified: Number(iRow.variants_unverified) || 0,
      sessions_waiting_human: Number(cRow.waiting_human) || 0,
      sessions_active_agent: Number(cRow.active_agent) || 0,
      ai_turns_24h_count: Number(aRow.turns_24h) || 0,
      ai_turns_error_24h_count: Number(aRow.turns_error_24h) || 0,
      ai_avg_latency_ms: Math.round(Number(aRow.avg_latency) || 0)
    },
    revenue_7d: sevenDaysRes.rows.map(r => ({
      date: r.date as string,
      revenue_vnd: Number(r.revenue_vnd),
      order_count: Number(r.order_count)
    })),
    recent_orders: recentOrdersData.items,
    recent_audits: recentAuditsData.items,
    low_stock_variants: lowStockRes.rows.map(r => ({
      id: r.id as string,
      laptop_id: r.laptop_id as string,
      sku: r.sku as string,
      cpu: r.cpu as string,
      gpu: r.gpu as string,
      ram_gb: Number(r.ram_gb),
      ssd_gb: Number(r.ssd_gb),
      screen: r.screen as string,
      color: r.color as string,
      usage_category: r.usage_category as import('@lapbot/contracts').UsageCategory,
      price_vnd: Number(r.price_vnd),
      stock: Number(r.stock),
      source_in_stock: r.source_in_stock === null ? null : Boolean(r.source_in_stock),
      stock_verified: Boolean(r.stock_verified),
      is_active: Boolean(r.is_active),
      revision: Number(r.revision),
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
      brand: r.brand as string,
      model_name: r.model_name as string
    })),
    top_products: topProductsRes.rows.map(r => ({
      variant_id: r.variant_id as string,
      sku: r.sku as string,
      brand: r.brand as string,
      model_name: r.model_name as string,
      orders_count: Number(r.orders_count) || 0,
      revenue_vnd: Number(r.revenue_vnd) || 0,
      stock: Number(r.stock) || 0
    }))
  };
}
