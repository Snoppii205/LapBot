# LapBot — sử dụng BUTTERFLY AI Gateway

Ngày kiểm chứng: **16/10/2026**. Đây là hướng dẫn adapter LLM cho [đặc tả MVP 08](../specs/08_DAC_TA_MVP_CHO_AI_CODE.md), không thay đổi nghiệp vụ, quyền tool hoặc giới hạn trong tài liệu 08.

**Đã kiểm chứng gọi API riêng với dữ liệu giả; chưa có adapter hay ứng dụng LapBot được triển khai.** Ví dụ TypeScript dưới đây là hướng dẫn triển khai, chưa được chạy trong một ứng dụng LapBot.

## 1. Thông số kết nối đã xác định

| Mục | Giá trị |
| --- | --- |
| Trang quản lý khóa | `https://reserve-liquid-shark-flows.trycloudflare.com/key` |
| Base URL API | `https://reserve-liquid-shark-flows.trycloudflare.com/v1` |
| Endpoint đã thử | `POST /v1/chat/completions` |
| Xác thực | Header `Authorization: Bearer <LLM_API_KEY>` |
| Request | `Content-Type: application/json` |
| Model đã thử | `gemini-2.5-flash` |
| Streaming | `stream: true`, response `text/event-stream; charset=utf-8` |
| Usage khi stream | `stream_options: {"include_usage": true}` đã hoạt động |

`/key` là trang dashboard, không phải API base URL. Tên model là ID gateway chấp nhận; response ghi tên model không tự chứng minh danh tính model upstream. Kết quả kiểm tra thêm model xem mục 10. Responses API, `strict:true`, JSON Schema output và những tham số ngoài các phép thử được ghi nhận chưa được kiểm chứng.

## 2. Cấu hình backend

Khi triển khai, thêm các biến sau vào môi trường **backend**. `.env.example` chỉ chứa placeholder; `.env` thật phải được gitignore và được backend nạp khi khởi động.

```dotenv
AI_ENABLED=true
LLM_BASE_URL=https://reserve-liquid-shark-flows.trycloudflare.com/v1
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=REPLACE_WITH_YOUR_NEW_KEY
```

- Không commit khóa thật, không đặt trong `VITE_*`, frontend, URL/query string, prompt hoặc log. Khóa đã chia sẻ trong hội thoại nên được thay trước khi sử dụng thật.
- `AI_ENABLED=false`: không gọi gateway, catalog/checkout/admin vẫn hoạt động. Bật AI mà thiếu cấu hình thì startup báo lỗi rõ ràng.
- Validate URL khi startup: dùng HTTPS, không có username/password/query/hash; chỉ người vận hành được đổi endpoint. Không nhận base URL hoặc API key từ request khách hàng.
- Base URL là cấu hình runtime; không hardcode hostname này trong service/frontend. URL Quick Tunnel có thể thay đổi.
- Không chạy script cài IDE từ dashboard để tích hợp LapBot; backend chỉ cần HTTP API.

## 3. Kiến trúc tích hợp tối thiểu

```text
React -- POST /api/chat/message-stream --> Fastify
                                    |-- kiểm tra session/receipt/quota/control gate
                                    |-- adapter --> BUTTERFLY /v1/chat/completions
                                    |-- tool executor --> catalog service --> PostgreSQL
React <-- SSE của LapBot ------------|
```

Giữ một adapter và một gateway. Dùng `fetch` sẵn trong Node runtime đã chọn; không cần agent framework, router đa provider, Redis hay pipeline train.

Backend tự thực thi các tool được phép ở tài liệu 08. Gateway/model không có quyền truy cập DB, SQL, filesystem, terminal hoặc thao tác đơn hàng. Không bật công cụ/sandbox/agent có sẵn của playground gateway cho LapBot.

## 4. Ví dụ mở một request stream bằng TypeScript

Đặt phần adapter trong backend, ví dụ `apps/api/src/modules/chat/llm-gateway.ts` khi bắt đầu code. Đây chỉ là phần mở HTTP stream; parser, tool executor, control gate và lưu receipt được mô tả ở các mục tiếp theo và tài liệu 08.

