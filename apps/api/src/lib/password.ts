import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { AppError } from './errors.js';

let activeHashes = 0;
const MAX_CONCURRENT_HASHES = 4;
const N = 16384;
const r = 8;
const p = 5;
const KEY_LEN = 64;
const MAX_MEM = 64 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  if (activeHashes >= MAX_CONCURRENT_HASHES) {
    throw new AppError(
      503,
      'AUTH_BUSY',
      'Hệ thống xác thực đang bận, vui lòng thử lại sau giây lát.'
    );
  }
  activeHashes++;
  try {
    const salt = randomBytes(16);
    const key = await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, KEY_LEN, { N, r, p, maxmem: MAX_MEM }, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
    return `scrypt$N=${N},r=${r},p=${p}$${salt.toString('base64')}$${key.toString('base64')}`;
  } finally {
    activeHashes--;
  }
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (activeHashes >= MAX_CONCURRENT_HASHES) {
    throw new AppError(
      503,
      'AUTH_BUSY',
      'Hệ thống xác thực đang bận, vui lòng thử lại sau giây lát.'
    );
  }
  const match = /^scrypt\$N=(\d+),r=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(stored);
  if (!match) return false;
  const [, nVal, rVal, pVal, saltB64, expectedB64] = match;
  const salt = Buffer.from(saltB64!, 'base64');
  const expectedKey = Buffer.from(expectedB64!, 'base64');

  activeHashes++;
  try {
    const candidate = await new Promise<Buffer>((resolve, reject) => {
      scrypt(
        password,
        salt,
        expectedKey.length,
        { N: Number(nVal), r: Number(rVal), p: Number(pVal), maxmem: MAX_MEM },
        (err, val) => (err ? reject(err) : resolve(val))
      );
    });
    return candidate.length === expectedKey.length && timingSafeEqual(candidate, expectedKey);
  } finally {
    activeHashes--;
  }
}
