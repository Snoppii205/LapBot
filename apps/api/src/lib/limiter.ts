import { AppError } from './errors.js';

type BucketEntry = {
  timestamps: number[];
  windowMs: number;
};

const hits = new Map<string, BucketEntry>();
const CLEANUP_INTERVAL_MS = 5 * 60_000;

const sweepTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    const active = entry.timestamps.filter(time => time > now - entry.windowMs);
    if (active.length === 0) {
      hits.delete(key);
    } else {
      entry.timestamps = active;
    }
  }
}, CLEANUP_INTERVAL_MS);
sweepTimer.unref();

export function limit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const existing = hits.get(key);
  const recent = (existing?.timestamps ?? []).filter(time => time > now - windowMs);

  if (recent.length >= max) {
    throw new AppError(429, 'RATE_LIMITED', 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.');
  }

  recent.push(now);
  hits.set(key, { timestamps: recent, windowMs });

  if (hits.size > 10_000) {
    for (const [entryKey, entry] of hits) {
      if (entry.timestamps.every(time => time <= now - entry.windowMs)) {
        hits.delete(entryKey);
      }
    }
  }
}
