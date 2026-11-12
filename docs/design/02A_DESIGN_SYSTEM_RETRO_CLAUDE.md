# HƯỚNG DẪN DESIGN SYSTEM: NEO-RETRO / WARM VINTAGE OS

> **Mục đích:** Tài liệu quy chuẩn giao diện Frontend cho dự án **LapBot (Website bán laptop tích hợp Chat-to-Order AI)**. Lấy cảm hứng từ giao diện máy tính cổ điển kết hợp thiết kế **Neo-Brutalism / Warm Vintage OS** hiện đại (tương tự **Poolsuite.net**, **PostHog.com**, **Gumroad**) — sang trọng, thoáng mắt, giàu cảm xúc cơ học và tối ưu chuyển đổi thương mại điện tử.

---

## 1. TRIẾT LÝ THIẾT KẾ

- **Sang trọng, thoáng mắt & tối ưu chuyển đổi (Airy Conversion-Focused Retro OS):** Sử dụng nền kem giấy ấm (`#F5F0E6` / `#FFFDF9`), viền mực đen-than sắc nét (`1.5px` – `2px solid #1C1A17`) và đổ bóng cứng không nhòe (**Hard Offset Shadow**). Tuyệt đối không làm giao diện tối tăm, rối mắt hay loè loẹt.
- **Bảo toàn độ sắc nét 100% cho ảnh Laptop:** Mọi ảnh sản phẩm thực tế từ `VZ_Data` luôn đặt trong khung trưng bày nền trắng tinh khiết (`#FFFFFF`) có khoảng thở thoáng, **không dùng filter retro, không làm mờ, không dither hay pixel hóa ảnh sản phẩm**.
- **Cơ học Phím cơ Xúc giác (Tactile Mechanical Keycaps):** Các nút CTA, phím gợi ý nhanh, thanh điều hướng và nút cửa sổ mô phỏng hành trình phím cơ: nổi nhẹ khi hover (`translate(-1px, -1px)`) và lún dứt khoát khi nhấn (`translate(2px, 2px)` kèm thu bóng về `1px 1px 0`).
- **Khung Cửa sổ Hệ điều hành Cổ điển (`Vintage OS Chrome`):** Các khối chính (AI Concierge, Thẻ sản phẩm, Khung Chat Copilot, Phiếu thanh toán, Trang chi tiết) được tổ chức như các cửa sổ hệ thống gọn gàng với cụm 3 đèn cửa sổ, dải kẻ sọc ngang (Pinstripe) và nhãn tiêu đề Monospace.

---

## 2. BẢNG MÀU & DESIGN TOKENS (`tokens.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root {
  /* Warm Vintage OS Surfaces */
  --bg-canvas: #F5F0E6;           /* Nền desktop kem ấm sang trọng */
  --bg-canvas-grid: rgba(28, 26, 23, 0.045); /* Lưới chấm nền cực mảnh 4.5% */
  --bg-surface: #FFFDF9;          /* Bề mặt cửa sổ giấy kem sáng */
  --bg-surface-pure: #FFFFFF;     /* Khung trưng bày ảnh laptop sắc nét 100% */
  --bg-surface-warm: #EDE5D5;     /* Thanh tiêu đề cửa sổ, khay phụ, chip nghỉ */
  --bg-surface-elevated: #FFFFFF; /* Input, thẻ nổi & hộp thoại */

  /* Crisp Ink & Typography Colors */
  --text-primary: #181614;        /* Mực đen ấm tương phản cao */
  --text-secondary: #575149;      /* Chữ mô tả, nội dung tư vấn phụ */
  --text-muted: #857D73;          /* Metadata, placeholder, timestamp */

  /* High-Conversion Neo-Retro Accents */
  --accent-primary: #D95326;      /* Cam đất nung nổi bật cho CTA Mua / Giá */
  --accent-hover: #BF4319;
  --accent-light: #FFEADF;
  --accent-amber: #F5C242;        /* Vàng bơ Vintage OS cho badge nổi bật / đèn LED */
  --accent-mint: #D7EFE2;         /* Xanh bạc hà cổ điển cho trạng thái Còn hàng */
  --accent-sky: #DFEBF6;          /* Lam nhạt cho chip thông số / VietQR */

  /* Neo-Brutalist Crisp Borders & Hard Shadows */
  --ink-border: #1C1A17;
  --border-light: #DFD6C5;
  --border-medium: #1C1A17;
  --border-strong: #1C1A17;
  --border-width: 1.5px;
  --border-width-heavy: 2px;

  --shadow-hard-xs: 2px 2px 0px #1C1A17;
  --shadow-hard-sm: 3px 3px 0px #1C1A17;
  --shadow-hard-md: 4px 4px 0px #1C1A17;
  --shadow-hard-lg: 6px 6px 0px #1C1A17;

  /* Status Colors */
  --status-success: #1D6F42;
  --status-warning: #A8650A;
  --status-danger: #B82E21;
}
```

---

## 3. QUY CHUẨN TYPOGRAPHY KÉP (MONO + SANS TIẾNG VIỆT)

| Mục đích | Font Family | Trọng lượng | Ứng dụng |
| :--- | :--- | :--- | :--- |
| **Tiêu đề Hệ thống, Cửa sổ, Giá & Thông số** | `JetBrains Mono`, `Space Mono`, monospace | Medium 500 – Bold 700 | Thanh tiêu đề cửa sổ, Heading chính, Giá tiền VND (`18.990.000₫`), CPU/GPU/RAM/SSD, Mã SKU & Mã đơn |
| **Hội thoại AI & Nội dung Tiếng Việt** | `Plus Jakarta Sans`, sans-serif | Regular 400 – Bold 700 | Bong bóng chat tư vấn tiếng Việt, bài mô tả sản phẩm, nhãn biểu mẫu giao hàng giúp đọc lâu êm mắt |

---

## 4. HỆ COMPONENT & ASSETS RETRO OS

1. **`WindowFrame` & `WindowTitleBar`:** Khung cửa sổ viền `1.5px solid #1C1A17`, đổ bóng cứng `4px 4px 0px #1C1A17`, thanh tiêu đề nền `#EDE5D5` gồm 3 chấm đèn cửa sổ (Coral / Amber / Mint), dải kẻ sọc Pinstripe cổ điển và tên cửa sổ Monospace.
2. **`SpecBadge`:** Chip phần cứng đóng khung sắc nét (`CPU`, `GPU`, `RAM`, `SSD`, `Màn hình`, `Pin`) hiển thị dạng lưới 2×2 dễ quét mắt so sánh trong 2 giây.
3. **`VariantCard` (Mini Hardware Window):** Header `BRAND // SKU` + pill trạng thái kho, vùng ảnh `#FFFFFF` `object-fit: contain` giữ trọn dáng laptop sắc nét, lưới thông số Monospace, giá bán cam đất đậm và cụm phím cơ `Tư vấn & Mua` / `Xem cấu hình`.
4. **`RetroLoadingBar`:** Thanh tiến trình 8 đốt vuông cổ điển chuyển động mượt kèm thông báo trạng thái Monospace.
5. **`ReceiptPerforation` & `ORDER_TERMINAL`:** Hộp thoại chốt đơn COD / VietQR có mép cắt răng cưa SVG mô phỏng hóa đơn in cao cấp, công tắc chọn phương thức dạng phím cơ và nút sao chép thông tin chuyển khoản nhanh.
6. **Zero Emoji Policy:** Toàn bộ biểu tượng sử dụng bộ vector SVG nét `1.85px` duotone đồng bộ trong `RetroIcons.tsx` và bộ SVG/Illustration tĩnh trong `public/assets/retro-os/`.
