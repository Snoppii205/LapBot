export const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}₫`;
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value)
  );

export function formatLaptopTitle(brand?: string | null, modelName?: string | null): string {
  const b = (brand ?? '').trim();
  const m = (modelName ?? '').trim();
  if (!b) return m;
  if (!m) return b;
  if (m.toLowerCase().startsWith(b.toLowerCase())) {
    const rest = m.slice(b.length);
    if (!rest || /^[\s\-_/]/.test(rest)) {
      return `${b}${rest}`;
    }
  }
  return `${b} ${m}`;
}

const MODEL_CPU_RE =
  /(?:Intel\s+)?Core\s+(?:Ultra\s+[3579]\s+\w+|i[3579][-\s]\w+)|Xeon\s+[\w-]+|(?:AMD\s+)?Ryzen\s+(?:AI\s+)?[3579](?:\s+[\w-]+)?|Apple\s+M[1-4](?:\s+(?:Pro|Max|Ultra))?|\bM[1-4](?:\s+(?:Pro|Max|Ultra))\b|\bM[1-4]\b/i;

export function cleanCpuLabel(cpu?: string | null, modelName?: string | null): string {
  const raw = (cpu ?? '').trim();
  if (raw && raw !== 'Chưa xác minh') return raw;
  const fromModel = (modelName ?? '').match(MODEL_CPU_RE)?.[0]?.trim();
  if (fromModel) return fromModel;
  return 'Vi xử lý chuẩn hãng';
}

export function cleanGpuLabel(gpu?: string | null): string {
  const raw = (gpu ?? '').trim();
  if (!raw || raw === 'Chưa xác minh') return 'Đồ họa tích hợp';
  return raw;
}
