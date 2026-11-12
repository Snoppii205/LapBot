import type { FastifyInstance, RouteOptions } from 'fastify';
import {
  adminCatalogSorts,
  adminStockFilters,
  catalogSortModes,
  customerSorts,
  customerTags,
  guestBuyerFilters,
  orderStatuses,
  usageCategories
} from '@lapbot/contracts';
import { config } from '../../config.js';

export type ApiAuthLevel =
  | 'PUBLIC'
  | 'GUEST'
  | 'CUSTOMER'
  | 'GUEST_OR_CUSTOMER'
  | 'ADMIN_STAFF'
  | 'SUPER_ADMIN';

interface QueryParamSpec {
  name: string;
  required?: boolean;
  description: string;
  schema: Record<string, unknown>;
}

interface EndpointMeta {
  tag: string;
  summary: string;
  description: string;
  auth: ApiAuthLevel;
  rateLimit?: string;
  queryParams?: QueryParamSpec[];
  pathParamDescriptions?: Record<string, string>;
  requestExample?: unknown;
  responseContentType?: string;
  isSse?: boolean;
  errorStatuses?: number[];
}

interface CapturedRoute {
  method: string;
  url: string;
  schema?: {
    params?: unknown;
    querystring?: unknown;
    body?: unknown;
    response?: Record<string, unknown>;
  };
}

const TAG_DEFINITIONS = [
  {
    name: '1. Hệ thống & Sức khoẻ',
    description:
      'Kiểm tra trạng thái sống (liveness), sẵn sàng kết nối PostgreSQL (readiness) và xuất đặc tả OpenAPI 3.0.3.'
  },
  {
    name: '2. Catalog & Cửa hàng',
    description:
      'Tra cứu biến thể laptop công khai, phân trang con trỏ (keyset cursor), lấy chi tiết phần cứng, ảnh tĩnh và chính sách cửa hàng.'
  },
  {
    name: '3. Phiên khách & Tài khoản',
    description:
      'Quản lý phiên ẩn danh (lapbot_guest) cho giỏ hàng/chat và tài khoản thành viên (lapbot_member) với mật khẩu băm scrypt.'
  },
  {
    name: '4. Đặt hàng COD & Tồn kho',
    description:
      'Quy trình đặt hàng COD 2 bước an toàn giao dịch: báo giá giữ giá 15 phút (preview) và khoá hàng trừ kho nguyên tử (confirm).'
  },
  {
    name: '5. Tư vấn AI (SSE) & Handoff',
    description:
      'Luồng chat streaming thời gian thực qua Server-Sent Events (SSE), 5 tool tra cứu an toàn và chuyển giao nhân viên thật (HITL).'
  },
  {
    name: '6. Admin — Xác thực & Dashboard',
    description:
      'Đăng nhập quản trị viên (lapbot_admin), quản lý phiên nội bộ và thống kê KPI vận hành thời gian thực.'
  },
  {
    name: '7. Admin — Catalog & Hình ảnh',
    description:
      'Quản trị dòng máy (laptops), biến thể SKU (variants) với khoá lạc quan (expected_revision), thao tác hàng loạt và tải ảnh.'
  },
  {
    name: '8. Admin — Đơn hàng COD',
    description:
      'Theo dõi danh sách đơn hàng COD, lịch sử trạng thái và chuyển đổi trạng thái đơn có hoàn kho tự động khi huỷ.'
  },
  {
    name: '9. Admin — Live Chat HITL',
    description:
      'Tiếp nhận hội thoại cần người hỗ trợ (claim), gửi tin nhắn kèm thẻ cấu hình/form địa chỉ, trả quyền về AI (release) và dọn phiên.'
  },
  {
    name: '10. Admin — Khách hàng CRM & Nhân sự',
    description:
      'Quản trị hồ sơ khách hàng 360 độ, nâng cấp khách vãng lai thành thành viên và phân quyền nhân sự (STAFF / SUPER_ADMIN).'
  },
  {
    name: '11. Admin — Cấu hình AI & Audit',
    description:
      'Điều chỉnh runtime AI (model, system prompt, timeout), test kết nối LLM Gateway, cài đặt cửa hàng và nhật ký kiểm toán (Audit Log).'
  }
] as const;

const SAMPLE_UUID = '00000000-0000-4000-8000-000000000001';

