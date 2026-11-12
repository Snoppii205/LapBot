# ĐÁNH GIÁ TÍNH KHẢ THI VÀ ĐỘ SẴN SÀNG LAPBOT

> **Báo cáo đánh giá ban đầu.** Sau báo cáo này, phạm vi đơn giản hóa và các hợp đồng MVP đã được chốt tại [đặc tả 08](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md). Kết luận chưa đủ đặc tả dưới đây mô tả phiên bản trước; phiên bản hiện tại đủ để bắt đầu code MVP, chưa có mã nguồn/benchmark để xác nhận vận hành.


## 1. Kết luận

**Ý tưởng khả thi; bộ tài liệu chưa đủ để coi là thiết kế triển khai hoàn chỉnh và hiện chưa có sản phẩm chạy được.** Trong workspace chỉ có tài liệu Markdown, không có source code, catalog dữ liệu, cấu hình dịch vụ thanh toán hay kết quả kiểm thử. Vì vậy chưa thể kết luận độ chính xác thực tế của tư vấn, trích xuất đơn hàng hoặc tỷ lệ chuyển đổi.

Phạm vi nên triển khai theo từng giai đoạn. MVP có thể làm được với một catalog chuẩn hóa, chat + tìm kiếm catalog có kiểm soát, form xác nhận đơn, reservation tồn kho trong database, COD và màn hình nhân viên xử lý. VietQR tự động đối soát, RAG ingestion tự phục vụ, A/B testing và phân tích nâng cao nên để sau khi đã có tích hợp và dữ liệu vận hành.

## 2. Đánh giá từng phần

| Phần | Khả thi | Độ sẵn sàng tài liệu | Nhận xét |
| --- | --- | --- | --- |
| Tư vấn theo nhu cầu | Cao | Trung bình | Khả thi nếu catalog có dữ liệu variant đầy đủ; RAG không thay thế truy vấn có cấu trúc cho giá/kho. |
| Generative UI | Cao | Trung bình | Cần schema có version, validate phía server và danh sách component cho phép. LLM không được tự phát HTML/component. |
| Chốt đơn và giữ kho | Cao | Thấp trước khi sửa | Cần transaction/conditional update trong DB, reservation hết hạn idempotent và quy định race-condition. Redis TTL đơn lẻ không bảo đảm tồn kho. |
| QR chuyển khoản và xác nhận tiền | Có điều kiện | Thấp | QR có thể tạo được; tự xác nhận cần ngân hàng/đơn vị trung gian cung cấp callback tin cậy hoặc quy trình đối soát. QR không đồng nghĩa cổng thanh toán. |
| Guest checkout | Cao | Trung bình | Cần guest session token khó đoán và gắn quyền sở hữu; fingerprint và mã đơn không phải thông tin xác thực. |
| HITL/Admin | Cao | Trung bình | Cần phân quyền, khóa phiên takeover nguyên tử, nhật ký thao tác và cơ chế trả quyền cho AI. |
| RAG/Admin ingestion | Trung bình | Thấp | Cần nguồn tài liệu có chủ sở hữu, phiên bản, ngày hiệu lực, quy trình duyệt và gỡ dữ liệu lỗi thời. |
| KPI/độ chính xác AI | Chưa thể khẳng định | Thấp | Các con số 95%, 80%, 3 phút, 4.7/5 chưa có baseline, tập đánh giá hay kết quả thử nghiệm. |

## 3. Các điểm đã chỉnh trong bộ tài liệu

- Chuyển nguồn chuẩn tồn kho về database; mô tả reservation nguyên tử, hạn 15 phút, gia hạn trong lúc chờ QR và giải phóng idempotent.
- Tách tạo draft, thao tác khách xác nhận và tạo QR thành các bước riêng. Hệ thống không hiển thị QR hoặc coi đơn đã chốt trước xác nhận.
- Làm rõ QR chỉ chứa dữ liệu chuyển khoản; trạng thái `PAID` chỉ được ghi sau callback đã xác thực và đối chiếu đầy đủ, hoặc đối soát thủ công.
- Sửa mô tả POST + SSE: client dùng `fetch`/`ReadableStream`, bổ sung idempotency và tiếp tục stream; native `EventSource` không dùng được cho POST tùy ý.
- Bổ sung kiểm soát guest session, quyền đọc đơn, validate widget, chống callback lặp, không tin giá do model/client cung cấp.
- Hạ KPI chưa kiểm chứng thành mục tiêu đo lường; chỉnh prompt/kịch bản để không cam kết cấu hình, voucher, giao hàng hoặc lợi ích không có căn cứ.
- Sửa các liên kết README sang đường dẫn tương đối.

## 4. Trình tự triển khai khuyến nghị

1. **Chốt dữ liệu và chính sách**: catalog/variant/giá/tồn kho, địa chỉ giao hàng, voucher, quà tặng, đổi trả/bảo hành; chỉ đưa nội dung đã duyệt vào tư vấn.
2. **MVP không thanh toán trực tuyến**: catalog search, chat, widget schema, guest session, tạo draft, xác nhận, COD, admin takeover và audit log.
3. **Kiểm tra nghiệp vụ và tải đồng thời**: hai khách tranh sản phẩm cuối, submit lặp, hết hạn đồng thời với xác nhận, sửa/hủy đơn, mất kết nối giữa các bước.
4. **Thanh toán QR**: chọn ngân hàng/đối tác cụ thể, xác minh callback/signature, idempotency, hoàn/nhầm/thiếu tiền, callback đến trễ và đối soát cuối ngày.
5. **Pilot có người giám sát**: chạy tập câu hỏi/đơn hàng đại diện; đo độ chính xác trích xuất, groundedness thông số, tỷ lệ lỗi giá/kho, escalation, thời gian xử lý và conversion. Chỉ mở rộng khi đạt ngưỡng do nhóm đặt ra.

## 5. Tiêu chí tối thiểu trước khi phát hành

- Không tạo đơn/QR hoặc thay đổi trạng thái chỉ vì model nói đã làm; backend xác thực quyền, state transition và giá trị ở mọi action.
- Không oversell trong kiểm thử đồng thời; không giải phóng cùng reservation hai lần; callback lặp không tạo giao dịch thanh toán lặp.
- Giá, tồn kho, voucher và tổng tiền hiển thị khớp nguồn catalog/order snapshot; prompt/RAG không thể ghi đè chúng.
- Không truy cập đơn của người khác bằng cách đoán order ID/số điện thoại; có chính sách đồng ý, lưu giữ, xóa và che PII trong log.
- Có xử lý timeout, retry, webhook đến trễ, hoàn tiền/đối soát và nhân viên takeover trước khi mở bán thật.
- Đo trên bộ dữ liệu đại diện; công bố KPI theo kết quả thực nghiệm, không dùng số mục tiêu làm kết quả.

## 6. Giới hạn đánh giá

Đây là đánh giá tài liệu và tính hợp lý kiến trúc, không phải audit mã nguồn hay tư vấn pháp lý/đối tác ngân hàng. Chính sách bảo vệ dữ liệu, điều kiện thanh toán và quy định thương mại cần được xác nhận theo nơi triển khai trước khi vận hành thật.
