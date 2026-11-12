# Báo cáo triển khai LapBot MVP — 19/10/2026

## Cập nhật tồn kho 19/10/2026

- Migration `003_inventory_source_status.sql` đã áp dụng trên Supabase; importer đã chạy lại, giữ stock hiện có và lưu cờ `in_stock` của VZ_Data riêng.
- Trong 100 variant đủ điều kiện: 34 nguồn báo hết hàng, 66 nguồn báo còn hàng nhưng thiếu số lượng. Public hiển thị lần lượt “Hết hàng” và “Chờ xác nhận tồn kho”; cả hai chưa nhận COD. Admin nhập hoặc xác nhận số lượng thực tế sẽ chuyển sang trạng thái còn/hết hàng dựa trên stock đã xác minh.
- `npm run build`, `npm run typecheck`, `npm run lint` đạt. GET catalog local trả 7 `out_of_stock` và 13 `pending_verification` ở 20 item đầu; sản phẩm `VZ-PRODUCT-19029` trả `out_of_stock`. Chưa có stock thực tế cho 66 sản phẩm, chưa chạy kiểm thử giao dịch trên DB thử nghiệm.

## Cập nhật ảnh sản phẩm 19/10/2026

- Migration `004_laptop_images.sql` đã áp dụng trên Supabase; seed nhập 920 ảnh có file hợp lệ cho 100 sản phẩm đủ điều kiện. API chi tiết trả `images` theo thứ tự nguồn, có caption trung tính; catalog list vẫn dùng ảnh đại diện.
- Trang chi tiết có ảnh lớn, nút trước/sau, dãy thumbnail và chú thích. `npm run build` và `npm run lint` đạt. GET chi tiết `VZ-PRODUCT-19029` trả 9 ảnh; ảnh thứ hai tải qua localhost với HTTP 200 `image/jpeg`.

Nguồn yêu cầu: [08](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md), [11](../specs/11_CAU_TRUC_DU_AN_VA_LO_TRINH_CODE.md), [12](../design/12_MAN_HINH_VA_LUONG_MVP.md). Phần dưới là trạng thái mã nguồn và kiểm chứng thực tế, chưa phải biên bản nghiệm thu pilot.

| Mốc | Mã nguồn | Kiểm chứng đã thực hiện | Còn thiếu |
| --- | --- | --- | --- |
| M0 | npm workspace, env backend, migrations `001_initial.sql` và `002_chat_turn_route.sql`, script tạo admin | `npm run build/typecheck/lint`; migration trên Supabase PostgreSQL | Chưa kiểm thử giao dịch trên DB thử nghiệm riêng |
| M1 | `modules/catalog`, contract catalog, trang list/detail và URL filter; importer và ảnh từ `VZ_Data/` | 100 sản phẩm thật đã nhập; GET catalog và ảnh trả 200; demo đã xóa | Còn 136 mục thiếu giá/cấu hình; tồn kho chính xác chưa có |
| M2 | Guest cookie, order preview/confirm/cancel/list/detail, CheckoutFlow dùng cho mua trực tiếp/chat | Unit test chuẩn hóa form; test PostgreSQL đã viết | Chưa chạy test tranh kho/idempotency/ownership trên PostgreSQL thật |
| M3 | Chat receipt/history, POST SSE, parser, gateway BUTTERFLY tương thích, tool allowlist, gate/control, chat drawer | Unit test SSE UTF-8/frame, allowlist và gate chặn text đến muộn | Chưa xác minh endpoint/key/model hiện hành, chưa test provider thật/takeover đồng thời trên DB |
| M4 | Admin login/logout, catalog revision, order transition, chat claim/release/message, UI admin polling | Build/typecheck/lint | Chưa chạy giao diện với DB/admin thật |
| M5 | Responsive cơ bản, khôi phục preview, production same-origin static, Playwright specs cho COD và admin/HITL, script đo p95 | Build và smoke inject GET `/` production trả 200 | Playwright chưa cài được vì npm registry DNS lỗi; chưa chạy E2E/benchmark p95 |

## Lệnh và kết quả trong phiên

