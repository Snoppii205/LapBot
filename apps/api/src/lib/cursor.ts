import { AppError } from './errors.js';
import { uuid } from './validate.js';

export type KeysetBoundary = [isoTimestamp: string, id: string];

export function decodeKeysetCursor(cursor?: string): KeysetBoundary | null {
  if (!cursor) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      typeof parsed[0] === 'string' &&
      !Number.isNaN(Date.parse(parsed[0])) &&
      typeof parsed[1] === 'string' &&
      uuid(parsed[1])
    ) {
      return [parsed[0], parsed[1]];
    }
  } catch {
    // Fall through to unified cursor error below
  }
  throw new AppError(400, 'INVALID_CURSOR', 'Cursor không hợp lệ.');
}

export function encodeKeysetCursor(timestamp: Date | string, id: string): string {
  const iso =
    typeof timestamp === 'string' ? new Date(timestamp).toISOString() : timestamp.toISOString();
  return Buffer.from(JSON.stringify([iso, id])).toString('base64url');
}
