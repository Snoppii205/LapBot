# LapBot — Website Bán Laptop & Trợ Lý Tư Vấn AI (Chat-to-Order COD)

LapBot là hệ thống thương mại điện tử chuyên biệt cho laptop kết hợp **bộ lọc Catalog kỹ thuật**, **trợ lý tư vấn AI tiếng Việt qua SSE** và **luồng chốt đơn COD 2 bước ngay trong khung chat hoặc trực tiếp trên web**. Backend nắm toàn quyền quyết định giá, tồn kho và trạng thái đơn hàng; AI chỉ thực hiện công cụ đọc dữ liệu được cấp phép và gợi ý cấu hình.

## Kiến trúc & Cấu trúc Monorepo

Dự án tổ chức theo chuẩn **npm workspaces** trên **Node.js 24 (`>=24 <25`)**, **TypeScript 6** và **PostgreSQL 17**:

```text
LapBot_Project/
├── apps/
│   ├── api/                        # @lapbot/api — Fastify 5, pg transaction, SSE LLM gateway, Admin Suite
│   └── web/                        # @lapbot/web — React 19, React Router 7, Vite 8 (Neo-Retro Warm OS UI)
├── packages/
│   └── contracts/                  # @lapbot/contracts — Shared DTOs, hằng số nghiệp vụ & JSON Schemas
├── data/
│   ├── vz-catalog/                 # Bộ dữ liệu sản phẩm & hình ảnh laptop thực tế (part1, part2)
│   └── store-info.fallback.json    # Dữ liệu chính sách cửa hàng mặc định khi DB chưa khởi tạo
├── docs/
│   ├── specs/                      # Đặc tả nghiệp vụ (08) & lộ trình cấu trúc (11)
│   ├── design/                     # Design system Neo-Retro OS (02A) & luồng màn hình (12)
│   ├── integrations/               # Hướng dẫn tích hợp cổng Butterfly OpenAI-compatible SSE (10)
│   ├── reviews/                    # Đối chiếu quy trình (09) & báo cáo triển khai (13)
│   └── archive/                    # Tài liệu nháp lịch sử (00–07, chỉ tham khảo)
├── e2e/                            # Kiểm thử đầu-cuối Playwright
├── scripts/                        # Công cụ benchmark API & probe danh mục model LLM
├── diagnostics/                    # Thư mục chứa kết quả xuất tự động (gitignored)
├── compose.yaml                    # Docker Compose PostgreSQL 17.6 local
└── package.json                    # Scripts điều phối toàn bộ workspaces
```

## Tính năng Cốt lõi

- **Catalog & Phiên bản cấu hình (SKU)**: Hỗ trợ lọc theo nhu cầu (`office_study`, `gaming`, `graphic_creator`, `programming`, `business_ultrabook`), ngân sách, thương hiệu, RAM/SSD và tình trạng kho thực tế.
- **Đặt hàng COD 2 bước an toàn giao dịch**:
  1. `POST /api/v1/orders/preview`: Báo giá 15 phút, không khóa mềm tồn kho, tối đa 1 đơn chờ xác nhận trên mỗi phiên.
  2. `POST /api/v1/orders/:id/confirm`: Khóa bản ghi theo thứ tự cố định chống deadlock, kiểm tra chênh lệch giá & trừ kho nguyên tử.
- **Tư vấn AI & Chuyển giao Nhân viên (HITL)**: Streaming chữ và thẻ sản phẩm (`laptop_spec`, `variant_customizer`, `address_form`) qua `POST /api/v1/chat/message-stream`, tự động ngắt luồng LLM tức thì qua `control-gate` khi khách yêu cầu gặp nhân viên hoặc Admin nhận phiên.
- **Tài khoản Thành viên & Khách vãng lai**: Hỗ trợ mua nhanh với tư cách Guest (`lapbot_guest` cookie) hoặc đăng ký/đăng nhập thành viên để quản lý hồ sơ và lịch sử đơn hàng.
- **Bộ Quản trị 7 Phân hệ (`/admin`)**: Dashboard KPI & doanh thu 7 ngày, Quản lý Catalog & Thư viện ảnh, Duyệt đơn COD, Live Chat HITL, Quản lý Khách hàng & Nhân sự (`SUPER_ADMIN` / `STAFF`), Cấu hình & Sandbox thử nghiệm AI trực tiếp, Cài đặt cửa hàng & Nhật ký kiểm toán (`audit_events`).

