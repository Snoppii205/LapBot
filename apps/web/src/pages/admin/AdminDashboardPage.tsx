import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AdminDashboardStats } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { money } from '../../lib/format.js';
import {
  AdminKpiGridSkeleton,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconBotCpu,
  IconChartBar,
  IconGrid,
  IconHistoryAudit,
  IconMessageSquare,
  IconPackage,
  IconRefresh,
  IconTag
} from '../../components/icons/RetroIcons.js';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<AdminDashboardStats>('/admin/dashboard');
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
        role="status"
        aria-busy="true"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <RetroSkeleton variant="text" width={360} height={22} />
            <RetroSkeleton variant="text" width={460} height={14} />
          </div>
          <RetroSkeleton width={150} height={36} radius={6} />
        </div>
        <AdminKpiGridSkeleton count={6} />
        <div className="admin-grid-asymmetric">
          <div className="retro-window" style={{ padding: '20px' }}>
            <RetroSkeleton height={220} radius={6} />
          </div>
          <div className="retro-window" style={{ padding: '20px' }}>
            <RetroSkeleton height={220} radius={6} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div
        className="os-alert-banner danger"
        style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconAlertTriangle size={18} />
          <span>
            <strong>Lỗi tải Dashboard: </strong> {error}
          </span>
        </div>
        <button type="button" onClick={() => void fetchStats()} className="retro-btn retro-btn-sm">
          Thử lại
        </button>
      </div>
    );
  }

  if (!stats) return null;
  const {
    kpi,
    revenue_7d,
    recent_orders,
    recent_audits,
    low_stock_variants,
    top_products = []
  } = stats;

  // Calculate max revenue for SVG 7d chart scaling
  const maxRevenue = Math.max(...revenue_7d.map(d => d.revenue_vnd), 1000000);

  // COD Conversion Funnel calculations
  const draftQuotes =
    (kpi.orders_by_status['PENDING_CONFIRMATION'] || 0) + (kpi.orders_by_status['EXPIRED'] || 0);
  const activePipeline =
    (kpi.orders_by_status['CONFIRMED_COD'] || 0) +
    (kpi.orders_by_status['PROCESSING'] || 0) +
    (kpi.orders_by_status['SHIPPING'] || 0);
  const deliveredCount = kpi.orders_by_status['DELIVERED'] || 0;
  const cancelledCount = kpi.orders_by_status['CANCELLED'] || 0;
  const confirmedTotal = activePipeline + deliveredCount + cancelledCount;
  const deliveryRatePct =
    confirmedTotal > 0 ? Math.round((deliveredCount / confirmedTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Title & Refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconChartBar size={22} />
            <span>BẢNG ĐIỀU KHIỂN & CHỈ SỐ HOẠT ĐỘNG (DASHBOARD)</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Theo dõi doanh thu, phễu chuyển đổi COD, tồn kho SKU, hàng đợi CSKH và hiệu năng AI thời
            gian thực.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void fetchStats()}
          className={`retro-btn ${loading ? 'is-busy' : ''}`.trim()}
        >
          <IconRefresh size={14} className={loading ? 'retro-spin' : undefined} />
          <span>{loading ? 'ĐANG LÀM MỚI...' : 'LÀM MỚI DỮ LIỆU'}</span>
        </button>
      </div>

      <RetroTopProgress
        active={loading && Boolean(stats)}
        label="Đang đồng bộ chỉ số Dashboard..."
      />

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid" style={{ marginBottom: 0 }}>
        <div className="admin-kpi-card" style={{ borderLeft: '5px solid var(--status-success)' }}>
          <div className="admin-kpi-header">
            <span>DOANH THU THỰC NHẬN</span>
            <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>DELIVERED</span>
          </div>
          <div className="admin-kpi-val" style={{ color: 'var(--status-success)' }}>
            {money(kpi.revenue_delivered_vnd)}
          </div>
          <div className="admin-kpi-sub">
            {deliveredCount} đơn hoàn tất · Tỷ lệ giao thành công:{' '}
            <strong>{deliveryRatePct}%</strong>
          </div>
        </div>

        <div className="admin-kpi-card" style={{ borderLeft: '5px solid var(--accent-primary)' }}>
          <div className="admin-kpi-header">
            <span>DOANH THU ĐANG VẬN HÀNH</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>PIPELINE</span>
          </div>
          <div className="admin-kpi-val" style={{ color: 'var(--accent-primary)' }}>
            {money(kpi.revenue_pipeline_vnd)}
          </div>
          <div className="admin-kpi-sub">
            {activePipeline} đơn đang chờ đóng gói hoặc đang giao COD
          </div>
        </div>

        <div className="admin-kpi-card" style={{ borderLeft: '5px solid var(--accent-amber)' }}>
          <div className="admin-kpi-header">
            <span>ĐƠN HÀNG HÔM NAY / TỔNG ĐƠN</span>
            <IconPackage size={14} />
          </div>
          <div className="admin-kpi-val">
            {kpi.orders_today_count}{' '}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              / {confirmedTotal} đơn chốt
            </span>
          </div>
          <div className="admin-kpi-sub">Ngoài ra có {draftQuotes} phiếu báo giá nháp/quá hạn</div>
        </div>

        <Link
          to="/admin/chat"
          className="admin-kpi-card"
          style={{
            borderLeft:
              kpi.sessions_waiting_human > 0
                ? '5px solid var(--status-danger)'
                : '5px solid var(--ink-border)',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div className="admin-kpi-header">
            <span>HÀNG ĐỢI HỖ TRỢ (HITL)</span>
            <IconMessageSquare size={14} />
          </div>
          <div
            className="admin-kpi-val"
            style={{ color: kpi.sessions_waiting_human > 0 ? 'var(--status-danger)' : 'inherit' }}
          >
            {kpi.sessions_waiting_human}{' '}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>khách đang chờ</span>
          </div>
          <div className="admin-kpi-sub">
            {kpi.sessions_active_agent} phiên đang có nhân viên trực →
          </div>
        </Link>

        <Link
          to="/admin/ai"
          className="admin-kpi-card"
          style={{ borderLeft: '5px solid #6B46C1', textDecoration: 'none', color: 'inherit' }}
        >
          <div className="admin-kpi-header">
            <span>TRÍ TUỆ AI (24H)</span>
            <IconBotCpu size={14} />
          </div>
          <div className="admin-kpi-val" style={{ color: '#553C9A' }}>
            {kpi.ai_turns_24h_count}{' '}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>lượt tư vấn</span>
          </div>
          <div className="admin-kpi-sub">
            Độ trễ TB: <strong>{kpi.ai_avg_latency_ms}ms</strong> · Lỗi:{' '}
            {kpi.ai_turns_error_24h_count} →
          </div>
        </Link>

        <Link
          to="/admin/catalog?kind=variants&stock_filter=low_stock"
          className="admin-kpi-card"
          style={{
            borderLeft:
              kpi.variants_low_stock > 0 || kpi.variants_out_of_stock > 0
                ? '5px solid var(--accent-primary)'
                : '5px solid var(--status-success)',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div className="admin-kpi-header">
            <span>TÌNH TRẠNG TỒN KHO SKU</span>
            <IconGrid size={14} />
          </div>
          <div className="admin-kpi-val">
            {kpi.variants_in_stock}{' '}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              / {kpi.variants_total} sẵn bán
            </span>
          </div>
          <div className="admin-kpi-sub">
            {kpi.variants_low_stock} sắp hết · {kpi.variants_out_of_stock} hết hàng ·{' '}
            {kpi.variants_unverified} chờ kiểm kho →
          </div>
        </Link>
      </div>

      {/* Row 2: 7-Day Revenue Trend Chart & Order Status Funnel */}
      <div className="admin-grid-asymmetric">
        {/* SVG Chart */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span>BIỂU ĐỒ DOANH THU 7 NGÀY QUA (VNĐ)</span>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>DOANH THU THỰC NHẬN (DELIVERED)</span>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <svg
                viewBox="0 0 700 200"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                <line x1="48" y1="20" x2="680" y2="20" stroke="#DDD5C7" strokeDasharray="3 3" />
                <line x1="48" y1="80" x2="680" y2="80" stroke="#DDD5C7" strokeDasharray="3 3" />
                <line x1="48" y1="140" x2="680" y2="140" stroke="#DDD5C7" strokeDasharray="3 3" />
                <line
                  x1="48"
                  y1="170"
                  x2="680"
                  y2="170"
                  stroke="var(--ink-border)"
                  strokeWidth="1.5"
                />

                <text x="42" y="24" fontSize="10" textAnchor="end" fill="var(--text-muted)">
                  {Math.round(maxRevenue / 1000000)}M
                </text>
                <text x="42" y="94" fontSize="10" textAnchor="end" fill="var(--text-muted)">
                  {Math.round(maxRevenue / 2000000)}M
                </text>
                <text x="42" y="174" fontSize="10" textAnchor="end" fill="var(--text-muted)">
                  0đ
                </text>

                {revenue_7d.map((day, idx) => {
                  const x = 76 + idx * 86;
                  const barHeight = Math.max(4, Math.round((day.revenue_vnd / maxRevenue) * 140));
                  const y = 170 - barHeight;
                  const dateStr = day.date.slice(5);
                  return (
                    <g key={day.date}>
                      <rect
                        x={x + 3}
                        y={y + 3}
                        width="36"
                        height={barHeight}
                        fill="var(--ink-border)"
                      />
                      <rect
                        x={x}
                        y={y}
                        width="36"
                        height={barHeight}
                        fill={day.revenue_vnd > 0 ? 'var(--accent-primary)' : 'var(--accent-amber)'}
                        stroke="var(--ink-border)"
                        strokeWidth="1.5"
                      />
                      {day.revenue_vnd > 0 && (
                        <text
                          x={x + 18}
                          y={y - 6}
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="var(--ink-primary)"
                        >
                          {(day.revenue_vnd / 1000000).toFixed(1)}M
                        </text>
                      )}
                      <text
                        x={x + 18}
                        y="187"
                        fontSize="11"
                        textAnchor="middle"
                        fill="var(--ink-primary)"
                        fontWeight="700"
                      >
                        {dateStr}
                      </text>
                      <text
                        x={x + 18}
                        y="199"
                        fontSize="9.5"
                        textAnchor="middle"
                        fill="var(--text-muted)"
                      >
                        {day.order_count} đơn
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown & Conversion Funnel */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span>PHỄU CHUYỂN ĐỔI & TRẠNG THÁI ĐƠN COD</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                key: 'CONFIRMED_COD',
                label: '1. Chờ kho đóng gói (CONFIRMED)',
                color: '#B7791F',
                bg: '#FEF9E7'
              },
              {
                key: 'PROCESSING',
                label: '2. Đang chuẩn bị hàng (PROCESSING)',
                color: '#2B6CB0',
                bg: '#EBF8FF'
              },
              {
                key: 'SHIPPING',
                label: '3. Đang giao COD (SHIPPING)',
                color: '#4C51BF',
                bg: '#EBF4FF'
              },
              {
                key: 'DELIVERED',
                label: '4. Giao & thu tiền xong (DELIVERED)',
                color: '#276749',
                bg: '#F0FFF4'
              },
              {
                key: 'CANCELLED',
                label: 'Đã hủy / hoàn kho (CANCELLED)',
                color: '#C53030',
                bg: '#FFF5F5'
              },
              {
                key: 'PENDING_CONFIRMATION',
                label: 'Báo giá nháp đang giữ 15p',
                color: '#4A5568',
                bg: '#EDF2F7'
              }
            ].map(item => {
              const count = kpi.orders_by_status[item.key] || 0;
              return (
                <Link
                  key={item.key}
                  to={`/admin/orders?status=${item.key}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 11px',
                    borderRadius: '4px',
                    background: item.bg,
                    border: '1px solid var(--ink-border)',
                    fontSize: '12px',
                    textDecoration: 'none'
                  }}
                >
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.label}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '13px',
                      color: item.color,
                      padding: '1px 8px',
                      background: '#fff',
                      borderRadius: '3px',
                      border: `1px solid ${item.color}`
                    }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
            <div style={{ marginTop: '6px' }}>
              <Link
                to="/admin/orders"
                className="retro-btn retro-btn-primary"
                style={{ width: '100%' }}
              >
                XỬ LÝ DANH SÁCH ĐƠN HÀNG →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top-Selling Laptops & Low Stock / Unverified Alerts */}
      <div className="admin-grid-2col">
        {/* Top-Selling Products */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconTag size={14} />
              <span>TOP 5 CẤU HÌNH LAPTOP BÁN CHẠY</span>
            </span>
            <Link
              to="/admin/catalog?kind=variants"
              style={{ color: 'var(--accent-amber)', textDecoration: 'none', fontSize: '11px' }}
            >
              Xem toàn bộ SKU →
            </Link>
          </div>
          <div style={{ padding: '12px' }}>
            {top_products.length === 0 ? (
              <p
                style={{
                  margin: '14px 0',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                Chưa có dữ liệu đơn hàng xác nhận để xếp hạng sản phẩm bán chạy.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {top_products.map((prod, idx) => (
                  <Link
                    key={prod.variant_id}
                    to={`/admin/catalog?kind=variants&q=${encodeURIComponent(prod.sku)}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 11px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '4px',
                      background: idx === 0 ? 'var(--accent-amber-light)' : 'var(--bg-canvas)',
                      textDecoration: 'none',
                      color: 'inherit',
                      fontSize: '12px'
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          background: idx === 0 ? 'var(--accent-primary)' : 'var(--ink-border)',
                          color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '11px',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {prod.brand} {prod.model_name}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {prod.sku} · Tồn kho: <strong>{prod.stock}</strong>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {money(prod.revenue_vnd)}
                      </div>
                      <div
                        style={{ fontSize: '11px', color: 'var(--ink-secondary)', fontWeight: 600 }}
                      >
                        {prod.orders_count} đơn đặt
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock & Unverified Stock Alerts */}
        <div className="retro-window">
          <div className="retro-window-header" style={{ background: 'var(--accent-primary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconAlertTriangle size={14} />
              <span>CẢNH BÁO TỒN KHO THẤP & CHỜ KIỂM KHO</span>
            </span>
            <Link
              to="/admin/catalog?kind=variants"
              style={{ color: '#FFFDF9', textDecoration: 'underline', fontSize: '11px' }}
            >
              Mở quản lý kho →
            </Link>
          </div>
          <div style={{ padding: '12px' }}>
            {low_stock_variants.length === 0 ? (
              <p
                style={{
                  margin: '14px 0',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                Kho hiện tại an toàn, tất cả SKU đều đã xác minh và trên ngưỡng cảnh báo.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {low_stock_variants.slice(0, 5).map(v => {
                  const isUnverified = !v.stock_verified;
                  const isOut = v.stock_verified && v.stock === 0;
                  const badgeBg = isOut
                    ? 'var(--status-danger)'
                    : isUnverified
                      ? '#B7791F'
                      : '#D95326';
                  const badgeText = isOut
                    ? 'HẾT HÀNG (0)'
                    : isUnverified
                      ? `CHỜ KIỂM KHO (${v.stock})`
                      : `SẮP HẾT (CÒN ${v.stock})`;
                  return (
                    <Link
                      key={v.id}
                      to={`/admin/catalog?kind=variants&q=${encodeURIComponent(v.sku)}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 11px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '4px',
                        background: isOut ? '#FFF5F5' : '#FEF9E7',
                        fontSize: '12px',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {v.brand} {v.model_name} ({v.sku})
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {v.cpu} · {v.ram_gb}GB RAM · {v.ssd_gb}GB SSD
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '3px',
                          background: badgeBg,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {badgeText}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Orders & Recent Security Audits */}
      <div className="admin-grid-asymmetric">
        <div className="admin-table-wrap">
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '2px solid var(--ink-border)',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>ĐƠN HÀNG PHÁT SINH GẦN ĐÂY</span>
            <Link
              to="/admin/orders"
              style={{
                fontSize: '12px',
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Quản lý tất cả →
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm / SKU</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                  >
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                recent_orders.map(order => (
                  <tr key={order.order_id}>
                    <td>
                      <Link
                        to={`/admin/orders?q=${encodeURIComponent(order.order_code)}`}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: 'var(--accent-primary)'
                        }}
                      >
                        {order.order_code}
                      </Link>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.customer_name || 'Khách vãng lai'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {order.customer_phone}
                      </div>
                    </td>
                    <td>
                      <div>{order.product_title || 'Laptop'}</div>
                      {order.sku && (
                        <Link
                          to={`/admin/catalog?kind=variants&q=${encodeURIComponent(order.sku)}`}
                          style={{
                            fontSize: '11px',
                            color: 'var(--ink-secondary)',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {order.sku}
                        </Link>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${order.status}`}>{order.status}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {money(order.total_vnd)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Security Audits */}
        <div className="retro-window">
          <div className="retro-window-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconHistoryAudit size={14} />
              <span>NHẬT KÝ KIỂM TOÁN GẦN ĐÂY</span>
            </span>
            <Link
              to="/admin/settings"
              style={{ color: 'var(--accent-amber)', textDecoration: 'none', fontSize: '11px' }}
            >
              Toàn bộ →
            </Link>
          </div>
          <div style={{ padding: '12px' }}>
            {recent_audits.length === 0 ? (
              <p
                style={{
                  margin: '14px 0',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  textAlign: 'center'
                }}
              >
                Chưa có sự kiện kiểm toán nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recent_audits.slice(0, 6).map(a => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      border: '1px solid var(--ink-border)',
                      borderRadius: '4px',
                      background: 'var(--bg-canvas)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}
                        >
                          {a.action}
                        </span>
                        <span
                          style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}
                        >
                          bởi {a.actor_name || a.actor_type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {a.entity_type} {a.entity_id ? `(${a.entity_id.slice(0, 8)}...)` : ''}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0
                      }}
                    >
                      {new Date(a.created_at).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
