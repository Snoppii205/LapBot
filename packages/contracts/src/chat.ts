import { variantSummarySchema } from './catalog.js';

export type ControlMode = 'AI' | 'AGENT';
export type ChatTurnStatus = 'PROCESSING' | 'COMPLETED' | 'INTERRUPTED' | 'FAILED' | 'FORWARDED';
export type SessionView = {
  session_id: string;
  control_mode: ControlMode;
  control_version: number;
  needs_human: boolean;
  human_requested_at: string | null;
  sales_context: Record<string, unknown>;
  expires_at: string;
  server_time: string;
};
export type ChatWidget =
  | {
      widget_id: string;
      schema_version: 1;
      widget_type: 'laptop_spec';
      payload: { variants: import('./catalog.js').VariantSummary[] };
    }
  | {
      widget_id: string;
      schema_version: 1;
      widget_type: 'variant_customizer';
      payload: { laptop_id: string; variants: import('./catalog.js').VariantSummary[] };
    }
  | {
      widget_id: string;
      schema_version: 1;
      widget_type: 'address_form';
      payload: { variant_id: string };
    };
export type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'AGENT' | 'SYSTEM';
  content: string;
  widgets: ChatWidget[];
  created_at: string;
};
export const sessionViewSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'session_id',
    'control_mode',
    'control_version',
    'needs_human',
    'human_requested_at',
    'sales_context',
    'expires_at',
    'server_time'
  ],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    control_mode: { type: 'string', enum: ['AI', 'AGENT'] },
    control_version: { type: 'integer' },
    needs_human: { type: 'boolean' },
    human_requested_at: { type: ['string', 'null'] },
    sales_context: { type: 'object', additionalProperties: true },
    expires_at: { type: 'string' },
    server_time: { type: 'string' }
  }
} as const;
export const chatWidgetSchema = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: false,
      required: ['widget_id', 'schema_version', 'widget_type', 'payload'],
      properties: {
        widget_id: { type: 'string', format: 'uuid' },
        schema_version: { const: 1 },
        widget_type: { const: 'laptop_spec' },
        payload: {
          type: 'object',
          additionalProperties: false,
          required: ['variants'],
          properties: {
            variants: { type: 'array', minItems: 1, maxItems: 3, items: variantSummarySchema }
          }
        }
      }
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['widget_id', 'schema_version', 'widget_type', 'payload'],
      properties: {
        widget_id: { type: 'string', format: 'uuid' },
        schema_version: { const: 1 },
        widget_type: { const: 'variant_customizer' },
        payload: {
          type: 'object',
          additionalProperties: false,
          required: ['laptop_id', 'variants'],
          properties: {
            laptop_id: { type: 'string', format: 'uuid' },
            variants: { type: 'array', minItems: 1, maxItems: 20, items: variantSummarySchema }
          }
        }
      }
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['widget_id', 'schema_version', 'widget_type', 'payload'],
      properties: {
        widget_id: { type: 'string', format: 'uuid' },
        schema_version: { const: 1 },
        widget_type: { const: 'address_form' },
        payload: {
          type: 'object',
          additionalProperties: false,
          required: ['variant_id'],
          properties: { variant_id: { type: 'string', format: 'uuid' } }
        }
      }
    }
  ]
} as const;
export const chatMessageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'role', 'content', 'widgets', 'created_at'],
  properties: {
    id: { type: 'string', pattern: '^[0-9]+$' },
    role: { type: 'string', enum: ['USER', 'ASSISTANT', 'AGENT', 'SYSTEM'] },
    content: { type: 'string' },
    widgets: { type: 'array', items: chatWidgetSchema },
    created_at: { type: 'string' }
  }
} as const;
