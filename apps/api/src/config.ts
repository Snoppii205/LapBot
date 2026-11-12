import { config as loadDotEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';

loadDotEnv({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const integer = (
  name: string,
  raw: string | undefined,
  min: number,
  max: number,
  fallback?: number
): number => {
  if (raw === undefined && fallback !== undefined) return fallback;
  if (!raw || !/^\d+$/.test(raw)) throw new Error(`${name} must be an integer`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
};

const booleanFlag = (name: string, raw: string | undefined, fallback = false): boolean => {
  if (raw === undefined || raw === '') return fallback;
  if (raw !== 'true' && raw !== 'false') throw new Error(`${name} must be true or false`);
  return raw === 'true';
};

const nodeEnv = process.env.NODE_ENV ?? 'development';
if (!['development', 'test', 'production'].includes(nodeEnv)) {
  throw new Error('NODE_ENV is invalid');
}

const publicOrigin = process.env.PUBLIC_ORIGIN ?? 'http://localhost:5173';
let parsedOrigin: URL;
try {
  parsedOrigin = new URL(publicOrigin);
} catch {
  throw new Error('PUBLIC_ORIGIN must be an absolute URL');
}
if (parsedOrigin.origin !== publicOrigin.replace(/\/$/, '')) {
  throw new Error('PUBLIC_ORIGIN must not include a path');
}
if (nodeEnv === 'production' && parsedOrigin.protocol !== 'https:') {
  throw new Error('PUBLIC_ORIGIN must use HTTPS in production');
}

const trustProxy = booleanFlag('TRUST_PROXY', process.env.TRUST_PROXY, false);
const shippingFeeVnd = integer('SHIPPING_FEE_VND', process.env.SHIPPING_FEE_VND, 0, 10_000_000, 0);
const aiEnabled = booleanFlag('AI_ENABLED', process.env.AI_ENABLED, false);

if (
  aiEnabled &&
  (!process.env.LLM_BASE_URL || !process.env.LLM_MODEL || !process.env.LLM_API_KEY)
) {
  throw new Error('AI_ENABLED=true requires LLM_BASE_URL, LLM_MODEL, and LLM_API_KEY');
}

if (aiEnabled) {
  let llmUrl: URL;
  try {
    llmUrl = new URL(process.env.LLM_BASE_URL!);
  } catch {
    throw new Error('LLM_BASE_URL must be an absolute URL');
  }
  if (
    !['http:', 'https:'].includes(llmUrl.protocol) ||
    llmUrl.username ||
    llmUrl.password ||
    llmUrl.search ||
    llmUrl.hash
  ) {
    throw new Error('LLM_BASE_URL must be HTTP/HTTPS without credentials, query, or fragment');
  }
  if (!llmUrl.pathname.replace(/\/$/, '').endsWith('/v1')) {
    throw new Error('LLM_BASE_URL must end with /v1');
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

export const config = {
  nodeEnv,
  host: process.env.HOST ?? '0.0.0.0',
  port: integer('PORT', process.env.PORT, 1, 65535, 3000),
  publicOrigin: parsedOrigin.origin,
  trustProxy,
  shippingFeeVnd,
  aiEnabled,
  databaseUrl: process.env.DATABASE_URL,
  llmBaseUrl: process.env.LLM_BASE_URL,
  llmModel: process.env.LLM_MODEL,
  llmApiKey: process.env.LLM_API_KEY,
  logLevel: process.env.LOG_LEVEL ?? 'info'
} as const;
