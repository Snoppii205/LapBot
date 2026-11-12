# Chỉ mục tài liệu LapBot

Cập nhật cấu trúc: **19/10/2026**. Tài liệu được chuyển theo vai trò; giữ mã số/tên cũ để truy vết.

## Tài liệu đang có hiệu lực

| Chủ đề | Tài liệu sở hữu | Quyết định |
| --- | --- | --- |
| Nghiệp vụ và contract | [08 — Đặc tả MVP](specs/08_DAC_TA_MVP_CHO_AI_CODE.md) | Scope, DB, API `/api/v1`, SSE, tool, auth, kho, handoff |
| Tổ chức code | [11 — Cấu trúc và lộ trình](specs/11_CAU_TRUC_DU_AN_VA_LO_TRINH_CODE.md) | Module/file, phụ thuộc, thứ tự scaffold và bàn giao |
| Hành vi UI | [12 — Màn hình và luồng MVP](design/12_MAN_HINH_VA_LUONG_MVP.md) | Route SPA, CTA, form, loading/empty/error, mobile và admin |
| Hình thức UI | [02A — Retro-Editorial](design/02A_DESIGN_SYSTEM_RETRO_CLAUDE.md) | Màu, font, card, trạng thái và khả năng đọc |
| Adapter LLM | [10 — BUTTERFLY](integrations/10_HUONG_DAN_API_BUTTERFLY.md) | Env, stream, tool round-trip, lỗi quota và bằng chứng lịch sử |
| Nguồn/quyết định | [09 — Đối chiếu quy trình bán](reviews/09_DOI_CHIEU_QUY_TRINH_BOT_BAN_HANG.md) | Lý do chọn quy trình và không train riêng |
| Chuẩn hóa lần này | [Rà soát 19/10](reviews/2026-10-19_CHUAN_HOA_TAI_LIEU.md) | Thay đổi cấu trúc, quyết định và điều kiện còn thiếu |
| Triển khai | [Báo cáo MVP 19/10](reviews/13_BAO_CAO_TRIEN_KHAI_MVP.md) | Mã đã viết, lệnh đã chạy và phần chưa nghiệm thu |

## Quy tắc ưu tiên

1. Yêu cầu mới do chủ dự án xác nhận có ưu tiên cao nhất; cập nhật tài liệu sở hữu trước khi code theo thay đổi đó.
2. Invariant/contract ở 08 cao hơn ví dụ ở 11, 12, 02A và 10. Không tạo endpoint, state, widget hay quyền tool khác trong một file hướng dẫn.
3. 11 quy định vị trí code; 12 quy định hành vi màn hình; 02A quy định hình thức. Design system không tự bổ sung dependency hoặc feature.
4. Báo cáo/diagnostics mô tả điều đã quan sát; kết quả ngày 16/10 không xác nhận gateway còn hoạt động ngày 19/10.
5. [Archive](archive/README.md) là thiết kế lịch sử, chỉ dùng khi có yêu cầu mở rộng rõ ràng. Không cộng các tính năng đó vào MVP.

Không sao chép toàn bộ bảng API/DB/state sang nhiều file. Khi đổi contract, sửa 08 rồi đối chiếu UI, adapter, schema/types dùng chung và ví dụ liên quan.

## Cách đọc theo mốc

Đọc 08 và mốc tương ứng trong 11; thêm 12/02A khi làm UI, thêm 10 khi tới adapter. Mỗi lần bàn giao ghi file đã tạo, lệnh chạy, thay đổi contract, kiểm chứng đã thực hiện và phần còn thiếu. Không đánh dấu “đã chạy” cho template hay mã minh họa.
