import { AppError } from './errors.js';

export function positiveInteger(
  raw: unknown,
  name: string,
  max: number,
  fallback?: number
): number {
  if (raw === undefined && fallback !== undefined) return fallback;
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    throw new AppError(400, 'INVALID_QUERY', `${name} phải là số nguyên.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0 || value > max) {
    throw new AppError(400, 'INVALID_QUERY', `${name} ngoài phạm vi.`);
  }
  return value;
}

export function uuid(raw: unknown): raw is string {
  return (
    typeof raw === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
  );
}

export function bigintCursor(raw: unknown): raw is string {
  if (typeof raw !== 'string' || !/^\d{1,19}$/.test(raw)) return false;
  const value = BigInt(raw);
  return value > 0n && value <= 9_223_372_036_854_775_807n;
}

export function stringQuery(raw: unknown, name: string, max: number): string | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string' || raw.length > max) {
    throw new AppError(400, 'INVALID_QUERY', `${name} không hợp lệ.`);
  }
  return raw.trim() || undefined;
}
