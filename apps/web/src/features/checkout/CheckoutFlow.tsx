import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type {
  OrderView,
  PaymentMethod,
  SessionView,
  ShippingAddressParts,
  StoreInfo,
  VariantDetail
} from '@lapbot/contracts';
import { useAuth } from '../auth/AuthContext.js';
import { useCart } from '../cart/CartContext.js';
import { useChat } from '../chat/ChatContext.js';
import { apiJson, ApiClientError } from '../../lib/api-client.js';
import { availabilityClass, availabilityLabel } from '../../lib/availability.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { dateTime, formatLaptopTitle, money } from '../../lib/format.js';
import {
  ADDRESS_TYPE_OPTIONS,
  formatShippingAddress,
  isAddressPartsComplete,
  parseLegacyAddress
} from '../../lib/vn-locations.js';
import { VietnamAddressComposer } from '../../components/address/VietnamAddressComposer.js';
import {
  ProgressiveImage,
  ReceiptPerforation,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconCheckCircle,
  IconClock,
  IconCopy,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconQrCode,
  IconRefresh,
  IconShieldCheck,
  IconSparkleAi,
  IconSpinner,
  IconTruckCod,
  IconUsers,
  IconZap
} from '../../components/icons/RetroIcons.js';

type FormValue = {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  note: string;
};

const initialForm: FormValue = {
  customer_name: '',
  customer_phone: '',
  shipping_address: '',
  note: ''
};

