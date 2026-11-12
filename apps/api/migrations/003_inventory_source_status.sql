ALTER TABLE laptop_variants
  ADD COLUMN source_in_stock boolean,
  ADD COLUMN stock_verified boolean NOT NULL DEFAULT true;

-- Imported VZ rows started with stock 0 because the source has no quantity.
-- Preserve any row already changed by an administrator or an order.
UPDATE laptop_variants
SET stock_verified = false
WHERE sku LIKE 'VZ-PRODUCT-%' AND stock = 0 AND revision = 1;