- `npm run build`: đạt; contracts, API và web biên dịch.
- `npm run typecheck`: đạt.
- `npm run lint`: đạt.
- `npm test`: 6/6 unit/API smoke test đạt (gateway SSE, browser SSE, gate, tool arguments, form COD, body/Origin validation).
- Fastify production `GET /` qua `inject`: 200, `text/html`.
- `docker info`: không kết nối được `dockerDesktopLinuxEngine` qua named pipe; `wsl --list --verbose` trả `WSL/E_ACCESSDENIED`. Không báo migration/transaction test là đạt.
- `npm install --save-dev @playwright/test@1.56.1`: `ENOTFOUND registry.npmjs.org`; Playwright specs có sẵn nhưng chưa chạy.
- Đã cấu hình `.env` cục bộ (được `.gitignore` bỏ qua) cho Session pooler cổng 5432 của project Supabase mới. Kết nối đọc xác nhận `postgres`; trước migration schema `public` trống. `npm run db:migrate` áp dụng `001` và `002`; `npm run db:seed` nạp catalog demo. Truy vấn đọc sau đó có 1 laptop, 12 variant, 0 order. GET `/api/v1/catalog/variants?limit=5` qua Fastify inject trả 200 và 5 item.
- Thử `npm run test:db` với cùng Supabase DB bị auto-review từ chối vì suite tạo/xóa dữ liệu và admin trên DB persistent. Không chạy lách; cần `TEST_DATABASE_URL` của DB thử nghiệm dùng được để xóa hoặc phê duyệt rõ ràng việc chạy suite trên project này. TLS hiện dùng `require` cho môi trường phát triển; chưa cấu hình CA để xác thực máy chủ theo `verify-full`.
- Theo lựa chọn của chủ dự án, thay seed demo bằng importer `VZ_Data/`. Nguồn hiện có part 1 và 2 (236 mục, còn thiếu 3 phần so với tên bộ dữ liệu). Importer chỉ lấy 100 mục có giá VND dương và RAM/SSD không mơ hồ; 136 mục bị loại với lý do trong `diagnostics/vz-import-report.json`. Giá và thông số lấy từ dữ liệu cung cấp; SKU `VZ-PRODUCT-{id}` là định danh nội bộ, chưa xác minh là SKU bán thật. Stock đặt 0 cho mọi variant.
- `npm run db:seed` trên Supabase: thành công; truy vấn đọc có 100 laptop, 100 variant, 0 SKU `DEMO-%`, 0 variant có thể bán. GET `/api/v1/catalog/variants?limit=5` trả 200 với 5 item; GET ảnh đầu tiên trả 200 `image/webp`.
- Sau thay importer: `npm run typecheck`, `npm run build`, `npm run lint` đều đạt; `npm test` đạt 6/6.
- Web đã nhận URL ảnh cục bộ `/api/v1/catalog/images/...` trong thẻ catalog và trang chi tiết. App local `http://localhost:5173/` trả catalog VZ qua Vite proxy; ảnh trả 200. Ba sản phẩm Legion đã chuẩn hóa hãng thành Lenovo trong DB.

## Trước pilot

1. Dùng PostgreSQL thử nghiệm riêng đã migrate; trong PowerShell đặt `$env:TEST_DATABASE_URL = 'postgres://...'` rồi chạy `npm run test:db` và sửa mọi lỗi phát hiện.
2. Cài Playwright/Chromium khi có registry, chạy `npm run e2e` trên DB thử nghiệm. Mở rộng E2E cho takeover giữa stream và lỗi provider bằng môi trường gateway kiểm soát được.
3. Đo p95 catalog/preview/confirm với 1.000 variant, 20 client, app và DB gần nhau; ghi số đo thực tế.
4. Chủ dự án duyệt tên shop, chính sách, giá, cấu hình/SKU và kho thật; cập nhật stock từ số lượng chính xác trước khi nhận COD. Bổ sung part 3–5 của bộ dữ liệu nếu muốn nhập đủ sản phẩm. Xác minh BUTTERFLY endpoint/model/key hiện hành trước khi đặt `AI_ENABLED=true`.
5. Rà soát handoff, SSE backpressure, metrics token và khả năng phục hồi kết nối với provider thực. Mã hiện có chưa đủ bằng chứng để coi M3/M4 đã nghiệm thu concurrency.
6. Trước pilot, tải CA của project từ Database settings → SSL và dùng `verify-full` để xác thực máy chủ PostgreSQL; cấu hình `.env` hiện dùng TLS `require` cho môi trường phát triển.
