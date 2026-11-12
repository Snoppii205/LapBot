export const commonErrorCodes = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'REVISION_CONFLICT',
  'SKU_EXISTS',
  'LAPTOP_NOT_FOUND',
  'INVALID_IMAGE',
  'STOCK_UNVERIFIED',
  'OUT_OF_STOCK',
  'QUOTE_EXPIRED',
  'SESSION_REQUIRED',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'AI_DISABLED',
  'LLM_UNAVAILABLE'
] as const;
export type CommonErrorCode = (typeof commonErrorCodes)[number];

export type ApiError = {
  error: { code: string; message: string; field_errors?: Record<string, string> };
  request_id: string;
};
export const errorResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['error', 'request_id'],
  properties: {
    error: {
      type: 'object',
      additionalProperties: false,
      required: ['code', 'message'],
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        field_errors: { type: 'object', additionalProperties: { type: 'string' } }
      }
    },
    request_id: { type: 'string', format: 'uuid' }
  }
} as const;
