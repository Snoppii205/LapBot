import { config } from '../../../config.js';
import { AppError } from '../../../lib/errors.js';
import { readSse } from './sse.js';

export type ProviderMessage = Record<string, unknown>;
export type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};
type ToolFragment = {
  index: number;
  id?: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};
type ProviderFrame = {
  error?: unknown;
  usage?: Record<string, unknown>;
  choices?: Array<{
    finish_reason?: string;
    delta?: {
      content?: string;
      reasoning_content?: string;
      tool_calls?: ToolFragment[];
    };
  }>;
};
export type Completion = {
  text: string;
  toolCalls: ToolCall[];
  finishReason: string;
  usage: Record<string, unknown> | null;
};
export async function complete(
  messages: ProviderMessage[],
  tools: Record<string, unknown>[],
  signal: AbortSignal,
  onText: (text: string) => void,
  modelOverride?: string,
  maxTokensOverride?: number
): Promise<Completion> {
  if (!config.llmBaseUrl || !config.llmApiKey) {
    throw new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI chưa được cấu hình cổng kết nối.');
  }
  const model = modelOverride || config.llmModel || 'gemini-2.5-flash';
  const max_tokens = maxTokensOverride || 1200;
  const requestBody: Record<string, unknown> = {
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    max_tokens
  };
  if (tools.length > 0) {
    requestBody.tools = tools;
    requestBody.tool_choice = 'auto';
  }
  const response = await fetch(`${config.llmBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    signal,
    headers: {
      Authorization: `Bearer ${config.llmApiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 429)
      throw new AppError(
        503,
        'LLM_RATE_LIMIT',
        'Hệ thống AI đang quá tải lượt gọi (Rate Limit), vui lòng thử lại sau giây lát.'
      );
    throw new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI tạm thời không khả dụng.');
  }
  if (
    (response.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() !==
      'text/event-stream' ||
    !response.body
  )
    throw new AppError(503, 'LLM_INVALID_STREAM', 'Trợ lý AI trả dữ liệu không hợp lệ.');
  let text = '',
    finishReason = '',
    done = false,
    usage: Record<string, unknown> | null = null;
  const calls = new Map<number, ToolCall>();
  let held = '',
    verifiedPrefix = false;
  for await (const data of readSse(response.body)) {
    if (data === '[DONE]') {
      done = true;
      break;
    }
    let frame: ProviderFrame;
    try {
      frame = JSON.parse(data) as ProviderFrame;
    } catch {
      throw new AppError(503, 'LLM_INVALID_STREAM', 'Luồng AI bị lỗi.');
    }
    if (frame?.error)
      throw new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI tạm thời không khả dụng.');
    if (frame?.usage) usage = frame.usage;
    const choice = frame?.choices?.[0];
    if (!choice) continue;
    if (choice.finish_reason) {
      const r = choice.finish_reason;
      finishReason =
        r === 'tool_use' || r === 'function_call' || r === 'TOOL_CALLS'
          ? 'tool_calls'
          : r === 'end_turn' || r === 'stop_sequence' || r === 'STOP'
            ? 'stop'
            : r === 'max_tokens' || r === 'MAX_TOKENS'
              ? 'length'
              : r;
    }
    const delta = choice.delta;
    if (typeof delta?.content === 'string' && delta.content) {
      text += delta.content;
      if (text.length > 12000) throw new AppError(503, 'LLM_OUTPUT_LIMIT', 'Phản hồi AI quá dài.');
      if (verifiedPrefix) {
        onText(delta.content);
      } else {
        held += delta.content;
        const isErrorPrefix =
          held.startsWith('SYSTEM NOTICE') ||
          held.startsWith('RPM limit') ||
          held.startsWith('Upstream returned');
        if (!isErrorPrefix && held.length >= 30) {
          verifiedPrefix = true;
          onText(held);
          held = '';
        }
      }
    }
    if (Array.isArray(delta?.tool_calls))
      for (const fragment of delta.tool_calls as ToolFragment[]) {
        if (!Number.isInteger(fragment.index) || fragment.index < 0 || fragment.index > 3)
          throw new AppError(503, 'LLM_INVALID_TOOL', 'Tool call không hợp lệ.');
        const current = calls.get(fragment.index) ?? {
          id: '',
          type: 'function' as const,
          function: { name: '', arguments: '' }
        };
        if (fragment.id) current.id += fragment.id;
        if (fragment.type && fragment.type !== 'function')
          throw new AppError(503, 'LLM_INVALID_TOOL', 'Tool call không hợp lệ.');
        if (fragment.function?.name) current.function.name += fragment.function.name;
        if (fragment.function?.arguments) current.function.arguments += fragment.function.arguments;
        if (current.function.arguments.length > 16000)
          throw new AppError(503, 'LLM_INVALID_TOOL', 'Tool arguments quá dài.');
        calls.set(fragment.index, current);
      }
  }
  if (finishReason === 'length' && calls.size === 0 && text.trim().length > 0) {
    finishReason = 'stop';
  }
  const completedCleanly = done || finishReason === 'stop' || finishReason === 'tool_calls';
  if (!completedCleanly || !finishReason || !['stop', 'tool_calls'].includes(finishReason))
    throw new AppError(503, 'LLM_INCOMPLETE', 'Phản hồi AI chưa hoàn chỉnh.');
  if (/^SYSTEM NOTICE: RATE LIMIT EXCEEDED|^RPM limit exceeded/i.test(text))
    throw new AppError(503, 'LLM_RATE_LIMIT', 'Trợ lý AI đang quá tải.');
  if (/^Upstream returned an empty response/i.test(text))
    throw new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI tạm thời không khả dụng.');
  if (held) onText(held);
  const toolCalls = [...calls.entries()].sort(([a], [b]) => a - b).map(([, call]) => call);
  if (
    new Set(toolCalls.map(call => call.id)).size !== toolCalls.length ||
    toolCalls.some(call => !call.id || !call.function.name)
  )
    throw new AppError(503, 'LLM_INVALID_TOOL', 'Tool call không hợp lệ.');
  if (finishReason === 'tool_calls' && !toolCalls.length)
    throw new AppError(503, 'LLM_INVALID_TOOL', 'Tool call bị thiếu.');
  return { text, toolCalls, finishReason, usage };
}
