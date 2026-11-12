import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode
} from 'react';
import { IconClose } from '../icons/RetroIcons.js';

export interface WindowTitleBarProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  accent?: 'warm' | 'amber' | 'mint' | 'dark';
  compact?: boolean;
}

/**
 * Thanh tiêu đề cửa sổ cổ điển chuẩn Neo-Retro / Warm Vintage OS:
 * 3 đèn cửa sổ viền mực + dải kẻ sọc Pinstripe cổ điển + nhãn Monospace sắc nét.
 */
export function WindowTitleBar({
  title,
  subtitle,
  rightSlot,
  accent = 'warm',
  compact = false
}: WindowTitleBarProps) {
  return (
    <div className={`os-titlebar os-titlebar-${accent} ${compact ? 'os-titlebar-compact' : ''}`}>
      <div className="os-window-dots" aria-hidden="true">
        <span className="os-dot os-dot-coral" />
        <span className="os-dot os-dot-amber" />
        <span className="os-dot os-dot-mint" />
      </div>

      <div className="os-pinstripes" aria-hidden="true" />

      <div className="os-title-pill">
        <span className="os-title-text">{title}</span>
        {subtitle ? <span className="os-title-sub"> // {subtitle}</span> : null}
      </div>

      <div className="os-pinstripes" aria-hidden="true" />

      {rightSlot ? <div className="os-titlebar-right">{rightSlot}</div> : null}
    </div>
  );
}

export interface WindowFrameProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  accent?: 'warm' | 'amber' | 'mint' | 'dark';
  compact?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Khung cửa sổ hệ điều hành cổ điển đổ bóng cứng Neo-Brutalism */
export function WindowFrame({
  title,
  subtitle,
  rightSlot,
  accent = 'warm',
  compact = false,
  className = '',
  bodyClassName = '',
  children
}: WindowFrameProps) {
  return (
    <div className={`os-window ${className}`.trim()}>
      <WindowTitleBar
        title={title}
        subtitle={subtitle}
        rightSlot={rightSlot}
        accent={accent}
        compact={compact}
      />
      <div className={`os-window-body ${bodyClassName}`.trim()}>{children}</div>
    </div>
  );
}

/** Badge thông số phần cứng kiểu chip Monospace sắc nét */
export function SpecBadge({
  label,
  value,
  icon,
  highlight = false
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`os-spec-badge ${highlight ? 'os-spec-badge-highlight' : ''}`}>
      <span className="os-spec-label">
        {icon}
        <span>{label}</span>
      </span>
      <strong className="os-spec-value" title={value}>
        {value}
      </strong>
    </div>
  );
}

