-- 006_classify_programming_variants.sql
-- Phân loại cấu hình laptop phục vụ lập trình & đa nhiệm (RAM >= 16GB, CPU Core i5/i7/i9/Ultra, Ryzen 5/7/9, Apple M-series)

UPDATE laptop_variants v
SET usage_category = 'programming',
    revision = v.revision + 1,
    updated_at = now()
FROM laptops l
WHERE v.laptop_id = l.id
  AND v.usage_category = 'office_study'
  AND v.ram_gb >= 16
  AND (
    v.cpu ~* 'Core (i[579]|Ultra)|Ryzen [579]|M[1-4]'
    OR l.model_name ~* 'ThinkPad|MacBook|Latitude|Inspiron|Vivobook|Zenbook|ProBook|EliteBook'
  );
