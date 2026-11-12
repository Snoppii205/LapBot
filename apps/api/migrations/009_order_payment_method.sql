-- 009_order_payment_method.sql
-- Bổ sung phương thức thanh toán tường minh (COD / VIETQR) cho bảng orders
-- và chuẩn hóa dữ liệu lịch sử từng ghi chú VietQR trong trường note.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'COD'
  CHECK (payment_method IN ('COD', 'VIETQR'));

UPDATE orders
SET payment_method = 'VIETQR',
    note = TRIM(REGEXP_REPLACE(note, '^\[Thanh toán: VietQR[^]]*\]\s*', ''))
WHERE note LIKE '[Thanh toán: VietQR%';