const ENDPOINT_METADATA: Record<string, EndpointMeta> = {
  // 1. Health & OpenAPI
  'GET /api/v1/health': {
    tag: '1. Hệ thống & Sức khoẻ',
    summary: 'Kiểm tra tiến trình API (Liveness Probe)',
    description:
      'Phản hồi ngay lập tức `{"status":"ok"}` để Docker HEALTHCHECK và Nginx xác nhận tiến trình Fastify đang hoạt động.',
    auth: 'PUBLIC',
    errorStatuses: []
  },
  'GET /api/v1/health/ready': {
    tag: '1. Hệ thống & Sức khoẻ',
    summary: 'Kiểm tra kết nối cơ sở dữ liệu (Readiness Probe)',
    description:
      'Thực thi truy vấn `SELECT 1` tới PostgreSQL Pool. Trả về `200 OK` khi DB sẵn sàng hoặc `503 Service Unavailable` nếu mất kết nối.',
    auth: 'PUBLIC',
    errorStatuses: [503]
  },
  'GET /api/v1/openapi.json': {
    tag: '1. Hệ thống & Sức khoẻ',
    summary: 'Xuất tài liệu đặc tả OpenAPI 3.0.3 (JSON)',
    description:
      'Trả về toàn bộ sơ đồ đặc tả OpenAPI 3.0.3 được tổng hợp trực tiếp từ JSON Schema của Fastify và `@lapbot/contracts`. Có thể nhập trực tiếp vào Postman, Insomnia hoặc Swagger Editor.',
    auth: 'PUBLIC',
    errorStatuses: []
  },

  // 2. Catalog & Storefront
  'GET /api/v1/catalog/variants': {
    tag: '2. Catalog & Cửa hàng',
    summary: 'Tra cứu & lọc danh sách biến thể Laptop',
    description:
      'Truy vấn danh mục biến thể đang mở bán kèm bộ lọc đa chiều (từ khoá, khoảng giá, RAM, SSD, hãng, nhu cầu sử dụng, tình trạng còn hàng) và phân trang keyset cursor hoặc offset.',
    auth: 'PUBLIC',
    queryParams: [
      {
        name: 'q',
        description: 'Từ khoá tìm kiếm theo tên máy, hãng, SKU, CPU hoặc GPU.',
        schema: { type: 'string', maxLength: 160 }
      },
      {
        name: 'brand',
        description: 'Lọc chính xác theo thương hiệu (VD: ASUS, Dell, Lenovo, HP, Apple).',
        schema: { type: 'string', maxLength: 80 }
      },
      {
        name: 'usage_category',
        description: 'Phân khúc nhu cầu sử dụng.',
        schema: { type: 'string', enum: [...usageCategories] }
      },
      {
        name: 'min_price',
        description: 'Giá tối thiểu (VNĐ).',
        schema: { type: 'integer', minimum: 1, maximum: 1000000000 }
      },
      {
        name: 'max_price',
        description: 'Giá tối đa (VNĐ).',
        schema: { type: 'integer', minimum: 1, maximum: 1000000000 }
      },
      {
        name: 'min_ram_gb',
        description: 'Dung lượng RAM tối thiểu (GB, VD: 8, 16, 32).',
        schema: { type: 'integer', minimum: 1, maximum: 512 }
      },
      {
        name: 'min_ssd_gb',
        description: 'Dung lượng ổ cứng SSD tối thiểu (GB, VD: 256, 512, 1024).',
        schema: { type: 'integer', minimum: 1, maximum: 16384 }
      },
      {
        name: 'available_only',
        description: 'Chỉ hiển thị các biến thể còn hàng đã xác minh (`true` / `false`).',
        schema: { type: 'string', enum: ['true', 'false'] }
      },
      {
        name: 'sort',
        description: 'Chế độ sắp xếp danh sách.',
        schema: { type: 'string', enum: [...catalogSortModes] }
      },
      {
        name: 'limit',
        description: 'Số bản ghi mỗi trang (mặc định 20, tối đa 40).',
        schema: { type: 'integer', minimum: 1, maximum: 40, default: 20 }
      },
      {
        name: 'cursor',
        description: 'Con trỏ phân trang keyset (không dùng đồng thời với `offset`).',
        schema: { type: 'string', maxLength: 256 }
      },
      {
        name: 'offset',
        description: 'Vị trí bắt đầu phân trang theo trang số (tối đa 10000).',
        schema: { type: 'integer', minimum: 0, maximum: 10000 }
      }
    ],
    errorStatuses: [400]
  },
  'GET /api/v1/catalog/variants/:variant_id': {
    tag: '2. Catalog & Cửa hàng',
    summary: 'Xem chi tiết biến thể Laptop & các cấu hình cùng dòng',
    description:
      'Trả về thông số phần cứng chi tiết, bộ sưu tập ảnh, chính sách bảo hành và danh sách các biến thể anh em (`siblings`) thuộc cùng dòng laptop.',
    auth: 'PUBLIC',
    pathParamDescriptions: {
      variant_id: 'UUID của biến thể laptop cần tra cứu.'
    },
    errorStatuses: [404]
  },
  'GET /api/v1/catalog/images/:part/:filename': {
    tag: '2. Catalog & Cửa hàng',
    summary: 'Tải ảnh gốc sản phẩm từ kho dữ liệu hạt giống',
    description:
      'Phục vụ tệp ảnh tĩnh (`image/jpeg`, `image/png`, `image/webp`) từ thư mục `data/vz-catalog` kèm kiểm tra chống leo thư mục (path traversal) và bộ nhớ đệm `Cache-Control: public, max-age=86400`.',
    auth: 'PUBLIC',
    responseContentType: 'image/*',
    pathParamDescriptions: {
      part: 'Số thứ tự phân vùng ảnh (số nguyên dương, VD: 1).',
      filename: 'Tên tệp ảnh hợp lệ (`.jpg`, `.jpeg`, `.png`, `.webp`).'
    },
    errorStatuses: [404]
  },
  'GET /api/v1/catalog/uploads/:filename': {
    tag: '2. Catalog & Cửa hàng',
    summary: 'Tải ảnh sản phẩm do Admin tải lên',
    description:
      'Phục vụ tệp ảnh đã tải lên trong thư mục `data/uploads` với tên tệp định dạng UUID bất biến (`Cache-Control: public, max-age=86400, immutable`).',
    auth: 'PUBLIC',
    responseContentType: 'image/*',
    pathParamDescriptions: {
      filename: 'Tên tệp UUID kèm phần mở rộng (`.jpg`, `.png`, `.webp`).'
    },
    errorStatuses: [404]
  },
  'GET /api/v1/store-info': {
    tag: '2. Catalog & Cửa hàng',
    summary: 'Lấy thông tin cửa hàng, phí vận chuyển & trạng thái AI',
    description:
      'Cung cấp cấu hình hiển thị chung cho Storefront: tên cửa hàng, chính sách bảo hành/đổi trả, phí giao hàng COD, câu chào AI và gợi ý câu hỏi mẫu.',
    auth: 'PUBLIC',
    errorStatuses: []
  },

  // 3. Guest & Customer Auth
  'POST /api/v1/chat/session': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Khởi tạo hoặc khôi phục phiên khách (Guest Session)',
    description:
      'Kiểm tra cookie `lapbot_guest` hiện tại; nếu chưa có hoặc đã hết hạn sẽ cấp mới phiên khách ẩn danh có thời hạn 30 ngày (`HttpOnly; SameSite=Lax; Secure`). Yêu cầu header `Origin` khớp `PUBLIC_ORIGIN`.',
    auth: 'PUBLIC',
    requestExample: {},
    errorStatuses: [403]
  },
  'POST /api/v1/chat/session/new': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Tạo mới hoàn toàn phiên hội thoại khách',
    description:
      'Buộc tạo một phiên hội thoại sạch mới và ghi đè cookie `lapbot_guest` (tự động gắn với `customer_id` nếu người dùng đang đăng nhập thành viên).',
    auth: 'PUBLIC',
    requestExample: {},
    errorStatuses: [403]
  },
  'POST /api/v1/auth/register': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Đăng ký tài khoản khách hàng thành viên',
    description:
      'Tạo tài khoản thành viên mới (mật khẩu băm `scrypt`), tự động cấp cookie `lapbot_member` và liên kết phiên `lapbot_guest` hiện tại vào tài khoản.',
    auth: 'PUBLIC',
    rateLimit: '10 lượt / giờ / IP',
    requestExample: {
      email: 'khachhang.demo@example.com',
      password: 'DemoPassword123!',
      full_name: 'Nguyễn Văn An',
      phone: '0901234567'
    },
    errorStatuses: [400, 403, 409, 429]
  },
  'POST /api/v1/auth/login': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Đăng nhập tài khoản thành viên',
    description:
      'Xác thực email và mật khẩu khách hàng, phát hành cookie phiên `lapbot_member` và đồng bộ đơn hàng/chat từ phiên khách ẩn danh hiện hành.',
    auth: 'PUBLIC',
    rateLimit: '15 lượt / 15 phút / IP',
    requestExample: {
      email: 'khachhang.demo@example.com',
      password: 'DemoPassword123!'
    },
    errorStatuses: [400, 401, 403, 429]
  },
  'POST /api/v1/auth/logout': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Đăng xuất tài khoản thành viên',
    description: 'Thu hồi phiên thành viên trong cơ sở dữ liệu và xoá cookie `lapbot_member`.',
    auth: 'CUSTOMER',
    requestExample: {},
    errorStatuses: [403]
  },
  'GET /api/v1/auth/me': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Lấy hồ sơ thành viên đang đăng nhập',
    description:
      'Trả về thông tin tài khoản, địa chỉ giao hàng mặc định và cấu trúc địa giới hành chính của thành viên từ cookie `lapbot_member`.',
    auth: 'CUSTOMER',
    errorStatuses: [401]
  },
  'PATCH /api/v1/auth/profile': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Cập nhật hồ sơ & sổ địa chỉ mặc định',
    description:
      'Cập nhật họ tên, số điện thoại và địa chỉ nhận hàng mặc định của khách hàng thành viên.',
    auth: 'CUSTOMER',
    requestExample: {
      full_name: 'Nguyễn Văn An',
      phone: '0901234567',
      default_shipping_address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    errorStatuses: [400, 401, 403]
  },
  'POST /api/v1/auth/change-password': {
    tag: '3. Phiên khách & Tài khoản',
    summary: 'Đổi mật khẩu tài khoản thành viên',
    description:
      'Xác minh mật khẩu hiện tại, cập nhật mật khẩu mới và thu hồi toàn bộ các phiên đăng nhập khác của khách hàng để bảo mật.',
    auth: 'CUSTOMER',
    requestExample: {
      current_password: 'DemoPassword123!',
      new_password: 'NewStrongPassword456!'
    },
    errorStatuses: [400, 401, 403]
  },

  // 4. Orders & COD
  'POST /api/v1/orders/preview': {
    tag: '4. Đặt hàng COD & Tồn kho',
    summary: 'Bước 1 — Tạo báo giá nháp giữ giá 15 phút (Preview Order)',
    description:
      'Kiểm tra biến thể khả dụng, tính phí vận chuyển và phát hành đơn nháp trạng thái `PENDING_CONFIRMATION` có hiệu lực 15 phút mà **chưa trừ tồn kho** (chống giữ kho ảo). Mỗi phiên giữ tối đa 1 đơn nháp; hỗ trợ idempotency qua `client_request_id`.',
    auth: 'PUBLIC',
    rateLimit: '15 req / phút / session; 60 req / phút / IP',
    requestExample: {
      client_request_id: SAMPLE_UUID,
      variant_id: '258bfce4-7cdb-4e9f-9e8d-3d3d256a354f',
      customer_name: 'Trần Minh Khôi',
      customer_phone: '0912345678',
      shipping_address: '45 Lê Lợi, Phường Phú Hội, TP. Huế',
      note: 'Giao giờ hành chính, gọi trước 15 phút',
      payment_method: 'COD'
    },
    errorStatuses: [400, 403, 404, 409, 429]
  },
  'POST /api/v1/orders/:order_id/confirm': {
    tag: '4. Đặt hàng COD & Tồn kho',
    summary: 'Bước 2 — Xác nhận chốt đơn COD & trừ kho nguyên tử',
    description:
      'Thực thi giao dịch ACID khoá dòng theo đúng thứ tự (`chat_sessions -> orders -> laptops FOR SHARE -> laptop_variants FOR UPDATE`), kiểm tra hạn báo giá 15 phút, xác nhận giá niêm yết không đổi, trừ `stock = stock - 1` nguyên tử và chuyển trạng thái sang `CONFIRMED`.',
    auth: 'GUEST_OR_CUSTOMER',
    rateLimit: '20 req / phút / actor; 60 req / phút / IP',
    pathParamDescriptions: {
      order_id: 'UUID của đơn hàng trạng thái `PENDING_CONFIRMATION`.'
    },
    requestExample: {},
    errorStatuses: [401, 403, 404, 409, 429]
  },
  'POST /api/v1/orders/:order_id/cancel': {
    tag: '4. Đặt hàng COD & Tồn kho',
    summary: 'Huỷ đơn hàng & hoàn kho an toàn',
    description:
      'Cho phép khách huỷ đơn khi đang ở trạng thái `PENDING_CONFIRMATION` hoặc `CONFIRMED`. Nếu đơn đã trừ kho (`CONFIRMED`), hệ thống hoàn trả đúng 1 đơn vị tồn kho trong cùng giao dịch DB.',
    auth: 'GUEST_OR_CUSTOMER',
    rateLimit: '20 req / phút / actor; 60 req / phút / IP',
    pathParamDescriptions: {
      order_id: 'UUID của đơn hàng cần huỷ.'
    },
    requestExample: {},
    errorStatuses: [401, 403, 404, 409, 429]
  },
  'GET /api/v1/orders/:order_id': {
    tag: '4. Đặt hàng COD & Tồn kho',
    summary: 'Xem chi tiết đơn hàng của tôi',
    description:
      'Trả về thông tin chi tiết đơn hàng, cấu hình sản phẩm đã chốt và lịch sử chuyển trạng thái của khách (kiểm tra quyền sở hữu theo `session_id` hoặc `customer_id`).',
    auth: 'GUEST_OR_CUSTOMER',
    pathParamDescriptions: {
      order_id: 'UUID của đơn hàng.'
    },
    errorStatuses: [401, 404]
  },
  'GET /api/v1/orders': {
    tag: '4. Đặt hàng COD & Tồn kho',
    summary: 'Danh sách lịch sử đơn hàng của tôi',
    description:
      'Liệt kê các đơn hàng thuộc phiên khách hoặc tài khoản thành viên hiện tại, sắp xếp mới nhất trước với phân trang cursor.',
    auth: 'GUEST_OR_CUSTOMER',
    queryParams: [
      {
        name: 'limit',
        description: 'Số lượng đơn mỗi trang (mặc định 20, tối đa 20).',
        schema: { type: 'integer', minimum: 1, maximum: 20, default: 20 }
      },
      {
        name: 'cursor',
        description: 'Con trỏ trang kế tiếp (`next_cursor`).',
        schema: { type: 'string', maxLength: 256 }
      }
    ],
    errorStatuses: [400, 401]
  },

  // 5. Chat AI & Handoff
  'GET /api/v1/chat/messages': {
    tag: '5. Tư vấn AI (SSE) & Handoff',
    summary: 'Lấy lịch sử tin nhắn & trạng thái điều khiển phiên Chat',
    description:
      'Trả về danh sách tin nhắn (kèm widget thẻ cấu hình / form thanh toán), trạng thái `control_mode` (`AI` hoặc `AGENT`), `control_version` và cờ `needs_human`.',
    auth: 'GUEST',
    queryParams: [
      {
        name: 'after_id',
        description: 'Chỉ lấy các tin nhắn mới hơn ID này (dùng để đồng bộ tăng dần).',
        schema: { type: 'string' }
      },
      {
        name: 'before_id',
        description: 'Lấy các tin nhắn cũ hơn ID này (tải lịch sử cũ). Không dùng cùng `after_id`.',
        schema: { type: 'string' }
      },
      {
        name: 'limit',
        description: 'Số tin nhắn tối đa (mặc định 50, tối đa 50).',
        schema: { type: 'integer', minimum: 1, maximum: 50, default: 50 }
      }
    ],
    errorStatuses: [400, 401]
  },
  'POST /api/v1/chat/message-stream': {
    tag: '5. Tư vấn AI (SSE) & Handoff',
    summary: 'Gửi tin nhắn & nhận phản hồi Streaming SSE từ Trợ lý AI',
    description:
      'Nếu phiên đang ở chế độ `AI`, mở luồng `text/event-stream` phát các sự kiện `start`, `text_delta`, `widget` (`laptop_cards`, `laptop_spec`, `address_form`, `handoff_notice`), `done` hoặc `error`. Nếu phiên đang chờ/được nhân viên thật hỗ trợ (`AGENT` / `needs_human`), trả về `202 Accepted` JSON chuyển tiếp tin nhắn cho Admin. Đảm bảo idempotency theo `client_message_id`.',
    auth: 'GUEST',
    rateLimit: '10 tin / phút / session; 30 tin / phút / IP; tối đa 10 luồng AI đồng thời',
    isSse: true,
    responseContentType: 'text/event-stream',
    requestExample: {
      client_message_id: SAMPLE_UUID,
      message: 'Tư vấn giúp mình laptop lập trình RAM 16GB tầm giá dưới 20 triệu còn hàng nhé!'
    },
    errorStatuses: [400, 401, 403, 409, 429, 503]
  },
  'POST /api/v1/chat/request-human': {
    tag: '5. Tư vấn AI (SSE) & Handoff',
    summary: 'Yêu cầu gặp tư vấn viên con người (HITL Handoff)',
    description:
      'Đặt cờ `needs_human = true`, tăng `control_version` nguyên tử và ngắt ngay lập tức mọi luồng AI đang stream dở (`control-gate.ts`) để chuyển hội thoại vào hàng đợi Live Chat của Admin.',
    auth: 'GUEST',
    requestExample: {
      expected_control_version: 1
    },
    errorStatuses: [400, 401, 403, 409]
  },
  'POST /api/v1/chat/resume-ai': {
    tag: '5. Tư vấn AI (SSE) & Handoff',
    summary: 'Quay lại chế độ tư vấn tự động với AI',
    description:
      'Huỷ trạng thái chờ nhân viên hoặc kết thúc hỗ trợ thủ công để khôi phục `control_mode = AI` (kiểm tra `expected_control_version` chống xung đột).',
    auth: 'GUEST',
    requestExample: {
      expected_control_version: 2
    },
    errorStatuses: [400, 401, 403, 409]
  },

  // 6. Admin Auth & Dashboard
  'POST /api/v1/admin/login': {
    tag: '6. Admin — Xác thực & Dashboard',
    summary: 'Đăng nhập cổng quản trị (Admin Console)',
    description:
      'Xác thực tài khoản nhân sự (`STAFF` hoặc `SUPER_ADMIN`), phát hành cookie phiên `lapbot_admin` (`HttpOnly; SameSite=Lax; Secure`).',
    auth: 'PUBLIC',
    rateLimit: '5 lượt / 15 phút / IP',
    requestExample: {
      username: 'admin',
      password: 'your-admin-password'
    },
    errorStatuses: [400, 401, 403, 429]
  },
  'POST /api/v1/admin/logout': {
    tag: '6. Admin — Xác thực & Dashboard',
    summary: 'Đăng xuất quản trị viên',
    description: 'Xoá phiên quản trị trong cơ sở dữ liệu và thu hồi cookie `lapbot_admin`.',
    auth: 'ADMIN_STAFF',
    requestExample: {},
    errorStatuses: [401, 403]
  },
  'GET /api/v1/admin/me': {
    tag: '6. Admin — Xác thực & Dashboard',
    summary: 'Kiểm tra phiên & vai trò quản trị viên hiện tại',
    description:
      'Trả về thông tin định danh và phân quyền (`STAFF` / `SUPER_ADMIN`) của nhân sự đang đăng nhập.',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },
  'POST /api/v1/admin/me/password': {
    tag: '6. Admin — Xác thực & Dashboard',
    summary: 'Nhân sự tự đổi mật khẩu cá nhân',
    description: 'Xác minh mật khẩu cũ và cập nhật mật khẩu mới cho quản trị viên hiện tại.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      old_password: 'current-password-123',
      new_password: 'new-strong-password-456'
    },
    errorStatuses: [400, 401, 403]
  },
  'GET /api/v1/admin/dashboard': {
    tag: '6. Admin — Xác thực & Dashboard',
    summary: 'Tổng hợp chỉ số KPI vận hành (Admin Dashboard)',
    description:
      'Trả về thống kê doanh thu COD, số lượng đơn theo trạng thái, cảnh báo biến thể sắp hết hàng, số phiên chat đang chờ nhân viên và đơn hàng mới nhất.',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },

  // 7. Admin Catalog & Images
  'GET /api/v1/admin/catalog/meta': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Lấy thống kê tổng quan & danh sách thương hiệu Catalog',
    description:
      'Trả về tổng số dòng máy, biến thể, số SKU hết hàng/sắp hết hàng và danh sách các thương hiệu hiện có để phục vụ bộ lọc quản trị.',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },
  'GET /api/v1/admin/catalog/laptops': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Danh sách dòng máy Laptop (Admin)',
    description:
      'Liệt kê toàn bộ dòng máy (kể cả dòng máy đang ẩn `is_active = false`) kèm tìm kiếm, lọc theo hãng, phân khúc, tồn kho và sắp xếp.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'q',
        description: 'Tìm kiếm theo tên dòng máy hoặc hãng.',
        schema: { type: 'string' }
      },
      { name: 'brand', description: 'Lọc theo thương hiệu.', schema: { type: 'string' } },
      {
        name: 'usage_category',
        description: 'Lọc theo phân khúc.',
        schema: { type: 'string', enum: [...usageCategories] }
      },
      {
        name: 'is_active',
        description: 'Trạng thái hiển thị (`true` / `false`).',
        schema: { type: 'string', enum: ['true', 'false'] }
      },
      {
        name: 'stock_filter',
        description: 'Bộ lọc mức tồn kho.',
        schema: { type: 'string', enum: [...adminStockFilters] }
      },
      {
        name: 'sort',
        description: 'Thứ tự sắp xếp.',
        schema: { type: 'string', enum: [...adminCatalogSorts] }
      },
      {
        name: 'limit',
        description: 'Số dòng mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      {
        name: 'offset',
        description: 'Vị trí phân trang offset.',
        schema: { type: 'integer', minimum: 0 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  },
  'POST /api/v1/admin/catalog/laptops': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Tạo mới dòng máy Laptop',
    description: 'Thêm một dòng sản phẩm mới vào bảng `laptops` và ghi nhật ký kiểm toán.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      brand: 'ASUS',
      model_name: 'ASUS Zenbook 14 OLED UX3405',
      description: 'Ultrabook mỏng nhẹ màn hình OLED 3K 120Hz',
      warranty_months: 24,
      is_active: true
    },
    errorStatuses: [400, 401, 403]
  },
  'PATCH /api/v1/admin/catalog/laptops/:id': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Cập nhật dòng máy Laptop (Optimistic Locking)',
    description:
      'Cập nhật thông tin dòng máy với kiểm tra `expected_revision` nhằm ngăn hai nhân viên ghi đè dữ liệu của nhau (`409 REVISION_CONFLICT`).',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID dòng máy laptop.' },
    requestExample: {
      expected_revision: 1,
      warranty_months: 24,
      is_active: true
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'DELETE /api/v1/admin/catalog/laptops/:id': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Xoá hoặc lưu trữ an toàn dòng máy Laptop',
    description:
      'Xoá cứng nếu dòng máy chưa phát sinh đơn hàng; tự động chuyển sang lưu trữ ẩn (`archived`) nếu đã có lịch sử đơn hàng liên kết để bảo toàn dữ liệu kế toán.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID dòng máy laptop.' },
    errorStatuses: [401, 403, 404]
  },
  'PUT /api/v1/admin/catalog/laptops/:id/images': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Cập nhật bộ sưu tập ảnh cho dòng máy',
    description:
      'Thay thế danh sách ảnh sản phẩm (tối đa 20 ảnh kèm chú thích) và đồng bộ ảnh đại diện chính của dòng máy.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID dòng máy laptop.' },
    requestExample: {
      images: [
        {
          image_url: '/api/v1/catalog/uploads/00000000-0000-4000-8000-000000000001.webp',
          caption: 'Mặt trước màn hình OLED'
        }
      ]
    },
    errorStatuses: [400, 401, 403, 404]
  },
  'GET /api/v1/admin/catalog/variants': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Danh sách biến thể SKU & Tồn kho (Admin)',
    description:
      'Liệt kê chi tiết các cấu hình biến thể SKU kèm giá bán, số lượng tồn kho thực tế, trạng thái xác minh kho và phân trang.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'q',
        description: 'Tìm kiếm theo SKU, tên máy, CPU, GPU.',
        schema: { type: 'string' }
      },
      {
        name: 'laptop_id',
        description: 'Lọc theo UUID dòng máy mẹ.',
        schema: { type: 'string', format: 'uuid' }
      },
      { name: 'brand', description: 'Lọc theo thương hiệu.', schema: { type: 'string' } },
      {
        name: 'usage_category',
        description: 'Lọc theo phân khúc.',
        schema: { type: 'string', enum: [...usageCategories] }
      },
      {
        name: 'stock_filter',
        description:
          'Lọc trạng thái tồn kho (`in_stock`, `low_stock`, `out_of_stock`, `unverified`).',
        schema: { type: 'string', enum: [...adminStockFilters] }
      },
      {
        name: 'is_active',
        description: 'Lọc trạng thái mở bán (`true` / `false`).',
        schema: { type: 'string', enum: ['true', 'false'] }
      },
      {
        name: 'sort',
        description: 'Thứ tự sắp xếp.',
        schema: { type: 'string', enum: [...adminCatalogSorts] }
      },
      {
        name: 'limit',
        description: 'Số bản ghi mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      {
        name: 'offset',
        description: 'Vị trí bắt đầu phân trang offset.',
        schema: { type: 'integer', minimum: 0 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  },
  'POST /api/v1/admin/catalog/variants': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Tạo mới biến thể cấu hình SKU',
    description: 'Thêm một cấu hình phần cứng (SKU) gắn với dòng máy `laptop_id` đã chọn.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      laptop_id: SAMPLE_UUID,
      sku: 'ASUS-UX3405-U7-16-512',
      cpu: 'Intel Core Ultra 7 155H',
      gpu: 'Intel Arc Graphics',
      ram_gb: 16,
      ssd_gb: 512,
      screen: '14" 3K OLED 120Hz',
      color: 'Ponder Blue',
      usage_category: 'business_ultrabook',
      price_vnd: 27990000,
      stock: 10,
      stock_verified: true,
      is_active: true
    },
    errorStatuses: [400, 401, 403, 409]
  },
  'PATCH /api/v1/admin/catalog/variants/:id': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Cập nhật giá bán, cấu hình hoặc tồn kho biến thể SKU',
    description:
      'Chỉnh sửa biến thể với cơ chế kiểm tra `expected_revision` chống ghi đè đồng thời và tự động làm mới bộ nhớ đệm thương hiệu công khai.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID biến thể SKU.' },
    requestExample: {
      expected_revision: 1,
      price_vnd: 26990000,
      stock: 12,
      stock_verified: true
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'DELETE /api/v1/admin/catalog/variants/:id': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Xoá hoặc lưu trữ ẩn biến thể SKU',
    description:
      'Xoá cứng biến thể nếu chưa từng có đơn hàng; chuyển sang ẩn (`is_active = false`) nếu đã phát sinh đơn hàng.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID biến thể SKU.' },
    errorStatuses: [401, 403, 404]
  },
  'POST /api/v1/admin/catalog/variants/bulk-patch': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Cập nhật hàng loạt biến thể SKU (Bulk Action)',
    description:
      'Áp dụng thao tác hàng loạt trên tối đa 100 biến thể trong 1 giao dịch (bật/tắt mở bán, xác minh kho, đặt tồn kho hoặc điều chỉnh giá bán).',
    auth: 'ADMIN_STAFF',
    requestExample: {
      variant_ids: [SAMPLE_UUID],
      action: 'verify_stock'
    },
    errorStatuses: [400, 401, 403]
  },
  'POST /api/v1/admin/catalog/images/upload': {
    tag: '7. Admin — Catalog & Hình ảnh',
    summary: 'Tải ảnh sản phẩm mới lên máy chủ (Base64 Binary Validation)',
    description:
      'Nhận dữ liệu ảnh mã hoá Base64 (giới hạn body 6MB), kiểm tra chữ ký byte thực tế (magic bytes JPEG/PNG/WebP) và lưu tệp bất biến vào `data/uploads`.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      filename: 'laptop-front.webp',
      mime_type: 'image/webp',
      data_base64: 'UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
    },
    errorStatuses: [400, 401, 403]
  },

  // 8. Admin Orders
  'GET /api/v1/admin/orders': {
    tag: '8. Admin — Đơn hàng COD',
    summary: 'Danh sách & tra cứu đơn hàng toàn hệ thống',
    description:
      'Liệt kê đơn hàng COD kèm bộ lọc theo trạng thái, khoảng ngày tạo và tìm kiếm theo mã đơn, tên khách hoặc số điện thoại.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'status',
        description: 'Lọc theo trạng thái đơn hàng.',
        schema: { type: 'string', enum: [...orderStatuses] }
      },
      {
        name: 'q',
        description: 'Từ khoá tìm mã đơn, tên người nhận hoặc SĐT.',
        schema: { type: 'string', maxLength: 160 }
      },
      { name: 'from', description: 'Từ ngày (ISO YYYY-MM-DD).', schema: { type: 'string' } },
      { name: 'to', description: 'Đến ngày (ISO YYYY-MM-DD).', schema: { type: 'string' } },
      {
        name: 'limit',
        description: 'Số đơn mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  },
  'GET /api/v1/admin/orders/:id': {
    tag: '8. Admin — Đơn hàng COD',
    summary: 'Chi tiết đơn hàng & nhật ký chuyển trạng thái (Admin)',
    description:
      'Xem toàn bộ thông tin đơn hàng COD, thông tin khách nhận, biến thể đã mua và dòng thời gian chuyển trạng thái (`events`).',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID đơn hàng.' },
    errorStatuses: [401, 404]
  },
  'POST /api/v1/admin/orders/:id/transition': {
    tag: '8. Admin — Đơn hàng COD',
    summary: 'Chuyển trạng thái vận hành đơn hàng COD',
    description:
      'Chuyển trạng thái đơn theo máy trạng thái hợp lệ (`CONFIRMED -> PACKING -> SHIPPING -> DELIVERED` hoặc `CANCELLED`) với kiểm tra `from_status`. Tự động hoàn kho đúng 1 lần nếu chuyển sang `CANCELLED`.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID đơn hàng.' },
    requestExample: {
      from_status: 'CONFIRMED',
      to_status: 'PACKING',
      note: 'Đã kiểm tra ngoại quan và đóng gói chống sốc'
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },

  // 9. Admin Live Chat (HITL)
  'GET /api/v1/admin/chat/sessions': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Danh sách phiên hội thoại & hàng đợi cần nhân viên hỗ trợ',
    description:
      'Liệt kê các phiên chat của khách hàng, ưu tiên phiên có `needs_human = true` để tư vấn viên tiếp nhận kịp thời.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'needs_human',
        description: 'Lọc phiên đang yêu cầu gặp nhân viên (`true` / `false`).',
        schema: { type: 'string', enum: ['true', 'false'] }
      },
      {
        name: 'mode',
        description: 'Lọc theo chế độ phiên (`WAITING`, `AGENT`, `AI`).',
        schema: { type: 'string', enum: ['WAITING', 'AGENT', 'AI'] }
      },
      {
        name: 'q',
        description: 'Tìm theo tên khách, email, SĐT hoặc nội dung.',
        schema: { type: 'string' }
      },
      {
        name: 'limit',
        description: 'Số phiên mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  },
  'GET /api/v1/admin/chat/:id/messages': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Xem toàn bộ lịch sử tin nhắn của một phiên Chat',
    description:
      'Tải lịch sử trao đổi giữa khách hàng, AI và tư vấn viên kèm thông tin phiên và ngữ cảnh bán hàng hiện tại.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID phiên chat.' },
    queryParams: [
      {
        name: 'after_id',
        description: 'Lấy tin nhắn mới hơn ID chỉ định.',
        schema: { type: 'string' }
      },
      {
        name: 'before_id',
        description: 'Lấy tin nhắn cũ hơn ID chỉ định.',
        schema: { type: 'string' }
      },
      {
        name: 'limit',
        description: 'Số tin nhắn tối đa (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100 }
      }
    ],
    errorStatuses: [400, 401, 404]
  },
  'POST /api/v1/admin/chat/:id/claim': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Tiếp nhận hỗ trợ phiên Chat (Claim Conversation)',
    description:
      'Chuyển `control_mode` sang `AGENT`, gán phiên cho nhân viên hiện tại, tăng `control_version` và ngắt ngay lập tức mọi luồng AI đang chạy trên phiên đó.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID phiên chat.' },
    requestExample: {
      expected_control_version: 1
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'POST /api/v1/admin/chat/:id/release': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Trả phiên hội thoại về cho Trợ lý AI (Release Conversation)',
    description:
      'Kết thúc phiên hỗ trợ thủ công của nhân viên và chuyển `control_mode` trở về `AI` với kiểm tra `expected_control_version`.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID phiên chat.' },
    requestExample: {
      expected_control_version: 2
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'POST /api/v1/admin/chat/:id/messages': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Tư vấn viên gửi tin nhắn & đính kèm thẻ sản phẩm / form đặt hàng',
    description:
      'Gửi tin nhắn phản hồi trực tiếp tới khách hàng khi phiên đang ở chế độ `AGENT`; hỗ trợ đính kèm widget `laptop_spec` hoặc `address_form` để khách chốt đơn 1 chạm.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID phiên chat.' },
    requestExample: {
      client_message_id: SAMPLE_UUID,
      message: 'Dạ mẫu HP Probook này hiện bên em đang sẵn hàng giao ngay trong ngày ạ!',
      attach_variant_id: '258bfce4-7cdb-4e9f-9e8d-3d3d256a354f',
      widget_type: 'laptop_spec'
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'DELETE /api/v1/admin/chat/:id': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Xoá một phiên hội thoại rỗng / đã kết thúc',
    description:
      'Dọn dẹp một phiên chat cụ thể (tự động gỡ tham chiếu an toàn nếu phiên từng có đơn hàng).',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID phiên chat.' },
    errorStatuses: [401, 403, 404]
  },
  'POST /api/v1/admin/chat/cleanup': {
    tag: '9. Admin — Live Chat HITL',
    summary: 'Dọn dẹp hàng loạt các phiên Chat rác / hết hạn',
    description:
      'Xoá hàng loạt các phiên khách rỗng không có tin nhắn hoặc đã hết hạn theo phạm vi `scope` được chọn.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      scope: 'empty_only'
    },
    errorStatuses: [400, 401, 403]
  },

  // 10. Admin Customers & Staff
  'GET /api/v1/admin/customers': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Danh sách khách hàng thành viên & chỉ số chi tiêu CRM',
    description:
      'Tra cứu danh sách thành viên kèm tổng số đơn hàng, tổng chi tiêu luỹ kế (LTV), nhãn phân loại (`VIP`, `REGULAR`, `NEW`, `RISK`) và trạng thái tài khoản.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'q',
        description: 'Tìm kiếm theo họ tên, email hoặc số điện thoại.',
        schema: { type: 'string' }
      },
      {
        name: 'is_active',
        description: 'Lọc trạng thái hoạt động (`true` / `false`).',
        schema: { type: 'string', enum: ['true', 'false'] }
      },
      {
        name: 'customer_tag',
        description: 'Lọc theo phân nhóm CRM.',
        schema: { type: 'string', enum: [...customerTags] }
      },
      {
        name: 'sort',
        description: 'Thứ tự sắp xếp khách hàng.',
        schema: { type: 'string', enum: [...customerSorts] }
      },
      {
        name: 'limit',
        description: 'Số bản ghi mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      {
        name: 'offset',
        description: 'Vị trí phân trang offset.',
        schema: { type: 'integer', minimum: 0 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  },
  'POST /api/v1/admin/customers': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Admin tạo mới tài khoản khách hàng thành viên',
    description:
      'Khởi tạo hồ sơ thành viên trực tiếp từ quầy/tổng đài và tuỳ chọn tự động gom các đơn hàng vãng lai cùng số điện thoại (`link_guest_orders`).',
    auth: 'ADMIN_STAFF',
    requestExample: {
      email: 'vip.customer@example.com',
      password: 'CustomerPass123!',
      full_name: 'Lê Hoàng Nam',
      phone: '0987654321',
      customer_tag: 'VIP',
      link_guest_orders: true
    },
    errorStatuses: [400, 401, 403, 409]
  },
  'GET /api/v1/admin/customers/guests': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Thống kê người mua vãng lai theo số điện thoại (Guest Buyers)',
    description:
      'Tổng hợp các khách mua COD chưa đăng ký tài khoản (nhóm theo SĐT) để chăm sóc khách hàng hoặc nâng cấp lên thành viên.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      { name: 'q', description: 'Tìm theo tên người nhận hoặc SĐT.', schema: { type: 'string' } },
      {
        name: 'filter',
        description: 'Bộ lọc tệp khách vãng lai.',
        schema: { type: 'string', enum: [...guestBuyerFilters] }
      },
      {
        name: 'sort',
        description: 'Thứ tự sắp xếp.',
        schema: { type: 'string', enum: [...customerSorts] }
      },
      {
        name: 'limit',
        description: 'Số dòng mỗi trang.',
        schema: { type: 'integer', minimum: 1, maximum: 100 }
      },
      {
        name: 'offset',
        description: 'Vị trí phân trang offset.',
        schema: { type: 'integer', minimum: 0 }
      }
    ],
    errorStatuses: [400, 401]
  },
  'POST /api/v1/admin/customers/guests/promote': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Nâng cấp khách mua vãng lai thành tài khoản thành viên',
    description:
      'Tạo tài khoản thành viên từ hồ sơ SĐT khách vãng lai và tự động liên kết toàn bộ lịch sử đơn hàng COD trước đó vào tài khoản mới.',
    auth: 'ADMIN_STAFF',
    requestExample: {
      phone: '0912345678',
      email: 'khoi.tran@example.com',
      password: 'MemberPass123!',
      full_name: 'Trần Minh Khôi',
      customer_tag: 'REGULAR'
    },
    errorStatuses: [400, 401, 403, 409]
  },
  'GET /api/v1/admin/customers/:id': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Hồ sơ 360 độ của khách hàng thành viên',
    description:
      'Xem thông tin chi tiết khách hàng, chỉ số mua sắm, ghi chú nội bộ CRM, danh sách đơn hàng gần đây và các phiên hội thoại liên quan.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID khách hàng.' },
    errorStatuses: [401, 404]
  },
  'PATCH /api/v1/admin/customers/:id': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Cập nhật hồ sơ, thẻ CRM, khoá tài khoản hoặc đặt lại mật khẩu khách',
    description:
      'Cho phép Admin cập nhật thông tin khách hàng, gắn nhãn CRM, ghi chú nội bộ, khoá/mở khoá tài khoản (tự thu hồi phiên nếu khoá) hoặc cấp lại mật khẩu mới.',
    auth: 'ADMIN_STAFF',
    pathParamDescriptions: { id: 'UUID khách hàng.' },
    requestExample: {
      customer_tag: 'VIP',
      admin_note: 'Khách doanh nghiệp mua định kỳ cho phòng kỹ thuật'
    },
    errorStatuses: [400, 401, 403, 404, 409]
  },
  'GET /api/v1/admin/staff': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Danh sách tài khoản nhân sự quản trị',
    description:
      'Liệt kê danh sách nhân viên (`STAFF`) và quản trị viên cấp cao (`SUPER_ADMIN`) cùng trạng thái hoạt động và số phiên đang mở.',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },
  'POST /api/v1/admin/staff': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Tạo tài khoản nhân sự mới (Chỉ SUPER_ADMIN)',
    description:
      'Cấp mới tài khoản quản trị nội bộ với vai trò `STAFF` hoặc `SUPER_ADMIN` và ghi nhận vào Audit Log.',
    auth: 'SUPER_ADMIN',
    requestExample: {
      username: 'tuvanvien01',
      display_name: 'Phạm Thu Hà — Tư vấn viên',
      password: 'StaffStrongPassword123!',
      role: 'STAFF'
    },
    errorStatuses: [400, 401, 403, 409]
  },
  'PATCH /api/v1/admin/staff/:id': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Cập nhật quyền hạn, trạng thái hoặc mật khẩu nhân sự (Chỉ SUPER_ADMIN)',
    description:
      'Điều chỉnh thông tin nhân sự; ngăn chặn tự khoá hoặc hạ quyền `SUPER_ADMIN` hoạt động cuối cùng của hệ thống.',
    auth: 'SUPER_ADMIN',
    pathParamDescriptions: { id: 'UUID nhân sự.' },
    requestExample: {
      display_name: 'Phạm Thu Hà — Trưởng ca',
      is_active: true
    },
    errorStatuses: [400, 401, 403, 404]
  },
  'POST /api/v1/admin/staff/:id/revoke-sessions': {
    tag: '10. Admin — Khách hàng CRM & Nhân sự',
    summary: 'Đăng xuất cưỡng bức toàn bộ phiên của một nhân sự (Chỉ SUPER_ADMIN)',
    description:
      'Thu hồi ngay lập tức mọi phiên đăng nhập đang hoạt động của nhân sự được chỉ định.',
    auth: 'SUPER_ADMIN',
    pathParamDescriptions: { id: 'UUID nhân sự.' },
    requestExample: {},
    errorStatuses: [401, 403, 404]
  },

  // 11. Admin AI, Settings & Audit
  'GET /api/v1/admin/ai/config': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Xem cấu hình Runtime Trợ lý AI & danh sách Tool an toàn',
    description:
      'Trả về trạng thái bật/tắt AI, model đang kích hoạt, hướng dẫn hệ thống bổ sung (custom instructions), giới hạn token/timeout và danh sách 5 tool chỉ đọc.',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },
  'PATCH /api/v1/admin/ai/config': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Cập nhật cấu hình Runtime Trợ lý AI (Chỉ SUPER_ADMIN)',
    description:
      'Thay đổi nóng (hot-reload) cấu hình AI ngay trong cơ sở dữ liệu mà không cần khởi động lại container backend.',
    auth: 'SUPER_ADMIN',
    requestExample: {
      ai_enabled_override: true,
      welcome_message:
        'Xin chào! Mình là LapBot — trợ lý chọn laptop theo đúng nhu cầu và ngân sách của bạn.',
      max_tokens_per_call: 1024,
      turn_timeout_ms: 45000
    },
    errorStatuses: [400, 401, 403]
  },
  'POST /api/v1/admin/ai/test': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Kiểm tra kết nối & độ trễ LLM Gateway (Chỉ SUPER_ADMIN)',
    description:
      'Gửi một câu lệnh kiểm thử tới LLM Gateway với model chỉ định để đo độ trễ phản hồi (ms) và xác minh API key hoạt động tốt.',
    auth: 'SUPER_ADMIN',
    requestExample: {
      model: 'claude-haiku-5-5',
      test_prompt: 'Chào bạn, hãy giới thiệu ngắn gọn 1 câu về vai trò tư vấn laptop của bạn.'
    },
    errorStatuses: [400, 401, 403, 502]
  },
  'GET /api/v1/admin/settings': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Xem cấu hình thông tin & chính sách cửa hàng',
    description:
      'Đọc cấu hình vận hành cửa hàng (tên thương hiệu, phí ship COD, chính sách bảo hành/đổi trả, giờ hỗ trợ, kênh liên hệ).',
    auth: 'ADMIN_STAFF',
    errorStatuses: [401]
  },
  'PATCH /api/v1/admin/settings': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Cập nhật thông tin & phí vận chuyển cửa hàng (Chỉ SUPER_ADMIN)',
    description:
      'Lưu cấu hình cửa hàng mới vào PostgreSQL và ghi nhận thay đổi vào bảng `audit_events`.',
    auth: 'SUPER_ADMIN',
    requestExample: {
      store_name: 'LapBot Official Store',
      shipping_fee_vnd: 0,
      support_hours: '08:00 – 22:00 mỗi ngày'
    },
    errorStatuses: [400, 401, 403]
  },
  'GET /api/v1/admin/audit': {
    tag: '11. Admin — Cấu hình AI & Audit',
    summary: 'Tra cứu Nhật ký Kiểm toán Hệ thống (Audit Trail)',
    description:
      'Truy xuất lịch sử bất biến mọi thao tác quản trị (cập nhật giá/kho, duyệt đơn, đổi cấu hình AI, phân quyền nhân sự) kèm bộ lọc chi tiết.',
    auth: 'ADMIN_STAFF',
    queryParams: [
      {
        name: 'action',
        description: 'Lọc theo mã hành động (VD: `ORDER_TRANSITION`, `CATALOG_PATCH`).',
        schema: { type: 'string' }
      },
      {
        name: 'entity_type',
        description: 'Lọc theo loại thực thể (`order`, `laptop`, `variant`, `staff`...).',
        schema: { type: 'string' }
      },
      {
        name: 'actor_type',
        description: 'Lọc theo loại tác nhân (`ADMIN`, `CUSTOMER`, `SYSTEM`).',
        schema: { type: 'string' }
      },
      { name: 'q', description: 'Tìm kiếm tự do trong nhật ký.', schema: { type: 'string' } },
      { name: 'from', description: 'Từ ngày (YYYY-MM-DD).', schema: { type: 'string' } },
      { name: 'to', description: 'Đến ngày (YYYY-MM-DD).', schema: { type: 'string' } },
      {
        name: 'limit',
        description: 'Số sự kiện mỗi trang (mặc định 20, tối đa 100).',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
      },
      { name: 'cursor', description: 'Con trỏ phân trang.', schema: { type: 'string' } }
    ],
    errorStatuses: [400, 401]
  }
};

