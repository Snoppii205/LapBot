CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid NOT NULL REFERENCES admin_users(id),
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE laptops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), brand text NOT NULL CHECK (length(brand) BETWEEN 1 AND 80),
  model_name text NOT NULL CHECK (length(model_name) BETWEEN 1 AND 160), description text NOT NULL DEFAULT '', image_url text,
  is_active boolean NOT NULL DEFAULT true, revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE laptop_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), laptop_id uuid NOT NULL REFERENCES laptops(id), sku text NOT NULL UNIQUE,
  cpu text NOT NULL, gpu text NOT NULL, ram_gb integer NOT NULL CHECK (ram_gb > 0), ssd_gb integer NOT NULL CHECK (ssd_gb > 0),
  screen text NOT NULL, color text NOT NULL, usage_category text NOT NULL CHECK (usage_category IN ('office_study','gaming','graphic_creator','programming','business_ultrabook')),
  price_vnd integer NOT NULL CHECK (price_vnd BETWEEN 1 AND 1000000000), stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true, revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX laptop_variants_public_price_idx ON laptop_variants(is_active, price_vnd, id);
CREATE INDEX laptop_variants_laptop_idx ON laptop_variants(laptop_id);

CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), guest_token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
  control_mode text NOT NULL DEFAULT 'AI' CHECK (control_mode IN ('AI','AGENT')), control_version integer NOT NULL DEFAULT 1,
  assigned_admin_id uuid REFERENCES admin_users(id), needs_human boolean NOT NULL DEFAULT false, human_requested_at timestamptz,
  sales_context jsonb NOT NULL DEFAULT '{}'::jsonb, active_preview_id uuid, last_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE chat_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES chat_sessions(id), client_message_id uuid NOT NULL,
  request_hash text NOT NULL, generation_version integer, route_control_mode text NOT NULL CHECK (route_control_mode IN ('AI','AGENT')),
  route_needs_human boolean NOT NULL, status text NOT NULL CHECK (status IN ('PROCESSING','COMPLETED','INTERRUPTED','FAILED','FORWARDED')),
  started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
  UNIQUE(session_id, client_message_id)
);
CREATE UNIQUE INDEX chat_turns_one_processing_per_session ON chat_turns(session_id) WHERE status = 'PROCESSING';
CREATE TABLE chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, session_id uuid NOT NULL REFERENCES chat_sessions(id), turn_id uuid REFERENCES chat_turns(id),
  role text NOT NULL CHECK (role IN ('USER','ASSISTANT','AGENT','SYSTEM')), sender_admin_id uuid REFERENCES admin_users(id), content text NOT NULL,
  widgets jsonb NOT NULL DEFAULT '[]'::jsonb, client_message_id uuid, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role = 'AGENT') = (sender_admin_id IS NOT NULL))
);
CREATE UNIQUE INDEX chat_messages_client_id_unique ON chat_messages(session_id, role, client_message_id) WHERE client_message_id IS NOT NULL;
CREATE UNIQUE INDEX chat_messages_turn_role_unique ON chat_messages(turn_id, role) WHERE turn_id IS NOT NULL;
CREATE INDEX chat_messages_session_id_idx ON chat_messages(session_id, id);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_code text NOT NULL UNIQUE,
  session_id uuid NOT NULL REFERENCES chat_sessions(id), client_request_id uuid NOT NULL, request_hash text NOT NULL,
  variant_id uuid NOT NULL REFERENCES laptop_variants(id), product_snapshot jsonb NOT NULL,
  unit_price_vnd integer NOT NULL CHECK (unit_price_vnd BETWEEN 1 AND 1000000000),
  shipping_fee_vnd integer NOT NULL CHECK (shipping_fee_vnd BETWEEN 0 AND 10000000),
  total_vnd integer NOT NULL CHECK (total_vnd = unit_price_vnd + shipping_fee_vnd AND total_vnd <= 2147483647),
  customer_name text NOT NULL, customer_phone text NOT NULL, shipping_address text NOT NULL, note text NOT NULL DEFAULT '',
  status text NOT NULL CHECK (status IN ('PENDING_CONFIRMATION','CONFIRMED_COD','PROCESSING','SHIPPING','DELIVERED','CANCELLED','EXPIRED')),
  quote_expires_at timestamptz NOT NULL, confirmed_at timestamptz, cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, client_request_id)
);
CREATE UNIQUE INDEX orders_one_pending_per_session ON orders(session_id) WHERE status = 'PENDING_CONFIRMATION';
CREATE INDEX orders_session_created_id_idx ON orders(session_id, created_at DESC, id DESC);
CREATE INDEX orders_status_created_id_idx ON orders(status, created_at DESC, id DESC);
ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_active_preview_fk FOREIGN KEY (active_preview_id) REFERENCES orders(id);
ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_last_order_fk FOREIGN KEY (last_order_id) REFERENCES orders(id);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_type text NOT NULL, actor_id uuid, action text NOT NULL,
  entity_type text NOT NULL, entity_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
