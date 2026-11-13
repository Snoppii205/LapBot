export type BudgetMessage = Record<string, unknown>;

export const PRE_TURN_CONTEXT_BUDGET_CHARS = 36_000;
export const IN_TURN_CONTEXT_BUDGET_CHARS = 64_000;
export const HARD_CONTEXT_LIMIT_CHARS = 96_000;
export const MAX_TOOLS_PER_TURN = 8;
export const MAX_PROVIDER_CALLS = 5;

function fitTruncatedPreviewJson(raw: string, maxChars: number): string {
  let previewLen = Math.max(40, maxChars - 64);
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = JSON.stringify({
      truncated: true,
      preview: raw.slice(0, previewLen)
    });
    if (candidate.length <= maxChars || previewLen <= 20) {
      return candidate;
    }
    const overflowRatio = maxChars / candidate.length;
    previewLen = Math.max(20, Math.floor(previewLen * overflowRatio * 0.85));
  }
  return JSON.stringify({ truncated: true, preview: raw.slice(0, 20) });
}

export function serializeToolResult(result: unknown, maxChars = 6000): string {
  const raw = JSON.stringify(result);
  if (raw.length <= maxChars) return raw;

  if (result && typeof result === 'object' && !Array.isArray(result)) {
    const clone: Record<string, unknown> = { ...(result as Record<string, unknown>) };
    if (typeof clone.description === 'string' && clone.description.length > 400) {
      clone.description = `${clone.description.slice(0, 400)}…`;
      const withTrimmedDesc = JSON.stringify(clone);
      if (withTrimmedDesc.length <= maxChars) return withTrimmedDesc;
    }
    if (Array.isArray(clone.variants) && clone.variants.length > 1) {
      const allVariants = clone.variants;
      clone.total_variants = allVariants.length;
      for (let keep = Math.min(allVariants.length - 1, 6); keep >= 1; keep--) {
        clone.variants = allVariants.slice(0, keep);
        const candidate = JSON.stringify(clone);
        if (candidate.length <= maxChars) return candidate;
      }
    }
  }

  return fitTruncatedPreviewJson(raw, maxChars);
}

function shrinkToolMessage(msg: BudgetMessage | undefined, targetChars: number): boolean {
  if (!msg || msg.role !== 'tool') return false;
  const rawContent = msg.content;
  if (typeof rawContent !== 'string' || rawContent.length <= targetChars) return false;

  try {
    const parsed = JSON.parse(rawContent) as unknown;
    const compacted = serializeToolResult(parsed, targetChars);
    if (compacted.length < rawContent.length) {
      msg.content = compacted;
      return true;
    }
  } catch {
    const compacted = fitTruncatedPreviewJson(rawContent, targetChars);
    if (compacted.length < rawContent.length) {
      msg.content = compacted;
      return true;
    }
  }

  return false;
}

function stripOptionalSystemSections(systemContent: string): string {
  let next = systemContent.replace(
    /\n?<store_tone_preferences>[\s\S]*?<\/store_tone_preferences>/g,
    ''
  );
  next = next.replace(/<store_ground_truth>([\s\S]*?)<\/store_ground_truth>/, (_m, inner) => {
    const trimmed = String(inner ?? '').trim();
    if (trimmed.length <= 450) return `<store_ground_truth>\n${trimmed}\n</store_ground_truth>`;
    return `<store_ground_truth>\n${trimmed.slice(0, 450)}\n</store_ground_truth>`;
  });
  return next;
}

/**
 * Fits prompt messages + tool schemas inside `maxChars` in progressive phases:
 * 1) evict oldest prior-turn user/assistant pairs,
 * 2) shrink oversized active-turn tool outputs to 1200 chars,
 * 3) compact tool outputs to 480 chars, drop oldest intermediate in-turn tool rounds
 *    while preserving the active user prompt and latest tool round, then shrink to 220 chars
 *    and finally trim optional store sections if still over budget.
 */
export function fitMessagesToContextBudget(params: {
  messages: BudgetMessage[];
  tools: Record<string, unknown>[];
  protectedStartIndex: number;
  maxChars: number;
}): { protectedStartIndex: number; serializedLength: number } {
  const { messages, tools, maxChars } = params;
  let protectedIdx = Math.max(1, Math.min(params.protectedStartIndex, messages.length));

  // Ensure history always begins cleanly on a user turn (e.g. after LIMIT window slicing)
  while (protectedIdx > 1 && messages[1]?.role !== 'user') {
    messages.splice(1, 1);
    protectedIdx--;
  }

  const measure = () => JSON.stringify({ messages, tools }).length;
  let currentLen = measure();

  // Phase 1: Evict oldest prior-turn history pairs while keeping system [0] and current turn [protectedIdx..end]
  while (currentLen > maxChars && protectedIdx > 1) {
    messages.splice(1, 1);
    protectedIdx--;
    while (protectedIdx > 1 && messages[1]?.role !== 'user') {
      messages.splice(1, 1);
      protectedIdx--;
    }
    currentLen = measure();
  }

  // Phase 2: If current-turn tool outputs alone exceed maxChars, compact oversized tool results to 1200 chars
  if (currentLen > maxChars) {
    for (let i = protectedIdx; i < messages.length && currentLen > maxChars; i++) {
      if (shrinkToolMessage(messages[i], 1200)) {
        currentLen = measure();
      }
    }
  }

  // Phase 3a: Shrink tool outputs further (480 chars) before dropping any in-turn rounds
  if (currentLen > maxChars) {
    for (let i = protectedIdx; i < messages.length && currentLen > maxChars; i++) {
      if (shrinkToolMessage(messages[i], 480)) {
        currentLen = measure();
      }
    }
  }

  // Phase 3b: Drop oldest completed intermediate (assistant + tool...) rounds inside active turn,
  // preserving messages[protectedIdx] (latest user message) and the newest assistant + tool round.
  if (currentLen > maxChars) {
    let lastAssistantIdx = -1;
    for (let i = messages.length - 1; i > protectedIdx; i--) {
      if (messages[i]?.role === 'assistant') {
        lastAssistantIdx = i;
        break;
      }
    }
    const groupStart = protectedIdx + 1;
    while (currentLen > maxChars && lastAssistantIdx > groupStart) {
      let removeCount = 1;
      if (messages[groupStart]?.role === 'assistant') {
        let groupEnd = groupStart + 1;
        while (groupEnd < lastAssistantIdx && messages[groupEnd]?.role === 'tool') {
          groupEnd++;
        }
        removeCount = groupEnd - groupStart;
      }
      messages.splice(groupStart, removeCount);
      lastAssistantIdx -= removeCount;
      currentLen = measure();
    }
  }

  // Phase 3c: Last-resort compact remaining tool outputs down to 220 chars
  if (currentLen > maxChars) {
    for (let i = protectedIdx; i < messages.length && currentLen > maxChars; i++) {
      if (shrinkToolMessage(messages[i], 220)) {
        currentLen = measure();
      }
    }
  }

  // Phase 3d: Strip optional store tone / long ground truth tags from system prompt if present
  if (
    currentLen > maxChars &&
    messages[0]?.role === 'system' &&
    typeof messages[0].content === 'string'
  ) {
    const compactedSystem = stripOptionalSystemSections(messages[0].content);
    if (compactedSystem.length < messages[0].content.length) {
      messages[0].content = compactedSystem;
      currentLen = measure();
    }
  }

  return { protectedStartIndex: protectedIdx, serializedLength: currentLen };
}
