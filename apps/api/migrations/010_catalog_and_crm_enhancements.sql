-- 010_catalog_and_crm_enhancements.sql
-- Mở rộng CRM Khách hàng (Nhãn phân loại VIP / Doanh nghiệp / Cảnh báo bom COD + Ghi chú CSKH nội bộ)
-- và bộ chỉ mục tối ưu hiệu năng truy vấn Catalog & Khách vãng lai COD trên PostgreSQL.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS customer_tag text NOT NULL DEFAULT 'STANDARD'
    CHECK (customer_tag IN ('STANDARD', 'VIP', 'CORPORATE', 'WATCHLIST')),
  ADD COLUMN IF NOT EXISTS admin_note text NOT NULL DEFAULT ''
    CHECK (length(admin_note) <= 2000);

CREATE INDEX IF NOT EXISTS laptops_brand_lower_idx
  ON laptops (LOWER(brand));

CREATE INDEX IF NOT EXISTS laptop_variants_admin_filter_idx
  ON laptop_variants (usage_category, is_active, stock_verified, stock);

CREATE INDEX IF NOT EXISTS orders_guest_phone_idx
  ON orders (customer_phone, created_at DESC)
  WHERE customer_id IS NULL;

CREATE INDEX IF NOT EXISTS orders_customer_phone_idx
  ON orders (customer_phone);

CREATE INDEX IF NOT EXISTS customers_tag_created_idx
  ON customers (customer_tag, created_at DESC, id DESC);
