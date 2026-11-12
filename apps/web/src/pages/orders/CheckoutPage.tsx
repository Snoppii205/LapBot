import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckoutFlow } from '../../features/checkout/CheckoutFlow.js';
import { useCart } from '../../features/cart/CartContext.js';
import { WindowFrame } from '../../components/os/RetroOsPrimitives.js';
import {
  IconArrowLeft,
  IconArrowRight,
  IconShoppingCart
} from '../../components/icons/RetroIcons.js';

export function CheckoutPage() {
  const { variant_id } = useParams();
  const [searchParams] = useSearchParams();
  const cart = useCart();

  const variantIds = useMemo(() => {
    if (variant_id?.trim()) {
      return [variant_id.trim()];
    }
    const rawList = searchParams.get('variants');
    if (rawList) {
      const parsed = rawList
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      return [...new Set(parsed)];
    }
    return cart.selectedIds;
  }, [variant_id, searchParams, cart.selectedIds]);

  if (variantIds.length === 0) {
    return (
      <section className="product-detail checkout-page-wrap">
        <WindowFrame title="CHECKOUT_TERMINAL.APP" subtitle="CHƯA CHỌN CẤU HÌNH" accent="amber">
          <div className="orders-empty-card">
            <h3>Chưa có cấu hình nào được chọn để thanh toán</h3>
            <p>
              Hãy chọn một mẫu laptop từ danh mục hoặc mở Giỏ hàng để tích chọn các cấu hình muốn
              đặt mua.
            </p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              {cart.count > 0 && (
                <button
                  type="button"
                  className="retro-btn retro-btn-amber"
                  onClick={() => cart.openCart()}
                >
                  <IconShoppingCart size={15} />
                  <span>Mở Giỏ hàng ({cart.count})</span>
                </button>
              )}
              <Link to="/" className="primary-button btn-with-icon">
                <span>Về danh mục Laptop</span>
                <IconArrowRight size={15} />
              </Link>
            </div>
          </div>
        </WindowFrame>
      </section>
    );
  }

  const isBatch = variantIds.length > 1;
  const singleId = variantIds[0]!;

  return (
    <section className="product-detail checkout-page-wrap">
      <div className="product-top-bar">
        {isBatch ? (
          <button type="button" className="back-link" onClick={() => cart.openCart()}>
            <IconArrowLeft size={15} />
            <span>Quay lại Giỏ hàng ({variantIds.length} cấu hình)</span>
          </button>
        ) : (
          <Link to={`/products/${singleId}`} className="back-link">
            <IconArrowLeft size={15} />
            <span>Xem lại cấu hình</span>
          </Link>
        )}
        <span className="product-sku-pill">
          {isBatch
            ? `BATCH CHECKOUT // ${variantIds.length} CẤU HÌNH`
            : 'DIRECT CHECKOUT // 1 MÁY / ĐƠN'}
        </span>
      </div>

      <WindowFrame
        title="CHECKOUT_TERMINAL.APP"
        subtitle={
          isBatch ? `THANH TOÁN GIỎ HÀNG (${variantIds.length} MÁY)` : 'HOÀN TẤT ĐƠN ĐẶT MUA'
        }
        accent="amber"
        rightSlot={
          <img
            src="/assets/retro-os/stamp-cod-inspection.svg"
            alt="COD Đồng kiểm"
            className="policy-cod-stamp"
            width="118"
            height="42"
          />
        }
      >
        <div className="checkout-page-heading">
          <h1>
            {isBatch ? `Đặt mua ${variantIds.length} cấu hình đã chọn` : 'Đặt mua COD & VietQR'}
          </h1>
          <p>
            Kiểm tra cấu hình ở cột tóm tắt bên phải, điền thông tin người nhận và duyệt phiếu báo
            giá 15 phút trước khi trừ kho.
          </p>
        </div>
        <CheckoutFlow variantIds={variantIds} />
      </WindowFrame>
    </section>
  );
}
