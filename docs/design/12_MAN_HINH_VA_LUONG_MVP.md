# Màn hình và luồng UI LapBot MVP

Tài liệu hành vi UI ngày **19/10/2026**, thực hiện nghiệp vụ/contract ở [08](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md) và dùng tokens của [02A](02A_DESIGN_SYSTEM_RETRO_CLAUDE.md). Không bổ sung feature hoặc endpoint ngoài MVP.

## 1. Điều hướng và màn hình

| Route SPA | Nội dung | Hành động chính |
| --- | --- | --- |
| `/` | Catalog, tìm tên/SKU, lọc ngân sách/brand/RAM/nhu cầu, danh sách phân trang | Xem chi tiết, chọn mua hoặc mở tư vấn |
| `/products/:variant_id` | SKU/cấu hình/giá hiện tại, tình trạng, mô tả và chính sách | Chọn variant khác, mua trực tiếp, hỏi AI về đúng variant |
| `/orders` | Đơn đã xác nhận của guest session hiện tại | Mở chi tiết, không tra bằng SĐT |
| `/orders/:order_id` | Snapshot đơn, tổng COD, trạng thái và hành động được phép | Hủy nếu hợp lệ, liên hệ hỗ trợ |
| `/admin/login` | Username/password, lỗi đăng nhập rõ ràng | Đăng nhập, không có tài khoản mặc định |
| `/admin/catalog` | Model/variant, giá/stock/is_active/revision, cả sản phẩm ẩn | Tạo/sửa qua API admin và xử lý revision conflict |
| `/admin/orders` | Lọc trạng thái, danh sách và vùng chi tiết | Transition hợp lệ theo quyền admin |
| `/admin/chat` | Danh sách phiên, transcript và ngữ cảnh | Claim, gửi khi đã assign, release |

Trang chi tiết sản phẩm hiển thị gallery ảnh theo thứ tự nguồn: ảnh chính lớn, ảnh thu nhỏ chọn được bằng chuột/bàn phím, chú thích trung tính và ảnh dự phòng khi nguồn thiếu. Tự chuyển ảnh sau 4,5 giây với hiệu ứng mờ dần; tạm dừng khi rê chuột, focus, tab ẩn hoặc người dùng chọn ảnh thủ công. Có nút bật/tạm dừng, hỗ trợ vuốt trên điện thoại và tắt tự chuyển khi hệ điều hành yêu cầu giảm chuyển động. Thẻ catalog dùng một ảnh đại diện để giữ danh sách gọn.

Chi tiết admin dùng vùng panel hoặc state trong cùng route, không cần thêm route/backend endpoint để đủ bảng. SPA route chỉ điều hướng; quyền thật luôn kiểm tra tại API `/api/v1`.

Header tối thiểu: thương hiệu LapBot, Catalog, Đơn của tôi, mở/đóng chat; Admin là lối vào vận hành. Footer lấy chính sách/liên hệ từ store-info đã duyệt. Không thêm member login, wishlist, giỏ nhiều máy, voucher hoặc dashboard doanh thu giả.

## 2. Catalog và đặc thù laptop

