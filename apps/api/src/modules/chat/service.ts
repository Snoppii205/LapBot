import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from '../../db/pool.js';
import { AppError } from '../../lib/errors.js';
import {
  acceptText,
  beginGate,
  closeGate,
  emitStatus,
  flushText,
  flushWidgets,
  gateAccepts,
  gateFor,
  stageWidget
} from './control-gate.js';
import { requestHuman } from './control.js';
import {
  finalizeTurn,
  mergeSalesFilter,
  recentMessages,
  type Receipt,
  type TurnTelemetry
} from './repository.js';
import { complete, type ProviderMessage } from './llm/gateway.js';
import { executeTool, parseTool, toolDefinitions } from './tools/execute.js';
import { getAiRuntimeSettings } from '../admin/ai.js';
import { getStoreSettings } from '../admin/settings.js';

const storePath = fileURLToPath(
  new URL('../../../../../data/store-info.fallback.json', import.meta.url)
);
const redact = (text: string) =>
  text
    .replace(/\b0[35789][0-9]{8}\b/g, '[số điện thoại]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]');

export function requestHash(message: string, selectedVariantId: string | null) {
  return createHash('sha256')
    .update(JSON.stringify([message.trim(), selectedVariantId]))
    .digest('hex');
}

export async function runAiTurn(
  sessionId: string,
  turn: Receipt,
  send: (event: string, data: Record<string, unknown>) => void,
  connectionSignal: AbortSignal
): Promise<void> {
  const startTime = Date.now();
  const aiConfig = await getAiRuntimeSettings().catch(() => null);
  const activeModel = aiConfig?.active_model || 'gemini-2.5-flash';
  const timeoutMs = aiConfig?.turn_timeout_ms || 30000;
  const configuredMax = aiConfig?.max_tokens_per_call || 1200;
  const maxTokens = Math.max(configuredMax, 1100);

  const controller = new AbortController();
  const deadline = Date.now() + timeoutMs;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  connectionSignal.addEventListener('abort', () => controller.abort(), { once: true });

  const gate = beginGate({
    sessionId,
    turnId: turn.id,
    version: turn.generation_version!,
    deadline,
    controller,
    send
  });

  let calls = 0;
  let toolsUsed = 0;
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    let store: Record<string, unknown> = {};
    try {
      const settings = await getStoreSettings();
      store = settings as unknown as Record<string, unknown>;
    } catch {
      try {
        store = JSON.parse(await readFile(storePath, 'utf8')) as Record<string, unknown>;
      } catch {
        // fallback
      }
    }

    const sessionRes = await pool.query<{ sales_context: Record<string, unknown> }>(
      'SELECT sales_context FROM chat_sessions WHERE id = $1',
      [sessionId]
    );
    const salesCtx = sessionRes.rows[0]?.sales_context;
    const selectedVariantId = salesCtx?.selected_variant_id;
    const variantHint =
      typeof selectedVariantId === 'string'
        ? ` Khách đang xem cấu hình máy có variant_id='${selectedVariantId}'. Nếu khách hỏi 'máy này', 'con này' hoặc muốn đặt mua, hãy dùng variant_id này để gọi get_laptop_detail hoặc show_checkout_form.`
        : '';
    const activeFilter = salesCtx?.filter as Record<string, unknown> | undefined;
    const filterHint = activeFilter
      ? ` Nhu cầu khách từng tìm: ${Object.entries(activeFilter)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}.`
      : '';

    const history = (await recentMessages(sessionId)).map(item => ({
      role: item.role === 'USER' ? 'user' : 'assistant',
      content: redact(item.content)
    }));

    const customInstructions = aiConfig?.custom_system_instructions?.trim()
      ? `\nLưu ý phong cách cửa hàng: ${aiConfig.custom_system_instructions}`
      : '';

    const system = `Bạn là chuyên viên tư vấn laptop thông minh cho LapBot theo phong cách súc tích, lịch sự, am hiểu phần cứng và đáng tin cậy.
Quy tắc vận hành bắt buộc:
1. Chỉ dùng dữ liệu catalog và chính sách thực tế từ kết quả tool và cửa hàng; tuyệt đối không bịa giá, tồn kho, cấu hình hay chính sách thanh toán. Nếu GPU hoặc màn hình ghi "Chưa xác minh", hãy nói rõ thông số đó chưa được xác minh hoặc là đồ họa tích hợp tiêu chuẩn, không tự suy đoán.
2. Quy đổi ngân sách tiếng Việt chuẩn xác ra số nguyên VND trước khi gọi search_laptop_catalog: "15tr" / "15 triệu" / "15 củ" = 15000000; "dưới 20tr" -> max_price=20000000; "tầm 20tr" / "khoảng 20tr" -> min_price=16000000, max_price=21000000; "rẻ nhất" -> sort_by="price_asc". Tuyệt đối không tự nâng max_price vượt trần khách đưa ra.
3. Khi khách nhắc dòng máy, chip hoặc GPU cụ thể (ví dụ "MacBook", "ThinkPad", "Legion", "RTX", "M2", "144Hz", "OLED"), truyền vào tham số keyword của search_laptop_catalog kết hợp preferred_brand / usage_category phù hợp.
4. Không in chuỗi UUID (variant_id, laptop_id) ra văn bản trả lời; hãy gọi tên máy (**Hãng + Model**) hoặc "máy #1", "máy #2". Vì giao diện đã tự động hiển thị thẻ sản phẩm trực quan ngay bên dưới lời tư vấn của bạn, hãy tập trung nêu điểm mạnh/yếu, lý do phù hợp nhu cầu và gợi ý chọn máy ngắn gọn thay vì chép lại toàn bộ thông số khô khan.
5. Nếu khách nói "máy này" / "con này" khi vừa hiển thị nhiều thẻ cấu hình và chưa có máy ghim rõ ràng, hãy hỏi lại ngắn gọn khách muốn chọn mẫu nào trước khi mở form đặt hàng.
6. Khi khách muốn đặt mua hoặc chốt đơn một máy cụ thể còn hàng, gọi tool show_checkout_form để mở phiếu đặt hàng trực tiếp trong chat. Không bao giờ coi tin nhắn "OK" / "Chốt" là đơn hàng đã tạo thành công — khách phải tự điền thông tin nhận hàng và bấm xác nhận trong phiếu đặt hàng.${variantHint}${filterHint}${customInstructions}
Thông tin cửa hàng: ${JSON.stringify(store).slice(0, 1800)}.`;

    const messages: ProviderMessage[] = [{ role: 'system', content: system }, ...history];
    while (
      JSON.stringify({ messages, tools: toolDefinitions }).length > 19000 &&
      messages.length > 2
    ) {
      messages.splice(1, 1);
    }

    const MAX_PROVIDER_CALLS = 4;
    let finished = false;
    while (calls < MAX_PROVIDER_CALLS && !finished) {
      if (!gateAccepts(gate)) throw new AppError(503, 'TURN_INTERRUPTED', 'Lượt chat đã ngắt.');
      calls++;
      const callTools = calls === MAX_PROVIDER_CALLS ? [] : toolDefinitions;
      let needsParagraphBreak = gate.text.length > 0 && !/\s$/.test(gate.text);
      const result = await complete(
        messages,
        callTools,
        controller.signal,
        text => {
          if (needsParagraphBreak && text.trim().length > 0) {
            needsParagraphBreak = false;
            acceptText(gate, `\n\n${text.replace(/^\s+/, '')}`);
          } else {
            if (text.trim().length > 0) needsParagraphBreak = false;
            acceptText(gate, text);
          }
        },
        activeModel,
        maxTokens
      );

      if (result.usage) {
        if (typeof result.usage.prompt_tokens === 'number')
          promptTokens += result.usage.prompt_tokens;
        if (typeof result.usage.completion_tokens === 'number')
          completionTokens += result.usage.completion_tokens;
      }

      if (result.finishReason === 'stop') {
        if (gate.stagedWidgets.length > 0 && !gate.text.trim()) {
          acceptText(gate, 'Dưới đây là thông tin cấu hình phù hợp hiện có tại kho LapBot:');
        }
        flushText(gate);
        flushWidgets(gate);
        const telemetry: TurnTelemetry = {
          model_used: activeModel,
          provider_calls: calls,
          tool_calls_count: toolsUsed,
          prompt_tokens: promptTokens || undefined,
          completion_tokens: completionTokens || undefined,
          latency_ms: Date.now() - startTime
        };
        const saved = await finalizeTurn(
          sessionId,
          turn.id,
          gate.version,
          'COMPLETED',
          gate.text,
          gate.widgets,
          telemetry
        );
        if (saved && gateAccepts(gate)) send('done', { turn_id: turn.id, status: 'COMPLETED' });
        finished = true;
        break;
      }

      if (toolsUsed + result.toolCalls.length > 4)
        throw new AppError(503, 'TOOL_BUDGET', 'Giới hạn thao tác tư vấn đã đạt.');
      toolsUsed += result.toolCalls.length;
      if (result.toolCalls.length > 0) {
        emitStatus(gate, 'searching');
      }
      messages.push({
        role: 'assistant',
        content: result.text || null,
        tool_calls: result.toolCalls
      });

      for (const call of result.toolCalls) {
        let args: Record<string, unknown>;
        try {
          args = parseTool(call.function.name, call.function.arguments);
        } catch (parseErr) {
          messages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify({
              error: 'INVALID_TOOL_ARGUMENTS',
              message: parseErr instanceof Error ? parseErr.message : 'Tham số không hợp lệ.',
              hint: 'Vui lòng kiểm tra lại tham số và gọi lại đúng schema.'
            })
          });
          continue;
        }

        if (call.function.name === 'escalate_to_human_agent') {
          await requestHuman(sessionId, gate.version);
          send('done', { turn_id: turn.id, status: 'INTERRUPTED' });
          finished = true;
          break;
        }
        if (call.function.name === 'search_laptop_catalog') {
          void mergeSalesFilter(sessionId, gate.version, args).catch(() => {});
        }
        const output = await executeTool(call.function.name, args);
        if (!gateAccepts(gate)) throw new AppError(503, 'TURN_INTERRUPTED', 'Lượt chat đã ngắt.');
        if (output.widget) stageWidget(gate, output.widget);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(output.result).slice(0, 8000)
        });
      }

      if (JSON.stringify({ messages, tools: toolDefinitions }).length > 19000) {
        throw new AppError(503, 'CONTEXT_BUDGET', 'Giới hạn ngữ cảnh đã đạt.');
      }
    }

    if (!finished) throw new AppError(503, 'PROVIDER_BUDGET', 'Giới hạn lượt tư vấn đã đạt.');
  } catch (error) {
    if (gateFor(sessionId) === gate) {
      const interrupted = controller.signal.aborted || connectionSignal.aborted;
      const code = error instanceof AppError ? error.code : 'LLM_UNAVAILABLE';

      if (
        !interrupted &&
        (gate.stagedWidgets.length > 0 || gate.widgets.length > 0) &&
        gateAccepts(gate)
      ) {
        if (!gate.text.trim()) {
          acceptText(
            gate,
            'Dưới đây là các cấu hình laptop phù hợp hiện có sẵn tại kho LapBot theo nhu cầu của bạn:'
          );
        }
        flushText(gate);
        flushWidgets(gate);
        const recoveredTelemetry: TurnTelemetry = {
          model_used: activeModel,
          provider_calls: calls,
          tool_calls_count: toolsUsed,
          prompt_tokens: promptTokens || undefined,
          completion_tokens: completionTokens || undefined,
          latency_ms: Date.now() - startTime,
          error_code: `recovered_${code}`
        };
        const recovered = await finalizeTurn(
          sessionId,
          turn.id,
          gate.version,
          'COMPLETED',
          gate.text,
          gate.widgets,
          recoveredTelemetry
        ).catch(() => false);
        if (recovered && !connectionSignal.aborted) {
          send('done', { turn_id: turn.id, status: 'COMPLETED' });
          return;
        }
      }

      flushText(gate);
      const status = interrupted ? 'INTERRUPTED' : 'FAILED';

      const telemetry: TurnTelemetry = {
        model_used: activeModel,
        provider_calls: calls,
        tool_calls_count: toolsUsed,
        prompt_tokens: promptTokens || undefined,
        completion_tokens: completionTokens || undefined,
        latency_ms: Date.now() - startTime,
        error_code: code
      };

      const saved = await finalizeTurn(
        sessionId,
        turn.id,
        gate.version,
        status,
        gate.text,
        gate.widgets,
        telemetry
      ).catch(() => false);
      if (saved && !connectionSignal.aborted) {
        let message = 'Trợ lý AI tạm thời không khả dụng.';
        if (code === 'LLM_RATE_LIMIT') {
          message =
            'Hệ thống AI đang quá tải lượt gọi (Rate Limit), vui lòng thử lại sau giây lát.';
        } else if (code === 'TURN_INTERRUPTED') {
          message = 'Lượt trao đổi đã dừng.';
        } else if (code === 'TOOL_BUDGET' || code === 'PROVIDER_BUDGET') {
          message =
            'Đã đạt giới hạn tìm kiếm trong một lượt, vui lòng gửi tin nhắn mới để LapBot hỗ trợ tiếp.';
        } else if (error instanceof AppError && error.message) {
          message = error.message;
        }
        send('error', { turn_id: turn.id, code, message });
        send('done', { turn_id: turn.id, status });
      }
    }
  } finally {
    clearTimeout(timer);
    if (gateFor(sessionId) === gate) closeGate(sessionId);
  }
}
