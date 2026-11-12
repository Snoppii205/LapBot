# ĐỐI CHIẾU QUY TRÌNH BOT BÁN HÀNG LAPBOT

Ngày đối chiếu: 16/10/2026. Phạm vi: thiết kế MVP; chưa có mã chạy hoặc kết quả đánh giá hội thoại.

## 1. Kết luận

LapBot có khung bán hàng phù hợp: hiểu nhu cầu → tư vấn từ catalog → chọn variant → thu thông tin → duyệt đơn → xác nhận → theo dõi/hỗ trợ. Khi rà soát, phần kỹ thuật đã rõ hơn phần điều khiển hội thoại. Các nhánh thiếu đã được bổ sung trực tiếp vào [đặc tả 08, mục 4A](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md).

“Phù hợp” ở đây là đánh giá thiết kế theo các hướng dẫn dưới đây, không phải chứng nhận chính thức hoặc bằng chứng bot đã bán hàng tốt trong thực tế. Các giới hạn 3 lần hỏi lại/120 giây chờ là lựa chọn của LapBot để kiểm thử, không phải con số bắt buộc từ nhà cung cấp.

## 2. Đối chiếu nguồn chính thức

| Nguyên tắc từ nguồn | Trước khi đối chiếu | Điều chỉnh cho LapBot |
| --- | --- | --- |
| Giới thiệu khả năng, ghi nhận thông tin đã biết và hỏi rõ từng ý. [Google: Agent design](https://docs.cloud.google.com/dialogflow/cx/docs/concept/agent-design) | Chưa có quy tắc hội thoại cụ thể trong spec MVP. | Chào ngắn; không hỏi lại budget/nhu cầu đã có; lưu context nhỏ, không thêm classifier. |
| Luồng retail thu đủ tham số rồi trình bày sản phẩm/giá và xin xác nhận. [Google: Retail virtual agent](https://codelabs.developers.google.com/codelabs/dialogflow-cx-retail-agent) | Có form/preview/confirm. | Giữ xác nhận bằng nút rõ ràng; “OK” trong chat không tự đặt hàng; cho sửa/hủy/đổi máy. |
| Bot cần xử lý việc người dùng chen câu hỏi hoặc đổi chủ đề. [Microsoft: Conversation flow](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-design-conversation-flow?view=azure-bot-service-4.0) | Thiếu yêu cầu tiếp tục bước đang dở sau hỏi chen ngang. | Giữ form/context hợp lệ, trả lời chính sách rồi cho quay lại checkout, đổi SKU phải tạo preview mới. |
| Handoff cần ngữ cảnh/transcript và phân biệt yêu cầu với trạng thái đã được nhận. [Microsoft: Human handoff](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-design-pattern-handoff-human?view=azure-bot-service-4.0) | Có claim/release; chưa có hành vi đầy đủ khi khách đang chờ. | WAITING suy ra từ cờ hiện có; tạm ngừng AI, có thông báo chờ/kênh khác, chỉ báo nhân viên tham gia sau claim. |
| Cart thể hiện sản phẩm, thông tin người mua, chi phí và giao hàng; giá ước tính có thể thay đổi ở checkout. [Shopify: Cart](https://shopify.dev/docs/api/storefront/latest/objects/cart) | Đã kiểm tra lại giá/kho lúc confirm. | Bổ sung nhãn phí/tổng COD/chính sách và receipt; không hứa giữ hàng khi chỉ preview. |

Các tài liệu Microsoft ở đây mô tả nguyên tắc thiết kế, không phải lựa chọn SDK cho LapBot. Dự án vẫn giữ React/Fastify/PostgreSQL và không phụ thuộc Dialogflow, Bot Framework hoặc Shopify.

## 3. Có cần train không?

**Chủ dự án đã xác nhận không bắt buộc tự train; MVP không train/fine-tune riêng.** Dùng LLM có sẵn cho hiểu yêu cầu/hội thoại, prompt có ví dụ và tool cho truy xuất catalog. Đơn hàng, giá, tồn kho và trạng thái được kiểm soát bằng API/backend.

Google phân biệt dùng foundation model qua prompt, bổ sung dữ liệu grounding và tuning bằng tập dữ liệu riêng. Tuning có thể hữu ích khi prompt không thể hiện hoặc không tạo ra hành vi cần thiết một cách ổn định. [Develop a generative AI application](https://docs.cloud.google.com/docs/ai-ml/generative-ai/develop-generative-ai-application), [Tuning and evaluation](https://docs.cloud.google.com/bigquery/docs/tune-evaluate).

Lựa chọn cho LapBot là suy luận từ phạm vi MVP và yêu cầu đơn giản/hiệu quả: đọc giá/kho hiện tại bằng tool; chuẩn bị kịch bản đánh giá; sửa dữ liệu, prompt và tool trước. Chỉ cân nhắc fine-tune sau nếu có lỗi lặp lại đã đo và dữ liệu phù hợp. Không cần thêm GPU, pipeline train hoặc vector DB cho MVP.

Seed catalog là chuẩn bị dữ liệu sản phẩm; viết prompt là chỉ dẫn khi gọi model; bộ kiểm thử hội thoại dùng đo chất lượng. Cả ba không làm thay đổi trọng số model. RAG có thể xét khi tài liệu chính sách tăng nhiều, hiện tại cấu hình chính sách nhỏ đã duyệt là đủ cho thiết kế này.

## 4. Phần đã cập nhật và cách chứng minh sau khi code

- Luồng mở chat/tìm hiểu/gợi ý/giải đáp/chốt đơn/hậu mãi trong 08 mục 4A.
- Context không chứa PII để giảm hỏi lại; liên kết preview/đơn để khôi phục đúng session.
- Chờ nhân viên có thông báo và lựa chọn quay lại AI; tách rõ WAITING với AGENT đã nhận.
- Chính sách cửa hàng lấy từ cấu hình đã duyệt, không tự sinh; có nút xem đơn của session.
- Quyết định không train được ghi vào 08 và AGENTS.md.

Sau khi code, chạy các kịch bản nghiệm thu tại 08 mục 4A và kiểm thử nghiệp vụ tại mục 10. Đo riêng độ đúng dữ kiện, lựa chọn tool, lỗi giao dịch và tỷ lệ hoàn thành; không dùng vài đoạn demo thành công để kết luận độ chính xác hay tăng doanh thu.

## 5. Rà soát toàn bộ tài liệu trước khi code

Phạm vi rà soát: README, AGENTS và tài liệu 00–09; yêu cầu đang có hiệu lực là 08. Các vấn đề dưới đây đã được sửa trong đặc tả, chưa phải lỗi đã sửa trên một ứng dụng đang chạy.

| Vấn đề phát hiện | Cách chốt lại |
| --- | --- |
| Preview cũ chỉ bị khóa nút ở frontend; tab khác vẫn có thể xác nhận. | Một pending preview/session, thay preview trong transaction; retry không khôi phục preview đã hủy. |
| Retry tin chờ nhân viên có thể chuyển sang chạy LLM sau resume. | Lưu receipt FORWARDED cho mọi tin đã chuyển tiếp; retry giữ route/kết quả ban đầu. |
| Xác nhận mới kiểm tra giá/kho variant; chưa đủ khi ẩn model hoặc đổi cấu hình. | Kiểm tra laptop/variant active, cấu hình/snapshot và giá; khóa dòng theo thứ tự thống nhất. |
| Gate stream chưa nêu rõ việc lưu prefix và finalize/abort cùng lúc. | Gate theo turn ID/version/deadline, lưu prefix một lần, CAS terminal status; không truy vấn DB mỗi token. |
| Lỗi DB cuối turn có thể để PROCESSING chặn phiên mãi. | Startup recovery và dọn lazy sau hard deadline ở request kế tiếp, không thêm worker. |
| BIGINT cursor có thể mất độ chính xác trong JavaScript. | Cursor chat serialize chuỗi, không Number; các resource ID khác vẫn UUID. |
| Chưa chốt cách validator thực sự từ chối trường thừa/sai kiểu. | Validator body tắt removeAdditional/coerceTypes; lỗi trả 400; query có schema riêng. [Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) |
| Tham số scrypt trước đó quá thấp so với cấu hình được khuyến nghị. | N=16384, r=8, p=5, async và giới hạn đồng thời; đây là một lựa chọn được [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt) liệt kê. |
| Ví dụ roadmap có frame SSE/argument tool/khẳng định sản phẩm sai lệch. | Sửa framing, tên/argument tool, bỏ cam kết hiệu năng/bảo hành không có nguồn và sửa đơn vị CSAT. |

Kiểm tra tài liệu đã chạy: 12 file Markdown; 21 liên kết file nội bộ; 8 JSON block; 10 frame SSE JSON; 30 cặp method/path MVP không trùng; 7 lời gọi tool minh họa khớp argument của schema roadmap. Các kiểm tra này đều đạt ở lượt rà soát này. Không có source ứng dụng để chạy typecheck, kiểm thử DB, end-to-end hoặc benchmark.

Kết luận sau sửa: chưa thấy mâu thuẫn lớn còn chặn việc bắt đầu code MVP theo 08. `00`–`07` vẫn là tham khảo mở rộng, không phải cam kết mọi tính năng tương lai đã đủ hợp đồng triển khai. Hiệu năng, độ đúng hội thoại và an toàn giao dịch cần được chứng minh bằng các kiểm thử đã liệt kê sau khi code.
