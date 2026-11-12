# Cấu trúc dự án và lộ trình code MVP

Trạng thái: đặc tả triển khai ngày **19/10/2026**, chưa phải mã nguồn đã tạo. [08](08_DAC_TA_MVP_CHO_AI_CODE.md) sở hữu nghiệp vụ, DB và contract; tài liệu này quy định cách tổ chức code để thực hiện các yêu cầu đó.

## 1. Đặc thù cần giữ

- Laptop có model cha và variant/SKU cụ thể; không tự ghép RAM/SSD thành cấu hình không bán. Catalog, chat và checkout dùng cùng catalog service.
- Khách có thể chọn máy và mua trực tiếp; AI là một đường tư vấn vào cùng checkout. Tắt AI vẫn mua COD được.
- Một preview/đơn tương ứng một SKU × một máy. Không tạo cart service, payment service hoặc order_items trong MVP.
- Giá, phí, tồn kho và trạng thái đơn do backend quyết định. Model không tạo/xác nhận/hủy đơn; câu “OK” trong chat không thay nút xác nhận.
- Chờ nhân viên và đã được nhân viên nhận là hai trạng thái UI khác nhau, suy ra từ AI/AGENT và needs_human. Không thêm mode WAITING trong DB.

## 2. Cấu trúc đích

Mọi đường dẫn dưới đây tính từ `LapBot/`; đây là đầu ra cần tạo, không phải cây mã nguồn đang tồn tại.

```text
LapBot/
  package.json                     # private, npm workspaces
  package-lock.json
  .node-version                    # Node LTS được xác minh lúc scaffold
  .env.example                     # Placeholder; .env thật bị gitignore
  .gitignore
  compose.yaml                     # PostgreSQL development
  store-info.json                   # Nội dung shop đã duyệt, không secret/phí trùng env
  VZ_Data/                          # JSON và ảnh nguồn do chủ dự án cung cấp
  apps/
    api/
      package.json
      tsconfig.json
      migrations/                  # SQL đánh số; schema_migrations
      src/
        server.ts                  # Listen, shutdown; không chứa business logic
        app.ts                     # Tạo Fastify app, register modules
        config.ts                  # Parse/validate env trước listen
        db/{pool.ts,migrate.ts,seed.ts,vz-source.ts,create-admin.ts}
        lib/{errors.ts,logger.ts,request-context.ts}
        modules/
          auth/                    # Guest/admin credentials, ownership, Origin
          catalog/                 # SQL catalog, admin edit, revision
          orders/                  # Preview/confirm/cancel/transition, transaction
          chat/                    # Receipts, history, orchestration, control gate
            llm/                   # Gateway adapter, SSE parser, tool-call accumulator
            tools/                 # Allowlist executor gọi service nội bộ
          admin/                   # Authenticated routes/claim/release, gọi service chung
    web/
      package.json
      index.html
      vite.config.ts
      tsconfig.json
      src/
        main.tsx
        app/{router.tsx,providers.tsx}
        pages/{catalog,product,orders,admin}/
        components/{layout,catalog,chat,checkout,admin,ui}/
        features/chat/             # Context/reducer, SSE, polling, gate UI
        features/checkout/         # Form, preview, confirm; không gọi LLM
        lib/{api-client.ts,format.ts}
        styles/{tokens.css,global.css}
    # api phục vụ web build khi production; không deploy thêm web server bắt buộc
  packages/
    contracts/
      package.json
      tsconfig.json
      src/{index.ts,catalog.ts,orders.ts,chat.ts,admin.ts,errors.ts}
  docs/
  scripts/
  diagnostics/
```

Trong module có thể dùng `routes.ts`, `schemas.ts`, `service.ts`, `repository.ts` khi cần; không tạo file rỗng/lớp trung gian chỉ để đủ cây. SQL nằm trong repository hoặc hàm DB của module; transaction do order/chat service sở hữu. Không tạo repository base class, CQRS/event bus hoặc HTTP giữa các module.

`packages/contracts` chỉ chứa types, JSON Schema và enum dùng chung; không import React, pg, Fastify, env hoặc gateway. Đặt type/schema của một resource cùng file, export qua một entrypoint và không chép lại interface ở web. Schema runtime vẫn cần validate dữ liệu unknown dù TypeScript compile thành công.

## 3. Hướng phụ thuộc và nguồn dữ liệu

```text
web -> contracts
api routes -> schema/auth -> service -> pg/PostgreSQL
chat orchestrator -> tool executor -> catalog / chat control service
chat orchestrator -> gateway adapter -> external LLM
orders service -> PostgreSQL (không LLM/mạng ngoài trong transaction)
```

