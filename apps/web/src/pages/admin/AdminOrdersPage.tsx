import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  AdminStoreSettings,
  OrderStatus
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { downloadCsv } from '../../lib/csv.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import {
  AdminDetailPaneSkeleton,
  AdminSplitListSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconClose,
  IconDownload,
  IconHistoryAudit,
  IconPackage,
  IconPrinter,
  IconQrCode,
  IconRefresh,
  IconRotateCcw,
  IconSearch,
  IconSpinner,
  IconTruckCod
} from '../../components/icons/RetroIcons.js';

type Page = {
  items: AdminOrderSummary[];
  next_cursor: string | null;
  counts_by_status?: Record<string, number>;
};

const statusTabs: Array<{ key: string; label: string }> = [
  { key: '', label: 'TẤT CẢ ĐƠN' },
  { key: 'CONFIRMED_COD', label: 'CHỜ ĐÓNG GÓI (COD)' },
  { key: 'PROCESSING', label: 'ĐANG ĐÓNG GÓI' },
  { key: 'SHIPPING', label: 'ĐANG VẬN CHUYỂN' },
  { key: 'DELIVERED', label: 'ĐÃ GIAO THÀNH CÔNG' },
  { key: 'CANCELLED', label: 'ĐÃ HỦY' },
  { key: 'PENDING_CONFIRMATION', label: 'BÁO GIÁ NHÁP (15P)' },
  { key: 'EXPIRED', label: 'QUÁ HẠN BÁO GIÁ' }
];

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: 'Báo giá nháp (Chờ khách chốt)',
  CONFIRMED_COD: 'Đã chốt COD — Chờ đóng gói',
  PROCESSING: 'Đang kiểm máy & đóng gói',
  SHIPPING: 'Đang giao hàng COD',
  DELIVERED: 'Đã giao & thu tiền thành công',
  CANCELLED: 'Đã hủy & hoàn kho',
  EXPIRED: 'Báo giá hết hạn 15p'
};

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState<string>(() => searchParams.get('status') || '');
  const [q, setQ] = useState<string>(() => searchParams.get('q') || '');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [page, setPage] = useState<Page | null>(null);
  const [cursor, setCursor] = useState('');
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selected, setSelected] = useState<AdminOrderDetail | null>(null);
  const [storeInfo, setStoreInfo] = useState<AdminStoreSettings | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openingOrderId, setOpeningOrderId] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Operational note & modals
  const [transitionNote, setTransitionNote] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  // Sync external URL navigation (?q=ORD-... or ?status=...)
  useEffect(() => {
    const urlQ = searchParams.get('q') ?? '';
    const urlStatus = searchParams.get('status') ?? '';
    setQ(prev => (prev !== urlQ ? urlQ : prev));
    setStatus(prev => (prev !== urlStatus ? urlStatus : prev));
  }, [searchParams]);

  useEffect(() => {
    void apiJson<AdminStoreSettings>('/admin/settings')
      .then(setStoreInfo)
      .catch(() => {});
  }, []);

  const open = useCallback(async (id: string) => {
    setError('');
    setOpeningOrderId(id);
    setDetailLoading(true);
    try {
      const detail = await apiJson<AdminOrderDetail>(`/admin/orders/${id}`);
      setSelected(detail);
      setTransitionNote('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được chi tiết đơn hàng.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setListLoading(true);
    try {
      const query = new URLSearchParams();
      if (status) query.set('status', status);
      if (q.trim()) query.set('q', q.trim());
      if (fromDate) query.set('from', fromDate);
      if (toDate) query.set('to', toDate);
      if (cursor) query.set('cursor', cursor);
      const res = await apiJson<Page>(`/admin/orders?${query}`);
      setPage(res);
      if (res.counts_by_status) {
        setCounts(res.counts_by_status);
      }
      // Auto-open matching order when deep-linked by ?q=ORD-...
      const trimmedQ = q.trim().toUpperCase();
      if (trimmedQ && res.items.length > 0) {
        const exact =
          res.items.find(i => i.order_code.toUpperCase() === trimmedQ) ??
          (res.items.length === 1 ? res.items[0] : null);
        if (exact && selected?.order_id !== exact.order_id) {
          void open(exact.order_id);
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được danh sách đơn hàng.');
    } finally {
      setListLoading(false);
    }
  }, [status, q, fromDate, toDate, cursor, open, selected?.order_id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function change(to: OrderStatus, explicitNote?: string) {
    if (!selected) return;
    setBusy(true);
    setError('');
    setSuccessMsg('');
    const noteToSend = (explicitNote ?? transitionNote).trim();
    try {
      const updated = await apiJson<AdminOrderDetail>(
        `/admin/orders/${selected.order_id}/transition`,
        {
          method: 'POST',
          body: JSON.stringify({
            from_status: selected.status,
            to_status: to,
            ...(noteToSend ? { note: noteToSend } : {})
          })
        }
      );
      setSelected(updated);
      setTransitionNote('');
      setCancelReason('');
      setShowCancelModal(false);
      setSuccessMsg(`Đã chuyển đơn ${updated.order_code} sang trạng thái ${updated.status}.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đổi được trạng thái đơn hàng.');
      await open(selected.order_id);
    } finally {
      setBusy(false);
    }
  }

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const query = new URLSearchParams({ limit: '100' });
      if (status) query.set('status', status);
      if (q.trim()) query.set('q', q.trim());
      if (fromDate) query.set('from', fromDate);
      if (toDate) query.set('to', toDate);
      const res = await apiJson<Page>(`/admin/orders?${query}`);
      downloadCsv(
        `lapbot-don-hang-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          'Mã đơn',
          'Trạng thái',
          'Người nhận',
          'Số điện thoại',
          'Sản phẩm',
          'Mã SKU',
          'Tổng thu COD (VND)',
          'Thành viên',
          'Ngày tạo',
          'Ghi chú khách'
        ],
        res.items.map(item => [
          item.order_code,
          item.status,
          item.customer_name || 'Khách vãng lai',
          item.customer_phone || '',
          item.product_title || '',
          item.sku || '',
          item.total_vnd,
          item.is_member ? 'Thành viên' : 'Vãng lai',
          new Date(item.created_at).toLocaleString('vi-VN'),
          item.note || ''
        ])
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không xuất được tệp CSV đơn hàng.');
    } finally {
      setExportingCsv(false);
    }
  };

  const resetFilters = () => {
    setStatus('');
    setQ('');
    setFromDate('');
    setToDate('');
    setCursor('');
    setCursorStack([]);
    setSearchParams({}, { replace: true });
  };

  const hasFilters = Boolean(status || q.trim() || fromDate || toDate);

  return (
    <section className="admin-section" style={{ gap: '18px' }}>
      {/* Title & Actions */}
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
            <IconPackage size={22} />
            <span>QUẢN TRỊ ĐƠN HÀNG COD & TIẾN TRÌNH KHO VẬN</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Tiếp nhận đơn COD, in phiếu giao hàng đồng kiểm cấu hình, cập nhật vận chuyển và đối
            soát thu hộ.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={exportingCsv}
            onClick={() => void handleExportCsv()}
            className={`retro-btn ${exportingCsv ? 'is-busy' : ''}`.trim()}
          >
            {exportingCsv ? <IconSpinner size={14} /> : <IconDownload size={14} />}
            <span>{exportingCsv ? 'ĐANG XUẤT CSV...' : 'XUẤT CSV ĐƠN HÀNG'}</span>
          </button>
          <button
            type="button"
            disabled={listLoading}
            onClick={() => void load()}
            className={`retro-btn ${listLoading ? 'is-busy' : ''}`.trim()}
          >
            <IconRefresh size={14} className={listLoading ? 'retro-spin' : undefined} />
            <span>{listLoading && page ? 'ĐANG LÀM MỚI...' : 'LÀM MỚI'}</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs with Accurate Counts */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          borderBottom: '2px solid var(--ink-border)',
          paddingBottom: '8px'
        }}
      >
        {statusTabs.map(tab => {
          const tabCount = tab.key
            ? counts[tab.key] || 0
            : Object.values(counts).reduce((a, b) => a + b, 0);
          const isActive = status === tab.key;
          return (
            <button
              type="button"
              key={tab.key || 'ALL'}
              className={`retro-btn ${isActive ? 'retro-btn-amber' : ''}`}
              onClick={() => {
                setStatus(tab.key);
                setCursor('');
                setCursorStack([]);
              }}
              style={{
                padding: '7px 12px',
                fontSize: '11.5px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? 'var(--ink-border)' : 'var(--bg-surface-warm)',
                  color: isActive ? '#FFFDF9' : 'var(--ink-secondary)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {tabCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Date Range Bar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--ink-border)',
          borderRadius: '4px',
          padding: '10px 14px'
        }}
      >
        <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconSearch size={16} />
          <input
            aria-label="Tìm kiếm đơn hàng"
            placeholder="Tìm theo mã đơn (ORD-...), tên người nhận, SĐT hoặc mã SKU..."
            value={q}
            onChange={e => {
              setQ(e.target.value);
              setCursor('');
              setCursorStack([]);
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid var(--ink-border)',
              borderRadius: '3px',
              background: 'var(--bg-canvas)',
              fontSize: '13px'
            }}
          />
          {q && (
            <button
              type="button"
              className="retro-icon-btn"
              onClick={() => {
                setQ('');
                setCursor('');
                setCursorStack([]);
              }}
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <IconClose size={14} />
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            fontSize: '12px'
          }}
        >
          <label htmlFor="ord-from" style={{ fontWeight: 700 }}>
            Từ:
          </label>
          <input
            id="ord-from"
            type="date"
            value={fromDate}
            onChange={e => {
              setFromDate(e.target.value);
              setCursor('');
              setCursorStack([]);
            }}
            style={{
              padding: '5px 8px',
              border: '1px solid var(--ink-border)',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <label htmlFor="ord-to" style={{ fontWeight: 700 }}>
            Đến:
          </label>
          <input
            id="ord-to"
            type="date"
            value={toDate}
            onChange={e => {
              setToDate(e.target.value);
              setCursor('');
              setCursorStack([]);
            }}
            style={{
              padding: '5px 8px',
              border: '1px solid var(--ink-border)',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>

        {hasFilters && (
          <button type="button" onClick={resetFilters} className="retro-btn retro-btn-sm">
            <IconRotateCcw size={13} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="os-alert-banner danger" style={{ marginBottom: 0 }}>
          <IconAlertTriangle size={16} />
          <span>
            <strong>Lỗi:</strong> {error}
          </span>
        </div>
      )}

      {successMsg && (
        <div role="status" className="os-alert-banner success" style={{ marginBottom: 0 }}>
          <IconCheck size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Split Layout: Left Order List / Right Order Receipt & Operations */}
      <div className="admin-panels">
        {/* Left List */}
        <div className="admin-list" style={{ maxHeight: '75vh' }}>
          <RetroTopProgress
            active={listLoading && Boolean(page)}
            label="Đang đồng bộ danh sách đơn hàng..."
          />
          {listLoading && !page && <AdminSplitListSkeleton rows={6} />}
          {page?.items.map(order => {
            const isSelected = (openingOrderId ?? selected?.order_id) === order.order_id;
            return (
              <button
                type="button"
                key={order.order_id}
                className={isSelected ? 'selected' : ''}
                onClick={() => void open(order.order_id)}
                style={{
                  background: isSelected ? 'var(--accent-amber-light)' : 'var(--bg-surface)',
                  border: '1.5px solid var(--ink-border)',
                  borderRadius: '4px',
                  boxShadow: isSelected ? '2px 2px 0px var(--ink-border)' : 'none',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                      {order.order_code}
                    </strong>
                    {order.payment_method === 'VIETQR' && (
                      <span
                        className="method-pill vietqr"
                        style={{ fontSize: '9.5px', padding: '1px 5px' }}
                      >
                        VIETQR
                      </span>
                    )}
                  </div>
                  <span className={`admin-badge ${order.status}`} style={{ fontSize: '10px' }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '12px', marginTop: '3px' }}>
                  {order.customer_name || 'Khách vãng lai'} · {order.customer_phone}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {order.product_title} ({order.sku})
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: '4px',
                    fontSize: '12px'
                  }}
                >
                  <strong
                    style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {money(order.total_vnd)}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </button>
            );
          })}

          {page?.items.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}
            >
              Không tìm thấy đơn hàng nào khớp bộ lọc hiện tại.
            </div>
          )}

          {(cursorStack.length > 0 || page?.next_cursor) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                disabled={cursorStack.length === 0}
                onClick={() => {
                  const prev = cursorStack[cursorStack.length - 1] ?? '';
                  setCursorStack(s => s.slice(0, -1));
                  setCursor(prev);
                }}
                className="retro-btn"
                style={{ flex: 1, fontSize: '12px' }}
              >
                <IconChevronLeft size={14} />
                <span>Trang trước</span>
              </button>
              <button
                type="button"
                disabled={!page?.next_cursor}
                onClick={() => {
                  if (!page?.next_cursor) return;
                  setCursorStack(s => [...s, cursor]);
                  setCursor(page.next_cursor);
                }}
                className="retro-btn"
                style={{ flex: 1, fontSize: '12px' }}
              >
                <span>Trang tiếp</span>
                <IconChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Right Detail Card */}
        <div
          className="admin-detail"
          style={{ background: 'var(--bg-surface)', border: '2px solid var(--ink-border)' }}
        >
          <RetroTopProgress
            active={
              (detailLoading && Boolean(selected) && selected?.order_id === openingOrderId) || busy
            }
            label="Đang cập nhật chứng từ đơn hàng..."
          />
          {detailLoading && (!selected || selected.order_id !== openingOrderId) ? (
            <AdminDetailPaneSkeleton variant="order" />
          ) : selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  borderBottom: '1.5px solid var(--ink-border)',
                  paddingBottom: '12px'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    CHI TIẾT CHỨNG TỪ ĐƠN HÀNG COD
                  </div>
                  <h2
                    style={{
                      margin: '2px 0 0',
                      fontSize: '18px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {selected.order_code}
                  </h2>
                  <div
                    style={{ fontSize: '11.5px', color: 'var(--ink-secondary)', marginTop: '2px' }}
                  >
                    {STATUS_LABELS[selected.status] || selected.status}
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                >
                  {selected.payment_method === 'VIETQR' || selected.note?.includes('VietQR') ? (
                    <span className="method-pill vietqr">
                      <IconQrCode size={13} />
                      <span>VIETQR</span>
                    </span>
                  ) : (
                    <span className="method-pill cod">
                      <IconPackage size={13} />
                      <span>COD</span>
                    </span>
                  )}
                  <span
                    className={`admin-badge ${selected.status}`}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {selected.status}
                  </span>
                  {selected.status !== 'PENDING_CONFIRMATION' && selected.status !== 'EXPIRED' && (
                    <button
                      type="button"
                      onClick={() => setShowPrintSlip(true)}
                      className="retro-btn retro-btn-amber"
                      title="Xem và in phiếu giao hàng đồng kiểm COD"
                    >
                      <IconPrinter size={15} />
                      <span>IN PHIẾU COD</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery info */}
              <div
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '4px',
                  padding: '14px'
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <IconTruckCod size={16} />
                  <span>THÔNG TIN NGƯỜI NHẬN & ĐỊA CHỈ ĐỒNG KIỂM</span>
                </div>
                <div className="admin-grid-2col" style={{ gap: '8px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Họ và tên:</span>{' '}
                    <strong>{selected.customer_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Điện thoại:</span>{' '}
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {selected.customer_phone}
                    </strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Địa chỉ nhận COD:</span>{' '}
                    <strong>{selected.shipping_address}</strong>
                  </div>
                  {selected.note && (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        background: '#fff',
                        padding: '7px 10px',
                        borderRadius: '3px',
                        border: '1px dashed var(--ink-border)',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>Ghi chú của khách:</span>{' '}
                      {selected.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Product specifications */}
              <div
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '4px',
                  padding: '14px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>
                    CẤU HÌNH ĐỒNG KIỂM (
                    {formatLaptopTitle(
                      selected.product_snapshot.brand,
                      selected.product_snapshot.model_name
                    )}
                    )
                  </span>
                  <Link
                    to={`/admin/catalog?kind=variants&q=${encodeURIComponent(selected.product_snapshot.sku)}`}
                    style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-primary)' }}
                  >
                    Mở SKU trong Kho →
                  </Link>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '6px'
                  }}
                >
                  <div>
                    Mã SKU: <code>{selected.product_snapshot.sku}</code>
                  </div>
                  <div>
                    CPU: <strong>{selected.product_snapshot.cpu}</strong>
                  </div>
                  <div>
                    GPU: <strong>{selected.product_snapshot.gpu}</strong>
                  </div>
                  <div>
                    RAM: <strong>{selected.product_snapshot.ram_gb} GB</strong>
                  </div>
                  <div>
                    SSD: <strong>{selected.product_snapshot.ssd_gb} GB</strong>
                  </div>
                  <div>
                    Màn hình: <strong>{selected.product_snapshot.screen}</strong>
                  </div>
                  <div>
                    Màu sắc: <strong>{selected.product_snapshot.color}</strong>
                  </div>
                </div>
              </div>

              {/* Price receipt breakdown */}
              <div
                style={{
                  border: '1.5px solid var(--ink-border)',
                  borderRadius: '4px',
                  padding: '14px',
                  background: '#fff'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '6px'
                  }}
                >
                  <span>Đơn giá máy chốt tại thời điểm đặt:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {money(selected.unit_price_vnd)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '6px'
                  }}
                >
                  <span>Phí vận chuyển & đồng kiểm COD:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {selected.shipping_fee_vnd === 0
                      ? 'MIỄN PHÍ'
                      : money(selected.shipping_fee_vnd)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: 800,
                    borderTop: '1px dashed var(--ink-border)',
                    paddingTop: '8px'
                  }}
                >
                  <span>TỔNG TIỀN THU HỘ (COD):</span>
                  <span style={{ color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                    {money(selected.total_vnd)}
                  </span>
                </div>
              </div>

              {/* Action State Transitions */}
              <div style={{ borderTop: '1.5px solid var(--ink-border)', paddingTop: '14px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--ink-secondary)'
                  }}
                >
                  THAO TÁC CHUYỂN TRẠNG THÁI VẬN HÀNH:
                </div>

                {['CONFIRMED_COD', 'PROCESSING', 'SHIPPING'].includes(selected.status) && (
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Ghi chú vận hành (VD: Mã vận đơn GHN/ViettelPost, serial máy xuất kho, người bàn giao...)"
                      value={transitionNote}
                      onChange={e => setTransitionNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid var(--ink-border)',
                        borderRadius: '4px',
                        fontSize: '12.5px',
                        background: 'var(--bg-canvas)'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selected.status === 'CONFIRMED_COD' && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void change('PROCESSING')}
                        className={`retro-btn retro-btn-primary ${busy ? 'is-busy' : ''}`.trim()}
                      >
                        {busy ? <IconSpinner size={16} /> : <IconCheck size={16} />}
                        <span>DUYỆT & ĐƯA VÀO ĐÓNG GÓI (PROCESSING)</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setShowCancelModal(true)}
                        className="retro-btn retro-btn-danger"
                      >
                        HỦY ĐƠN & HOÀN KHO
                      </button>
                    </>
                  )}

                  {selected.status === 'PROCESSING' && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void change('SHIPPING')}
                        className={`retro-btn retro-btn-primary ${busy ? 'is-busy' : ''}`.trim()}
                      >
                        {busy ? <IconSpinner size={16} /> : <IconTruckCod size={16} />}
                        <span>BÀN GIAO ĐƠN VỊ VẬN CHUYỂN (SHIPPING)</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setShowCancelModal(true)}
                        className="retro-btn retro-btn-danger"
                      >
                        HỦY ĐƠN & HOÀN KHO
                      </button>
                    </>
                  )}

                  {selected.status === 'SHIPPING' && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void change('DELIVERED')}
                        className={`retro-btn retro-btn-success ${busy ? 'is-busy' : ''}`.trim()}
                      >
                        {busy ? <IconSpinner size={16} /> : <IconCheck size={16} />}
                        <span>XÁC NHẬN GIAO THÀNH CÔNG & ĐÃ THU COD</span>
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setShowCancelModal(true)}
                        className="retro-btn retro-btn-danger"
                      >
                        GIAO THẤT BẠI / HOÀN KHO (+1)
                      </button>
                    </>
                  )}

                  {selected.status === 'PENDING_CONFIRMATION' && (
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--accent-amber-light)',
                        border: '1px dashed var(--ink-border)',
                        borderRadius: '4px',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <IconClock size={16} />
                      <span>
                        Đây là <strong>báo giá nháp 15 phút</strong> (chưa trừ tồn kho, hết hạn lúc{' '}
                        {new Date(selected.quote_expires_at).toLocaleString('vi-VN')}). Đơn sẽ
                        chuyển sang <code>CONFIRMED_COD</code> ngay khi khách bấm xác nhận đặt mua.
                      </span>
                    </div>
                  )}

                  {['DELIVERED', 'CANCELLED', 'EXPIRED'].includes(selected.status) && (
                    <div
                      style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}
                    >
                      Đơn hàng đã ở trạng thái kết thúc ({selected.status}), không thể chuyển tiếp.
                    </div>
                  )}
                </div>
              </div>

              {/* Order Lifecycle Audit Timeline */}
              {selected.timeline && selected.timeline.length > 0 && (
                <div style={{ borderTop: '1.5px dashed var(--ink-border)', paddingTop: '14px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--ink-secondary)'
                    }}
                  >
                    <IconHistoryAudit size={14} />
                    <span>LỊCH SỬ XỬ LÝ CHỨNG TỪ ({selected.timeline.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selected.timeline.map(ev => {
                      const meta = ev.metadata || {};
                      const fromSt = typeof meta.from === 'string' ? meta.from : '';
                      const toSt = typeof meta.to === 'string' ? meta.to : '';
                      const noteStr = typeof meta.note === 'string' ? meta.note : '';
                      return (
                        <div
                          key={ev.id}
                          style={{
                            padding: '8px 10px',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--ink-border)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '10px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--accent-primary)'
                              }}
                            >
                              {fromSt && toSt ? `${fromSt} → ${toSt}` : ev.action}
                            </strong>{' '}
                            <span style={{ color: 'var(--ink-secondary)' }}>
                              bởi {ev.actor_name || ev.actor_type}
                            </span>
                            {noteStr && (
                              <div
                                style={{
                                  marginTop: '3px',
                                  fontStyle: 'italic',
                                  color: 'var(--ink-primary)'
                                }}
                              >
                                Ghi chú: &ldquo;{noteStr}&rdquo;
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {new Date(ev.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <IconPackage size={28} />
              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Chọn một đơn hàng ở danh sách bên trái để kiểm tra thông tin người nhận, in phiếu
                giao COD hoặc cập nhật trạng thái kho vận.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && selected && (
        <div className="admin-modal-backdrop" onClick={() => !busy && setShowCancelModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header" style={{ background: 'var(--status-danger)' }}>
              <span>XÁC NHẬN HỦY ĐƠN & HOÀN KHO // {selected.order_code}</span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setShowCancelModal(false)}
                aria-label="Đóng"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Bạn đang thực hiện hủy đơn hàng <strong>{selected.order_code}</strong> (trạng thái
                hiện tại: <code>{selected.status}</code>).
              </p>
              <div
                style={{
                  background: '#FEF9E7',
                  border: '1px solid #D69E2E',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#8B5A00'
                }}
              >
                Hệ thống sẽ tự động cộng trả <strong>+1 tồn kho</strong> vào mã SKU{' '}
                <code>{selected.product_snapshot.sku}</code> ngay trong cùng giao dịch cơ sở dữ
                liệu.
              </div>

              <div>
                <label
                  htmlFor="cancel-reason"
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginBottom: '5px'
                  }}
                >
                  Lý do hủy đơn / giao thất bại (lưu vào Nhật ký Kiểm toán):
                </label>
                <input
                  id="cancel-reason"
                  type="text"
                  maxLength={300}
                  placeholder="VD: Khách đổi sang cấu hình RAM 32GB / Không liên lạc được khi giao COD..."
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="retro-btn"
                >
                  QUAY LẠI
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void change(
                      'CANCELLED',
                      cancelReason || transitionNote || 'Hủy đơn từ trang quản trị'
                    )
                  }
                  className="retro-btn retro-btn-danger"
                >
                  {busy ? 'ĐANG HỦY & HOÀN KHO...' : 'XÁC NHẬN HỦY ĐƠN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable COD Delivery & Hardware Inspection Slip Modal */}
      {showPrintSlip && selected && (
        <div
          className="admin-modal-backdrop cod-print-modal-backdrop"
          onClick={() => setShowPrintSlip(false)}
        >
          <div
            className="admin-modal-box cod-print-modal-box"
            style={{ maxWidth: '720px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header no-print">
              <span>PHIẾU GIAO HÀNG & ĐỒNG KIỂM COD // {selected.order_code}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="retro-btn retro-btn-amber retro-btn-sm"
                >
                  <IconPrinter size={14} />
                  <span>IN PHIẾU NGAY (A4/A5)</span>
                </button>
                <button
                  type="button"
                  className="retro-icon-btn on-dark"
                  onClick={() => setShowPrintSlip(false)}
                  aria-label="Đóng"
                >
                  <IconClose size={15} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body" style={{ background: '#fff' }}>
              <div className="cod-print-slip">
                <div className="cod-print-header">
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {storeInfo?.store_name || 'LAPBOT — CHUYÊN GIA LAPTOP & TRỢ LÝ AI'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#444', marginTop: '2px' }}>
                      {storeInfo?.contact_channels?.join(' · ') || 'Hotline: 1900 6868'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#444' }}>
                      {storeInfo?.shipping_scope ||
                        'Cho phép đồng kiểm ngoại quan & cấu hình trước khi thanh toán COD'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    >
                      PHIẾU XUẤT KHO & THU HỘ COD
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        marginTop: '2px'
                      }}
                    >
                      {selected.order_code}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555' }}>
                      Ngày in: {new Date().toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="cod-print-grid">
                  <div className="cod-print-box">
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      1. NGƯỜI NHẬN HÀNG
                    </div>
                    <div>
                      Họ tên: <strong>{selected.customer_name}</strong>
                    </div>
                    <div>
                      Điện thoại: <strong>{selected.customer_phone}</strong>
                    </div>
                    <div>Địa chỉ: {selected.shipping_address}</div>
                    {selected.note && (
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>
                        Ghi chú: <em>{selected.note}</em>
                      </div>
                    )}
                  </div>

                  <div className="cod-print-box">
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      2. THÔNG TIN THANH TOÁN THU HỘ
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Giá trị sản phẩm:</span>
                      <strong>{money(selected.unit_price_vnd)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phí vận chuyển COD:</span>
                      <strong>
                        {selected.shipping_fee_vnd === 0
                          ? '0 ₫ (Miễn phí)'
                          : money(selected.shipping_fee_vnd)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '6px',
                        paddingTop: '6px',
                        borderTop: '1px dashed #1C1A17',
                        fontSize: '15px',
                        fontWeight: 800
                      }}
                    >
                      <span>SỐ TIỀN THU HỘ COD:</span>
                      <span>{money(selected.total_vnd)}</span>
                    </div>
                  </div>
                </div>

                <div className="cod-print-box" style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      marginBottom: '6px'
                    }}
                  >
                    3. THÔNG SỐ KỸ THUẬT ĐỒNG KIỂM KHI NHẬN HÀNG (1 MÁY NGUYÊN SEAL / ĐỦ PHỤ KIỆN)
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>
                    {selected.product_snapshot.brand} {selected.product_snapshot.model_name} — Mã
                    SKU: {selected.product_snapshot.sku}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px 16px',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      • Vi xử lý (CPU): <strong>{selected.product_snapshot.cpu}</strong>
                    </div>
                    <div>
                      • Đồ họa (GPU): <strong>{selected.product_snapshot.gpu}</strong>
                    </div>
                    <div>
                      • Bộ nhớ RAM: <strong>{selected.product_snapshot.ram_gb} GB</strong>
                    </div>
                    <div>
                      • Ổ cứng SSD: <strong>{selected.product_snapshot.ssd_gb} GB</strong>
                    </div>
                    <div>
                      • Màn hình: <strong>{selected.product_snapshot.screen}</strong>
                    </div>
                    <div>
                      • Màu sắc: <strong>{selected.product_snapshot.color}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#333' }}>
                  <strong>Chính sách bảo hành & đổi trả:</strong>{' '}
                  {storeInfo?.warranty_policy || 'Bảo hành chính hãng 12 tháng.'}{' '}
                  {storeInfo?.return_policy || ''}
                </div>

                <div className="cod-print-signatures">
                  <div>
                    <strong>KHO XUẤT HÀNG</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '42px' }}>
                      (Ký & ghi rõ họ tên)
                    </div>
                  </div>
                  <div>
                    <strong>BƯU TÁ GIAO HÀNG</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '42px' }}>
                      (Ký xác nhận nhận kiện)
                    </div>
                  </div>
                  <div>
                    <strong>KHÁCH HÀNG ĐỒNG KIỂM</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '42px' }}>
                      (Đã kiểm đúng cấu hình)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
