import { adminImageMimeTypes, usageCategories } from '@lapbot/contracts';
import { AppError } from '../../lib/errors.js';
import { positiveInteger, stringQuery } from '../../lib/validate.js';

export const idSchema = { type: 'string', format: 'uuid' } as const;

export const strSchema = (maxLength: number, minLength = 1) => ({
  type: 'string',
  minLength,
  maxLength
});

export const laptopProperties = {
  brand: strSchema(80),
  model_name: strSchema(160),
  description: { type: 'string', maxLength: 5000 },
  image_url: { type: ['string', 'null'], maxLength: 2000 },
  is_active: { type: 'boolean' }
} as const;

export const variantProperties = {
  cpu: strSchema(160),
  gpu: strSchema(160),
  ram_gb: { type: 'integer', minimum: 1, maximum: 1024 },
  ssd_gb: { type: 'integer', minimum: 1, maximum: 100000 },
  screen: strSchema(160),
  color: strSchema(80),
  usage_category: { type: 'string', enum: [...usageCategories] },
  price_vnd: { type: 'integer', minimum: 1, maximum: 1000000000 },
  stock: { type: 'integer', minimum: 0, maximum: 1000000 },
  stock_verified: { type: 'boolean' },
  is_active: { type: 'boolean' }
} as const;

export const objectBody = (properties: Record<string, unknown>, required: string[]) => ({
  type: 'object',
  additionalProperties: false,
  required,
  properties
});

export const imageUploadBody = objectBody(
  {
    filename: strSchema(255),
    mime_type: { type: 'string', enum: [...adminImageMimeTypes] },
    data_base64: strSchema(6 * 1024 * 1024, 16)
  },
  ['filename', 'mime_type', 'data_base64']
);

export const versionBody = objectBody(
  { expected_control_version: { type: 'integer', minimum: 1 } },
  ['expected_control_version']
);

export const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: idSchema }
} as const;

export const parseAllowedQuery = (raw: unknown, keys: string[]): Record<string, unknown> => {
  const value = (raw ?? {}) as Record<string, unknown>;
  if (Object.keys(value).some(key => !keys.includes(key))) {
    throw new AppError(400, 'INVALID_QUERY', 'Query không hợp lệ.');
  }
  return value;
};

export const parseLimit = (raw: unknown, max = 200): number => {
  const value = raw === undefined ? 50 : positiveInteger(raw, 'limit', max);
  if (value < 1) throw new AppError(400, 'INVALID_QUERY', 'limit phải ít nhất 1.');
  return value;
};

export const parseOffset = (raw: unknown): number | undefined =>
  raw === undefined ? undefined : positiveInteger(raw, 'offset', 10000);

export const parseCursor = (raw: unknown): string | undefined => stringQuery(raw, 'cursor', 512);