| Dữ liệu | Nguồn chuẩn |
| --- | --- |
| Giá/cấu hình/được phép bán | Catalog DB; cả laptop và variant active |
| Phí giao hàng | SHIPPING_FEE_VND, validate ở startup |
| Tổng/địa chỉ/trạng thái đơn | OrderView do order service trả sau transaction |
| Quyền xem đơn/chat | Credential cookie và ownership trong backend |
| Lịch sử và receipt | PostgreSQL; stream buffer chỉ tạm thời trong RAM |
| Chính sách | store-info.json được shop duyệt |
| Trạng thái đang nhập form | React state; không gửi checkout PII vào LLM/localStorage |
| UI tokens | styles/tokens.css theo 02A |

## 4. Quy ước cố định

- TypeScript strict, ESM thống nhất khi scaffold; chọn runtime/package còn được hỗ trợ, khóa phiên bản và lockfile. Không dùng ví dụ Tailwind cũ để ép một phiên bản toolchain.
- Backend API duy nhất `/api/v1`; đường dẫn UI trong tài liệu 12 không phải HTTP resource của backend. Vite proxy giữ nguyên `/api/v1`; production cùng origin, SPA fallback không được nuốt lỗi API.
- API/DB snake_case; camelCase chỉ dùng nội bộ UI với mapping tập trung. Tiền integer VND; timestamp ISO UTC; chat cursor BIGINT luôn là string. Order/resource IDs và client request IDs theo 08.
- Một error envelope của 08; không tự thêm success envelope/endpoint tổng quát. Định nghĩa response schema cho cả admin/public, không serialize stock/PII nội bộ ra public.
- Backend chỉ đọc env qua config.ts. AI_ENABLED mặc định false; bật AI cần LLM_BASE_URL, LLM_MODEL, LLM_API_KEY hợp lệ. Không expose các biến này qua Vite hoặc store-info.
- Tạo root scripts `dev`, `build`, `typecheck`, `lint`, `db:migrate`, `db:seed`, `admin:create` khi scaffold. `dev` điều phối web/api; build contracts trước các app; `admin:create` không có mật khẩu mặc định. Tài liệu chưa khẳng định các lệnh này đã tồn tại/chạy được.

## 5. Mốc triển khai

| Mốc | Phạm vi | Điều kiện bàn giao |
| --- | --- | --- |
| M0 — Nền | Workspace/config, contracts, PostgreSQL compose, migrations/seeds, app/router shell, design tokens | Hướng dẫn setup và env; scripts thực sự tồn tại; DB lên và migrate được; AI tắt rõ ràng |
| M1 — Catalog | Public catalog/detail, lọc q/budget/brand/RAM/nhu cầu, UI và store-info | Dữ liệu DB, URL filter/pagination, empty/error/out-of-stock, không cần key |
| M2 — COD | Guest cookie, form, preview, confirm/cancel, đơn của tôi; order service dùng lại cho admin sau này | Khóa/ownership/idempotency theo 08; hai khách tranh SKU cuối không oversell; retry/hủy không trừ/cộng lặp khi kiểm chứng bằng PostgreSQL thật |
| M3 — AI | Receipt/history, adapter stream, tool executor, widget, quota và recovery | Provider stream tách khỏi SSE LapBot; tool schema đủ; lỗi LLM vẫn mua được; key chỉ ở backend |
| M4 — Admin/HITL | Login, catalog edit, xử lý đơn, xem phiên, request-human/claim/release | Không tự tạo đơn thay khách; polling có giới hạn; version/gate và assigned admin đúng; không phát AI đến muộn |
| M5 — Demo/vận hành | Hoàn thiện responsive, lỗi/khôi phục, cấu hình production và kiểm chứng | Báo cáo thực tế các tiêu chí mục 10 của 08; shop duyệt catalog/chính sách trước mở bán |

Ở M2 chưa có console admin, có thể kiểm chứng order service bằng harness khi được yêu cầu; không phát minh một admin endpoint bỏ auth để demo. Ở M3, xây control gate/hàm handoff cần thiết, hoàn thiện route/console quyền admin trong M4. Không coi M0–M5 đã hoàn thành vì có tài liệu này.

## 6. Phiếu bàn giao mỗi mốc

Ghi rõ: phạm vi đã làm → file/schema/migration thay đổi → lệnh setup/run thực tế → kiểm chứng đã thực hiện và kết quả → lỗi/chưa làm → mốc tiếp theo. Không ghi lại secret hoặc prompt/customer data trong báo cáo. Nếu chưa thực hiện một phép kiểm chứng thì ghi chưa thực hiện; không dùng số mục tiêu p95/AI accuracy làm số đo.