/** Thanh tiến trình 8 đốt vuông cổ điển thay cho chữ loading đơn điệu */
export function RetroLoadingBar({ label = 'Đang đồng bộ dữ liệu catalog...' }: { label?: string }) {
  return (
    <div className="os-loading-box" role="status">
      <div className="os-loading-head">
        <span className="os-loading-tag">SYSTEM.BUSY</span>
        <span className="os-loading-label">{label}</span>
      </div>
      <div className="os-loading-track" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, idx) => (
          <span
            key={idx}
            className="os-loading-segment"
            style={{ animationDelay: `${idx * 0.11}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Đường cắt răng cưa SVG tinh tế cho biên lai đặt hàng COD / VietQR */
export function ReceiptPerforation({ position = 'bottom' }: { position?: 'top' | 'bottom' }) {
  return (
    <div className={`os-receipt-perf os-receipt-perf-${position}`} aria-hidden="true">
      <svg viewBox="0 0 400 10" preserveAspectRatio="none">
        <path
          d={
            position === 'top'
              ? 'M0,10 L10,1 L20,10 L30,1 L40,10 L50,1 L60,10 L70,1 L80,10 L90,1 L100,10 L110,1 L120,10 L130,1 L140,10 L150,1 L160,10 L170,1 L180,10 L190,1 L200,10 L210,1 L220,10 L230,1 L240,10 L250,1 L260,10 L270,1 L280,10 L290,1 L300,10 L310,1 L320,10 L330,1 L340,10 L350,1 L360,10 L370,1 L380,10 L390,1 L400,10 Z'
              : 'M0,0 L10,9 L20,0 L30,9 L40,0 L50,9 L60,0 L70,9 L80,0 L90,9 L100,0 L110,9 L120,0 L130,9 L140,0 L150,9 L160,0 L170,9 L180,0 L190,9 L200,0 L210,9 L220,0 L230,9 L240,0 L250,9 L260,0 L270,9 L280,0 L290,9 L300,0 L310,9 L320,0 L330,9 L340,0 L350,9 L360,0 L370,9 L380,0 L390,9 L400,0 Z'
          }
          fill="var(--bg-surface)"
          stroke="var(--ink-border)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/** Nhãn phím tắt cơ học nhỏ gọn kiểu [↵ ENTER] hoặc [ESC] */
export function KeycapHint({ label }: { label: string }) {
  return <kbd className="os-keycap-hint">{label}</kbd>;
}

/* ============================================================================
   NEO-RETRO WARM LOADING PRIMITIVES & DOMAIN SKELETONS
   ============================================================================ */

export interface RetroSkeletonProps {
  variant?: 'block' | 'text' | 'pill' | 'circle';
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** Khối placeholder giấy kem ấm ánh shimmer tinh tế, không dùng xám lạnh */
export function RetroSkeleton({
  variant = 'block',
  width,
  height,
  radius,
  className = '',
  style
}: RetroSkeletonProps) {
  const computedStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
    ...style
  };
  return (
    <span
      aria-hidden="true"
      className={`retro-skeleton retro-skeleton-${variant} ${className}`.trim()}
      style={computedStyle}
    />
  );
}

/** Thanh tiến trình mảnh 2.5px Terracotta -> Amber chống giật khung hình khi lọc/refresh */
export function RetroTopProgress({
  active,
  label = 'Đang đồng bộ dữ liệu...',
  className = ''
}: {
  active: boolean;
  label?: string;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      className={`retro-top-progress ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-busy="true"
    >
      <span className="retro-top-progress-bar" />
    </div>
  );
}

export interface ProgressiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  alt: string;
  wrapperClassName?: string;
  fallback?: ReactNode;
}

/**
 * Ảnh sản phẩm / QR sắc nét 100% trên nền trắng:
 * - Nếu ảnh đã có trong cache (complete), hiển thị tức thì không nháy.
 * - Nếu đang tải từ mạng, hiện lớp giấy kem shimmer phía dưới và fade-in mượt 180ms.
 * - Tuyệt đối không áp filter/blur lên ảnh thật sau khi tải xong.
 */
export function ProgressiveImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallback = null,
  onLoad,
  onError,
  ...rest
}: ProgressiveImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const isLoaded = Boolean(src && loadedSrc === src);
  const isFailed = Boolean(src && failedSrc === src);

  useEffect(() => {
    if (!src) return;
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoadedSrc(src);
    }
  }, [src]);

  if (!src || isFailed) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={`progressive-img-wrap ${isLoaded ? 'is-loaded' : 'is-loading'} ${wrapperClassName}`.trim()}
    >
      {!isLoaded && <span className="progressive-img-shimmer" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`progressive-img ${isLoaded ? 'is-loaded' : ''} ${className}`.trim()}
        onLoad={e => {
          setLoadedSrc(src);
          onLoad?.(e);
        }}
        onError={e => {
          setFailedSrc(src);
          onError?.(e);
        }}
        {...rest}
      />
    </div>
  );
}

/** Lưới 6 thẻ Skeleton cho CatalogPage (dùng class .variant-card-skeleton tách biệt với E2E .variant-card) */
export function VariantCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="catalog-grid"
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách laptop"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="variant-card-skeleton">
          <div className="variant-card-skeleton-media">
            <RetroSkeleton width="72%" height="68%" radius={6} />
          </div>
          <div className="variant-card-skeleton-body">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RetroSkeleton variant="pill" width={72} height={18} />
              <RetroSkeleton variant="pill" width={64} height={18} />
            </div>
            <RetroSkeleton variant="text" width="88%" height={18} />
            <RetroSkeleton variant="text" width="56%" height={13} />
            <div className="variant-card-skeleton-specs">
              <RetroSkeleton height={36} radius={5} />
              <RetroSkeleton height={36} radius={5} />
              <RetroSkeleton height={36} radius={5} />
              <RetroSkeleton height={36} radius={5} />
            </div>
            <div className="variant-card-skeleton-footer">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <RetroSkeleton variant="text" width={54} height={12} />
                <RetroSkeleton variant="text" width={128} height={22} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <RetroSkeleton height={34} radius={6} />
                <RetroSkeleton height={34} radius={6} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton chuẩn bố cục 2 cửa sổ cho trang Chi tiết sản phẩm (ProductPage) */
