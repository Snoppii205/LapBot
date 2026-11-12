import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { OrderView, SessionView } from '@lapbot/contracts';
import { useAuth } from '../../features/auth/AuthContext.js';
import { apiJson } from '../../lib/api-client.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import {
  OrderReceiptSkeletonList,
  ReceiptPerforation,
  RetroTopProgress,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconPackage,
  IconQrCode
} from '../../components/icons/RetroIcons.js';

export function OrdersPage() {
  const { customer } = useAuth();
  const [items, setItems] = useState<OrderView[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState('');
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    setCursor('');
    setCursorStack([]);
  }, [customer?.customer_id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        if (!customer) {
          await apiJson<SessionView>('/chat/session', { method: 'POST', body: '{}' });
        }
        const result = await apiJson<{ items: OrderView[]; next_cursor: string | null }>(
          `/orders${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`
        );
        if (active) {
          setItems(result.items);
          setNextCursor(result.next_cursor);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không tải được đơn.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [cursor, customer?.customer_id]);

  return (
    <section className="product-detail">
      <WindowFrame
        title="MY_ORDERS.LOG"
        subtitle={customer ? `TÀI KHOẢN: ${customer.email.toUpperCase()}` : 'PHIÊN KHÁCH VÃNG LAI'}
        accent="amber"
      >
        <div className="orders-page-header">
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi tiến trình xử lý kho, giao hàng đồng kiểm và biên lai thanh toán.</p>
          {!customer && (
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                background: 'var(--bg-canvas)',
                padding: '6px 12px',
                borderRadius: '3px',
                border: '1px dashed var(--ink-border)'
              }}
            >
              Đang xem đơn theo phiên máy này.{' '}
              <Link
                to="/login?return_url=/orders"
                style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
              >
                Đăng nhập tài khoản
              </Link>{' '}
              để tự động lưu & đồng bộ xuyên suốt mọi thiết bị.
            </div>
          )}
        </div>
      </WindowFrame>

      <RetroTopProgress
        active={loading && items.length > 0}
        label="Đang chuyển trang danh sách đơn hàng..."
      />

      {loading && items.length === 0 && <OrderReceiptSkeletonList count={3} />}

      {error && (
        <p role="alert" className="unavailable">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <WindowFrame title="ORDER_SPOOL // EMPTY">
          <div className="orders-empty-card">
            <img
              src="/assets/retro-os/empty-orders-os.svg"
              alt=""
              width="144"
              height="108"
              className="empty-state-svg"
            />
            <h3>Chưa có đơn hàng nào trong phiên này</h3>
            <p>
              Bạn chưa xác nhận đơn đặt mua nào. Nếu đã đặt đơn nhưng xóa cookie hoặc đổi thiết bị,
              vui lòng liên hệ hotline cửa hàng để tra cứu theo số điện thoại.
            </p>
            <Link to="/" className="primary-button btn-with-icon">
              <span>Khám phá laptop ngay</span>
              <IconArrowRight size={15} />
            </Link>
          </div>
        </WindowFrame>
      )}

      <div
        className={`orders-list-grid ${loading && items.length > 0 ? 'is-refreshing-pane' : ''}`.trim()}
      >
        {items.map(order => {
          const isVietQr =
            order.payment_method === 'VIETQR' || Boolean(order.note?.includes('VietQR'));
          return (
            <div className="receipt-shell" key={order.order_id}>
              <ReceiptPerforation position="top" />
              <article className="receipt order-card">
                <div className="order-card-head">
                  <div>
                    <span className="eyebrow">{order.order_code}</span>
                    <span className="receipt-sys-code">{order.status}</span>
                  </div>
                  <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                    {order.status === 'CONFIRMED_COD'
                      ? isVietQr
                        ? 'ĐÃ XÁC NHẬN · VIETQR'
                        : 'ĐÃ XÁC NHẬN COD'
                      : order.status}
                  </span>
                </div>

                <h2>
                  {formatLaptopTitle(
                    order.product_snapshot.brand,
                    order.product_snapshot.model_name
                  )}
                </h2>
                <p className="order-card-specs">
                  SKU: {order.product_snapshot.sku} · {order.product_snapshot.cpu} · RAM{' '}
                  {order.product_snapshot.ram_gb}GB · SSD {order.product_snapshot.ssd_gb}GB
                </p>

                <div className="order-card-foot">
                  <div>
                    <span className="foot-label">TỔNG THANH TOÁN</span>
                    <strong className="foot-price">{money(order.total_vnd)}</strong>
                  </div>

                  <div className="foot-method">
                    {isVietQr ? (
                      <span className="method-pill vietqr">
                        <IconQrCode size={13} />
                        <span>VietQR 24/7</span>
                      </span>
                    ) : (
                      <span className="method-pill cod">
                        <IconPackage size={13} />
                        <span>COD Đồng kiểm</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-card-action">
                  <Link to={`/orders/${order.order_id}`} className="primary-link btn-with-icon">
                    <span>Chi tiết & Tiến độ đơn</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </article>
              <ReceiptPerforation position="bottom" />
            </div>
          );
        })}
      </div>

      {(cursorStack.length > 0 || nextCursor) && (
        <div
          className="catalog-pagination"
          style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
        >
          <button
            type="button"
            className="retro-btn"
            disabled={cursorStack.length === 0 || loading}
            onClick={() => {
              const prev = cursorStack[cursorStack.length - 1] ?? '';
              setCursorStack(s => s.slice(0, -1));
              setCursor(prev);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px'
            }}
          >
            <IconChevronLeft size={14} />
            <span>Trang trước</span>
          </button>
          <button
            type="button"
            className="primary-button btn-with-icon"
            disabled={!nextCursor || loading}
            onClick={() => {
              if (!nextCursor) return;
              setCursorStack(s => [...s, cursor]);
              setCursor(nextCursor);
            }}
          >
            <span>Trang tiếp theo</span>
            <IconChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