const HTTP_ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Dữ liệu đầu vào hoặc tham số truy vấn không hợp lệ (`VALIDATION_ERROR`, `INVALID_QUERY`, `INVALID_CONTENT_TYPE`).',
  401: 'Chưa xác thực hoặc phiên đăng nhập đã hết hạn (`UNAUTHORIZED`, `SESSION_REQUIRED`).',
  403: 'Không đủ quyền truy cập hoặc sai header `Origin` chống CSRF (`FORBIDDEN`, `INVALID_ORIGIN`).',
  404: 'Không tìm thấy tài nguyên yêu cầu (`NOT_FOUND`).',
  409: 'Xung đột trạng thái giao dịch, hết hàng, hết hạn báo giá hoặc lệch phiên bản khoá lạc quan (`CONFLICT`, `OUT_OF_STOCK`, `QUOTE_EXPIRED`, `REVISION_CONFLICT`).',
  429: 'Vượt quá giới hạn tần suất gọi API (`RATE_LIMITED`).',
  502: 'Lỗi kết nối tới dịch vụ LLM Gateway bên ngoài (`UPSTREAM_ERROR`).',
  503: 'Dịch vụ tạm thời bận hoặc cơ sở dữ liệu chưa sẵn sàng (`AI_BUSY`, `AI_DISABLED`, `SERVICE_UNAVAILABLE`).'
};

