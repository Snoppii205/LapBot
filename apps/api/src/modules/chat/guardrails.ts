export type InputGuardrailVerdict =
  | { blocked: false }
  | {
      blocked: true;
      reason: 'prompt_injection' | 'off_topic';
      reply: string;
    };

const wb = (pattern: string, flags = 'iu') =>
  new RegExp(`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, flags);

const INJECTION_PATTERNS: RegExp[] = [
  // Role / delimiter / XML tag spoofing
  /<\|\s*(?:im_start|im_end|system|user|assistant|endoftext)\s*\|>/iu,
  /<\s*\/?\s*(?:immutable_security_rules|sales_concierge_playbook|store_ground_truth|untrusted_session_context|store_tone_preferences|system_prompt|system_instructions)\s*>/iu,
  /(?:^|\n)\s*(?:\[\s*SYSTEM(?:\s+OVERRIDE|\s+PROMPT|\s+INSTRUCTION)?\s*\]|###\s*(?:System\s+Instruction|System\s+Prompt)\s*:)/iu,

  // English instruction override / jailbreak
  wb(
    '(?:ignore|disregard|forget|override|bypass)\\s+(?:all\\s+|any\\s+|your\\s+|the\\s+)?(?:previous|prior|above|earlier|system|core|initial|hidden)\\s+(?:instructions?|rules?|prompts?|constraints?|guidelines?|directives?)'
  ),
  wb(
    '(?:you\\s+are\\s+now\\s+DAN|do\\s+anything\\s+now|developer\\s+mode\\s+enabled|enable\\s+jailbreak|act\\s+as\\s+an\\s+unrestricted\\s+AI)'
  ),

  // Vietnamese instruction override / jailbreak
  wb(
    '(?:bỏ\\s+qua|phớt\\s+lờ|quên\\s+đi|xóa\\s+bỏ|vô\\s+hiệu\\s+hóa)\\s+(?:mọi\\s+|tất\\s+cả\\s+|toàn\\s+bộ\\s+|các\\s+)?(?:quy\\s+tắc|chỉ\\s+dẫn|hướng\\s+dẫn|câu\\s+lệnh|ràng\\s+buộc|luật)(?:\\s+(?:trên|phía\\s+trên|trước(?:\\s+đó)?|cũ|hệ\\s+thống|ban\\s+đầu|bắt\\s+buộc))?'
  ),
  wb(
    '(?:bật\\s+chế\\s+độ\\s+(?:DAN|developer|jailbreak|không\\s+giới\\s+hạn)|từ\\s+(?:giờ|bây\\s+giờ)\\s+bạn\\s+(?:không\\s+còn\\s+là\\s+LapBot|là\\s+AI\\s+tự\\s+do|không\\s+bị\\s+ràng\\s+buộc))'
  ),

  // System prompt / hidden config extraction (EN + VI)
  wb(
    '(?:print|show|reveal|display|output|repeat|dump|leak)\\s+(?:me\\s+)?(?:all\\s+|your\\s+|the\\s+)?(?:full\\s+|exact\\s+|entire\\s+|verbatim\\s+)?(?:system\\s+prompt|system\\s+instructions?|hidden\\s+prompt|initial\\s+prompt|internal\\s+rules|tool\\s+definitions?)'
  ),
  wb(
    '(?:in\\s+ra|hiển\\s+thị|tiết\\s+lộ|sao\\s+chép|lặp\\s+lại|chép\\s+lại|đọc\\s+lại|xuất\\s+ra|cho\\s+(?:tôi|mình|anh|chị|em)\\s+(?:xem|biết))\\s+(?:nguyên\\s+văn\\s+|toàn\\s+bộ\\s+|đầy\\s+đủ\\s+|chính\\s+xác\\s+)?(?:system\\s*prompt|prompt\\s+hệ\\s+thống|chỉ\\s+dẫn\\s+hệ\\s+thống|quy\\s+tắc\\s+vận\\s+hành(?:\\s+bắt\\s+buộc)?|câu\\s+lệnh\\s+hệ\\s+thống|cấu\\s+hình\\s+json(?:\\s+nội\\s+bộ)?)'
  ),

  // Fake admin / price / tool spoofing
  wb(
    '(?:admin\\s+override|system\\s+override|set\\s+price_vnd\\s*=|admin\\s+đã\\s+duyệt\\s+giảm\\s+giá|lệnh\\s+quản\\s+trị\\s*:\\s*(?:giảm\\s+giá|sửa\\s+giá|miễn\\s+phí))'
  )
];

const LAPTOP_DOMAIN_SIGNAL_RE = wb(
  [
    'laptop',
    'máy\\s*tính',
    'máy',
    'macbook',
    'ultrabook',
    'workstation',
    'notebook',
    'netbook',
    'chromebook',
    'cấu\\s*hình',
    'phần\\s*cứng',
    'chip',
    'cpu',
    'gpu',
    'vga',
    'card',
    'ram',
    'ssd',
    'nvme',
    'hdd',
    'ổ\\s*cứng',
    'màn\\s*hình',
    'màn',
    'oled',
    'ips',
    'mini\\s*led',
    '120hz',
    '144hz',
    '165hz',
    '240hz',
    'pin',
    'sạc',
    'bàn\\s*phím',
    'trackpad',
    'touchpad',
    'tản\\s*nhiệt',
    'trọng\\s*lượng',
    'mỏng\\s*nhẹ',
    'inch',
    'thunderbolt',
    'type-?c',
    'hdmi',
    'webcam',
    'dell',
    'asus',
    'lenovo',
    'hp',
    'acer',
    'apple',
    'msi',
    'lg',
    'microsoft',
    'gigabyte',
    'huawei',
    'samsung',
    'thinkpad',
    'ideapad',
    'legion',
    'loq',
    'yoga',
    'vivobook',
    'zenbook',
    'rog',
    'tuf',
    'expertbook',
    'xps',
    'latitude',
    'inspiron',
    'vostro',
    'precision',
    'alienware',
    'victus',
    'omen',
    'elitebook',
    'probook',
    'pavilion',
    'envy',
    'dragonfly',
    'nitro',
    'aspire',
    'swift',
    'predator',
    'gram',
    'surface',
    'intel',
    'core\\s*i[3579]',
    'core\\s*ultra',
    'ryzen',
    'amd',
    'rtx',
    'gtx',
    'quadro',
    'radeon',
    'm[1234](?:\\s*(?:pro|max|ultra))?',
    'mua',
    'bán',
    'giá',
    'ngân\\s*sách',
    'triệu',
    '\\d+\\s*(?:tr|củ)',
    'vnd',
    'tư\\s*vấn',
    'gợi\\s*ý',
    'so\\s*sánh',
    'đối\\s*chiếu',
    'mẫu',
    'con\\s*này',
    'chiếc\\s*này',
    'phiên\\s*bản',
    'sku',
    'còn\\s*hàng',
    'hết\\s*hàng',
    'tồn\\s*kho',
    'kho',
    'đặt\\s*hàng',
    'đặt\\s*mua',
    'chốt\\s*đơn',
    'chốt',
    'giỏ\\s*hàng',
    'cod',
    'vietqr',
    'chuyển\\s*khoản',
    'thanh\\s*toán',
    'giao\\s*hàng',
    'ship',
    'đồng\\s*kiểm',
    'bảo\\s*hành',
    'đổi\\s*trả',
    'trả\\s*góp',
    'khuyến\\s*mãi',
    'ưu\\s*đãi',
    'cửa\\s*hàng',
    'shop',
    'lapbot',
    'nhân\\s*viên',
    'hỗ\\s*trợ',
    'hotline',
    'zalo',
    'văn\\s*phòng',
    'gaming',
    'đồ\\s*họa',
    'dựng\\s*phim',
    'render',
    'autocad',
    'revit',
    'premiere',
    'photoshop',
    'docker',
    'android\\s*studio',
    'sinh\\s*viên',
    'kế\\s*toán'
  ].join('|')
);

const OFF_TOPIC_ABUSE_PATTERNS: RegExp[] = [
  // Writing source code / functions / scripts / SQL / algorithms
  wb(
    '(?:viết|code|tạo|sinh|debug|sửa\\s+lỗi|implement|write|generate)\\s+(?:giúp\\s+(?:tôi|mình|anh|chị|em)\\s+)?(?:một\\s+|1\\s+|cho\\s+(?:tôi|mình)\\s+)?(?:hàm|code|đoạn\\s+code|mã\\s+nguồn|chương\\s+trình|script|class|thuật\\s+toán|câu\\s+lệnh\\s+sql|biểu\\s+thức\\s+regex|function|program|algorithm)'
  ),
  /(?:^|\n)\s*(?:def\s+[a-zA-Z_]\w*\s*\(|function\s+[a-zA-Z_]\w*\s*\(|#include\s*<[\w.]+>|public\s+static\s+void\s+main\s*\()/mu,

  // Solving math / physics / chemistry homework
  wb(
    '(?:giải\\s+(?:giúp\\s+|chi\\s+tiết\\s+)?(?:phương\\s+trình|hệ\\s+phương\\s+trình|bất\\s+phương\\s+trình|bài\\s+toán|tích\\s+phân|đạo\\s+hàm|ma\\s+trận)|tính\\s+(?:đạo\\s+hàm|nguyên\\s+hàm|tích\\s+phân|giới\\s+hạn\\s+lim)|cân\\s+bằng\\s+phương\\s+trình\\s+hóa\\s+học)'
  ),

  // Creative writing / essays / translation / cooking / fortune telling
  wb(
    '(?:làm\\s+(?:một\\s+|1\\s+|bài\\s+)?thơ|sáng\\s+tác\\s+(?:thơ|truyện|nhạc|lời\\s+bài\\s+hát)|viết\\s+(?:bài\\s+văn|đoạn\\s+văn(?:\\s+nghị\\s+luận)?|luận\\s+văn|tiểu\\s+luận|đơn\\s+xin\\s+nghỉ)|dịch\\s+(?:đoạn\\s+văn|bài\\s+báo|văn\\s+bản\\s+này|câu\\s+này)\\s+sang\\s+tiếng|kể\\s+(?:một\\s+|cho\\s+nghe\\s+)?chuyện\\s+(?:cười|ma|cổ\\s+tích)|xem\\s+(?:bói|tử\\s+vi|cung\\s+hoàng\\s+đạo|ngày\\s+tốt)|công\\s+thức\\s+nấu|cách\\s+nấu\\s+món)'
  )
];

export const INJECTION_REFUSAL_REPLY =
  'Mình là chuyên viên tư vấn laptop của **LapBot** nên chỉ hỗ trợ tra cứu cấu hình thực tế tại kho, đối chiếu thông số phần cứng, báo giá niêm yết và đặt hàng COD/VietQR. Mình không thể thay đổi quy tắc vận hành hay cung cấp cấu hình hệ thống nội bộ.\n\nBạn đang tìm laptop cho công việc gì và tầm ngân sách khoảng bao nhiêu để mình lọc mẫu phù hợp nhất nhé?';

export const OFF_TOPIC_REFUSAL_REPLY =
  'Mình là trợ lý chuyên tư vấn phần cứng và đặt mua laptop tại **LapBot**, nên xin phép không giải bài tập, viết code hay xử lý các chủ đề ngoài mảng laptop nhé!\n\nNếu bạn đang cần tìm **laptop lập trình, văn phòng mỏng nhẹ, đồ họa hay gaming**, hãy cho mình biết **ngân sách dự kiến** để mình chọn ngay các mẫu ngon nhất trong kho cho bạn!';

export function evaluateInputGuardrail(rawMessage: string): InputGuardrailVerdict {
  const normalized = rawMessage.normalize('NFC').trim();
  if (!normalized) return { blocked: false };

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        blocked: true,
        reason: 'prompt_injection',
        reply: INJECTION_REFUSAL_REPLY
      };
    }
  }

  const hasDomainSignal = LAPTOP_DOMAIN_SIGNAL_RE.test(normalized);
  if (!hasDomainSignal) {
    for (const pattern of OFF_TOPIC_ABUSE_PATTERNS) {
      if (pattern.test(normalized)) {
        return {
          blocked: true,
          reason: 'off_topic',
          reply: OFF_TOPIC_REFUSAL_REPLY
        };
      }
    }
  }

  return { blocked: false };
}

/**
 * Redacts Vietnamese phone numbers (contiguous or separated by space/dot/dash/+84),
 * emails, 12-digit citizen IDs, and 13-19 digit payment card sequences before sending history to external LLM providers.
 */
export function redactSensitivePii(text: string): string {
  if (!text) return '';
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(?<![\d])(?:\+?84[\s.-]?|0)[35789](?:[\s.-]?\d){8}(?![\d])/g, '[số điện thoại]')
    .replace(/(?<![\d])\d{12}(?![\d])/g, '[mã định danh]')
    .replace(/(?<![\d])(?:\d[ -]?){13,19}(?![\d])/g, match => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19 ? '[số thẻ/tài khoản]' : match;
    });
}

/**
 * Cleans untrusted session filter values before embedding into <untrusted_session_context>.
 */
export function sanitizeContextValue(raw: unknown, maxLen = 80): string {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\r\n\t<>`\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

const SENTENCE_TERMINATOR_RE = /[.!?…](?=\s|$|["'”’*_)\]])/g;

function lastRealSentenceEnd(segment: string): number {
  let lastIdx = -1;
  SENTENCE_TERMINATOR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SENTENCE_TERMINATOR_RE.exec(segment)) !== null) {
    lastIdx = match.index;
  }
  return lastIdx;
}

export function trimDanglingIncompleteSentence(text: string): string {
  const trimmed = text.trimEnd();
  if (!trimmed) return trimmed;
  // Keep text if it already ends with real terminal punctuation, table pipe, or closing delimiter
  if (/(?:[.!?…:;]|[.!?…]["'”’*_)\]]|\|)$/.test(trimmed)) {
    return trimmed;
  }

  const lastNewline = trimmed.lastIndexOf('\n');
  if (lastNewline > 0) {
    const tailLine = trimmed.slice(lastNewline + 1);
    const tailSentenceEnd = lastRealSentenceEnd(tailLine);
    if (tailSentenceEnd >= 0) {
      let cut = lastNewline + 1 + tailSentenceEnd + 1;
      while (cut < trimmed.length && /["'”’*_)\]]/.test(trimmed[cut]!)) cut++;
      return trimmed.slice(0, cut).trimEnd();
    }
    return trimmed.slice(0, lastNewline).trimEnd();
  }

  const boundary = lastRealSentenceEnd(trimmed);
  if (boundary > 0 && boundary > trimmed.length * 0.3) {
    let cut = boundary + 1;
    while (cut < trimmed.length && /["'”’*_)\]]/.test(trimmed[cut]!)) cut++;
    return trimmed.slice(0, cut).trimEnd();
  }
  return trimmed;
}

/**
 * Strips accidental raw UUIDs and internal XML guardrail tags from assistant prose
 * while preserving valid internal Markdown links like (/products/<uuid>).
 */
export function sanitizeAssistantText(text: string, options?: { truncated?: boolean }): string {
  if (!text) return '';

  const protectedLinks: string[] = [];
  let cleaned = text.replace(
    /\(\/products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\)/gi,
    match => {
      const idx = protectedLinks.push(match) - 1;
      return `__LAPBOT_SAFE_PRODUCT_LINK_${idx}__`;
    }
  );

  // Strip leaked internal XML delimiter tags if a model ever echoes them
  cleaned = cleaned.replace(
    /<\s*\/?\s*(?:immutable_security_rules|sales_concierge_playbook|store_ground_truth|untrusted_session_context|store_tone_preferences)\s*>/gi,
    ''
  );

  // Strip parenthesized key-value UUID leaks like (variant_id="...") or [variant_id: ...]
  cleaned = cleaned.replace(
    /\(\s*(?:variant_id|laptop_id|sku_id)\s*[:=]\s*["'`]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}["'`]?\s*\)/gi,
    ''
  );
  cleaned = cleaned.replace(
    /\b(?:variant_id|laptop_id)\s*[:=]\s*["'`]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}["'`]?/gi,
    ''
  );

  // Strip any remaining bare UUIDs in prose
  cleaned = cleaned.replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    ''
  );

  // Clean up double spaces left behind on the same line (preserving newlines and markdown indentation)
  cleaned = cleaned.replace(/([^\S\r\n]{2,})/g, ' ').replace(/\s+([,.;:!?])/g, '$1');

  cleaned = cleaned.replace(/__LAPBOT_SAFE_PRODUCT_LINK_(\d+)__/g, (_, rawIdx: string) => {
    return protectedLinks[Number(rawIdx)] ?? '';
  });

  if (options?.truncated) {
    cleaned = trimDanglingIncompleteSentence(cleaned);
  }

  return cleaned;
}