export function ProductDetailSkeleton() {
  return (
    <div
      className="product-page-shell"
      role="status"
      aria-busy="true"
      aria-label="Đang tải cấu hình chi tiết"
    >
      <div className="product-breadcrumb" aria-hidden="true">
        <RetroSkeleton variant="text" width={92} height={14} />
        <span className="crumb-sep">/</span>
        <RetroSkeleton variant="text" width={74} height={14} />
        <span className="crumb-sep">/</span>
        <RetroSkeleton variant="text" width={160} height={14} />
      </div>

      <div className="product-detail-window-grid">
        <WindowFrame
          title="MEDIA_VIEWER.APP"
          subtitle="ĐANG TẢI HÌNH ẢNH"
          accent="warm"
          className="product-media-window"
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '8px',
              aspectRatio: '16 / 10',
              display: 'grid',
              placeItems: 'center',
              padding: '20px'
            }}
          >
            <RetroSkeleton width="76%" height="74%" radius={8} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginTop: '12px'
            }}
          >
            <RetroSkeleton height={58} radius={6} />
            <RetroSkeleton height={58} radius={6} />
            <RetroSkeleton height={58} radius={6} />
            <RetroSkeleton height={58} radius={6} />
          </div>
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <RetroSkeleton variant="text" width={150} height={15} />
            <RetroSkeleton variant="text" width="96%" height={13} />
            <RetroSkeleton variant="text" width="88%" height={13} />
            <RetroSkeleton variant="text" width="72%" height={13} />
          </div>
        </WindowFrame>

        <WindowFrame
          title="SPEC_DATASHEET.SYS"
          subtitle="ĐANG ĐỒNG BỘ KHO"
          accent="amber"
          className="product-spec-window"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <RetroSkeleton variant="pill" width={88} height={22} />
              <RetroSkeleton variant="pill" width={104} height={22} />
            </div>
            <RetroSkeleton variant="text" width="84%" height={26} />
            <RetroSkeleton variant="text" width="46%" height={14} />
            <div
              style={{
                padding: '14px',
                background: 'var(--bg-surface-raised)',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <RetroSkeleton variant="text" width={96} height={14} />
              <RetroSkeleton variant="text" width={156} height={28} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <RetroSkeleton key={idx} height={54} radius={6} />
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '6px'
              }}
            >
              <RetroSkeleton height={44} radius={6} />
              <RetroSkeleton height={44} radius={6} />
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}

/** Danh sách cuống phiếu biên nhận Skeleton cho OrdersPage & AccountPage */
export function OrderReceiptSkeletonList({
  count = 3,
  compact = false
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div
      className="orders-list"
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách đơn hàng"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="order-receipt-skeleton"
          style={{ padding: compact ? '12px 14px' : '16px 18px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RetroSkeleton variant="text" width={128} height={18} />
              <RetroSkeleton variant="pill" width={96} height={22} />
            </div>
            <RetroSkeleton variant="text" width={118} height={20} />
          </div>
          {!compact && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed var(--border-light)'
              }}
            >
              <RetroSkeleton variant="text" width="52%" height={13} />
              <RetroSkeleton variant="text" width={110} height={13} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Skeleton chi tiết đơn hàng (OrderStatusTracker + Biên lai COD) */
export function OrderDetailSkeleton() {
  return (
    <div
      className="order-detail-shell"
      role="status"
      aria-busy="true"
      aria-label="Đang tải chi tiết đơn hàng"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}
      >
        <RetroSkeleton variant="text" width={150} height={16} />
        <RetroSkeleton variant="pill" width={110} height={24} />
      </div>
      <div className="order-receipt-skeleton" style={{ padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <RetroSkeleton height={44} radius={6} />
          <RetroSkeleton height={44} radius={6} />
          <RetroSkeleton height={44} radius={6} />
          <RetroSkeleton height={44} radius={6} />
        </div>
      </div>
      <WindowFrame title="ORDER_RECEIPT.COD" subtitle="ĐANG ĐỒNG BỘ PHIẾU" accent="amber">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <RetroSkeleton variant="text" width={180} height={24} />
            <RetroSkeleton variant="pill" width={120} height={26} />
          </div>
          <RetroSkeleton height={76} radius={6} />
          <RetroSkeleton height={68} radius={6} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '10px',
              borderTop: '1.5px dashed var(--border-light)'
            }}
          >
            <RetroSkeleton variant="text" width={110} height={16} />
            <RetroSkeleton variant="text" width={150} height={26} />
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}

/** Bong bóng trạng thái AI đang suy nghĩ / tra cứu kho thực tế trước khi stream chữ đầu tiên */
export function ChatThinkingBubble({
  label = 'Trợ lý đang đối chiếu cấu hình & tồn kho...',
  onStop
}: {
  label?: string;
  onStop?: () => void;
}) {
  return (
    <div className="chat-thinking-bubble" role="status" aria-live="polite">
      <div className="chat-thinking-main">
        <div className="chat-thinking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="chat-thinking-label">{label}</span>
      </div>
      {onStop && (
        <button
          type="button"
          className="chat-thinking-stop-btn"
          onClick={onStop}
          title="Dừng tạo phản hồi"
          aria-label="Dừng tạo phản hồi"
        >
          <IconClose size={11} />
          <span>Dừng</span>
        </button>
      )}
    </div>
  );
}

/** Skeleton dải thẻ KPI cho Admin Dashboard & Admin Users CRM */
export function AdminKpiGridSkeleton({
  count = 4,
  mini = false
}: {
  count?: number;
  mini?: boolean;
}) {
  return (
    <div
      className={mini ? 'admin-kpi-mini-grid' : 'admin-kpi-grid'}
      role="status"
      aria-busy="true"
      aria-label="Đang tải chỉ số vận hành"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={mini ? 'admin-kpi-mini-card' : 'admin-kpi-card'}
          style={{ pointerEvents: 'none' }}
        >
          <RetroSkeleton variant="text" width="58%" height={12} />
          <RetroSkeleton
            variant="text"
            width="46%"
            height={mini ? 22 : 28}
            style={{ marginTop: '8px' }}
          />
          <RetroSkeleton variant="text" width="74%" height={11} style={{ marginTop: '8px' }} />
        </div>
      ))}
    </div>
  );
}