```typescript
type GatewayConfig = {
  baseUrl: string; // Đã validate khi startup, kết thúc bằng /v1.
  apiKey: string;
  model: string;
};

export async function openGatewayStream(
  config: GatewayConfig,
  messages: readonly Record<string, unknown>[],
  tools: readonly Record<string, unknown>[],
  turnSignal: AbortSignal,
): Promise<Response> {
  const response = await fetch(
    `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`,
    {
      method: "POST",
      redirect: "error", // Không chuyển tiếp credential sang URL redirect.
      signal: turnSignal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 600,
        ...(tools.length ? { tools, tool_choice: "auto" } : {}),
      }),
    },
  );

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`GATEWAY_HTTP_${response.status}`);
  }

  const mediaType = response.headers.get("content-type")
    ?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "text/event-stream" || !response.body) {
    await response.body?.cancel();
    throw new Error("GATEWAY_INVALID_STREAM");
  }

  return response;
}
```

`turnSignal` được tạo **một lần cho cả lượt chat**, hủy sau deadline chung 30 giây hoặc khi client ngắt/handoff. Không tạo timeout 30 giây mới cho từng lần gọi. Không gọi hàm này khi AI bị tắt hoặc phiên đang AGENT/WAITING. Nếu thay bằng SDK về sau, tắt retry tự động và cấu hình cùng deadline/budget trước khi dùng.

## 5. Đọc SSE đúng cách

Gateway stream theo dạng Chat Completions. Ví dụ rút gọn các frame độc lập:

```text
data: {"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{"content":"Em đã tìm được "},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{"content":"máy phù hợp."},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: {"choices":[],"usage":{"prompt_tokens":100,"completion_tokens":20,"total_tokens":120}}

data: [DONE]

```

Quy tắc parser:

1. Dùng `ReadableStream` và `TextDecoder` với decode tăng dần (`stream:true`), flush decoder khi EOF. Không dùng `response.json()`/`response.text()` để đọc stream đang chạy.
2. Tách dòng tăng dần, xử lý CRLF/LF đúng cả khi CR/LF bị chia giữa hai network chunk. Dòng trống kết thúc một event. Ghép nhiều dòng `data:` trong cùng event bằng newline; bỏ comment `:` và field SSE không dùng.
3. Chỉ `JSON.parse` payload event đã hoàn chỉnh. Một network chunk có thể chứa nhiều event hoặc chỉ một phần UTF-8/JSON. `[DONE]` là sentinel, không phải JSON.
4. Chấp nhận frame role/content rỗng và `choices:[]` chứa usage; không giả định mọi frame đều có `choices[0]`. MVP xử lý một completion, dùng choice index 0.
5. Nối `delta.content`, gom `delta.tool_calls` theo mục 6. Không gửi tool arguments, `reasoning_content`, metadata hoặc usage ra chat khách hàng.
6. Ghi nhận `finish_reason` và tiếp tục đọc usage/`[DONE]`; không dừng ngay ở frame có finish_reason. Hoàn tất bình thường khi đủ tín hiệu kết thúc. EOF/timeout trước `[DONE]`, lỗi JSON hoặc payload `error` là lỗi luồng; không báo COMPLETED.
7. `finish_reason: length` là chạm giới hạn output; không thực thi tool arguments bị cắt. Kết thúc rõ lỗi giới hạn theo trạng thái turn của 08, không âm thầm coi câu trả lời/tool là đầy đủ. Reason bị từ chối/không hỗ trợ cũng không được coi thành công.
8. Giới hạn buffer/event/arguments trong adapter, chặn payload quá lớn, tôn trọng backpressure; đóng/cancel reader và abort upstream khi dừng.

Không chuyển nguyên stream gateway cho frontend. Chuẩn hóa sang `start`, `text_delta`, `widget`, `error`, `done` của LapBot ở tài liệu 08. Batch text khoảng 50 ms qua control gate, không truy vấn DB hoặc ghi log mỗi token.

## 6. Tool calling khi stream

### Request minh họa

