-- 007_auth_and_admin_suite.sql
-- Mở rộng hệ thống: Khách hàng thành viên, Phân quyền Admin (SUPER_ADMIN / STAFF),
-- Cấu hình AI Chatbot & Telemetry, Cấu hình Cửa hàng và Tối ưu hóa Audit Logs.

-- 1. Bảng Khách hàng thành viên & Phiên đăng nhập
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (position('@' in email) > 1 AND length(email) <= 160),
  phone text UNIQUE CHECK (phone IS NULL OR phone ~ '^0[35789][0-9]{8}$'),
  password_hash text NOT NULL,
  full_name text NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  default_shipping_address text NOT NULL DEFAULT '' CHECK (length(default_shipping_address) <= 500),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions(customer_id);

-- Liên kết đơn hàng & phiên chat với tài khoản khách hàng (nullable đối với Guest)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);
CREATE INDEX IF NOT EXISTS chat_sessions_customer_idx ON chat_sessions(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_customer_created_id_idx ON orders(customer_id, created_at DESC, id DESC) WHERE customer_id IS NOT NULL;

-- 2. Mở rộng phân quyền Nhân sự Admin
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'SUPER_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'STAFF')),
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Cấu hình AI Chatbot động & Telemetry lượt chat
CREATE TABLE IF NOT EXISTS ai_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ai_enabled_override boolean,
  active_model text,
  custom_system_instructions text NOT NULL DEFAULT '' CHECK (length(custom_system_instructions) <= 4000),
  welcome_message text NOT NULL DEFAULT 'Xin chào! Mình là trợ lý AI của LapBot. Bạn đang tìm laptop cho nhu cầu gì và tầm ngân sách khoảng bao nhiêu?',
  suggested_prompts jsonb NOT NULL DEFAULT '["Tìm laptop lập trình dưới 25 triệu","Laptop gaming RTX màn 144Hz","MacBook mỏng nhẹ pin trâu","Chính sách bảo hành & giao COD"]'::jsonb,
  max_tokens_per_call integer NOT NULL DEFAULT 600 CHECK (max_tokens_per_call BETWEEN 128 AND 1200),
  turn_timeout_ms integer NOT NULL DEFAULT 30000 CHECK (turn_timeout_ms BETWEEN 10000 AND 60000),
  human_wait_timeout_sec integer NOT NULL DEFAULT 120 CHECK (human_wait_timeout_sec BETWEEN 30 AND 600),
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE chat_turns
  ADD COLUMN IF NOT EXISTS model_used text,
  ADD COLUMN IF NOT EXISTS provider_calls integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tool_calls_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prompt_tokens integer,
  ADD COLUMN IF NOT EXISTS completion_tokens integer,
  ADD COLUMN IF NOT EXISTS latency_ms integer,
  ADD COLUMN IF NOT EXISTS error_code text;

-- 4. Cấu hình Cửa hàng quản trị trực tiếp trên DB
CREATE TABLE IF NOT EXISTS store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'LapBot — Chuyên gia Laptop & Trợ lý AI',
  shipping_fee_vnd integer NOT NULL DEFAULT 0 CHECK (shipping_fee_vnd BETWEEN 0 AND 10000000),
  price_tax_note text NOT NULL DEFAULT 'Giá niêm yết đã bao gồm VAT. Miễn phí kiểm tra phần cứng 15 bước trước khi giao.',
  shipping_scope text NOT NULL DEFAULT 'Giao hàng toàn quốc — Cho phép đồng kiểm ngoại quan và cấu hình máy trước khi thanh toán COD.',
  warranty_policy text NOT NULL DEFAULT 'Bảo hành chính hãng 12 tháng phần cứng, hỗ trợ vệ sinh máy & cài đặt phần mềm trọn đời.',
  return_policy text NOT NULL DEFAULT '1 đổi 1 trong 7 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.',
  support_hours text NOT NULL DEFAULT '08:30 – 21:30 (Thứ 2 – Chủ Nhật)',
  contact_channels jsonb NOT NULL DEFAULT '["Hotline: 1900 6868", "Zalo OA: LapBot Official", "Email: support@lapbot.vn"]'::jsonb,
  policy_links jsonb NOT NULL DEFAULT '["Chính sách bảo hành 12 tháng: Hỗ trợ phần cứng và vệ sinh máy trọn đời", "Quy định đổi trả 7 ngày & Giao hàng COD: Cho phép đồng kiểm máy trước khi thanh toán"]'::jsonb,
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS audit_events_created_id_idx ON audit_events(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx ON audit_events(entity_type, entity_id, created_at DESC);
