import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { VariantDetail, StoreInfo } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { ProductGallery } from '../../components/catalog/ProductGallery.js';
import {
  ProductDetailSkeleton,
  RetroTopProgress,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import { useChat } from '../../features/chat/ChatContext.js';
import { toCartSnapshot, useCart } from '../../features/cart/CartContext.js';
import { availabilityClass, availabilityLabel } from '../../lib/availability.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import {
  IconArrowLeft,
  IconCheck,
  IconCpu,
  IconFileText,
  IconGpu,
  IconPalette,
  IconRam,
  IconRefreshCw,
  IconScreen,
  IconShieldCheck,
  IconShoppingCart,
  IconSparkleAi,
  IconSsd,
  IconTruckCod,
  IconZap
} from '../../components/icons/RetroIcons.js';

function renderProductDescription(raw?: string) {
  if (!raw || !raw.trim()) {
    return <p className="desc-empty">Chưa có thông tin mô tả chi tiết cho sản phẩm này.</p>;
  }

  const lines = raw
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);
  return (
    <div className="product-desc-content">
      {lines.map((line, idx) => {
        if (line.startsWith('*Từ khóa*:') || line.startsWith('Từ khóa:')) {
          return (
            <p key={idx} className="desc-keywords">
              <strong>Từ khóa:</strong> {line.replace(/^\*?Từ khóa\*?:\s*/, '')}
            </p>
          );
        }

        const isHeading =
          (line.length < 75 && !line.endsWith('.') && !line.includes(',')) ||
          /^(Thiết Kế|Hiệu Suất|Hiệu Năng|Màn Hình|Bàn Phím|Thời Lượng Pin|Cổng Kết Nối|Bảo Mật|Ưu Điểm|Đánh Giá|Tổng Kết)/i.test(
            line
          );

        if (isHeading && idx > 0) {
          return (
            <h3 key={idx} className="desc-heading">
              {line.replace(/^#+\s*/, '')}
            </h3>
          );
        }

        return (
          <p key={idx} className="desc-paragraph">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function ProductPage() {
  const chat = useChat();
  const cart = useCart();
  const { variant_id } = useParams();
  const [item, setItem] = useState<VariantDetail | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!variant_id) return;
    let active = true;
    setLoading(true);
    setError('');
    void apiJson<VariantDetail>(`/catalog/variants/${variant_id}`)
      .then(value => {
        if (active) {
          setItem(value);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Không tải được sản phẩm.');
          setLoading(false);
        }
      });
    void apiJson<StoreInfo>('/store-info')
      .then(value => {
        if (active) setStore(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [variant_id]);

  const { setSelectedVariant } = chat;

  useEffect(() => {
    if (variant_id && item) {
      setSelectedVariant(variant_id);
    }
  }, [variant_id, item?.variant_id, setSelectedVariant]);

  if (error) {
    return (
      <div role="alert" className="product-error">
        <p>{error}</p>
        <Link to="/" className="primary-link">
          <IconArrowLeft size={16} />
          <span>Về catalog</span>
        </Link>
      </div>
    );
  }

  if (!item) {
    return <ProductDetailSkeleton />;
  }

  const cleanSpec = (val: string | null | undefined, fallback: string) => {
    if (!val) return fallback;
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase().includes('chưa xác minh')) return fallback;
    return trimmed;
  };

  const specRows: Array<{ label: string; value: string; icon: ReactNode }> = [
    { label: 'CPU', value: cleanSpec(item.cpu, 'Tiêu chuẩn hãng'), icon: <IconCpu size={17} /> },
    { label: 'GPU', value: cleanSpec(item.gpu, 'Đồ họa tích hợp'), icon: <IconGpu size={17} /> },
    { label: 'RAM', value: `${item.ram_gb} GB`, icon: <IconRam size={17} /> },
    { label: 'Ổ cứng SSD', value: `${item.ssd_gb} GB`, icon: <IconSsd size={17} /> },
    {
      label: 'Màn hình',
      value: cleanSpec(item.screen, 'Tiêu chuẩn hãng'),
      icon: <IconScreen size={17} />
    },
    {
      label: 'Màu sắc',
      value: cleanSpec(item.color, 'Tiêu chuẩn hãng'),
      icon: <IconPalette size={17} />
    }
  ];

  return (
    <article className={`product-detail ${loading ? 'is-refreshing-pane' : ''}`.trim()}>
      <RetroTopProgress active={loading} label="Đang chuyển sang cấu hình mới..." />
      <div className="product-top-bar">
        <Link to="/" className="back-link">
          <IconArrowLeft size={15} />
          <span>Quay lại Catalog</span>
        </Link>
        <span className="product-sku-pill">
          {item.brand} // SKU: {item.sku}
        </span>
      </div>

      {/* Top 2-Column Hero: Left Sharp Media Window, Right Datasheet & Conversion Box */}
      <section className="product-hero">
        <WindowFrame
          title="MEDIA_VIEWER.APP"
          subtitle={`${item.images.length || 1} GÓC CHỤP SẮC NÉT`}
          className="product-media-window"
        >
          <ProductGallery images={item.images} modelName={`${item.brand} ${item.model_name}`} />
        </WindowFrame>

        <WindowFrame
          title="SPEC_DATASHEET.SYS"
          subtitle={item.sku}
          accent="amber"
          className="product-datasheet-window"
        >
          <div className="product-hero-details">
            <div className="product-title-wrap">
              <div>
                <p className="eyebrow">{item.brand} OFFICIAL CONFIG</p>
                <h1 className="product-title">{formatLaptopTitle(item.brand, item.model_name)}</h1>
              </div>
              <img
                src="/assets/retro-os/stamp-verified-warranty.svg"
                alt="Bảo hành chính hãng 12 tháng"
                className="product-warranty-stamp"
                width="68"
                height="68"
              />
            </div>

            <div className="product-price-row">
              <div>
                <span className="price-caption">GIÁ BÁN CHÍNH THỨC</span>
                <span className="price">{money(item.price_vnd)}</span>
              </div>
              {availabilityLabel(item.availability_status) ? (
                <span className={`stock-badge ${availabilityClass(item.availability_status)}`}>
                  {availabilityLabel(item.availability_status)}
                </span>
              ) : null}
            </div>

            {/* Hardware Specifications Datasheet */}
            <div className="product-specs-box">
              <h3 className="specs-box-title">BẢNG CẤU HÌNH PHẦN CỨNG</h3>
              <dl className="detail-specs">
                {specRows.map(spec => (
                  <div key={spec.label}>
                    <dt className="spec-label-with-icon">
                      {spec.icon}
                      <span>{spec.label}</span>
                    </dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Streamlined 3-Button Purchase & Consultation Actions */}
            <div className="product-actions">
              {item.in_stock ? (
                <>
                  <Link
                    to={`/checkout/${item.variant_id}`}
                    aria-label="Chọn mua COD"
                    className="primary-button product-buy-btn"
                  >
                    <IconZap size={17} />
                    <span>Mua ngay (COD / VietQR)</span>
                  </Link>

                  <button
                    type="button"
                    className={`product-cart-btn ${cart.hasItem(item.variant_id) ? 'in-cart' : ''}`}
                    onClick={() => {
                      if (cart.hasItem(item.variant_id)) {
                        cart.openCart();
                      } else {
                        cart.addItem(item.variant_id, {
                          openDrawer: true,
                          snapshot: toCartSnapshot(item)
                        });
                      }
                    }}
                  >
                    {cart.hasItem(item.variant_id) ? (
                      <>
                        <IconCheck size={17} />
                        <span>Đã có trong giỏ · Mở giỏ</span>
                      </>
                    ) : (
                      <>
                        <IconShoppingCart size={17} />
                        <span>Thêm vào giỏ hàng</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <span className="disabled-link product-buy-btn">
                  <span>Tạm hết hàng / Chờ nhập kho</span>
                </span>
              )}

              <button
                type="button"
                className="product-chat-btn"
                onClick={() =>
                  chat.openChat(
                    item.variant_id,
                    `Đánh giá chi tiết ưu nhược điểm cấu hình ${formatLaptopTitle(
                      item.brand,
                      item.model_name
                    )} giúp tôi`
                  )
                }
              >
                <IconSparkleAi size={17} />
                <span>Tư vấn cấu hình này với AI</span>
              </button>
            </div>
          </div>
        </WindowFrame>
      </section>

      {/* Bottom Section: Detailed Description & Store Policies */}
      <section className="product-body">
        <WindowFrame title="PRODUCT_OVERVIEW.DOC" subtitle="ĐẶC ĐIỂM & ĐÁNH GIÁ CHI TIẾT">
          <h2 className="section-heading-with-icon">
            <IconFileText size={21} />
            <span>Đặc điểm nổi bật & Mô tả chi tiết</span>
          </h2>
          {renderProductDescription(item.description)}
        </WindowFrame>

        <WindowFrame
          title="STORE_POLICY.CFG"
          subtitle="BẢO HÀNH & GIAO NHẬN"
          rightSlot={
            <img
              src="/assets/retro-os/stamp-cod-inspection.svg"
              alt="COD Đồng kiểm tận nơi"
              className="policy-cod-stamp"
              width="126"
              height="44"
            />
          }
        >
          <div className="policy-grid">
            <div className="policy-item">
              <div className="policy-item-head">
                <IconShieldCheck size={19} />
                <strong>Bảo hành chính hãng</strong>
              </div>
              <p>{store?.warranty_policy ?? 'Bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất.'}</p>
            </div>
            <div className="policy-item">
              <div className="policy-item-head">
                <IconRefreshCw size={19} />
                <strong>Đổi trả minh bạch</strong>
              </div>
              <p>
                {store?.return_policy ?? '1 đổi 1 trong 7 ngày đầu nếu phát sinh lỗi phần cứng.'}
              </p>
            </div>
            <div className="policy-item">
              <div className="policy-item-head">
                <IconTruckCod size={19} />
                <strong>Thanh toán COD & VietQR</strong>
              </div>
              <p>
                {store?.price_tax_note ??
                  'Mở hộp kiểm tra ngoại quan & cấu hình trước khi thanh toán.'}
              </p>
            </div>
          </div>
        </WindowFrame>
      </section>
    </article>
  );
}
