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
  truncatedByLength?: boolean;
  usage: Record<string, unknown> | null;
};

const CONTEXT_LIMIT_RE =
  /context_length_exceeded|context[-_\s]?window|maximum\s+context\s+length|reduce\s+(?:the\s+)?length|too\s+many\s+tokens|token\s+limit|prompt\s+(?:is\s+)?too\s+(?:long|large)|input\s+(?:is\s+|token\s+count\s+)?(?:too\s+(?:long|large)|exceeds)|exceeds?\s+(?:the\s+)?(?:max(?:imum)?\s+)?(?:context|token|input)\s*(?:length|limit|window|count)?|request\s+(?:entity\s+)?too\s+large|payload\s+too\s+large/i;

const RATE_LIMIT_RE = /rate[-_\s]?limit|too\s+many\s+requests|rpm\s+limit/i;

function extractUpstreamErrorText(raw: string): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as {
      error?: { code?: unknown; type?: unknown; message?: unknown } | string;
      message?: unknown;
      code?: unknown;
    };
    const parts: string[] = [];
    if (typeof parsed.code === 'string') parts.push(parsed.code);
    if (typeof parsed.message === 'string') parts.push(parsed.message);
    if (typeof parsed.error === 'string') {
      parts.push(parsed.error);
    } else if (parsed.error && typeof parsed.error === 'object') {
      if (typeof parsed.error.code === 'string') parts.push(parsed.error.code);
      if (typeof parsed.error.type === 'string') parts.push(parsed.error.type);
      if (typeof parsed.error.message === 'string') parts.push(parsed.error.message);
    }
    if (parts.length > 0) return parts.join(' ');
  } catch {
    // Non-JSON upstream error body; fall through to raw text
  }
  return raw;
}

export function classifyUpstreamHttpError(status: number, bodyText: string): AppError {
  if (status === 429) {
    return new AppError(
      503,
      'LLM_RATE_LIMIT',
      'Hệ thống AI đang quá tải lượt gọi (Rate Limit), vui lòng thử lại sau giây lát.'
    );
  }
  const normalized = extractUpstreamErrorText(bodyText);
  if (status === 413 || CONTEXT_LIMIT_RE.test(normalized)) {
    return new AppError(503, 'CONTEXT_BUDGET', 'Giới hạn ngữ cảnh đã đạt.');
  }
  if (RATE_LIMIT_RE.test(normalized)) {
    return new AppError(
      503,
      'LLM_RATE_LIMIT',
      'Hệ thống AI đang quá tải lượt gọi (Rate Limit), vui lòng thử lại sau giây lát.'
    );
  }
  return new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI tạm thời không khả dụng.');
}

export function classifyUpstreamStreamError(frameError: unknown): AppError {
  const serialized =
    typeof frameError === 'string'
      ? frameError
      : (() => {
          try {
            return JSON.stringify(frameError);
          } catch {
            return '';
          }
        })();
  const normalized = extractUpstreamErrorText(serialized);
  if (CONTEXT_LIMIT_RE.test(normalized)) {
    return new AppError(503, 'CONTEXT_BUDGET', 'Giới hạn ngữ cảnh đã đạt.');
  }
  if (RATE_LIMIT_RE.test(normalized)) {
    return new AppError(
      503,
      'LLM_RATE_LIMIT',
      'Hệ thống AI đang quá tải lượt gọi (Rate Limit), vui lòng thử lại sau giây lát.'
    );
  }
  return new AppError(503, 'LLM_UNAVAILABLE', 'Trợ lý AI tạm thời không khả dụng.');
}
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
  const max_tokens = maxTokensOverride || 3600;
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
    const errorBody = await response
      .text()
      .then(s => s.slice(0, 4096))
      .catch(() => '');
    throw classifyUpstreamHttpError(response.status, errorBody);
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
    if (frame?.error) throw classifyUpstreamStreamError(frame.error);
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
      if (text.length > 24000) throw new AppError(503, 'LLM_OUTPUT_LIMIT', 'Phản hồi AI quá dài.');
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
        if (!Number.isInteger(fragment.index) || fragment.index < 0 || fragment.index > 7)
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
  const truncatedByLength = finishReason === 'length';
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
  return { text, toolCalls, finishReason, truncatedByLength, usage };
}