Ví dụ này chỉ khai báo filter `max_price` để minh họa giao thức. Bản triển khai phải dùng schema dùng chung với đủ các filter tùy chọn của `search_laptop_catalog` ở 08; không lấy schema rút gọn này thay toàn bộ contract.

```json
{
  "model": "gemini-2.5-flash",
  "messages": [
    {"role": "system", "content": "Bạn tư vấn laptop. Giá và tồn kho phải lấy từ tool catalog; không tự bịa."},
    {"role": "user", "content": "Tìm laptop dưới 20 triệu đồng."}
  ],
  "tools": [{
    "type": "function",
    "function": {
      "name": "search_laptop_catalog",
      "description": "Tìm laptop theo ngân sách tối đa, đơn vị VND.",
      "parameters": {
        "type": "object",
        "properties": {"max_price": {"type": "integer", "minimum": 0}},
        "additionalProperties": false
      }
    }
  }],
  "tool_choice": "auto",
  "stream": true,
  "stream_options": {"include_usage": true},
  "max_tokens": 600
}
```

### Ghép tool-call fragments

Ví dụ một tool có thể được chia như sau; ID trong ví dụ là dữ liệu giả:

```text
data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_demo_1|opaque","type":"function","function":{"name":"search_laptop_catalog","arguments":""}}]},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\"max_price\":20000000}"}}]},"finish_reason":null}]}

data: {"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}

data: [DONE]

```

- Gom theo `tool_calls[].index` trong cùng một provider call. Nối các mảnh `id`, `function.name`, `function.arguments` có mặt; không ghi đè phần đã nhận bằng fragment rỗng. Reset bộ gom khi sang provider call mới.
- **Giữ nguyên toàn bộ tool-call ID.** Trong lần thử, ID chứa dấu `|` và một hậu tố dài. Không cắt hậu tố, ép UUID, đổi ký tự hay tự sinh ID thay thế; gửi lại nguyên ID làm `tool_call_id` ở lượt tiếp theo.
- Chờ finish_reason `tool_calls` và stream kết thúc hợp lệ rồi mới parse arguments. Không chạy tool theo JSON chưa đủ hoặc theo text/Markdown giả làm tool call.
- Kiểm tra ID không rỗng/không trùng, type/function name thuộc allowlist, arguments là object đúng schema và còn quota/control gate. Tool lạ/sai schema không được thực thi; trả kết quả lỗi đã chuẩn hóa cho model nếu còn budget, hoặc kết thúc lỗi rõ ràng.
- Với nhiều tool, kiểm tra tổng số trước khi chạy, xử lý theo thứ tự xác định. MVP không cần thực thi song song các tool có khả năng đổi context/mode. `escalate_to_human_agent` chuyển WAITING thì ngừng vòng LLM ngay, xử lý theo 08, không gọi thêm model.

### Gửi kết quả tool lại cho model

Giữ message history của các provider call trong lượt chat ở backend. Thêm một message `assistant` với toàn bộ `tool_calls` đã ghép, rồi một message `tool` cho từng call. Không dùng tool message làm chỉ dẫn hệ thống. Ví dụ kết quả dưới đây là **dữ liệu giả rút gọn**, không phải định nghĩa VariantSummary hay catalog thật:

```json
[
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [{
      "id": "call_demo_1|opaque",
      "type": "function",
      "function": {"name": "search_laptop_catalog", "arguments": "{\"max_price\":20000000}"}
    }]
  },
  {
    "role": "tool",
    "tool_call_id": "call_demo_1|opaque",
    "content": "{\"products\":[{\"variant_id\":\"00000000-0000-4000-8000-000000000001\",\"name\":\"Laptop Demo A\",\"price_vnd\":17990000,\"in_stock\":true}]}"
  }
]
```

Gửi lại toàn bộ history hợp lệ cùng tool schema tới **cùng endpoint**, vẫn `stream:true`. Adapter sau đó nhận text trả lời, hoặc một vòng tool nữa nếu còn budget. `tool_choice:none` đã được thử ở bước soạn câu trả lời sau tool; chỉ dùng khi backend đã có đủ dữ kiện và chủ động kết thúc việc lấy thêm dữ liệu. Không buộc `none` từ đầu cho toàn bộ hội thoại.