- Mỗi thẻ tương ứng một variant mua được: hãng/model, SKU hoặc nhãn cấu hình, CPU/GPU/RAM/SSD/màn hình, giá integer VND và `in_stock`. Không dựng giá “từ” mà không chỉ rõ variant tương ứng.
- Thanh tìm kiếm dùng `q` cho tên/brand/SKU; filter bám query API và lưu trên URL để F5/back hoạt động. Đổi filter reset cursor; “Xóa bộ lọc” giữ hành vi rõ ràng. Không tải toàn bộ catalog để lọc trên client.
- Sản phẩm chỉ hiển thị khi laptop và variant active. Ba nhãn tồn kho public: Còn hàng (đã xác minh stock > 0), Hết hàng (nguồn báo hết hoặc số lượng đã xác minh bằng 0), Chờ xác nhận tồn kho (nguồn báo còn/không rõ nhưng thiếu số lượng). Hai trạng thái sau vẫn xem được nhưng nút mua bị khóa. Bộ lọc `available_only` chỉ lấy hàng đã xác minh còn số lượng; không công bố con số stock nội bộ.
- Chọn RAM/SSD/màu là chọn một variant đã có, không chọn các thuộc tính độc lập để tạo cấu hình giả. Luôn cập nhật cả variant_id, giá và tình trạng từ backend.
- Mở “Tư vấn máy này” truyền selected_variant_id vào chat context; không tự gửi một tin hoặc gọi LLM chỉ vì mở drawer. Chỉ gửi khi khách bấm gửi/chip yêu cầu tư vấn rõ ràng.
- So sánh dùng tối đa 3 variant trong kết quả tư vấn; không cần một compare service riêng. Thông số thiếu ghi “Chưa có thông tin”, không suy đoán FPS, pin, dock hoặc nâng cấp RAM.

## 3. Chat và widget

Desktop: catalog vẫn dùng được, chat dạng drawer cạnh phải; mobile: panel một cột gần toàn màn hình, vùng tin cuộn độc lập và composer không bị bàn phím che. Chỉ một chat panel/session, không thêm chat app độc lập. Việc đổi route không tự xóa hội thoại hoặc gọi lại model.

| Trạng thái | Cách thể hiện |
| --- | --- |
| AI tắt | Nhãn “Tư vấn AI đang tắt”, giữ catalog/form/đơn; không hiện câu trả lời model giả |
| Sẵn sàng | Giới thiệu trợ lý AI; chip Tư vấn máy / Đơn của tôi / Gặp nhân viên |
| Đang gửi/stream | Báo chờ ngay, một turn/session; batch chữ, không tự tạo request mới khi mất mạng |
| WAITING | “Đã gửi yêu cầu hỗ trợ”, tin mới được lưu/chuyển tiếp; không nói nhân viên đã đọc, không có AI trả lời |
| AGENT | Nhân viên đã nhận sau commit claim; khách chat bình thường, chỉ assigned admin gửi/release được |
| Lỗi/ngắt | Giữ prefix hợp lệ, tải lịch sử; nút tạo lại chỉ tạo ID mới sau lượt cũ kết thúc |

WAITING sau 120 giây có thể hiện kênh hỗ trợ và nút “Tiếp tục với AI”; không tự resume hoặc giành phiên AGENT. Thời gian dựa server_time, không hứa SLA nhân viên.

Widget registry chỉ có `laptop_spec`, `variant_customizer`, `address_form` như 08. Payload do backend validate; unknown widget hiện fallback, không render HTML model. OrderPreviewCard/OrderReceipt là UI từ order API, không phải widget do AI tự phát. Dedupe widget_id; thẻ lịch sử không được làm sống lại preview/action đã hết hiệu lực.

Frontend dùng POST fetch/ReadableStream và parse protocol LapBot, không nhận raw gateway SSE/tool arguments. Kiểm tra JSON 202 cho FORWARDED, status/content-type và version khi khôi phục. Không dùng EventSource GET hoặc JSON.parse theo network chunk.

## 4. Mua trực tiếp và mua trong chat dùng cùng một flow

```text
Chọn variant -> Form -> API preview -> Duyệt sản phẩm/địa chỉ/tổng COD
                                  -> Sửa: preview mới
                                  -> Hủy: API cancel khi có preview
                                  -> Xác nhận: API confirm -> Receipt/trạng thái
```

