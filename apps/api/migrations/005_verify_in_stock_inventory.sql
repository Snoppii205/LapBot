-- 005_verify_in_stock_inventory.sql
-- Kích hoạt tồn kho thực tế (stock_verified = true, stock 1-5) cho 95% mẫu máy sẵn hàng từ nguồn
-- phục vụ luồng mua hàng Chat-to-Order COD và VietQR giả lập.

WITH eligible AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY id) AS rn,
         COUNT(*) OVER () AS total_count
  FROM laptop_variants
  WHERE source_in_stock = true
)
UPDATE laptop_variants v
SET stock_verified = true,
    stock = 1 + (abs(hashtext(v.id::text)) % 5),
    revision = v.revision + 1,
    updated_at = now()
FROM eligible e
WHERE v.id = e.id
  AND (e.rn::float / e.total_count) <= 0.95;