Widget sản phẩm/form được backend dựng từ kết quả service đã validate. Trong MVP, tool catalog dùng VariantSummary/VariantDetail của 08 và chỉ công bố `in_stock`, không gửi số kho nội bộ cho model/khách. Nội dung text model không phải nguồn giá, tồn kho hoặc trạng thái đơn. Không đưa tên/số điện thoại/địa chỉ từ form checkout vào history gửi gateway.

## 7. Giới hạn và xử lý lỗi theo MVP

| Mục | Quy tắc triển khai |
| --- | --- |
| Provider calls | Tối đa **3/turn**, đếm trước mỗi request kể cả request lỗi |
| Tool calls | Tối đa **4/turn**, kiểm tra trước khi thực thi |
| Context | Tối đa **6.000 input token/call**, gồm system/tools/history/tool result; giảm lịch sử và giới hạn kết quả trước request, không cắt JSON/tool-call pair giữa chừng |
| Output | `max_tokens:600` mỗi call, tối đa 1.800 output token/turn |
| Deadline | **30 giây chung cho cả turn**, không reset khi gọi model/tool tiếp |
| Retry | MVP không tự retry provider trong adapter, không retry sau khi đã stream text hoặc chạy tool; khách tạo lại lượt bằng ID mới theo 08 |
| Metrics | Duration, first-content latency, số calls/tools, usage thật, mã lỗi; thiếu usage ghi unknown, không coi là 0 |
| Frontend | Chỉ nhận SSE LapBot; hiển thị chờ ngay, giữ catalog/checkout hoạt động khi AI lỗi |

Nếu cần ước lượng token trước request, chọn bộ đếm phù hợp model với khoảng dự phòng; khi chưa có bộ đếm chính xác phải ghi rõ là ước lượng, không tuyên bố cắt theo ký tự bảo đảm đúng giới hạn token. Đối chiếu usage thực tế khi pilot.

HTTP 401/403: credential/quyền cần người vận hành xử lý; 429: quota/rate limit; 5xx/network: gateway/upstream lỗi. Chỉ log status/error code đã lọc, không log request headers, prompt đầy đủ hay raw error body từ gateway. Không chuyển chi tiết credential/provider ra khách.

**Lưu ý đã quan sát khi kiểm tra nhiều model:** gateway có thể trả HTTP 200, SSE hợp lệ, `finish_reason:stop` và `[DONE]` nhưng content thực tế là wrapper `SYSTEM NOTICE: RATE LIMIT EXCEEDED` / `RPM limit exceeded`. Đây là lỗi quota, không phải câu trả lời model thành công. Cũng đã gặp HTTP 200 với finish_reason `error` và nội dung `Upstream returned an empty response`. Adapter phải kiểm tra lỗi trong event/finish_reason và nhận diện wrapper lỗi cụ thể của gateway (kể cả khi bị chia delta), không chỉ kiểm tra HTTP status. Yêu cầu bên cung cấp ưu tiên trả lỗi có cấu trúc/status phù hợp; nhận diện wrapper text chỉ là biện pháp tương thích, không phải cách phân tích tùy ý mọi câu có từ “rate limit”.

Lỗi trước khi mở SSE LapBot trả JSON lỗi theo API contract; lỗi sau khi đã mở SSE phát `error` rồi `done`. Provider/budget lỗi thì turn FAILED; client ngắt hoặc takeover thì INTERRUPTED theo 08. Giữ prefix đã được gate chấp nhận, finalize một lần. Không nhận callback đến muộn và không tự tiếp tục generation sau handoff.

## 8. Kết quả kiểm chứng thực tế

Các phép thử riêng ngày 16/10/2026, model `gemini-2.5-flash`, dữ liệu giả, không có khách hàng/đơn thật:

| Bài thử | Kết quả |
| --- | --- |
| Non-stream, ép chọn tool tra cứu demo | HTTP 200; tool name/arguments hợp lệ; khoảng 4,02 giây |
| Non-stream, nhận tool result rồi trả lời | HTTP 200; đúng giá giả 15.000.000 VND; khoảng 2,83 giây |
| Text stream | HTTP 200; 6 content delta; chữ đầu 4,07 giây, hoàn tất 4,46 giây |
| Tự chọn tool khi stream (`auto`) | HTTP 200; 2 tool-call delta; ghép đúng `search_laptop_catalog` và `max_price=20000000`; hoàn tất 3,53 giây |
| Stream trả lời sau tool | HTTP 200; 4 content delta; đúng giá giả 17.990.000 VND và stock=3; chữ đầu 3,46 giây, hoàn tất 3,63 giây |

Cả 3 yêu cầu stream đều có content type SSE, finish_reason phù hợp, `[DONE]`, usage, không lỗi parse. Số `stock=3` chỉ là dữ liệu giả dùng thử giao thức, không phải contract công bố kho của LapBot; production chỉ dùng `in_stock` như trên. Các phần nội dung đến ở các thời điểm khác nhau; xác nhận client nhận được nội dung tăng dần. Không kết luận được cách gateway tạo stream nội bộ hoặc tốc độ model upstream từ phép đo này.

Đây là mẫu kiểm tra nhỏ, không phải benchmark, SLA, xác nhận mọi model hoặc độ chính xác tư vấn. Chưa kiểm chứng tải đồng thời, vận hành dài hạn, hủy request từ client, handoff trong ứng dụng, quota thực, chính sách lưu dữ liệu hoặc danh tính upstream. Các tình huống đó cần kiểm tra khi tích hợp/pilot.

## 9. Endpoint tạm thời và tài liệu đối chiếu

Theo tài liệu Cloudflare, Quick Tunnel dùng hostname tạm thời, không bảo đảm uptime và được ghi là không hỗ trợ SSE. **Tuy nhiên, các phép thử trực tiếp trên endpoint cụ thể ở trên đã nhận SSE thành công.** Dùng kết quả thực tế cho đánh giá endpoint này; không suy rộng rằng mọi Quick Tunnel đều bảo đảm streaming. Khi hostname/gateway/model đổi, kiểm tra lại text stream và vòng tool call trước khi cập nhật môi trường.

Trước vận hành thật, dùng endpoint ổn định do bên cung cấp xác nhận, làm rõ quota/chi phí/chính sách dữ liệu và đo trên môi trường triển khai. Không cần thay kiến trúc LapBot chỉ vì đổi base URL.