## Hướng dẫn Khởi chạy Nhanh

1. **Chuẩn bị biến môi trường & CSDL**:
   ```powershell
   Copy-Item .env.example .env
   docker compose up -d postgres
   ```
2. **Cài đặt phụ thuộc, chạy Migration & nhập dữ liệu Catalog**:
   ```powershell
   npm install
   npm run db:migrate
   npm run db:seed
   ```
3. **Khởi tạo tài khoản `SUPER_ADMIN` đầu tiên** (mật khẩu tối thiểu 12 ký tự):
   ```powershell
   $env:ADMIN_PASSWORD = 'YourStrongPassword123!'
   npm run admin:create -- admin
   Remove-Item Env:ADMIN_PASSWORD
   ```
4. **Chạy môi trường phát triển** (`http://localhost:5173` cho Web và `http://localhost:3000` cho API):
   ```powershell
   npm run dev
   ```

## Kiểm thử & Chất lượng Mã nguồn

| Lệnh                | Mục đích                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------ |
| `npm run typecheck` | Kiểm tra kiểu tĩnh TypeScript trên cả 3 workspaces                                          |
| `npm run lint`      | Kiểm tra quy tắc ESLint                                                                     |
| `npm run format`    | Chuẩn hóa định dạng code toàn dự án bằng Prettier                                           |
| `npm test`          | Chạy bộ Unit & API Contract Tests (`apps/api/test/core.test.ts`)                            |
| `npm run test:db`   | Chạy kiểm thử đồng thời & giao dịch trên PostgreSQL thử nghiệm (`TEST_DATABASE_URL`)        |
| `npm run e2e`       | Chạy kiểm thử đầu-cuối Playwright (`e2e/mvp.spec.ts`)                                       |
| `npm run build`     | Biên dịch toàn bộ `@lapbot/contracts`, `@lapbot/api` và `@lapbot/web`                       |
| `npm start`         | Khởi chạy máy chủ Production Single-Origin (`apps/api/dist/server.js` phục vụ cả API & SPA) |

## Triển khai Production (Deploy)

1. **Thiết lập biến môi trường bắt buộc**:
   - `NODE_ENV=production`
   - `PUBLIC_ORIGIN=https://your-domain.com` (bắt buộc HTTPS ở Production)
   - `TRUST_PROXY=true` (khi đặt sau Reverse Proxy như Nginx, Cloudflare, Render, Railway, Fly.io)
   - `DATABASE_URL=postgres://...`
   - `AI_ENABLED=true` kèm `LLM_BASE_URL` (kết thúc bằng `/v1`), `LLM_MODEL`, `LLM_API_KEY` (hoặc giữ `AI_ENABLED=false` cho chế độ Catalog + COD trực tiếp).
2. **Build, chạy Migration và khởi động trực tiếp trên Node 24**:
   ```bash
   npm ci
   npm run build
   npm run db:migrate:prod
   npm start
   ```
3. **Hoặc đóng gói bằng Docker (`Dockerfile` đa tầng có sẵn)**:
   ```bash
   docker build -t lapbot:latest .
   ```
   Gắn volume bền vững vào `/app/data/uploads` để lưu ảnh sản phẩm do Admin tải lên, và cấu hình probe sức khỏe vào `GET /api/v1/health` (liveness) hoặc `GET /api/v1/health/ready` (kiểm tra kết nối PostgreSQL).
