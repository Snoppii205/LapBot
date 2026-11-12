import type { VariantSummary } from '@lapbot/contracts';
import { Link } from 'react-router-dom';
import { formatLaptopTitle, money } from '../../lib/format.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { availabilityClass, availabilityLabel } from '../../lib/availability.js';
import { useChat } from '../../features/chat/ChatContext.js';
import { toCartSnapshot, useCart } from '../../features/cart/CartContext.js';
import {
  IconArrowRight,
  IconCheck,
  IconCpu,
  IconGpu,
  IconRam,
  IconScale,
  IconShoppingCart,
  IconSparkleAi,
  IconSsd,
  IconZap
} from '../icons/RetroIcons.js';
import { ProgressiveImage, SpecBadge } from '../os/RetroOsPrimitives.js';

export const CATEGORY_LABELS: Record<string, string> = {
  office_study: 'Học tập / Văn phòng',
  gaming: 'Gaming Hiệu năng',
  graphic_creator: 'Đồ họa & Creator',
  programming: 'Lập trình / Dev',
  business_ultrabook: 'Doanh nhân Mỏng nhẹ'
};

export function formatStorageCapacity(ssdGb: number): string {
  if (ssdGb >= 1024 && ssdGb % 1024 === 0) {
    return `${ssdGb / 1024}TB`;
  }
  return `${ssdGb}GB`;
}

export function VariantCard({
  variant,
  isCompared = false,
  onToggleCompare
}: {
  variant: VariantSummary;
  isCompared?: boolean;
  onToggleCompare?: (variant: VariantSummary) => void;
}) {
  const chat = useChat();
  const cart = useCart();
  const imageUrl = catalogImageUrl(variant.image_url);
  const categoryName = CATEGORY_LABELS[variant.usage_category] ?? 'Laptop chính hãng';
  const inCart = cart.hasItem(variant.variant_id);
  const displayTitle = formatLaptopTitle(variant.brand, variant.model_name);

  return (
    <article className="variant-card">
      {/* Mini Vintage OS Title Strip */}
      <div className="card-os-strip">
        <div className="card-os-left">
          <span
            className={`card-os-dots ${availabilityClass(variant.availability_status)}`}
            aria-hidden="true"
            title={availabilityLabel(variant.availability_status) ?? undefined}
          >
            <i />
            <i />
          </span>
          <span className="card-sku-code">
            {variant.brand} // {variant.sku}
          </span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {onToggleCompare && (
            <button
              type="button"
              className={`card-compare-toggle ${isCompared ? 'active' : ''}`}
              aria-pressed={isCompared}
              onClick={() => onToggleCompare(variant)}
              title={
                isCompared
                  ? 'Bỏ khỏi khay so sánh'
                  : 'Thêm cấu hình vào khay so sánh (tối đa 3 máy)'
              }
            >
              {isCompared ? <IconCheck size={11} /> : <IconScale size={11} />}
              <span>{isCompared ? 'Đã chọn' : 'So sánh'}</span>
            </button>
          )}
          {availabilityLabel(variant.availability_status) ? (
            <span className={`stock-status ${availabilityClass(variant.availability_status)}`}>
              {availabilityLabel(variant.availability_status)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Pure White Crystal-Clear Product Showcase Stage */}
      <Link
        to={`/products/${variant.variant_id}`}
        className="product-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProgressiveImage
          src={imageUrl}
          alt={`${variant.brand} ${variant.model_name}`}
          loading="lazy"
          width={360}
          height={210}
          fallback={<span className="image-placeholder-text">Đang cập nhật ảnh</span>}
        />
        <span className="card-category-badge">{categoryName}</span>
      </Link>

      <div className="card-body">
        <h2 className="card-model-title">
          <Link to={`/products/${variant.variant_id}`}>{displayTitle}</Link>
        </h2>

        {/* 2x2 Hardware Cartridge Spec Badges */}
        <div className="card-specs-grid">
          <SpecBadge label="CPU" value={variant.cpu} icon={<IconCpu size={13} />} />
          <SpecBadge
            label="GPU"
            value={variant.gpu && variant.gpu !== 'Chưa xác minh' ? variant.gpu : 'Đồ họa tích hợp'}
            icon={<IconGpu size={13} />}
          />
          <SpecBadge
            label="RAM"
            value={`${variant.ram_gb}GB`}
            icon={<IconRam size={13} />}
            highlight
          />
          <SpecBadge
            label="SSD"
            value={formatStorageCapacity(variant.ssd_gb)}
            icon={<IconSsd size={13} />}
            highlight
          />
        </div>

        <div className="card-foot">
          <div className="card-price-block">
            <span className="card-price-label">GIÁ NIÊM YẾT</span>
            <strong className="card-price">{money(variant.price_vnd)}</strong>
          </div>
          <Link
            className="card-detail-inline-link"
            to={`/products/${variant.variant_id}`}
            title="Xem chi tiết ảnh & cấu hình"
          >
            <span>Xem cấu hình</span>
            <IconArrowRight size={12} />
          </Link>
        </div>

        <div className="card-actions-trio">
          {variant.in_stock ? (
            <Link
              to={`/checkout/${variant.variant_id}`}
              className="card-buy-now-btn"
              title="Mua ngay cấu hình này"
            >
              <IconZap size={13} />
              <span>Mua ngay</span>
            </Link>
          ) : (
            <span className="card-out-btn">Tạm hết hàng</span>
          )}

          {variant.in_stock && (
            <button
              type="button"
              className={`card-cart-btn ${inCart ? 'in-cart' : ''}`}
              onClick={() =>
                inCart
                  ? cart.openCart()
                  : cart.addItem(variant.variant_id, { snapshot: toCartSnapshot(variant) })
              }
              title={
                inCart ? 'Đã có trong giỏ — bấm để xem giỏ hàng' : 'Thêm cấu hình này vào giỏ hàng'
              }
              aria-label={inCart ? 'Xem giỏ hàng' : 'Thêm vào giỏ'}
            >
              {inCart ? <IconCheck size={13} /> : <IconShoppingCart size={13} />}
              <span>{inCart ? 'Đã thêm' : 'Thêm giỏ'}</span>
            </button>
          )}

          <button
            type="button"
            className="card-chat-btn"
            onClick={() => chat.openChat(variant.variant_id)}
            title="Tư vấn AI cho mẫu máy này"
          >
            <IconSparkleAi size={13} />
            <span>Tư vấn</span>
          </button>
        </div>
      </div>
    </article>
  );
}
