import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { OrderView } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { dateTime, formatLaptopTitle, money } from '../../lib/format.js';
import {
  OrderDetailSkeleton,
  ReceiptPerforation,
  RetroTopProgress,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconArrowLeft,
  IconCheckCircle,
  IconPackage,
  IconQrCode,
  IconRefresh,
  IconSpinner
} from '../../components/icons/RetroIcons.js';

const STATUS_STEPS = [
  { key: 'CONFIRMED_COD', label: 'Đã xác nhận' },
  { key: 'PROCESSING', label: 'Chuẩn bị máy' },
  { key: 'SHIPPING', label: 'Đang giao hàng' },
  { key: 'DELIVERED', label: 'Giao thành công' }
];

export function OrderDetailPage() {
  const { order_id } = useParams();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reloading, setReloading] = useState(false);

  async function reload(manual = false) {
    if (!order_id) return;
    setError('');
    if (manual) setReloading(true);
    try {
      setOrder(await apiJson<OrderView>(`/orders/${order_id}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được đơn.');
    } finally {
      if (manual) setReloading(false);
    }
  }

  useEffect(() => {
    void reload(false);
  }, [order_id]);

  async function cancel() {
    if (!order) return;
    setBusy(true);
    try {
      setOrder(
        await apiJson<OrderView>(`/orders/${order.order_id}/cancel`, { method: 'POST', body: '{}' })
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không hủy được đơn.');
    } finally {
      setBusy(false);
    }
  }

  const isCancelled = order?.status === 'CANCELLED';
  const isVietQr = order?.payment_method === 'VIETQR' || Boolean(order?.note?.includes('VietQR'));
  const stepIndex = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1;

  return (
    <section className="product-detail">
      <div className="product-top-bar">
        <Link to="/orders" className="back-link">
          <IconArrowLeft size={15} />
          <span>Quay lại Đơn của tôi</span>
        </Link>
        {order && <span className="order-code-badge">{order.order_code}</span>}
      </div>

      {error && (
        <p role="alert" className="unavailable">
          {error}
        </p>
      )}
      {!order && !error && <OrderDetailSkeleton />}

      {order && (
        <div className="order-detail-layout">
          <RetroTopProgress
            active={reloading || busy}
            label="Đang cập nhật trạng thái đơn hàng..."
          />
          {!isCancelled ? (
            <WindowFrame title="DELIVERY_TRACKER.SYS" subtitle={order.order_code} accent="amber">
              <div className="status-stepper">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index <= stepIndex;
                  const isCurrent = index === stepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`stepper-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="stepper-dot">
                        {isDone ? <IconCheckCircle size={15} /> : <span>0{index + 1}</span>}
                      </div>
                      <span className="stepper-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </WindowFrame>
          ) : (
            <div className="order-cancelled-banner">
              <strong>Đơn hàng đã được hủy (CANCELLED)</strong>
              <p>
                Tồn kho đã được hoàn lại hệ thống. Bạn có thể chọn cấu hình khác bất cứ lúc nào.
              </p>
            </div>
          )}

          <div className="receipt-shell">
            <ReceiptPerforation position="top" />
            <div className="receipt order-detail-receipt">
              <div className="receipt-head">
                <div>
                  <p className="eyebrow">BIÊN LAI ĐẶT HÀNG // {order.order_code}</p>
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
                {formatLaptopTitle(order.product_snapshot.brand, order.product_snapshot.model_name)}
              </h2>
              <p className="receipt-specs">
                SKU: {order.product_snapshot.sku} · {order.product_snapshot.cpu} ·{' '}
                {order.product_snapshot.gpu} · RAM {order.product_snapshot.ram_gb}GB · SSD{' '}
                {order.product_snapshot.ssd_gb}GB
              </p>

              <div className="receipt-calc-table">
                <div className="calc-row">
                  <span>Giá máy (×1):</span>
                  <span>{money(order.unit_price_vnd)}</span>
                </div>
                <div className="calc-row">
                  <span>Phí vận chuyển:</span>
                  <span>{money(order.shipping_fee_vnd)}</span>
                </div>
                <div className="calc-row total-row">
                  <strong>TỔNG THANH TOÁN:</strong>
                  <strong className="price">{money(order.total_vnd)}</strong>
                </div>
              </div>

              <div className="receipt-info-grid">
                <div>
                  <span className="info-label">PHƯƠNG THỨC:</span>
                  <p>
                    {isVietQr ? (
                      <span className="method-pill vietqr">
                        <IconQrCode size={13} /> VietQR 24/7
                      </span>
                    ) : (
                      <span className="method-pill cod">
                        <IconPackage size={13} /> COD (Đồng kiểm)
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <span className="info-label">THỜI GIAN XÁC NHẬN:</span>
                  <p>{order.confirmed_at ? dateTime(order.confirmed_at) : 'Chưa xác nhận'}</p>
                </div>

                <div>
                  <span className="info-label">NGƯỜI NHẬN MÁY:</span>
                  <p>
                    {order.customer_name} ({order.customer_phone})
                  </p>
                </div>

                <div>
                  <span className="info-label">ĐỊA CHỈ GIAO HÀNG:</span>
                  <p>{order.shipping_address}</p>
                </div>

                {order.note && (
                  <div className="info-full">
                    <span className="info-label">GHI CHÚ:</span>
                    <p>{order.note}</p>
                  </div>
                )}
              </div>

              <div className="actions">
                <button
                  type="button"
                  disabled={reloading || busy}
                  className={`btn-with-icon ${reloading ? 'is-busy' : ''}`.trim()}
                  onClick={() => void reload(true)}
                >
                  <IconRefresh size={14} className={reloading ? 'retro-spin' : undefined} />
                  <span>{reloading ? 'Đang làm mới...' : 'Làm mới trạng thái'}</span>
                </button>
                {order.status === 'CONFIRMED_COD' && (
                  <button
                    type="button"
                    className={`btn-danger-outline btn-with-icon ${busy ? 'is-busy' : ''}`.trim()}
                    disabled={busy || reloading}
                    onClick={() => void cancel()}
                  >
                    {busy && <IconSpinner size={14} />}
                    <span>{busy ? 'Đang xử lý...' : 'Hủy đơn hàng này'}</span>
                  </button>
                )}
              </div>
            </div>
            <ReceiptPerforation position="bottom" />
          </div>
        </div>
      )}
    </section>
  );
}