const TABLE_WIDTH_PATTERNS = ['78%', '62%', '86%', '54%', '70%', '48%', '66%'];

/** Các hàng <tr> Skeleton đặt trực tiếp vào <tbody> cho mọi bảng Admin (5-7 cột) */
export function AdminTableRowsSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="admin-table-skeleton-row" aria-hidden="true">
          {Array.from({ length: columns }).map((__, cIdx) => {
            const width =
              cIdx === 0 && columns >= 7
                ? '28px'
                : TABLE_WIDTH_PATTERNS[(rIdx + cIdx) % TABLE_WIDTH_PATTERNS.length];
            return (
              <td key={cIdx} style={{ padding: '12px 12px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: cIdx === columns - 1 ? 'flex-end' : 'flex-start'
                  }}
                >
                  <RetroSkeleton variant="text" width={width} height={14} />
                  {(cIdx === 1 || cIdx === 2) && (
                    <RetroSkeleton variant="text" width="52%" height={11} />
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/** Danh sách thẻ cột trái cho Split-Pane (AdminOrdersPage & AdminChatPage) */
export function AdminSplitListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}
      role="status"
      aria-busy="true"
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          style={{
            padding: '11px 12px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-light)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RetroSkeleton variant="text" width="44%" height={14} />
            <RetroSkeleton variant="pill" width={74} height={18} />
          </div>
          <RetroSkeleton variant="text" width="76%" height={12} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <RetroSkeleton variant="text" width="36%" height={11} />
            <RetroSkeleton variant="text" width="28%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton cho cột phải Chi tiết Đơn / Luồng Chat / Ngăn kéo Hồ sơ 360° */
export function AdminDetailPaneSkeleton({
  variant = 'order'
}: {
  variant?: 'order' | 'chat' | 'drawer';
}) {
  if (variant === 'chat') {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}
        role="status"
        aria-busy="true"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <RetroSkeleton variant="text" width={190} height={18} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <RetroSkeleton height={30} width={96} radius={5} />
            <RetroSkeleton height={30} width={96} radius={5} />
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', width: '66%' }}>
          <RetroSkeleton height={54} radius={8} />
        </div>
        <div style={{ alignSelf: 'flex-end', width: '52%' }}>
          <RetroSkeleton height={44} radius={8} />
        </div>
        <div style={{ alignSelf: 'flex-start', width: '74%' }}>
          <RetroSkeleton height={68} radius={8} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: variant === 'drawer' ? '4px 0' : '16px'
      }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <RetroSkeleton variant="text" width="52%" height={20} />
          <RetroSkeleton variant="text" width="36%" height={13} />
        </div>
        <RetroSkeleton variant="pill" width={108} height={26} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <RetroSkeleton height={62} radius={6} />
        <RetroSkeleton height={62} radius={6} />
        <RetroSkeleton height={62} radius={6} />
      </div>
      <RetroSkeleton height={96} radius={6} />
      <RetroSkeleton height={112} radius={6} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <RetroSkeleton width={120} height={34} radius={6} />
        <RetroSkeleton width={120} height={34} radius={6} />
      </div>
    </div>
  );
}
