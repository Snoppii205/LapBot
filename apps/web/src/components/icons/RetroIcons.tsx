import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

function baseProps(
  size: number | string = 18,
  className = '',
  rest: SVGProps<SVGSVGElement> = {}
): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    className: `retro-icon ${className}`.trim(),
    ...rest
  };
}

/** CPU — Vi xử lý trung tâm với lõi bán dẫn Duotone */
export function IconCpu({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.16"
      />
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="var(--accent-amber)" fillOpacity="0.45" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  );
}

/** GPU — Card đồ họa với cụm quạt kép cơ khí */
export function IconGpu({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8.5" cy="12" r="3" fill="var(--accent-amber)" fillOpacity="0.4" />
      <circle cx="15.5" cy="12" r="3" fill="var(--accent-amber)" fillOpacity="0.4" />
      <path d="M8.5 10.5v3M7 12h3M15.5 10.5v3M14 12h3M6 18v2h5v-2" />
    </svg>
  );
}

/** RAM — Thanh bộ nhớ với chip nhớ đối xứng */
export function IconRam({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="2"
        y="7"
        width="20"
        height="9"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <rect x="2" y="7" width="20" height="9" rx="1.5" />
      <rect
        x="5"
        y="9.5"
        width="3"
        height="4"
        rx="0.5"
        fill="var(--accent-amber)"
        fillOpacity="0.45"
      />
      <rect
        x="10.5"
        y="9.5"
        width="3"
        height="4"
        rx="0.5"
        fill="var(--accent-amber)"
        fillOpacity="0.45"
      />
      <rect
        x="16"
        y="9.5"
        width="3"
        height="4"
        rx="0.5"
        fill="var(--accent-amber)"
        fillOpacity="0.45"
      />
      <path d="M5 16v2M9 16v2M15 16v2M19 16v2" />
    </svg>
  );
}