- Form dùng cùng component/service ở catalog và chat. Thu tên, SĐT, địa chỉ text, ghi chú; validate theo 08, giữ các trường hợp lệ khi lỗi một trường. Không bắt đăng nhập thành viên, không đòi chat để mua.
- Bấm xem trước mới gửi PII tới order API, không qua LLM. Thông tin chưa submit chỉ ở React state; F5 có thể mất phần đang nhập. Preview đã lưu có thể khôi phục bằng active_preview_id và API có kiểm tra session.
- Preview hiển thị đúng SKU/cấu hình × 1, tiền máy, phí giao, tổng COD, thông tin nhận và chính sách. Ghi “Có hiệu lực 15 phút · Chưa giữ tồn kho”; deadline không được diễn đạt là giữ hàng.
- Khóa nút khi request đang chạy nhưng vẫn giữ request ID để retry đúng input. Sửa SKU/thông tin tạo request ID mới; preview mới hủy pending cũ ở backend. UI không tự sửa tổng hoặc đổi snapshot mà bỏ qua API.
- PRICE_CHANGED/PRODUCT_CHANGED/PRODUCT_UNAVAILABLE/OUT_OF_STOCK/QUOTE_EXPIRED: trình bày lỗi cụ thể, yêu cầu duyệt lại hoặc chọn SKU khác; không tự xác nhận giá mới. Hết hạn tính theo server_time và khóa confirm; server vẫn kiểm tra lại.
- Chỉ hiện thành công khi order API trả trạng thái đã commit phù hợp. Receipt có order_code, snapshot/tổng COD, trạng thái và nút theo dõi/hủy đúng state. COD chưa phải đã thu tiền.
- “OK”, “chốt nhé” trong chat chỉ dẫn khách tới nút xác nhận; không thành lệnh mutation cho LLM.
- Xóa cookie/hết hạn guest: thông báo không còn phiên có quyền và kênh hỗ trợ; không cho tìm lại đơn chỉ bằng số điện thoại/mã đơn.

## 5. Admin tối thiểu

- Catalog: phân trang, sửa model và variant tách nhau; expected_revision theo response đã đọc. Conflict thì tải lại và cho admin duyệt thay đổi, không ghi đè mù.
- Orders: summary list hạn chế PII; chỉ mở detail sau API xác thực. Chỉ hiện transition hợp lệ từ state hiện tại; server kiểm tra lại. Không có nút “xác nhận thay khách”, “đã thanh toán QR” hoặc tạo draft giả.
- Chat: desktop danh sách trái/transcript phải; ngữ cảnh mua có thể gập trong panel. Mobile chuyển danh sách → chi tiết thay vì ép ba cột. Phân biệt chờ nhận, phiên admin đang giữ và AI hoạt động.
- Claim/release gửi expected_control_version. Chỉ assigned admin soạn/gửi/release; người khác gặp conflict thì tải trạng thái lại, không takeover cưỡng bức.
- Poll danh sách admin 10 giây, phiên mở 5 giây, dừng tab ẩn; một request/resource đang chạy. Transcript là message đã lưu, không giả lập xem từng token AI từ một admin stream chưa có trong contract.

## 6. Trạng thái dùng chung và khả năng sử dụng

Mọi màn hình có loading/skeleton, rỗng, lỗi kèm retry có kiểm soát, thiếu quyền/phiên hết hạn và trạng thái thành công thật. Không bịa lượt bán, giảm giá, sao đánh giá hoặc nhân viên đang online từ dữ liệu chưa có.

Mốc layout dự kiến: dưới 768px một cột; từ 768px tăng số cột theo chiều rộng card; desktop rộng có filter và chat drawer. Dùng responsive CSS, không để card/form tràn ngang ở 360px; admin table có scroll riêng khi cần. Đây là quyết định UI, không phải KPI đã đo.

Form có label thật, lỗi gắn với field, focus rõ; nút/action dùng keyboard được, modal/drawer có tên và quản lý focus, đóng xong trả focus về nút mở. Dùng text/icon cùng màu để báo state; vùng chat cuộn không kéo người dùng xuống khi họ đang đọc tin cũ. Tôn trọng reduced-motion, không đọc từng token qua aria-live; thông báo hoàn tất/lỗi theo lượt. Ảnh có alt/kích thước và lazy loading phù hợp, không thêm animation/library nặng cho hiệu ứng retro.