/**
 * Chuyển đổi JSON Schema của Fastify/Ajv sang OpenAPI 3.0.3 Schema Object chuẩn
 * (ví dụ: `type: ['string', 'null']` -> `type: 'string', nullable: true`).
 */
export function toOpenApiSchema(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return { type: 'object' };
  }
  if (Array.isArray(input)) {
    return { type: 'array', items: input[0] ? toOpenApiSchema(input[0]) : {} };
  }

  const raw = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === 'type' && Array.isArray(value)) {
      const nonNull = value.filter(t => t !== 'null');
      if (value.includes('null')) {
        result.nullable = true;
      }
      if (nonNull.length === 1) {
        result.type = nonNull[0];
      } else if (nonNull.length > 1) {
        result.oneOf = nonNull.map(t => ({ type: t }));
      }
      continue;
    }

    if (key === 'properties' && value && typeof value === 'object') {
      const props: Record<string, unknown> = {};
      for (const [propName, propSchema] of Object.entries(value as Record<string, unknown>)) {
        props[propName] = toOpenApiSchema(propSchema);
      }
      result.properties = props;
      continue;
    }

    if (key === 'items' && value && typeof value === 'object') {
      result.items = toOpenApiSchema(value);
      continue;
    }

    if ((key === 'anyOf' || key === 'oneOf' || key === 'allOf') && Array.isArray(value)) {
      result[key] = value.map(item => toOpenApiSchema(item));
      continue;
    }

    if (key === 'additionalProperties' && value && typeof value === 'object') {
      result.additionalProperties = toOpenApiSchema(value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function toOpenApiPath(fastifyUrl: string): string {
  return fastifyUrl.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
}

function extractPathParamNames(fastifyUrl: string): string[] {
  const names: string[] = [];
  const regex = /:([a-zA-Z0-9_]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(fastifyUrl)) !== null) {
    if (match[1]) names.push(match[1]);
  }
  return names;
}

function securityForAuth(auth: ApiAuthLevel): Array<Record<string, string[]>> {
  switch (auth) {
    case 'PUBLIC':
      return [];
    case 'GUEST':
      return [{ GuestSessionCookie: [] }];
    case 'CUSTOMER':
      return [{ CustomerSessionCookie: [] }];
    case 'GUEST_OR_CUSTOMER':
      return [{ GuestSessionCookie: [] }, { CustomerSessionCookie: [] }];
    case 'ADMIN_STAFF':
    case 'SUPER_ADMIN':
      return [{ AdminSessionCookie: [] }];
  }
}

export function buildOpenApiDocument(routes: CapturedRoute[]) {
  const paths: Record<string, Record<string, unknown>> = {};

  const sortedRoutes = [...routes].sort((a, b) => a.url.localeCompare(b.url));

  for (const route of sortedRoutes) {
    const methodUpper = route.method.toUpperCase();
    if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(methodUpper)) continue;
    if (!route.url.startsWith('/api/v1/')) continue;

    const key = `${methodUpper} ${route.url}`;
    const meta: EndpointMeta = ENDPOINT_METADATA[key] ?? {
      tag: route.url.startsWith('/api/v1/admin')
        ? '6. Admin — Xác thực & Dashboard'
        : '2. Catalog & Cửa hàng',
      summary: `${methodUpper} ${route.url}`,
      description: `Endpoint ${methodUpper} ${route.url}.`,
      auth: route.url.startsWith('/api/v1/admin') ? 'ADMIN_STAFF' : 'PUBLIC',
      errorStatuses: [400, 401, 403]
    };

    const openApiPath = toOpenApiPath(route.url);
    if (!paths[openApiPath]) paths[openApiPath] = {};

    const parameters: Array<Record<string, unknown>> = [];

    // 1. Path parameters
    const pathParamNames = extractPathParamNames(route.url);
    const schemaParamsProps =
      route.schema?.params &&
      typeof route.schema.params === 'object' &&
      'properties' in route.schema.params
        ? ((route.schema.params as { properties?: Record<string, unknown> }).properties ?? {})
        : {};

    for (const paramName of pathParamNames) {
      const fromSchema = schemaParamsProps[paramName]
        ? toOpenApiSchema(schemaParamsProps[paramName])
        : paramName.includes('id')
          ? { type: 'string', format: 'uuid' }
          : { type: 'string' };

      parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        description:
          meta.pathParamDescriptions?.[paramName] ?? `Tham số đường dẫn \`${paramName}\`.`,
        schema: fromSchema
      });
    }

    // 2. Query parameters
    if (meta.queryParams?.length) {
      for (const qp of meta.queryParams) {
        parameters.push({
          name: qp.name,
          in: 'query',
          required: Boolean(qp.required),
          description: qp.description,
          schema: qp.schema
        });
      }
    } else if (
      route.schema?.querystring &&
      typeof route.schema.querystring === 'object' &&
      'properties' in route.schema.querystring
    ) {
      const qObj = route.schema.querystring as {
        required?: string[];
        properties?: Record<string, unknown>;
      };
      const reqSet = new Set(qObj.required ?? []);
      for (const [qName, qSchema] of Object.entries(qObj.properties ?? {})) {
        parameters.push({
          name: qName,
          in: 'query',
          required: reqSet.has(qName),
          schema: toOpenApiSchema(qSchema)
        });
      }
    }

    // 3. Request body
    const isMutation = ['POST', 'PATCH', 'PUT'].includes(methodUpper);
    let requestBody: Record<string, unknown> | undefined;
    if (route.schema?.body) {
      const convertedBodySchema = toOpenApiSchema(route.schema.body);
      requestBody = {
        required: true,
        description: isMutation
          ? 'Payload JSON (`Content-Type: application/json`). Bắt buộc gửi kèm header `Origin` khớp `PUBLIC_ORIGIN`.'
          : undefined,
        content: {
          'application/json': {
            schema: convertedBodySchema,
            ...(meta.requestExample !== undefined ? { example: meta.requestExample } : {})
          }
        }
      };
    }

    // 4. Responses
    const responses: Record<string, unknown> = {};
    if (meta.isSse) {
      responses['200'] = {
        description:
          'Luồng sự kiện Server-Sent Events (`text/event-stream`) phát tuần tự các frame `start`, `text_delta`, `widget`, `done` hoặc `error`.',
        content: {
          'text/event-stream': {
            schema: {
              type: 'string',
              description:
                'Định dạng SSE chuẩn: `event: <start|text_delta|widget|done|error>\\ndata: <JSON>\\n\\n`'
            },
            example:
              'event: start\ndata: {"turn_id":"00000000-0000-4000-8000-000000000001"}\n\nevent: text_delta\ndata: {"turn_id":"00000000-0000-4000-8000-000000000001","text":"Dưới đây là các mẫu laptop phù hợp:"}\n\nevent: done\ndata: {"turn_id":"00000000-0000-4000-8000-000000000001","status":"COMPLETED"}\n\n'
          }
        }
      };
      responses['202'] = {
        description:
          'Tin nhắn đã được chuyển tiếp vào hàng đợi tư vấn viên con người khi phiên ở chế độ `AGENT` hoặc `needs_human = true`.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['turn_id', 'status', 'control_mode', 'needs_human'],
              properties: {
                turn_id: { type: 'string', format: 'uuid' },
                status: { type: 'string', enum: ['FORWARDED'] },
                control_mode: { type: 'string', enum: ['AI', 'AGENT'] },
                needs_human: { type: 'boolean' }
              }
            }
          }
        }
      };
    } else if (meta.responseContentType?.startsWith('image/')) {
      responses['200'] = {
        description: 'Nội dung nhị phân của tệp hình ảnh sản phẩm.',
        content: {
          [meta.responseContentType]: {
            schema: { type: 'string', format: 'binary' }
          }
        }
      };
    } else if (route.schema?.response && Object.keys(route.schema.response).length > 0) {
      for (const [statusCode, respSchema] of Object.entries(route.schema.response)) {
        responses[statusCode] = {
          description:
            statusCode === '201' ? 'Khởi tạo tài nguyên thành công.' : 'Thực thi thành công.',
          content: {
            'application/json': {
              schema: toOpenApiSchema(respSchema)
            }
          }
        };
      }
    } else {
      const defaultSuccessSchema =
        route.url === '/api/v1/health'
          ? {
              type: 'object',
              required: ['status'],
              properties: { status: { type: 'string', enum: ['ok'] } }
            }
          : route.url === '/api/v1/health/ready'
            ? {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['ready'] } }
              }
            : {
                type: 'object',
                properties: { ok: { type: 'boolean' } }
              };

      responses['200'] = {
        description: 'Thực thi thành công.',
        content: {
          'application/json': {
            schema: defaultSuccessSchema
          }
        }
      };
    }

    for (const errCode of meta.errorStatuses ?? [400]) {
      const codeStr = String(errCode);
      if (!responses[codeStr]) {
        responses[codeStr] = {
          description: HTTP_ERROR_DESCRIPTIONS[errCode] ?? `Lỗi HTTP ${errCode}.`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorEnvelope' }
            }
          }
        };
      }
    }

    paths[openApiPath][methodUpper.toLowerCase()] = {
      tags: [meta.tag],
      summary: meta.summary,
      description: meta.description,
      operationId: `${methodUpper.toLowerCase()}_${route.url
        .replace(/^\/api\/v1\//, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')}`,
      security: securityForAuth(meta.auth),
      'x-auth-level': meta.auth,
      ...(meta.rateLimit ? { 'x-rate-limit': meta.rateLimit } : {}),
      ...(meta.isSse ? { 'x-sse-stream': true } : {}),
      ...(parameters.length > 0 ? { parameters } : {}),
      ...(requestBody ? { requestBody } : {}),
      responses
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'LapBot — Hệ thống Thương mại Điện tử Laptop & Trợ lý Bán hàng AI (API Specification)',
      version: '1.0.0',
      description:
        'Đặc tả kỹ thuật đầy đủ toàn bộ hệ thống RESTful & SSE Streaming API của LapBot (`/api/v1/*`), được đồng bộ trực tiếp từ JSON Schema runtime (`@lapbot/contracts`). Bao gồm Storefront Catalog, Auth Khách/Thành viên, Giao dịch Đặt hàng COD nguyên tử, Tư vấn AI Streaming (SSE) kèm Human-in-the-Loop Handoff và 7 phân hệ Quản trị Vận hành.'
    },
    servers: [
      {
        url: config.publicOrigin,
        description: 'Máy chủ LapBot hiện hành (Single-Origin Fullstack)'
      }
    ],
    tags: [...TAG_DEFINITIONS],
    components: {
      securitySchemes: {
        GuestSessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'lapbot_guest',
          description:
            'Cookie phiên ẩn danh (`HttpOnly; SameSite=Lax; Secure`), cấp qua `POST /api/v1/chat/session`, thời hạn 30 ngày.'
        },
        CustomerSessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'lapbot_member',
          description:
            'Cookie phiên khách hàng thành viên (`HttpOnly; SameSite=Lax; Secure`), cấp sau khi đăng ký hoặc đăng nhập.'
        },
        AdminSessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'lapbot_admin',
          description:
            'Cookie phiên nhân sự quản trị (`HttpOnly; SameSite=Lax; Secure`), phân quyền `STAFF` và `SUPER_ADMIN`.'
        }
      },
      schemas: {
        ErrorEnvelope: {
          type: 'object',
          additionalProperties: false,
          required: ['error', 'request_id'],
          properties: {
            error: {
              type: 'object',
              additionalProperties: false,
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'string',
                  description:
                    'Mã lỗi định danh máy đọc được (VD: `VALIDATION_ERROR`, `INVALID_ORIGIN`, `OUT_OF_STOCK`, `QUOTE_EXPIRED`).'
                },
                message: {
                  type: 'string',
                  description: 'Thông báo lỗi tiếng Việt hiển thị cho người dùng.'
                },
                field_errors: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  description: 'Chi tiết lỗi theo từng trường dữ liệu (nếu có).'
                }
              }
            },
            request_id: {
              type: 'string',
              format: 'uuid',
              description: 'Mã truy vết request duy nhất trong log máy chủ.'
            }
          }
        }
      }
    },
    paths
  };
}

export function registerOpenApiDocs(app: FastifyInstance) {
  const capturedRoutes: CapturedRoute[] = [];

  app.addHook('onRoute', (routeOptions: RouteOptions) => {
    const methods = Array.isArray(routeOptions.method)
      ? routeOptions.method
      : [routeOptions.method];
    for (const method of methods) {
      if (method === 'HEAD' || method === 'OPTIONS') continue;
      if (!routeOptions.url.startsWith('/api/v1/')) continue;
      capturedRoutes.push({
        method,
        url: routeOptions.url,
        schema: routeOptions.schema as CapturedRoute['schema']
      });
    }
  });

  let cachedDoc: ReturnType<typeof buildOpenApiDocument> | null = null;

  app.get('/api/v1/openapi.json', async (_request, reply) => {
    if (!cachedDoc) {
      cachedDoc = buildOpenApiDocument(capturedRoutes);
    }
    reply.header('Cache-Control', 'no-cache');
    return cachedDoc;
  });
}
