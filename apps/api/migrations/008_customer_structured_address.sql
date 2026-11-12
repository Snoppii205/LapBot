-- 008_customer_structured_address.sql
-- Bổ sung dữ liệu địa chỉ giao hàng có cấu trúc 4 cấp (Tỉnh/Thành, Quận/Huyện, Phường/Xã, Số nhà/Đường & Loại địa chỉ)
-- cho bảng khách hàng thành viên, giữ nguyên default_shipping_address phục vụ biên lai COD & Admin Suite.

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS shipping_address_meta jsonb
  CHECK (shipping_address_meta IS NULL OR jsonb_typeof(shipping_address_meta) = 'object');