export function CheckoutFlow({
  variantId,
  variantIds,
  onOrderSuccess
}: {
  variantId?: string;
  variantIds?: string[];
  onOrderSuccess?: (order: OrderView) => void;
}) {
  const location = useLocation();
  const { customer, refresh: refreshAuth } = useAuth();
  const cart = useCart();
  const chat = useChat();

  const targetIds = useMemo(() => {
    const raw = variantIds?.length ? variantIds : variantId ? [variantId] : [];
    return [...new Set(raw.map(id => id.trim()).filter(Boolean))];
  }, [variantId, variantIds]);

  const primaryVariantId = targetIds[0] ?? '';
  const isBatch = targetIds.length > 1;
  const targetIdsKey = targetIds.join(',');

  const [form, setForm] = useState<FormValue>(initialForm);
  const [itemsDetail, setItemsDetail] = useState<VariantDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  const [addressParts, setAddressParts] = useState<ShippingAddressParts>({
    province: '',
    ward: '',
    street_detail: '',
    address_type: 'HOME'
  });
  const [editingAddress, setEditingAddress] = useState(true);
  const [addressInputMode, setAddressInputMode] = useState<'structured' | 'quick'>('structured');
  const [saveDefaultAddress, setSaveDefaultAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  const [order, setOrder] = useState<OrderView | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<OrderView[]>([]);
  const [editingStep1, setEditingStep1] = useState(false);

  const [busy, setBusy] = useState(false);
  const [restoringQuote, setRestoringQuote] = useState(false);
  const [verifyingQr, setVerifyingQr] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrImgError, setQrImgError] = useState(false);
  const [error, setError] = useState('');
  const [partialBatchError, setPartialBatchError] = useState('');
  const [remainingSec, setRemainingSec] = useState<number | null>(null);

  const requestId = useRef<string | null>(null);
  const serverOffsetRef = useRef(0);
  const initializedCustomerRef = useRef<string | null>(null);

  // Hydrate Member profile fields once upon login/load
  useEffect(() => {
    if (customer && initializedCustomerRef.current !== customer.customer_id) {
      initializedCustomerRef.current = customer.customer_id;
      const parsed = parseLegacyAddress(
        customer.default_shipping_address,
        customer.shipping_address_meta
      );
      const formattedSaved = customer.shipping_address_meta
        ? formatShippingAddress(parsed)
        : customer.default_shipping_address;
      const hasValidSaved =
        formattedSaved.trim().length >= 12 &&
        formattedSaved.split(',').filter(part => part.trim()).length >= 3;

      setAddressParts(parsed);
      setEditingAddress(!hasValidSaved);
      setForm(prev => ({
        ...prev,
        customer_name: prev.customer_name || customer.full_name || '',
        customer_phone: prev.customer_phone || customer.phone || '',
        shipping_address: prev.shipping_address || formattedSaved || ''
      }));
    }
  }, [customer]);

  // Preload live VariantDetail(s) & StoreInfo for sticky right-column summary
  useEffect(() => {
    if (!targetIds.length) {
      setItemsDetail([]);
      setLoadingDetails(false);
      return;
    }
    let active = true;
    setLoadingDetails(true);

    void Promise.all([
      Promise.all(
        targetIds.map(id => apiJson<VariantDetail>(`/catalog/variants/${id}`).catch(() => null))
      ),
      apiJson<StoreInfo>('/store-info').catch(() => null)
    ]).then(([details, info]) => {
      if (!active) return;
      setItemsDetail(details.filter((item): item is VariantDetail => item !== null));
      if (info) setStoreInfo(info);
      setLoadingDetails(false);
    });

    return () => {
      active = false;
    };
  }, [targetIdsKey, targetIds]);

  // Restore active 15-minute PENDING_CONFIRMATION quote if returning to the same single SKU
  useEffect(() => {
    if (!primaryVariantId || isBatch) return;
    let active = true;
    setRestoringQuote(true);
    void apiJson<SessionView>('/chat/session', { method: 'POST', body: '{}' })
      .then(async session => {
        const id = session.sales_context.active_preview_id;
        if (typeof id !== 'string') return;
        const saved = await apiJson<OrderView>(`/orders/${id}`);
        if (
          active &&
          saved.variant_id === primaryVariantId &&
          saved.status === 'PENDING_CONFIRMATION'
        ) {
          setOrder(saved);
          setEditingStep1(false);
          setAddressParts(prev =>
            prev.province ? prev : parseLegacyAddress(saved.shipping_address, null)
          );
          setEditingAddress(false);
          const restoredMethod: PaymentMethod =
            saved.payment_method === 'VIETQR' || saved.note?.includes('VietQR') ? 'VIETQR' : 'COD';
          setPaymentMethod(restoredMethod);
          setForm(prev => ({
            customer_name: prev.customer_name || saved.customer_name,
            customer_phone: prev.customer_phone || saved.customer_phone,
            shipping_address: prev.shipping_address || saved.shipping_address,
            note:
              prev.note ||
              (saved.note ? saved.note.replace(/^\[Thanh toán: VietQR[^\]]*\]\s*/i, '') : '')
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setRestoringQuote(false);
      });
    return () => {
      active = false;
    };
  }, [primaryVariantId, isBatch]);

  // 15-minute quote countdown synchronized with server_time
  useEffect(() => {
    if (!order || order.status !== 'PENDING_CONFIRMATION') {
      setRemainingSec(null);
      return;
    }
    const serverMs = Date.parse(order.server_time);
    if (Number.isFinite(serverMs)) {
      serverOffsetRef.current = serverMs - Date.now();
    }
    const expiresMs = Date.parse(order.quote_expires_at);
    if (!Number.isFinite(expiresMs)) {
      setRemainingSec(null);
      return;
    }
    const tick = () => {
      const nowServer = Date.now() + serverOffsetRef.current;
      const diffSec = Math.max(0, Math.ceil((expiresMs - nowServer) / 1000));
      setRemainingSec(diffSec);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const update = (key: keyof FormValue, value: string) => {
    setForm(previous => ({ ...previous, [key]: value }));
    requestId.current = null;
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const resolveEffectiveAddress = (): {
    address: string;
    meta: ShippingAddressParts | null;
    valid: boolean;
  } => {
    if (!editingAddress) {
      const trimmed = form.shipping_address.trim();
      const valid =
        trimmed.length >= 12 && trimmed.split(',').filter(part => part.trim()).length >= 3;
      return {
        address: trimmed,
        meta: isAddressPartsComplete(addressParts) ? addressParts : null,
        valid
      };
    }

    if (addressInputMode === 'quick') {
      const trimmed = form.shipping_address.trim();
      const valid =
        trimmed.length >= 12 && trimmed.split(',').filter(part => part.trim()).length >= 3;
      return { address: trimmed, meta: null, valid };
    }

    if (isAddressPartsComplete(addressParts)) {
      return {
        address: formatShippingAddress(addressParts),
        meta: addressParts,
        valid: true
      };
    }

    // Smart fallback when user pastes/types a full 3-part address into street_detail
    const directStreet = addressParts.street_detail.trim();
    if (
      !addressParts.province.trim() &&
      !addressParts.ward.trim() &&
      directStreet.length >= 12 &&
      directStreet.split(',').filter(part => part.trim()).length >= 3
    ) {
      return { address: directStreet, meta: null, valid: true };
    }

    return { address: formatShippingAddress(addressParts), meta: null, valid: false };
  };

  async function submitPreview(forceNewRequest = false) {
    if (!primaryVariantId) return;
    setError('');
    setPartialBatchError('');

    const resolved = resolveEffectiveAddress();
    if (!resolved.valid) {
      setError(
        addressInputMode === 'quick'
          ? 'Vui lòng nhập đầy đủ Số nhà/Tên đường, Phường/Xã và Tỉnh/Thành phố (ngăn cách bởi dấu phẩy).'
          : 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà/tên đường nhận máy.'
      );
      return;
    }

    setBusy(true);
    if (forceNewRequest || !requestId.current) {
      requestId.current = crypto.randomUUID();
    }

    try {
      const result = await apiJson<OrderView>('/orders/preview', {
        method: 'POST',
        body: JSON.stringify({
          client_request_id: requestId.current,
          variant_id: primaryVariantId,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          shipping_address: resolved.address,
          note: form.note.trim(),
          payment_method: paymentMethod,
          ...(resolved.meta ? { shipping_address_meta: resolved.meta } : {}),
          ...(customer ? { save_default_address: saveDefaultAddress } : {})
        })
      });

      setForm(prev => ({ ...prev, shipping_address: resolved.address }));
      setOrder(result);
      setEditingStep1(false);
      setQrImgError(false);

      if (customer && saveDefaultAddress) {
        void refreshAuth();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tạo được phiếu báo giá đơn hàng.');
    } finally {
      setBusy(false);
    }
  }

  async function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitPreview(false);
  }

  async function handleCancelQuote() {
    if (!order) return;
    setBusy(true);
    setError('');
    try {
      await apiJson<OrderView>(`/orders/${order.order_id}/cancel`, {
        method: 'POST',
        body: '{}'
      });
    } catch {
      // Even if already expired/cancelled, return cleanly to Step 1
    } finally {
      setOrder(null);
      requestId.current = null;
      setEditingStep1(false);
      setBusy(false);
    }
  }

  async function handleConfirmOrder() {
    if (!order) return;
    setBusy(true);
    setError('');
    setPartialBatchError('');

    const confirmedList: OrderView[] = [];

    try {
      const firstConfirmed = await apiJson<OrderView>(`/orders/${order.order_id}/confirm`, {
        method: 'POST',
        body: '{}'
      });
      confirmedList.push(firstConfirmed);
      cart.removeItem(firstConfirmed.variant_id);

      if (isBatch) {
        for (const extraVariantId of targetIds.slice(1)) {
          try {
            const extraQuote = await apiJson<OrderView>('/orders/preview', {
              method: 'POST',
              body: JSON.stringify({
                client_request_id: crypto.randomUUID(),
                variant_id: extraVariantId,
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                note: order.note,
                payment_method: order.payment_method,
                ...(customer ? { save_default_address: false } : {})
              })
            });
            const extraConfirmed = await apiJson<OrderView>(
              `/orders/${extraQuote.order_id}/confirm`,
              {
                method: 'POST',
                body: '{}'
              }
            );
            confirmedList.push(extraConfirmed);
            cart.removeItem(extraVariantId);
          } catch (batchErr) {
            const failedSku =
              itemsDetail.find(item => item.variant_id === extraVariantId)?.sku ?? extraVariantId;
            const msg =
              batchErr instanceof Error ? batchErr.message : 'Không thể xác nhận cấu hình này.';
            setPartialBatchError(
              `Đã chốt thành công ${confirmedList.length}/${targetIds.length} máy. Cấu hình ${failedSku} chưa chốt được (${msg}) và vẫn được giữ trong Giỏ hàng của bạn.`
            );
            break;
          }
        }
      }

      setConfirmedOrders(confirmedList);
      setOrder(firstConfirmed);
      setEditingStep1(false);

      if (customer) {
        void refreshAuth();
      }
      if (onOrderSuccess) {
        onOrderSuccess(firstConfirmed);
      }
    } catch (cause) {
      if (
        cause instanceof ApiClientError &&
        [
          'PRICE_CHANGED',
          'PRODUCT_CHANGED',
          'PRODUCT_UNAVAILABLE',
          'OUT_OF_STOCK',
          'QUOTE_EXPIRED'
        ].includes(cause.code)
      ) {
        setError(`${cause.message} Hãy bấm tạo lại phiếu báo giá hoặc chọn cấu hình khác.`);
      } else {
        setError(cause instanceof Error ? cause.message : 'Xác nhận đặt hàng thất bại.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSimulatedQrConfirm() {
    setVerifyingQr(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 900));
    setVerifyingQr(false);
    await handleConfirmOrder();
  }

  const isConfirmed = confirmedOrders.length > 0 || order?.status === 'CONFIRMED_COD';
  const isPending = !isConfirmed && order?.status === 'PENDING_CONFIRMATION';
  const showStep1Form = !isConfirmed && (!isPending || editingStep1);
  const activeStep = isConfirmed ? 3 : isPending && !editingStep1 ? 2 : 1;

  const activePaymentMethod: PaymentMethod =
    order?.payment_method === 'VIETQR' ||
    (!order && paymentMethod === 'VIETQR') ||
    Boolean(order?.note?.includes('VietQR'))
      ? 'VIETQR'
      : 'COD';

  const isQuoteExpired =
    isPending &&
    (remainingSec !== null
      ? remainingSec <= 0
      : order
        ? Date.parse(order.quote_expires_at) <= Date.now() + serverOffsetRef.current
        : false);

  const formattedCountdown =
    remainingSec !== null && remainingSec > 0
      ? `${String(Math.floor(remainingSec / 60)).padStart(2, '0')}:${String(
          remainingSec % 60
        ).padStart(2, '0')}`
      : '00:00';

  // Cost calculation for Right Sticky Summary & Batch Receipt
  const unitShippingFee = order ? order.shipping_fee_vnd : (storeInfo?.shipping_fee_vnd ?? 0);
  const orderCount = isConfirmed
    ? Math.max(1, confirmedOrders.length)
    : Math.max(1, itemsDetail.length || targetIds.length);

  const liveSubtotalVnd = itemsDetail.reduce((sum, item) => sum + item.price_vnd, 0);
  const effectiveSubtotalVnd = isConfirmed
    ? confirmedOrders.length > 0
      ? confirmedOrders.reduce((sum, o) => sum + o.unit_price_vnd, 0)
      : (order?.unit_price_vnd ?? liveSubtotalVnd)
    : isPending && order && !isBatch
      ? order.unit_price_vnd
      : liveSubtotalVnd || order?.unit_price_vnd || 0;

  const effectiveShippingTotalVnd = isConfirmed
    ? confirmedOrders.length > 0
      ? confirmedOrders.reduce((sum, o) => sum + o.shipping_fee_vnd, 0)
      : (order?.shipping_fee_vnd ?? unitShippingFee)
    : unitShippingFee * orderCount;

  const effectiveGrandTotalVnd = effectiveSubtotalVnd + effectiveShippingTotalVnd;

  const qrAmountVnd = isBatch
    ? effectiveGrandTotalVnd
    : (order?.total_vnd ?? effectiveGrandTotalVnd);
  const qrUrl = order
    ? `https://img.vietqr.io/image/MB-0333666999-compact2.png?amount=${qrAmountVnd}&addInfo=${encodeURIComponent(
        order.order_code
      )}&accountName=CONG%20TY%20TNHH%20LAPBOT%20VN`
    : '';

  const outOfStockItems = itemsDetail.filter(item => !item.in_stock);
  const allLoadedOutOfStock =
    !loadingDetails && itemsDetail.length > 0 && outOfStockItems.length === itemsDetail.length;

  const returnUrl = `${location.pathname}${location.search}`;

  return (
    <div className="checkout-layout-2col">
      {/* LEFT MAIN COLUMN: 3-Step Interactive Flow */}
      <div className="checkout-main-col">
        {/* 3-Step Sequential Progress Header */}
        <div className="checkout-steps-bar" aria-label="Tiến trình thanh toán 3 bước">
          <div className={`checkout-step-item ${activeStep === 1 ? 'active' : 'done'}`}>
            <span className="checkout-step-num">
              {activeStep > 1 ? <IconCheck size={12} /> : '01'}
            </span>
            <div className="checkout-step-copy">
              <strong>Thông tin & Thanh toán</strong>
              <small>Người nhận & địa chỉ</small>
            </div>
          </div>

          <div
            className={`checkout-step-item ${
              activeStep === 2 ? 'active' : activeStep > 2 ? 'done' : ''
            }`}
          >
            <span className="checkout-step-num">
              {activeStep > 2 ? <IconCheck size={12} /> : '02'}
            </span>
            <div className="checkout-step-copy">
              <strong>Duyệt biên lai 15p</strong>
              <small>Chốt giá trước trừ kho</small>
            </div>
          </div>

          <div className={`checkout-step-item ${activeStep === 3 ? 'active done' : ''}`}>
            <span className="checkout-step-num">
              {activeStep === 3 ? <IconCheck size={12} /> : '03'}
            </span>
            <div className="checkout-step-copy">
              <strong>Hoàn tất đơn</strong>
              <small>Giữ máy nguyên tử</small>
            </div>
          </div>
        </div>

        <RetroTopProgress
          active={restoringQuote || busy || verifyingQr}
          label="Đang đồng bộ phiếu đặt hàng..."
        />

        {error && (
          <p role="alert" className="unavailable checkout-error-banner">
            {error}
          </p>
        )}

        {partialBatchError && (
          <div role="alert" className="os-alert-banner warning">
            <IconAlertTriangle size={16} />
            <span>{partialBatchError}</span>
          </div>
        )}

        {!loadingDetails && outOfStockItems.length > 0 && !isConfirmed && (
          <div role="status" className="os-alert-banner warning">
            <IconAlertTriangle size={16} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <span>
                Cấu hình{' '}
                <strong>
                  {outOfStockItems
                    .map(item => `${formatLaptopTitle(item.brand, item.model_name)} (${item.sku})`)
                    .join(', ')}
                </strong>{' '}
                hiện đang tạm hết hàng hoặc chưa xác minh tồn kho.
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="retro-btn retro-btn-sm"
                  onClick={() =>
                    chat.openChat(
                      outOfStockItems[0]!.variant_id,
                      `Mẫu ${formatLaptopTitle(
                        outOfStockItems[0]!.brand,
                        outOfStockItems[0]!.model_name
                      )} (${outOfStockItems[0]!.sku}) đang hết hàng, gợi ý giúp mình mẫu tương đương sẵn kho nhé!`
                    )
                  }
                >
                  <IconSparkleAi size={13} />
                  <span>Nhờ AI gợi ý mẫu sẵn kho</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Recipient & Payment Method Form */}
        {showStep1Form && (
          <form className="checkout-form" onSubmit={preview} noValidate>
            {isPending && order && editingStep1 && (
              <div className="checkout-editing-quote-bar">
                <span>
                  Đang chỉnh sửa thông tin cho phiếu báo giá <strong>{order.order_code}</strong>
                </span>
                <button
                  type="button"
                  className="os-inline-text-btn"
                  onClick={() => setEditingStep1(false)}
                >
                  Quay lại xem biên lai
                </button>
              </div>
            )}

            {customer ? (
              <div className="checkout-member-banner linked">
                <span className="checkout-member-banner-copy">
                  <IconUsers size={14} />
                  <span>
                    Thành viên: <strong>{customer.full_name}</strong> · Tự động lưu đơn vào hồ sơ
                  </span>
                </span>
                <span className="checkout-member-tag">
                  <IconCheck size={12} />
                  <span>ĐÃ LIÊN KẾT</span>
                </span>
              </div>
            ) : (
              <div className="checkout-member-banner guest">
                <span>Đã có tài khoản thành viên LapBot?</span>
                <Link
                  to={`/login?return_url=${encodeURIComponent(returnUrl)}`}
                  className="checkout-member-login-link"
                >
                  <span>Đăng nhập điền sẵn địa chỉ</span>
                  <IconArrowRight size={12} />
                </Link>
              </div>
            )}

            <div className="checkout-payment-methods">
              <span className="checkout-section-title">01 // CHỌN PHƯƠNG THỨC THANH TOÁN</span>
              <div className="payment-options-grid">
                <label
                  className={`payment-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => {
                      setPaymentMethod('COD');
                      requestId.current = null;
                    }}
                  />
                  <div className="payment-option-body">
                    <div className="payment-option-header">
                      <IconPackage size={17} />
                      <strong>COD (Đồng kiểm & Thanh toán)</strong>
                    </div>
                    <p>
                      Mở hộp kiểm tra ngoại quan & cấu hình máy cùng shipper trước khi trả tiền.
                    </p>
                  </div>
                </label>

                <label
                  className={`payment-option-card ${paymentMethod === 'VIETQR' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="VIETQR"
                    checked={paymentMethod === 'VIETQR'}
                    onChange={() => {
                      setPaymentMethod('VIETQR');
                      requestId.current = null;
                    }}
                  />
                  <div className="payment-option-body">
                    <div className="payment-option-header">
                      <IconQrCode size={17} />
                      <strong>Chuyển khoản VietQR 24/7</strong>
                      <span className="badge-fast">TỨC THÌ</span>
                    </div>
                    <p>Quét mã QR ngân hàng điền sẵn số tiền & mã đơn, xác thực đối soát ngay.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="checkout-fields">
              <span className="checkout-section-title">02 // THÔNG TIN NGƯỜI NHẬN MÁY</span>
              <div className="os-form-row-2col">
                <label>
                  Họ và tên người nhận *
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Ví dụ: Nguyễn Văn Thuận"
                    value={form.customer_name}
                    onChange={e => update('customer_name', e.target.value)}
                  />
                </label>
                <label>
                  Số điện thoại nhận hàng *
                  <input
                    required
                    inputMode="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={form.customer_phone}
                    onChange={e => update('customer_phone', e.target.value)}
                  />
                </label>
              </div>

              {!editingAddress && form.shipping_address ? (
                <div className="checkout-saved-addr-card">
                  <div className="checkout-saved-addr-head">
                    <span className="checkout-saved-addr-badge">
                      <IconMapPin size={14} />
                      <span>
                        ĐỊA CHỈ GIAO MÁY
                        {addressParts.address_type
                          ? ` · ${
                              ADDRESS_TYPE_OPTIONS.find(
                                o => o.value === addressParts.address_type
                              )?.label.toUpperCase() ?? ''
                            }`
                          : ''}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="checkout-edit-addr-btn"
                      onClick={() => setEditingAddress(true)}
                    >
                      <IconEdit size={13} />
                      <span>Đổi địa chỉ khác</span>
                    </button>
                  </div>
                  <p className="checkout-saved-addr-text">{form.shipping_address}</p>
                </div>
              ) : (
                <div className="checkout-composer-block">
                  <div className="checkout-composer-head">
                    <span className="checkout-composer-title">Địa chỉ nhận hàng *</span>
                    <div className="checkout-composer-head-actions">
                      <button
                        type="button"
                        className="os-inline-text-btn"
                        onClick={() =>
                          setAddressInputMode(prev =>
                            prev === 'structured' ? 'quick' : 'structured'
                          )
                        }
                      >
                        {addressInputMode === 'structured'
                          ? 'Nhập nhanh 1 dòng'
                          : 'Chọn Tỉnh / Phường chuẩn 2026'}
                      </button>
                      {customer && customer.default_shipping_address && (
                        <button
                          type="button"
                          className="os-inline-text-btn"
                          onClick={() => {
                            const restored = parseLegacyAddress(
                              customer.default_shipping_address,
                              customer.shipping_address_meta
                            );
                            setAddressParts(restored);
                            update(
                              'shipping_address',
                              customer.shipping_address_meta
                                ? formatShippingAddress(restored)
                                : customer.default_shipping_address
                            );
                            setEditingAddress(false);
                          }}
                        >
                          Dùng địa chỉ mặc định
                        </button>
                      )}
                    </div>
                  </div>

                  {addressInputMode === 'structured' ? (
                    <VietnamAddressComposer
                      compact
                      required
                      value={addressParts}
                      onChange={(parts, formatted) => {
                        setAddressParts(parts);
                        update('shipping_address', formatted);
                      }}
                    />
                  ) : (
                    <label>
                      Địa chỉ giao hàng đầy đủ (Số nhà, Phường/Xã, Tỉnh/Thành phố) *
                      <input
                        required
                        minLength={12}
                        maxLength={500}
                        placeholder="Ví dụ: 144 Xuân Thủy, Phường Cầu Giấy, Thành phố Hà Nội"
                        value={form.shipping_address}
                        onChange={e => update('shipping_address', e.target.value)}
                      />
                    </label>
                  )}
                </div>
              )}

              {customer && (
                <label className="checkout-save-default-check">
                  <input
                    type="checkbox"
                    checked={saveDefaultAddress}
                    onChange={e => setSaveDefaultAddress(e.target.checked)}
                  />
                  <span>Lưu địa chỉ & số điện thoại này làm mặc định cho lần mua tiếp theo</span>
                </label>
              )}

              <label>
                Ghi chú giao hàng (tùy chọn)
                <textarea
                  maxLength={500}
                  rows={2}
                  placeholder="Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  value={form.note}
                  onChange={e => update('note', e.target.value)}
                />
              </label>
            </div>

            <button
              className={`primary-button btn-with-icon ${busy ? 'is-busy' : ''}`.trim()}
              type="submit"
              disabled={busy || allLoadedOutOfStock}
            >
              {busy ? <IconSpinner size={16} /> : <IconZap size={16} />}
              <span>
                {isPending && editingStep1
                  ? 'Cập nhật lại phiếu xem trước'
                  : paymentMethod === 'VIETQR'
                    ? 'Xem mã VietQR & Duyệt phiếu'
                    : 'Xem trước đơn COD'}
              </span>
            </button>
          </form>
        )}

        {/* STEP 2 & STEP 3: Locked Recipient Card + Perforated Vintage Receipt */}
        {order && (!editingStep1 || isConfirmed) && (
          <>
            {/* Compact Locked Recipient Summary Card during Step 2 */}
            {isPending && (
              <div className="checkout-recipient-locked-card">
                <div className="checkout-recipient-locked-head">
                  <span className="checkout-saved-addr-badge">
                    <IconCheck size={13} />
                    <span>THÔNG TIN GIAO NHẬN ĐÃ CHỐT TRÊN PHIẾU</span>
                  </span>
                  <button
                    type="button"
                    className="checkout-edit-addr-btn"
                    disabled={busy || verifyingQr}
                    onClick={() => setEditingStep1(true)}
                  >
                    <IconEdit size={13} />
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                </div>

                <div className="checkout-recipient-locked-grid">
                  <div>
                    <span className="lbl">Người nhận:</span>{' '}
                    <strong>
                      {order.customer_name} · {order.customer_phone}
                    </strong>
                  </div>
                  <div>
                    <span className="lbl">Phương thức:</span>{' '}
                    <strong>
                      {activePaymentMethod === 'VIETQR'
                        ? 'Chuyển khoản VietQR 24/7'
                        : 'COD (Đồng kiểm khi nhận máy)'}
                    </strong>
                  </div>
                  <div className="full">
                    <span className="lbl">Địa chỉ giao:</span> {order.shipping_address}
                  </div>
                  {order.note && (
                    <div className="full">
                      <span className="lbl">Ghi chú:</span> <em>{order.note}</em>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="receipt-shell" aria-live="polite">
              <ReceiptPerforation position="top" />
              <div className={`receipt ${isConfirmed ? 'receipt-confirmed' : ''}`}>
                <div className="receipt-head">
                  <div>
                    <p className="eyebrow">
                      {isConfirmed && confirmedOrders.length > 1
                        ? `BATCH_RECEIPT // ${confirmedOrders.length} ĐƠN ĐÃ CHỐT`
                        : `ORDER_RECEIPT // ${order.order_code}`}
                    </p>
                    <span className="receipt-sys-code">{order.status}</span>
                  </div>
                  <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                    {isConfirmed
                      ? activePaymentMethod === 'VIETQR'
                        ? 'ĐÃ XÁC NHẬN · VIETQR'
                        : 'ĐÃ XÁC NHẬN COD'
                      : 'CHỜ BẠN XÁC NHẬN'}
                  </span>
                </div>

                {/* Single-SKU vs Multi-SKU Receipt Lines */}
                {isConfirmed && confirmedOrders.length > 1 ? (
                  <div className="checkout-batch-list">
                    {confirmedOrders.map(confirmed => (
                      <div key={confirmed.order_id} className="checkout-batch-item">
                        <div>
                          <strong>
                            {formatLaptopTitle(
                              confirmed.product_snapshot.brand,
                              confirmed.product_snapshot.model_name
                            )}
                          </strong>
                          <small>
                            Mã đơn: <code>{confirmed.order_code}</code> · SKU:{' '}
                            {confirmed.product_snapshot.sku} · RAM{' '}
                            {confirmed.product_snapshot.ram_gb}GB / SSD{' '}
                            {confirmed.product_snapshot.ssd_gb}GB
                          </small>
                        </div>
                        <div className="checkout-batch-item-right">
                          <strong>{money(confirmed.total_vnd)}</strong>
                          <Link to={`/orders/${confirmed.order_id}`}>Xem biên lai →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isBatch && itemsDetail.length > 1 ? (
                  <div className="checkout-batch-list">
                    {itemsDetail.map((item, idx) => (
                      <div key={item.variant_id} className="checkout-batch-item">
                        <div>
                          <strong>
                            {idx + 1}. {formatLaptopTitle(item.brand, item.model_name)}
                          </strong>
                          <small>
                            SKU: {item.sku} · {item.cpu} · RAM {item.ram_gb}GB · SSD {item.ssd_gb}GB
                          </small>
                        </div>
                        <div className="checkout-batch-item-right">
                          <strong>{money(item.price_vnd)}</strong>
                          <span>×1 máy</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <h3>
                      {formatLaptopTitle(
                        order.product_snapshot.brand,
                        order.product_snapshot.model_name
                      )}
                    </h3>
                    <p className="receipt-specs">
                      SKU: {order.product_snapshot.sku} · {order.product_snapshot.cpu} · RAM{' '}
                      {order.product_snapshot.ram_gb}GB · SSD {order.product_snapshot.ssd_gb}GB
                    </p>
                  </>
                )}

                <div className="receipt-calc-table">
                  <div className="calc-row">
                    <span>Đơn giá cấu hình (×{orderCount}):</span>
                    <span>{money(effectiveSubtotalVnd)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Phí vận chuyển đồng kiểm:</span>
                    <span>
                      {effectiveShippingTotalVnd === 0
                        ? 'Miễn phí (0 ₫)'
                        : money(effectiveShippingTotalVnd)}
                    </span>
                  </div>
                  <div className="calc-row total-row">
                    <strong>TỔNG THANH TOÁN:</strong>
                    <strong className="price">{money(effectiveGrandTotalVnd)}</strong>
                  </div>
                </div>

                <div className="receipt-info-grid">
                  <div>
                    <span className="info-label">NGƯỜI NHẬN:</span>
                    <p>
                      {order.customer_name} ({order.customer_phone})
                    </p>
                  </div>
                  <div>
                    <span className="info-label">ĐỊA CHỈ GIAO:</span>
                    <p>{order.shipping_address}</p>
                  </div>
                  {order.note && (
                    <div className="info-full">
                      <span className="info-label">GHI CHÚ:</span>
                      <p>{order.note}</p>
                    </div>
                  )}
                </div>

                {/* Step 2 Pending Controls */}
                {isPending && (
                  <>
                    {activePaymentMethod === 'VIETQR' && (
                      <div className="vietqr-payment-card">
                        <div className="vietqr-card-header">
                          <IconQrCode size={20} />
                          <div>
                            <strong>QUÉT MÃ VIETQR CHUYỂN KHOẢN 24/7</strong>
                            <p>
                              Mở ứng dụng ngân hàng bất kỳ để quét mã hoặc sao chép nhanh thông tin
                            </p>
                          </div>
                        </div>

                        <div className="vietqr-card-body">
                          <div className="vietqr-qr-frame">
                            {!qrImgError ? (
                              <ProgressiveImage
                                src={qrUrl}
                                alt={`Mã VietQR thanh toán đơn hàng ${order.order_code}`}
                                width={180}
                                height={180}
                                loading="eager"
                                onError={() => setQrImgError(true)}
                                fallback={
                                  <div className="vietqr-fallback-svg">
                                    <IconQrCode size={120} />
                                    <span>Mã QR đối soát</span>
                                  </div>
                                }
                              />
                            ) : (
                              <div className="vietqr-fallback-svg">
                                <IconQrCode size={120} />
                                <span>Mã QR đối soát</span>
                              </div>
                            )}
                            <span className="vietqr-scan-hint">VIETQR // NAPAS 247</span>
                          </div>

                          <div className="vietqr-account-info">
                            <div className="account-field">
                              <span className="lbl">Ngân hàng thụ hưởng:</span>
                              <div className="val-row">
                                <strong>MB Bank (Ngân hàng Quân Đội)</strong>
                              </div>
                            </div>

                            <div className="account-field">
                              <span className="lbl">Số tài khoản:</span>
                              <div className="val-row">
                                <code className="copy-code">0333 666 999</code>
                                <button
                                  type="button"
                                  className="btn-copy"
                                  onClick={() => void copyToClipboard('0333666999', 'stk')}
                                  title="Sao chép số tài khoản"
                                >
                                  <IconCopy size={13} />
                                  <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="account-field">
                              <span className="lbl">Chủ tài khoản:</span>
                              <div className="val-row">
                                <strong>CONG TY TNHH LAPBOT VIET NAM</strong>
                              </div>
                            </div>

                            <div className="account-field">
                              <span className="lbl">Số tiền cần chuyển:</span>
                              <div className="val-row">
                                <code className="copy-code highlight-price">
                                  {money(qrAmountVnd)}
                                </code>
                                <button
                                  type="button"
                                  className="btn-copy"
                                  onClick={() => void copyToClipboard(String(qrAmountVnd), 'tien')}
                                  title="Sao chép số tiền"
                                >
                                  <IconCopy size={13} />
                                  <span>{copiedField === 'tien' ? 'Đã chép' : 'Chép'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="account-field">
                              <span className="lbl">Nội dung chuyển khoản:</span>
                              <div className="val-row">
                                <code className="copy-code">{order.order_code}</code>
                                <button
                                  type="button"
                                  className="btn-copy"
                                  onClick={() => void copyToClipboard(order.order_code, 'nd')}
                                  title="Sao chép nội dung"
                                >
                                  <IconCopy size={13} />
                                  <span>{copiedField === 'nd' ? 'Đã chép' : 'Chép'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="vietqr-simulation-note">
                          <IconZap size={14} />
                          <span>
                            Chế độ thanh toán giả lập: bấm xác nhận bên dưới để hệ thống đối soát &
                            chốt đơn tức thì.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`receipt-countdown-bar ${isQuoteExpired ? 'expired' : ''}`}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <IconClock size={14} />
                        <span>
                          {isQuoteExpired
                            ? 'Phiếu báo giá 15 phút đã hết hạn'
                            : `Còn ${formattedCountdown} giữ mức giá báo trước`}
                        </span>
                      </span>
                      {isQuoteExpired && (
                        <button
                          type="button"
                          className="chat-retry-btn"
                          disabled={busy}
                          onClick={() => void submitPreview(true)}
                        >
                          <IconRefresh size={12} />
                          <span>Tạo lại phiếu báo giá mới</span>
                        </button>
                      )}
                    </div>

                    <div className="receipt-quote-notice">
                      <IconClock size={14} />
                      <span>
                        Phiếu có hiệu lực 15 phút (đến {dateTime(order.quote_expires_at)}). Chưa giữ
                        tồn kho. Kho chỉ trừ nguyên tử khi bạn bấm xác nhận.
                      </span>
                    </div>

                    <div className="actions">
                      {activePaymentMethod === 'VIETQR' ? (
                        <button
                          className="primary-button btn-with-icon"
                          type="button"
                          disabled={busy || verifyingQr || isQuoteExpired}
                          onClick={() => void handleSimulatedQrConfirm()}
                        >
                          {verifyingQr ? (
                            <>
                              <span className="chat-pulse-dot" />
                              <span>Đang đối soát VietQR...</span>
                            </>
                          ) : (
                            <>
                              <IconCheckCircle size={16} />
                              <span>Đã quét mã & Xác nhận thanh toán</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          className={`primary-button btn-with-icon ${busy ? 'is-busy' : ''}`.trim()}
                          type="button"
                          disabled={busy || isQuoteExpired}
                          onClick={() => void handleConfirmOrder()}
                        >
                          {busy ? <IconSpinner size={16} /> : <IconCheckCircle size={16} />}
                          <span>Xác nhận đặt COD</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className={busy ? 'is-busy' : undefined}
                        disabled={busy || verifyingQr}
                        onClick={() => void handleCancelQuote()}
                      >
                        Hủy phiếu này
                      </button>
                    </div>
                  </>
                )}

                {/* Step 3 Confirmed State */}
                {isConfirmed && (
                  <div className="confirmed-success-panel">
                    <div className="confirmed-success-badge">
                      <IconCheckCircle size={24} />
                      <div>
                        <strong>
                          {activePaymentMethod === 'VIETQR'
                            ? 'Thanh toán VietQR thành công!'
                            : 'Đặt hàng COD thành công!'}
                        </strong>
                        <p>
                          {confirmedOrders.length > 1 ? (
                            <>
                              Đã chốt thành công <strong>{confirmedOrders.length} đơn hàng</strong>{' '}
                              ({confirmedOrders.map(o => o.order_code).join(', ')}). Kho đã giữ máy
                              cho toàn bộ đơn của bạn.
                            </>
                          ) : (
                            <>
                              Mã đơn hàng của bạn là <strong>{order.order_code}</strong>. Kho đã giữ
                              máy nguyên tử cho đơn của bạn.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="actions">
                      <Link
                        className="primary-button btn-with-icon"
                        to={confirmedOrders.length > 1 ? '/orders' : `/orders/${order.order_id}`}
                      >
                        <span>
                          {confirmedOrders.length > 1
                            ? 'Quản lý các đơn vừa đặt'
                            : 'Theo dõi đơn hàng'}
                        </span>
                        <IconArrowRight size={15} />
                      </Link>
                      <Link className="btn-with-icon secondary-keycap-link" to="/">
                        <span>Tiếp tục xem catalog</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <ReceiptPerforation position="bottom" />
            </div>
          </>
        )}
      </div>

      {/* RIGHT STICKY COLUMN: Live Hardware & Order Cost Summary */}
      <aside className="checkout-summary-aside" aria-label="Tóm tắt cấu hình và chi phí">
        <div className="checkout-summary-card">
          <div className="checkout-summary-head">
            <span className="checkout-summary-sys">ORDER_SUMMARY.SYS</span>
            <span className="checkout-summary-count">{orderCount} MÁY</span>
          </div>

          <div className="checkout-summary-items">
            {loadingDetails && itemsDetail.length === 0 ? (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}
                role="status"
                aria-busy="true"
              >
                {Array.from({ length: Math.max(1, targetIds.length) }).map((_, idx) => (
                  <div key={idx} className="checkout-summary-item">
                    <div className="checkout-summary-thumb">
                      <RetroSkeleton width={64} height={46} radius={4} />
                    </div>
                    <div
                      className="checkout-summary-meta"
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}
                    >
                      <RetroSkeleton variant="text" width="84%" height={15} />
                      <RetroSkeleton variant="text" width="92%" height={12} />
                      <RetroSkeleton variant="text" width="48%" height={16} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              itemsDetail.map(item => {
                const thumb = catalogImageUrl(item.image_url);
                const availTxt = availabilityLabel(item.availability_status);
                return (
                  <div key={item.variant_id} className="checkout-summary-item">
                    <div className="checkout-summary-thumb">
                      <ProgressiveImage
                        src={thumb}
                        alt={formatLaptopTitle(item.brand, item.model_name)}
                        width={72}
                        height={54}
                        fallback={<IconPackage size={22} />}
                      />
                    </div>
                    <div className="checkout-summary-meta">
                      <div className="checkout-summary-title-row">
                        <Link
                          to={`/products/${item.variant_id}`}
                          className="checkout-summary-item-title"
                        >
                          {formatLaptopTitle(item.brand, item.model_name)}
                        </Link>
                        {availTxt && (
                          <span
                            className={`chat-avail-badge ${availabilityClass(
                              item.availability_status
                            )}`}
                          >
                            {availTxt}
                          </span>
                        )}
                      </div>
                      <p className="checkout-summary-specs">
                        {item.sku} · {item.cpu} · RAM {item.ram_gb}GB · SSD {item.ssd_gb}GB
                      </p>
                      <strong className="checkout-summary-price">{money(item.price_vnd)}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="checkout-summary-totals">
            <div className="summary-calc-line">
              <span>Tạm tính ({orderCount} máy):</span>
              <span>{money(effectiveSubtotalVnd)}</span>
            </div>
            <div className="summary-calc-line">
              <span>Vận chuyển & đồng kiểm:</span>
              <span>
                {effectiveShippingTotalVnd === 0
                  ? 'Miễn phí (0 ₫)'
                  : money(effectiveShippingTotalVnd)}
              </span>
            </div>
            <div className="summary-calc-line">
              <span>Thanh toán:</span>
              <span>{activePaymentMethod === 'VIETQR' ? 'VietQR 24/7' : 'COD Đồng kiểm'}</span>
            </div>
            <div className="summary-calc-total">
              <span>TỔNG CỘNG</span>
              <strong>{money(effectiveGrandTotalVnd)}</strong>
            </div>
          </div>

          <div className="checkout-summary-trust">
            <div className="trust-bullet">
              <IconTruckCod size={15} />
              <span>Cho phép mở hộp kiểm tra ngoại quan & cấu hình trước khi thanh toán.</span>
            </div>
            <div className="trust-bullet">
              <IconShieldCheck size={15} />
              <span>
                {storeInfo?.warranty_policy || 'Bảo hành chính hãng 12–24 tháng toàn quốc.'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
