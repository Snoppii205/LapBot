# Thiết kế lịch sử — không triển khai mặc định

Nghiệp vụ/contract hiện hành nằm ở [08](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md). Các file dưới đây giữ nội dung thiết kế trước khi tinh gọn MVP; liên kết được cập nhật theo vị trí mới.

| File | Nội dung lịch sử |
| --- | --- |
| [00](00_TONG_QUAN_KIEN_TRUC_HE_THONG.md) | Kiến trúc nhiều dịch vụ, vector search, real-time hub |
| [01](01_TAI_LIEU_NGHIEP_VU.md) | Reservation, VietQR, voucher và thành viên |
| [02](02_TAI_LIEU_GIAO_DIEN_AI_THUC_THI.md) | Widget/wireframe mở rộng, gồm QR |
| [03](03_TAI_LIEU_KY_THUAT_AI_FRONTEND.md) | Zustand, event bus và stream resume trước khi tinh gọn |
| [04](04_TAI_LIEU_KY_THUAT_AI_ADMIN.md) | Console/RAG/copilot/analytics nâng cao |
| [05](05_THIET_KE_API_ML_VA_CSDL.md) | API/tool/DB mở rộng; không phải schema MVP |
| [06](06_KICH_BAN_CHAT_TO_ORDER_VA_PROMPT_SYSTEM.md) | Prompt/hội thoại có AI tạo draft, QR và voucher |
| [07](07_DANH_GIA_TINH_KHA_THI_VA_DO_SAN_SANG.md) | Đánh giá của phiên bản cũ |

Không copy các ví dụ này vào migration, contract hoặc prompt MVP. Muốn áp dụng một tính năng lịch sử, trước tiên phải chốt lại phạm vi, quyền, state machine và điều kiện hoàn thành trong bộ đặc tả hiện hành.
