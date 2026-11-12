import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../features/cart/CartContext.js';
import { availabilityClass, availabilityLabel } from '../../lib/availability.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import { useAnimatedPresence, usePresenceValue } from '../../lib/use-animated-presence.js';
import {
  IconArrowRight,
  IconCheck,
  IconClose,
  IconCpu,
  IconRam,
  IconRefresh,
  IconShoppingCart,
  IconSsd,
  IconTrash,
  IconZap
} from '../icons/RetroIcons.js';
import { ProgressiveImage, RetroSkeleton, RetroTopProgress } from '../os/RetroOsPrimitives.js';

export function CartDrawer() {
  const cart = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cart.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cart.closeCart();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cart]);

  const toastPresence = usePresenceValue(!cart.open ? cart.toast : null, 155);
  const drawerPresence = useAnimatedPresence(cart.open, 175);
  const activeToast = toastPresence.activeValue;

  const selectableItems = cart.items.filter(item => item.in_stock && !item.unavailable);
  const allSelected = selectableItems.length > 0 && selectableItems.every(item => item.selected);

  const handleProceedCheckout = () => {
    if (!cart.selectedIds.length) return;
    const ids = [...cart.selectedIds];
    cart.closeCart();
    if (ids.length === 1) {
      navigate(`/checkout/${ids[0]}`);
    } else {
      navigate(`/checkout?variants=${encodeURIComponent(ids.join(','))}`);
    }
  };

  return (
    <>
      {activeToast && (
        <div
          className={`cart-toast-banner ${toastPresence.stateClass}`}
          role="status"
          aria-live="polite"
        >
          <span className="cart-toast-icon">
            <IconCheck size={14} />
          </span>
          <div className="cart-toast-copy">
            <strong>
              {activeToast.alreadyInCart ? 'Máy đã có sẵn trong giỏ' : 'Đã thêm vào giỏ hàng'}
            </strong>
            <span>{activeToast.title}</span>
          </div>
          <button type="button" className="cart-toast-open-btn" onClick={() => cart.openCart()}>
            <span>Mở giỏ ({cart.count})</span>
          </button>
          <button
            type="button"
            className="cart-toast-close-btn"
            onClick={cart.dismissToast}
            aria-label="Đóng thông báo"
          >
            <IconClose size={13} />
          </button>
        </div>
      )}

      {drawerPresence.rendered && (
        <>
          <div
            className={`cart-backdrop ${drawerPresence.stateClass}`}
            onClick={cart.closeCart}
            aria-hidden="true"
          />
          <aside
            className={`cart-drawer ${drawerPresence.stateClass}`}
            role="dialog"
            aria-modal="true"
            aria-hidden={drawerPresence.closing || undefined}
            aria-label="Giỏ hàng LapBot"
          >
            <header className="cart-drawer-head">
              <div className="cart-drawer-title-group">
                <div className="os-window-dots" aria-hidden="true">
                  <span className="os-dot os-dot-coral" />
                  <span className="os-dot os-dot-amber" />
                  <span className="os-dot os-dot-mint" />
                </div>
                <IconShoppingCart size={18} />
                <div>
                  <strong>Giỏ hàng của bạn</strong>
                  <span className="cart-drawer-sub">CART_SPOOLER // {cart.count} CẤU HÌNH</span>
                </div>
              </div>

              <button
                type="button"
                className="chat-close-btn"
                onClick={cart.closeCart}
                aria-label="Đóng giỏ hàng"
                title="Đóng giỏ hàng (Esc)"
              >
                <IconClose size={17} />
              </button>
            </header>

            <RetroTopProgress
              active={cart.syncing}
              label="Đang đồng bộ giá và tồn kho giỏ hàng..."
            />

            {cart.items.length > 0 && (
              <div className="cart-drawer-toolbar">
                <label className="cart-select-all">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={selectableItems.length === 0}
                    onChange={e => cart.selectAll(e.target.checked)}
                  />
                  <span>
                    Chọn tất cả còn hàng ({cart.selectedIds.length}/{selectableItems.length})
                  </span>
                </label>

                <div className="cart-toolbar-actions">
                  <button
                    type="button"
                    className={`cart-toolbar-btn ${cart.syncing ? 'is-busy' : ''}`.trim()}
                    disabled={cart.syncing}
                    onClick={() => void cart.refreshCart()}
                    title="Đồng bộ lại giá & tồn kho mới nhất"
                  >
                    <IconRefresh size={12} className={cart.syncing ? 'retro-spin' : undefined} />
                    <span>{cart.syncing ? 'Đang đồng bộ...' : 'Làm mới kho'}</span>
                  </button>
                  <button
                    type="button"
                    className="cart-toolbar-btn danger"
                    onClick={cart.clearCart}
                    title="Xóa toàn bộ giỏ hàng"
                  >
                    <IconTrash size={12} />
                    <span>Xóa hết</span>
                  </button>
                </div>
              </div>
            )}

            <div className="cart-drawer-body">
              {cart.items.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">
                    <IconShoppingCart size={34} />
                  </div>
                  <h3>Giỏ hàng chưa có cấu hình nào</h3>
                  <p>
                    Lưu các mẫu laptop bạn đang cân nhắc vào giỏ để so sánh nhanh tồn kho, giá bán
                    và đặt mua nhiều máy chỉ trong 1 lần nhập địa chỉ.
                  </p>
                  <Link to="/" className="primary-button btn-with-icon" onClick={cart.closeCart}>
                    <span>Khám phá Catalog Laptop</span>
                    <IconArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.items.map(item => {
                    const thumb = catalogImageUrl(item.image_url);
                    const title = formatLaptopTitle(item.brand, item.model_name);
                    const availText = item.unavailable
                      ? 'Ngừng kinh doanh'
                      : availabilityLabel(item.availability_status);

                    return (
                      <article
                        key={item.variant_id}
                        className={`cart-item-card ${item.selected ? 'is-selected' : ''} ${
                          !item.in_stock ? 'is-disabled' : ''
                        }`}
                      >
                        <div className="cart-item-main">
                          <label className="cart-item-check" aria-label={`Chọn ${title}`}>
                            <input
                              type="checkbox"
                              checked={item.selected}
                              disabled={!item.in_stock || item.unavailable}
                              onChange={() => cart.toggleSelect(item.variant_id)}
                            />
                          </label>

                          <Link
                            to={`/products/${item.variant_id}`}
                            className="cart-item-thumb"
                            onClick={cart.closeCart}
                            tabIndex={-1}
                            aria-hidden="true"
                          >
                            {item.hydrating && !thumb ? (
                              <RetroSkeleton width={76} height={54} radius={4} />
                            ) : (
                              <ProgressiveImage
                                src={thumb}
                                alt={title}
                                width={84}
                                height={62}
                                loading="lazy"
                                fallback={<span className="cart-thumb-fallback">NO IMG</span>}
                              />
                            )}
                          </Link>

                          <div className="cart-item-info">
                            <div className="cart-item-meta-top">
                              <span className="cart-item-sku">{item.sku}</span>
                              {item.hydrating ? (
                                <RetroSkeleton variant="pill" width={68} height={16} />
                              ) : (
                                availText && (
                                  <span
                                    className={`chat-avail-badge ${
                                      item.unavailable
                                        ? 'status-out'
                                        : availabilityClass(item.availability_status)
                                    }`}
                                  >
                                    {availText}
                                  </span>
                                )
                              )}
                            </div>

                            {item.hydrating && item.model_name === 'Đang đồng bộ cấu hình...' ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  margin: '4px 0'
                                }}
                              >
                                <RetroSkeleton variant="text" width="82%" height={15} />
                                <RetroSkeleton variant="text" width="64%" height={12} />
                              </div>
                            ) : (
                              <Link
                                to={`/products/${item.variant_id}`}
                                className="cart-item-title"
                                onClick={cart.closeCart}
                              >
                                {title}
                              </Link>
                            )}

                            {item.ram_gb > 0 && (
                              <div className="cart-item-specs">
                                <span>
                                  <IconCpu size={12} /> {item.cpu}
                                </span>
                                <span>
                                  <IconRam size={12} /> {item.ram_gb}GB
                                </span>
                                <span>
                                  <IconSsd size={12} /> {item.ssd_gb}GB
                                </span>
                              </div>
                            )}

                            <div className="cart-item-bottom">
                              {item.hydrating && item.price_vnd <= 0 ? (
                                <RetroSkeleton variant="text" width={104} height={18} />
                              ) : (
                                <strong className="cart-item-price">
                                  {item.price_vnd > 0 ? money(item.price_vnd) : '—'}
                                </strong>
                              )}

                              <div className="cart-item-actions">
                                {item.in_stock && !item.unavailable && (
                                  <Link
                                    to={`/checkout/${item.variant_id}`}
                                    className="cart-item-buy-single"
                                    onClick={cart.closeCart}
                                  >
                                    Mua ngay
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  className="cart-item-remove"
                                  onClick={() => cart.removeItem(item.variant_id)}
                                  aria-label={`Xóa ${title} khỏi giỏ`}
                                  title="Xóa khỏi giỏ hàng"
                                >
                                  <IconTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <footer className="cart-drawer-foot">
                <div className="cart-summary-row">
                  <div>
                    <span className="cart-summary-label">
                      TẠM TÍNH ({cart.selectedIds.length} MÁY ĐÃ CHỌN)
                    </span>
                    <small className="cart-summary-hint">
                      Mỗi máy tạo 1 biên lai bảo hành & đồng kiểm độc lập
                    </small>
                  </div>
                  <strong className="cart-summary-total">{money(cart.selectedTotalVnd)}</strong>
                </div>

                <button
                  type="button"
                  className="primary-button btn-with-icon cart-checkout-btn"
                  disabled={cart.selectedIds.length === 0}
                  onClick={handleProceedCheckout}
                >
                  <IconZap size={16} />
                  <span>
                    {cart.selectedIds.length > 0
                      ? `Tiến hành đặt mua (${cart.selectedIds.length} máy)`
                      : 'Chọn ít nhất 1 máy còn hàng để đặt mua'}
                  </span>
                </button>
              </footer>
            )}
          </aside>
        </>
      )}
    </>
  );
}