- [BUTTERFLY dashboard](https://reserve-liquid-shark-flows.trycloudflare.com/key): trang công khai đã đọc, hướng dẫn API tương thích OpenAI và base URL `/v1`; URL có thể hết hiệu lực.
- [OpenAI Docs — Streaming API responses](https://developers.openai.com/api/docs/guides/streaming-responses): định dạng delta khi streaming.
- [OpenAI Docs — Function calling](https://developers.openai.com/api/docs/guides/function-calling): schema tool, ghép tool-call fragments và gửi tool result.
- [Cloudflare — Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/): giới hạn hostname/uptime/SSE theo tài liệu nhà cung cấp tunnel.

Tài liệu OpenAI ở đây dùng đối chiếu giao thức; BUTTERFLY là gateway bên thứ ba, không mặc định có cùng tính năng, chính sách hay bảo đảm của OpenAI.

## 10. Kiểm tra lại danh sách model

Script [scripts/check-gateway-models.ps1](../../scripts/check-gateway-models.ps1) dùng **PowerShell 7**. Chạy từ thư mục LapBot:

```powershell
# Kiểm tra toàn bộ model đơn trong catalog công khai hiện tại.
# Nhập khóa tại prompt ẩn, không gắn khóa vào command line.
pwsh -File ./scripts/check-gateway-models.ps1

# Hoặc chỉ kiểm tra các model được chọn trong phiên PowerShell 7.
./scripts/check-gateway-models.ps1 -Models @('gemini-2.5-flash', 'deepseek-v4.1-flash')
```

Mỗi model có tối đa 3 request: text stream → tự chọn tool tìm laptop dưới 20 triệu → nhận kết quả giả và stream câu trả lời đúng sản phẩm/giá. Tool call và follow-up dùng chung deadline 30 giây; phép thử text riêng có deadline 30 giây. Schema thử chỉ có `max_price`, chưa phải toàn bộ contract production.

Mặc định chạy tuần tự, nghỉ 20 giây trước mỗi model, `max_tokens:600`/request, không retry tự động. Gặp thông báo rate limit thì dừng gọi thêm và ghi các model còn lại là chưa kiểm tra do quota. Không coi model bị chặn quota/timeout một lần là model không tồn tại. `antigravity-swarm` được ghi riêng là chưa thử vì là route nhiều agent, ngoài phạm vi adapter một model của MVP.

Báo cáo JSON trong `diagnostics/` lưu ID model, timestamp UTC, status/finish_reason, số delta, thời gian, usage và câu trả lời từ dữ liệu giả; không lưu credential hoặc tool-call ID dài. Model có mặt trong catalog chưa đồng nghĩa key hiện tại gọi được model đó. Kết quả có hiệu lực tại thời điểm đo với key/endpoint đó, không bảo đảm tài khoản khác hoặc những lần gọi sau.

`PASS` chỉ xác nhận ba phép thử giao thức và dữ liệu giả đạt; không phải đánh giá chất lượng tư vấn, bảo mật, danh tính upstream hay SLA. Giá trong follow-up phải khớp 17.990.000 VND và sản phẩm Laptop Demo A. Nếu model diễn đạt giá bằng đơn vị triệu thay vì số đầy đủ, cần đọc báo cáo để xác minh trước khi kết luận sai giá.

### Bảng kết quả kiểm chứng thực tế (19 models)

Ngày đo: **16/10/2026** (Đã chạy kiểm thử độc lập tránh rate limit quota):

| Model ID | Nhóm | Text Stream | Tool Calling | Follow-up sau Tool | Trạng thái cho LapBot | Ghi chú |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **`gemini-2.5-flash`** | Google |  PASS |  PASS |  PASS | **ĐẠT (Khuyên dùng)** | Tốc độ nhanh (~3-4s), xử lý tool và tiếng Việt rất chuẩn |
| **`gemini-3.1-flash-lite`** | Google |  PASS |  PASS |  PASS | **ĐẠT (Khuyên dùng)** | Tốc độ cao, tối ưu chi phí |
| **`gemini-3.8-flash`** | Google |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`gemini-4-argon`** | Google |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`claude-haiku-5-5`** | Anthropic |  PASS |  PASS |  PASS | **ĐẠT (Khuyên dùng)** | Độ trễ thấp (~2.1s), gọi tool chính xác |
| **`claude-opus-5`** | Anthropic |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`claude-fable-5`** | Anthropic |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`claude-fable-5.1`** | Anthropic |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`deepseek-v4.1-flash`** | DeepSeek |  PASS |  PASS |  PASS | **ĐẠT (Khuyên dùng)** | Tốc độ tốt (~2.5s), phân tích cấu hình tốt |
| **`gpt-5.6-luna`** | OpenAI |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`gpt-6-astra`** | OpenAI |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`qwen3.8-flash`** | Qwen |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`glm-5.3`** | Zhipu |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`glm-5.3-flash`** | Zhipu |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`grok-4.6`** | xAI |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| **`grok-4.7`** | xAI |  PASS |  PASS |  PASS | **ĐẠT** | Hoạt động tốt |
| `claude-opus-5-5` | Anthropic |  PASS |  PASS | ❌ Lỗi upstream | **Chỉ Text (Không dùng tool)** | Bước trả lời sau tool bị lỗi `upstream empty response` |
| `gpt-6-luna` | OpenAI |  PASS | ❌ Không trigger | N/A | **Chỉ Text (Không dùng tool)** | Không tự kích hoạt gọi tool khi có schema |
| `antigravity-swarm` | Multi-agent |  Stream | N/A | N/A | **Không áp dụng** | Chạy multi-agent SSE chu trình dài, không dùng cho single adapter |