/** SSD — Ổ cứng thể rắn NVMe M.2 */
export function IconSsd({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 14h18" />
      <circle cx="7" cy="16.5" r="0.8" fill="currentColor" />
      <circle cx="10" cy="16.5" r="0.8" fill="currentColor" />
      <rect
        x="6"
        y="8"
        width="6"
        height="3.5"
        rx="0.75"
        fill="var(--accent-amber)"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/** Screen — Màn hình laptop kèm thước đo đường chéo */
export function IconScreen({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="4"
        width="18"
        height="12"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 19h20M9 16l-1 3M15 16l1 3" />
      <path d="M7 13L17 7" strokeDasharray="2 2" />
    </svg>
  );
}

/** Palette / Color Swatch — Màu sắc vỏ máy */
export function IconPalette({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="12" cy="12" r="9" fill="var(--accent-amber)" fillOpacity="0.22" />
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2.5-1 2.5-2.2 0-.6-.2-1.1-.6-1.5-.4-.4-.6-.9-.6-1.5 0-1.2 1-2.2 2.2-2.2H17a4 4 0 0 0 4-4c0-3.7-4-6.6-9-6.6Z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

/** Arrow Left — Mũi tên điều hướng quay lại */
export function IconArrowLeft({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

/** Arrow Right — Mũi tên điều hướng tiến tới */
export function IconArrowRight({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Chevron Left — Nút lùi ảnh Gallery */
export function IconChevronLeft({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
    </svg>
  );
}

/** Chevron Right — Nút tiến ảnh Gallery */
export function IconChevronRight({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

/** Chevron Down — Mở rộng bộ lọc */
export function IconChevronDown({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Chevron Up — Thu gọn bộ lọc */
export function IconChevronUp({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

/** Play — Nút tự phát trình chiếu ảnh */
export function IconPlay({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polygon points="6 4 19 12 6 20 6 4" fill="currentColor" />
    </svg>
  );
}

/** Pause — Nút tạm dừng trình chiếu ảnh */
export function IconPause({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect x="6" y="4" width="3.5" height="16" rx="1" fill="currentColor" />
      <rect x="14.5" y="4" width="3.5" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

/** Close — Nút đóng chuẩn cơ khí */
export function IconClose({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** Sparkle AI — Biểu tượng Trợ lý AI Retro-Technical */
export function IconSparkleAi({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M12 2.5 14.4 9.6 21.5 12l-7.1 2.4L12 21.5 9.6 14.4 2.5 12l7.1-2.4L12 2.5Z"
        fill="var(--accent-amber)"
        fillOpacity="0.45"
      />
      <path d="M19 3v3M17.5 4.5h3M5 17v3M3.5 18.5h3" />
    </svg>
  );
}

/** Send — Mũi tên gửi tin nhắn */
export function IconSend({ size = 17, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="m21 3-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1L21 3Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M10 14 21 3" />
    </svg>
  );
}

/** Package — Hộp đơn hàng 3D Duotone */
export function IconPackage({ size = 17, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" fill="var(--accent-amber)" fillOpacity="0.3" />
      <path d="M12 12 20 7.5M12 12v9M12 12 4 7.5M16 5.25l-8 4.5" />
    </svg>
  );
}

/** Headset — Tai nghe nhân viên tư vấn hỗ trợ */
export function IconHeadset({ size = 17, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect
        x="2"
        y="13"
        width="4"
        height="6"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.24"
      />
      <rect
        x="18"
        y="13"
        width="4"
        height="6"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.24"
      />
      <path d="M20 19a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

/** Shopping Bag — Phiếu đặt mua COD */
export function IconShoppingBag({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M5 7h14l1 13H4L5 7Z" fill="currentColor" fillOpacity="0.16" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

/** Shield Check — Bảo hành chính hãng */
export function IconShieldCheck({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M12 3 4 6.5v5.5c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6.5L12 3Z"
        fill="var(--accent-mint)"
        fillOpacity="0.8"
      />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Refresh — Đổi trả minh bạch */
export function IconRefreshCw({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="12" cy="12" r="8" fill="var(--accent-amber)" fillOpacity="0.25" stroke="none" />
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2m-.5-4v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  );
}

/** Truck COD — Giao hàng & Kiểm tra COD */
export function IconTruckCod({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="2"
        y="6"
        width="12"
        height="10"
        rx="1"
        fill="var(--accent-primary)"
        fillOpacity="0.18"
      />
      <path d="M14 9h4l3 3.5V16h-7V9Z" />
      <circle cx="6.5" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </svg>
  );
}

/** File Text — Bài viết & Mô tả chi tiết */
export function IconFileText({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
        fill="var(--accent-amber)"
        fillOpacity="0.22"
      />
      <path d="M14 3v6h6M8 13h8M8 17h5M8 9h2" />
    </svg>
  );
}

/** Sliders — Bộ lọc cấu hình */
export function IconSliders({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4" />
    </svg>
  );
}

/** Rotate Ccw — Đặt lại bộ lọc */
export function IconRotateCcw({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/** Grid — Danh mục sản phẩm */
export function IconGrid({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect x="3" y="3" width="7" height="7" rx="1" fill="var(--accent-amber)" fillOpacity="0.35" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        fill="var(--accent-amber)"
        fillOpacity="0.35"
      />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/** Terminal Admin — Quản trị viên */
export function IconTerminalAdmin({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  );
}

/** QR Code — Mã VietQR quét chuyển khoản */
export function IconQrCode({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.16"
      />
      <rect x="5" y="5" width="3" height="3" fill="var(--accent-primary)" />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.16"
      />
      <rect x="16" y="5" width="3" height="3" fill="var(--accent-primary)" />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.16"
      />
      <rect x="5" y="16" width="3" height="3" fill="var(--accent-primary)" />
      <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3M20 14v3" />
    </svg>
  );
}

/** Copy — Sao chép thông tin tài khoản */
export function IconCopy({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="8"
        y="8"
        width="13"
        height="13"
        rx="2"
        fill="var(--accent-amber)"
        fillOpacity="0.28"
      />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/** Check Circle — Xác nhận thành công */
export function IconCheckCircle({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="var(--status-success)"
        fillOpacity="0.2"
        stroke="var(--status-success)"
      />
      <path d="m8.5 12 2.5 2.5 5-5" stroke="var(--status-success)" strokeWidth="2.1" />
    </svg>
  );
}

/** Zap — Chốt đơn siêu tốc / Tức thì */
export function IconZap({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill="var(--accent-amber)"
        fillOpacity="0.55"
      />
    </svg>
  );
}

/** Clock — Bộ đếm thời gian giữ đơn 15 phút */
export function IconClock({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="12" cy="12" r="9" fill="var(--accent-amber)" fillOpacity="0.22" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Message Square — Chat tư vấn máy */
export function IconMessageSquare({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="var(--accent-amber)"
        fillOpacity="0.28"
      />
      <path d="M8 10h8M8 14h4" />
    </svg>
  );
}

/** Sidebar Dock — Tách màn hình Split View */
export function IconSidebarDock({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.08"
      />
      <line x1="15" y1="4" x2="15" y2="20" />
      <rect
        x="15"
        y="4"
        width="6"
        height="16"
        rx="1"
        fill="var(--accent-primary)"
        fillOpacity="0.22"
      />
    </svg>
  );
}

/** Window — Khung cửa sổ hệ điều hành Vintage OS */
export function IconWindow({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        fill="var(--accent-amber)"
        fillOpacity="0.22"
      />
      <path d="M3 9h18" />
      <circle cx="6.5" cy="6.5" r="0.8" fill="currentColor" />
      <circle cx="9.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

/** Tag — Tem chứng nhận & khuyến nghị */
export function IconTag({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8l-8.7-8.7Z"
        fill="var(--accent-amber)"
        fillOpacity="0.28"
      />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** Search — Kính lúp Retro nét mực */
export function IconSearch({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="11" cy="11" r="7" fill="var(--accent-amber)" fillOpacity="0.2" />
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

/** Filter — Phễu lọc */
export function IconFilter({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

/** Users — Quản lý khách hàng & Nhân sự */
export function IconUsers({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" fill="var(--accent-primary)" fillOpacity="0.18" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Chart Bar — Thống kê & Phân tích KPI */
export function IconChartBar({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" strokeWidth={2.4} />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <rect
        x="10.5"
        y="4"
        width="3"
        height="16"
        fill="var(--accent-amber)"
        fillOpacity="0.3"
        stroke="none"
      />
    </svg>
  );
}

/** Settings — Cài đặt hệ thống & Cửa hàng */
export function IconSettings({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="12" cy="12" r="3" fill="var(--accent-amber)" fillOpacity="0.3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Bot Cpu — Quản trị Model & Trí tuệ AI */
export function IconBotCpu({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="11"
        width="18"
        height="10"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.18"
      />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 15h.01M16 15h.01M9 19h6" />
    </svg>
  );
}

/** History Audit — Nhật ký kiểm toán bảo mật */
export function IconHistoryAudit({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M12 7v5l4 2" />
    </svg>
  );
}

/** Lock — Bảo mật & Mật khẩu */
export function IconLock({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        fill="var(--accent-amber)"
        fillOpacity="0.22"
      />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/** Plus — Thêm mới */
export function IconPlus({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** Edit — Chỉnh sửa */
export function IconEdit({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        fill="var(--accent-amber)"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/** Trash — Xóa / Hủy */
export function IconTrash({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/** Check — Hoàn thành */
export function IconCheck({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="20 6 9 17 4 12" strokeWidth={2.4} />
    </svg>
  );
}

/** X — Đóng / Hủy */
export function IconX({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Eye — Xem / Hiện */
export function IconEye({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="var(--accent-amber)" fillOpacity="0.3" />
    </svg>
  );
}

/** EyeOff — Ẩn mật khẩu */
export function IconEyeOff({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/** Refresh — Làm mới */
export function IconRefresh({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/** Sparkles — Trí tuệ AI / Nổi bật */
export function IconSparkles({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"
        fill="var(--accent-amber)"
        fillOpacity="0.3"
      />
    </svg>
  );
}

/** LogOut — Đăng xuất */
export function IconLogOut({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/** Upload — Tải tệp ảnh từ máy tính */
export function IconUpload({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** Image — Khung hình ảnh sản phẩm */
export function IconImage({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="var(--accent-amber)"
        fillOpacity="0.2"
      />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/** Archive — Lưu trữ ẩn an toàn */
export function IconArchive({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect x="2" y="3" width="20" height="5" rx="1" fill="var(--accent-amber)" fillOpacity="0.3" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

/** AlertTriangle — Cảnh báo thao tác quan trọng */
export function IconAlertTriangle({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="m10.29 3.86-8.47 14.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill="var(--accent-amber)"
        fillOpacity="0.32"
      />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/** MapPin — Vị trí giao hàng định vị 4 cấp */
export function IconMapPin({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"
        fill="var(--accent-primary)"
        fillOpacity="0.18"
      />
      <circle cx="12" cy="10" r="2.6" fill="var(--accent-amber)" fillOpacity="0.65" />
    </svg>
  );
}

/** Home — Địa chỉ Nhà riêng */
export function IconHome({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z"
        fill="var(--accent-amber)"
        fillOpacity="0.24"
      />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

/** Building — Địa chỉ Văn phòng / Công ty */
export function IconBuilding({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="4"
        y="3"
        width="12"
        height="18"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <path d="M16 9h4a1 1 0 0 1 1 1v11h-5M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1M9 21v-3h2v3" />
    </svg>
  );
}

/** GraduationCap — Trường Đại học / Ký túc xá */
export function IconGraduationCap({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polygon points="12 3 2 8 12 13 22 8 12 3" fill="var(--accent-amber)" fillOpacity="0.34" />
      <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5M22 8v6" />
    </svg>
  );
}

/** Mail — Thư điện tử định danh */
export function IconMail({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="var(--accent-amber)"
        fillOpacity="0.22"
      />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

/** Phone — Số điện thoại di động nhận COD */
export function IconPhone({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="6"
        y="2.5"
        width="12"
        height="19"
        rx="2"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

/** Key — Khóa xác thực phiên thành viên */
export function IconKey({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <circle cx="8" cy="15" r="4.5" fill="var(--accent-amber)" fillOpacity="0.32" />
      <path d="m11.3 11.7 8.7-8.7M16 7l2.5 2.5M19 4l2 2" />
    </svg>
  );
}

/** Printer — In phiếu giao hàng & đồng kiểm COD */
export function IconPrinter({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path
        d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        fill="var(--accent-primary)"
        fillOpacity="0.14"
      />
      <rect
        x="6"
        y="14"
        width="12"
        height="8"
        rx="1"
        fill="var(--accent-amber)"
        fillOpacity="0.28"
      />
    </svg>
  );
}

/** Download — Xuất dữ liệu CSV kiểm kho / báo cáo */
export function IconDownload({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/** ExternalLink — Mở xem trực tiếp trên Storefront */
export function IconExternalLink({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/** Maximize — Mở rộng khung cửa sổ Chat (720px) */
export function IconMaximize({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

/** Minimize — Thu hẹp khung cửa sổ Chat về chuẩn (540px) */
export function IconMinimize({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

/** ShoppingCart — Giỏ hàng lưu trữ cấu hình laptop */
export function IconShoppingCart({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path
        d="M6 6h15l-1.7 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.6L5 3H2"
        fill="var(--accent-amber)"
        fillOpacity="0.24"
      />
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
    </svg>
  );
}

/** Scale / Columns — So sánh thông số cấu hình song song */
export function IconScale({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="4"
        width="7.5"
        height="16"
        rx="1.5"
        fill="var(--accent-amber)"
        fillOpacity="0.26"
      />
      <rect
        x="13.5"
        y="4"
        width="7.5"
        height="16"
        rx="1.5"
        fill="var(--accent-primary)"
        fillOpacity="0.16"
      />
      <path d="M5.5 9h2.5M5.5 13h2.5M16 9h2.5M16 13h2.5" />
    </svg>
  );
}

/** UserPlus — Tạo mới hoặc nâng cấp khách hàng thành viên */
export function IconUserPlus({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" fill="var(--accent-amber)" fillOpacity="0.28" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

/** Link — Liên kết / Gộp đơn hàng theo số điện thoại */
export function IconLink({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/** Layers — Thao tác hàng loạt trên nhiều SKU */
export function IconLayers({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" fill="var(--accent-amber)" fillOpacity="0.32" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

/** Unlock — Mở khóa tài khoản */
export function IconUnlock({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg {...baseProps(size, className, rest)}>
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        fill="var(--accent-mint)"
        fillOpacity="0.65"
      />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

/** Spinner — Vòng cung xoay cơ khí mảnh 1.85px cho nút bấm và tiến trình tải */
export function IconSpinner({ size = 15, className, ...rest }: IconProps) {
  const cls = ['retro-icon', 'retro-spin', className].filter(Boolean).join(' ');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.95}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cls}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.22" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
