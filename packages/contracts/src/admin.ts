import {
  orderStatuses,
  orderViewSchema,
  paymentMethods,
  type OrderView,
  type PaymentMethod
} from './orders.js';
import { chatMessageSchema } from './chat.js';
import { usageCategories } from './catalog.js';

export const adminRoles = ['SUPER_ADMIN', 'STAFF'] as const;
export type AdminRole = (typeof adminRoles)[number];

export const adminStockFilters = ['in_stock', 'low_stock', 'out_of_stock', 'unverified'] as const;
export type AdminStockFilter = (typeof adminStockFilters)[number];

export const adminCatalogSorts = [
  'newest',
  'updated_desc',
  'price_asc',
  'price_desc',
  'stock_asc',
  'stock_desc',
  'name_asc'
] as const;
export type AdminCatalogSort = (typeof adminCatalogSorts)[number];

export const adminBulkVariantActions = [
  'verify_stock',
  'activate',
  'deactivate',
  'set_stock',
  'adjust_stock_delta',
  'adjust_price_pct',
  'adjust_price_delta'
] as const;
export type AdminBulkVariantAction = (typeof adminBulkVariantActions)[number];

export const customerTags = ['STANDARD', 'VIP', 'CORPORATE', 'WATCHLIST'] as const;
export type CustomerTag = (typeof customerTags)[number];

export const customerSorts = ['newest', 'spent_desc', 'orders_desc', 'cancelled_desc'] as const;
export type CustomerSort = (typeof customerSorts)[number];

export const guestBuyerFilters = ['all', 'high_cancel', 'vip_guest', 'unlinked'] as const;
export type GuestBuyerFilter = (typeof guestBuyerFilters)[number];

export const STAFF_MIN_PASSWORD_LENGTH = 10;
export const AI_MAX_CUSTOM_INSTRUCTIONS_LENGTH = 4000;
export const AI_MAX_TEST_PROMPT_LENGTH = 500;
export const AI_MAX_TOKENS_MIN = 128;
export const AI_MAX_TOKENS_MAX = 1200;
export const AI_TURN_TIMEOUT_MIN_MS = 10000;
export const AI_TURN_TIMEOUT_MAX_MS = 60000;
export const AI_HUMAN_WAIT_MIN_SEC = 30;
export const AI_HUMAN_WAIT_MAX_SEC = 600;

export const ADMIN_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const adminImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AdminImageMimeType = (typeof adminImageMimeTypes)[number];

export const adminAuditEntityTypes = [
  'LAPTOP',
  'VARIANT',
  'ORDER',
  'CHAT_SESSION',
  'STAFF',
  'CUSTOMER',
  'AI_CONFIG',
  'STORE_SETTINGS'
] as const;
export type AdminAuditEntityType = (typeof adminAuditEntityTypes)[number];

export const adminAuditActions = [
  'LAPTOP_CREATE',
  'LAPTOP_PATCH',
  'LAPTOP_DELETE',
  'LAPTOP_ARCHIVE',
  'LAPTOP_IMAGES_UPDATE',
  'IMAGE_UPLOAD',
  'VARIANT_CREATE',
  'VARIANT_PATCH',
  'VARIANT_BULK_PATCH',
  'VARIANT_DELETE',
  'VARIANT_ARCHIVE',
  'ORDER_CONFIRMED',
  'ORDER_CANCELLED',
  'ORDER_TRANSITION',
  'ORDER_STATUS_CHANGE',
  'CHAT_CLAIM',
  'CHAT_RELEASE',
  'CHAT_SESSION_CLEAN',
  'CHAT_SESSIONS_BULK_CLEAN',
  'STAFF_CREATE',
  'STAFF_PATCH',
  'STAFF_PASSWORD_CHANGE',
  'STAFF_SESSION_REVOKE',
  'CUSTOMER_REGISTER',
  'CUSTOMER_CREATE',
  'CUSTOMER_PATCH',
  'CUSTOMER_PASSWORD_RESET',
  'CUSTOMER_LINK_ORDERS',
  'GUEST_PROMOTE_MEMBER',
  'AI_CONFIG_UPDATE',
  'AI_SANDBOX_TEST',
  'STORE_SETTINGS_UPDATE'
] as const;
export type AdminAuditAction = (typeof adminAuditActions)[number];

export type AdminProfile = {
  admin_id: string;
  username: string;
  display_name: string;
  role: AdminRole;
  last_login_at: string | null;
};

export const adminProfileSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['admin_id', 'username', 'display_name', 'role', 'last_login_at'],
  properties: {
    admin_id: { type: 'string', format: 'uuid' },
    username: { type: 'string' },
    display_name: { type: 'string' },
    role: { type: 'string', enum: [...adminRoles] },
    last_login_at: { type: ['string', 'null'] }
  }
} as const;

export type AdminOrderSummary = {
  order_id: string;
  order_code: string;
  status: import('./orders.js').OrderStatus;
  variant_id: string;
  total_vnd: number;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod;
  customer_name?: string;
  customer_phone?: string;
  product_title?: string;
  sku?: string;
  note?: string;
  is_member?: boolean;
};

export const adminOrderSummarySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'order_id',
    'order_code',
    'status',
    'variant_id',
    'total_vnd',
    'created_at',
    'updated_at'
  ],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    order_code: { type: 'string' },
    status: { type: 'string', enum: [...orderStatuses] },
    variant_id: { type: 'string', format: 'uuid' },
    total_vnd: { type: 'integer' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    payment_method: { type: 'string', enum: [...paymentMethods] },
    customer_name: { type: 'string' },
    customer_phone: { type: 'string' },
    product_title: { type: 'string' },
    sku: { type: 'string' },
    note: { type: 'string' },
    is_member: { type: 'boolean' }
  }
} as const;

export type AdminChatSession = {
  session_id: string;
  control_mode: import('./chat.js').ControlMode;
  control_version: number;
  needs_human: boolean;
  human_requested_at: string | null;
  assigned_admin_id: string | null;
  sales_context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  message_count?: number;
};

export const adminChatSessionSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'session_id',
    'control_mode',
    'control_version',
    'needs_human',
    'human_requested_at',
    'assigned_admin_id',
    'sales_context',
    'created_at',
    'updated_at'
  ],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    control_mode: { type: 'string', enum: ['AI', 'AGENT'] },
    control_version: { type: 'integer' },
    needs_human: { type: 'boolean' },
    human_requested_at: { type: ['string', 'null'] },
    assigned_admin_id: { type: ['string', 'null'] },
    sales_context: { type: 'object', additionalProperties: true },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    customer_id: { type: ['string', 'null'] },
    customer_name: { type: ['string', 'null'] },
    customer_email: { type: ['string', 'null'] },
    message_count: { type: 'integer', minimum: 0 }
  }
} as const;

export const adminChatCleanScopes = ['empty_or_expired', 'inactive_ai_24h', 'all_ai_idle'] as const;
export type AdminChatCleanScope = (typeof adminChatCleanScopes)[number];

export type AdminChatDeleteResult = {
  session_id: string;
  mode: 'deleted' | 'cleared';
  deleted_messages_count: number;
  cancelled_quotes_count: number;
  message: string;
};

export const adminChatDeleteResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['session_id', 'mode', 'deleted_messages_count', 'cancelled_quotes_count', 'message'],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    mode: { type: 'string', enum: ['deleted', 'cleared'] },
    deleted_messages_count: { type: 'integer', minimum: 0 },
    cancelled_quotes_count: { type: 'integer', minimum: 0 },
    message: { type: 'string' }
  }
} as const;

export type AdminChatBulkCleanResult = {
  scope: AdminChatCleanScope;
  deleted_sessions_count: number;
  cleared_sessions_count: number;
  deleted_messages_count: number;
  cancelled_quotes_count: number;
  purged_auth_sessions_count: number;
  message: string;
};

export const adminChatBulkCleanResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'scope',
    'deleted_sessions_count',
    'cleared_sessions_count',
    'deleted_messages_count',
    'cancelled_quotes_count',
    'purged_auth_sessions_count',
    'message'
  ],
  properties: {
    scope: { type: 'string', enum: [...adminChatCleanScopes] },
    deleted_sessions_count: { type: 'integer', minimum: 0 },
    cleared_sessions_count: { type: 'integer', minimum: 0 },
    deleted_messages_count: { type: 'integer', minimum: 0 },
    cancelled_quotes_count: { type: 'integer', minimum: 0 },
    purged_auth_sessions_count: { type: 'integer', minimum: 0 },
    message: { type: 'string' }
  }
} as const;

export const adminOrderPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminOrderSummarySchema },
    next_cursor: { type: ['string', 'null'] },
    counts_by_status: { type: 'object', additionalProperties: true }
  }
} as const;

export const adminChatPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminChatSessionSchema },
    next_cursor: { type: ['string', 'null'] },
    counts_by_mode: {
      type: 'object',
      additionalProperties: false,
      required: ['waiting', 'agent', 'ai'],
      properties: {
        waiting: { type: 'integer' },
        agent: { type: 'integer' },
        ai: { type: 'integer' }
      }
    }
  }
} as const;

export const adminChatHistorySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'items',
    'next_cursor',
    'control_mode',
    'control_version',
    'needs_human',
    'human_requested_at',
    'assigned_admin_id',
    'sales_context',
    'server_time'
  ],
  properties: {
    items: { type: 'array', items: chatMessageSchema },
    next_cursor: { type: ['string', 'null'] },
    control_mode: { type: 'string', enum: ['AI', 'AGENT'] },
    control_version: { type: 'integer' },
    needs_human: { type: 'boolean' },
    human_requested_at: { type: ['string', 'null'] },
    assigned_admin_id: { type: ['string', 'null'] },
    sales_context: { type: 'object', additionalProperties: true },
    server_time: { type: 'string' },
    customer_info: {
      type: 'object',
      additionalProperties: true
    }
  }
} as const;

export type AdminLaptop = {
  id: string;
  brand: string;
  model_name: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  revision: number;
  created_at: string;
  updated_at: string;
  variant_count?: number;
  total_stock?: number;
  unverified_count?: number;
  min_price_vnd?: number | null;
  max_price_vnd?: number | null;
  images?: Array<{ image_url: string; caption: string }>;
};

export const adminLaptopSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'brand',
    'model_name',
    'description',
    'image_url',
    'is_active',
    'revision',
    'created_at',
    'updated_at'
  ],
  properties: {
    id: { type: 'string', format: 'uuid' },
    brand: { type: 'string' },
    model_name: { type: 'string' },
    description: { type: 'string' },
    image_url: { type: ['string', 'null'] },
    is_active: { type: 'boolean' },
    revision: { type: 'integer' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    variant_count: { type: 'integer' },
    total_stock: { type: 'integer' },
    unverified_count: { type: 'integer' },
    min_price_vnd: { type: ['integer', 'null'] },
    max_price_vnd: { type: ['integer', 'null'] },
    images: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['image_url', 'caption'],
        properties: { image_url: { type: 'string' }, caption: { type: 'string' } }
      }
    }
  }
} as const;

export type AdminCatalogDeleteResult = {
  id: string;
  mode: 'deleted' | 'archived';
  cancelled_quotes_count: number;
  message: string;
};

export const adminCatalogDeleteResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'mode', 'cancelled_quotes_count', 'message'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    mode: { type: 'string', enum: ['deleted', 'archived'] },
    cancelled_quotes_count: { type: 'integer' },
    message: { type: 'string' }
  }
} as const;

export type AdminImageUploadInput = {
  filename: string;
  mime_type: AdminImageMimeType;
  data_base64: string;
};

export type AdminImageUploadResult = {
  url: string;
  filename: string;
  size_bytes: number;
};

export const adminImageUploadResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['url', 'filename', 'size_bytes'],
  properties: {
    url: { type: 'string' },
    filename: { type: 'string' },
    size_bytes: { type: 'integer' }
  }
} as const;

export type AdminLaptopImagesUpdateResult = {
  items: Array<{ image_url: string; caption: string }>;
  image_url: string | null;
  revision: number;
};

export const adminLaptopImagesUpdateResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'image_url', 'revision'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['image_url', 'caption'],
        properties: { image_url: { type: 'string' }, caption: { type: 'string' } }
      }
    },
    image_url: { type: ['string', 'null'] },
    revision: { type: 'integer' }
  }
} as const;

export type AdminVariant = {
  id: string;
  laptop_id: string;
  sku: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  screen: string;
  color: string;
  usage_category: import('./catalog.js').UsageCategory;
  price_vnd: number;
  stock: number;
  source_in_stock: boolean | null;
  stock_verified: boolean;
  is_active: boolean;
  revision: number;
  created_at: string;
  updated_at: string;
  brand?: string;
  model_name?: string;
};

export const adminVariantSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'laptop_id',
    'sku',
    'cpu',
    'gpu',
    'ram_gb',
    'ssd_gb',
    'screen',
    'color',
    'usage_category',
    'price_vnd',
    'stock',
    'source_in_stock',
    'stock_verified',
    'is_active',
    'revision',
    'created_at',
    'updated_at'
  ],
  properties: {
    id: { type: 'string', format: 'uuid' },
    laptop_id: { type: 'string', format: 'uuid' },
    sku: { type: 'string' },
    cpu: { type: 'string' },
    gpu: { type: 'string' },
    ram_gb: { type: 'integer' },
    ssd_gb: { type: 'integer' },
    screen: { type: 'string' },
    color: { type: 'string' },
    usage_category: { type: 'string', enum: [...usageCategories] },
    price_vnd: { type: 'integer' },
    stock: { type: 'integer' },
    source_in_stock: { type: ['boolean', 'null'] },
    stock_verified: { type: 'boolean' },
    is_active: { type: 'boolean' },
    revision: { type: 'integer' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    brand: { type: 'string' },
    model_name: { type: 'string' }
  }
} as const;

export type AdminLaptopPage = {
  items: AdminLaptop[];
  next_cursor: string | null;
  total_count?: number;
  next_offset?: number | null;
};

export const adminLaptopPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminLaptopSchema },
    next_cursor: { type: ['string', 'null'] },
    total_count: { type: 'integer', minimum: 0 },
    next_offset: { type: ['integer', 'null'] }
  }
} as const;

export type AdminVariantPage = {
  items: AdminVariant[];
  next_cursor: string | null;
  total_count?: number;
  next_offset?: number | null;
};

export const adminVariantPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminVariantSchema },
    next_cursor: { type: ['string', 'null'] },
    total_count: { type: 'integer', minimum: 0 },
    next_offset: { type: ['integer', 'null'] }
  }
} as const;

export type AdminCatalogMeta = {
  summary: {
    laptops_total: number;
    laptops_active: number;
    laptops_archived: number;
    variants_total: number;
    variants_active: number;
    variants_in_stock: number;
    variants_low_stock: number;
    variants_out_of_stock: number;
    variants_unverified: number;
  };
  brands: string[];
  laptop_options: Array<{
    id: string;
    brand: string;
    model_name: string;
    is_active: boolean;
    variant_count: number;
  }>;
};

export const adminCatalogMetaSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'brands', 'laptop_options'],
  properties: {
    summary: {
      type: 'object',
      additionalProperties: false,
      required: [
        'laptops_total',
        'laptops_active',
        'laptops_archived',
        'variants_total',
        'variants_active',
        'variants_in_stock',
        'variants_low_stock',
        'variants_out_of_stock',
        'variants_unverified'
      ],
      properties: {
        laptops_total: { type: 'integer' },
        laptops_active: { type: 'integer' },
        laptops_archived: { type: 'integer' },
        variants_total: { type: 'integer' },
        variants_active: { type: 'integer' },
        variants_in_stock: { type: 'integer' },
        variants_low_stock: { type: 'integer' },
        variants_out_of_stock: { type: 'integer' },
        variants_unverified: { type: 'integer' }
      }
    },
    brands: { type: 'array', items: { type: 'string' } },
    laptop_options: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'brand', 'model_name', 'is_active', 'variant_count'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          brand: { type: 'string' },
          model_name: { type: 'string' },
          is_active: { type: 'boolean' },
          variant_count: { type: 'integer' }
        }
      }
    }
  }
} as const;

export type AdminBulkVariantPatchResult = {
  updated_count: number;
  items: AdminVariant[];
  message: string;
};

export const adminBulkVariantPatchResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['updated_count', 'items', 'message'],
  properties: {
    updated_count: { type: 'integer' },
    items: { type: 'array', items: adminVariantSchema },
    message: { type: 'string' }
  }
} as const;

// --- Dashboard & Analytics ---
export type AdminTopProduct = {
  variant_id: string;
  sku: string;
  brand: string;
  model_name: string;
  orders_count: number;
  revenue_vnd: number;
  stock: number;
};

export const adminTopProductSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['variant_id', 'sku', 'brand', 'model_name', 'orders_count', 'revenue_vnd', 'stock'],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    sku: { type: 'string' },
    brand: { type: 'string' },
    model_name: { type: 'string' },
    orders_count: { type: 'integer' },
    revenue_vnd: { type: 'integer' },
    stock: { type: 'integer' }
  }
} as const;

export type AdminDashboardStats = {
  kpi: {
    revenue_delivered_vnd: number;
    revenue_pipeline_vnd: number;
    orders_today_count: number;
    orders_total_count: number;
    orders_by_status: Record<string, number>;
    variants_total: number;
    variants_in_stock: number;
    variants_low_stock: number;
    variants_out_of_stock: number;
    variants_unverified: number;
    sessions_waiting_human: number;
    sessions_active_agent: number;
    ai_turns_24h_count: number;
    ai_turns_error_24h_count: number;
    ai_avg_latency_ms: number;
  };
  revenue_7d: Array<{ date: string; revenue_vnd: number; order_count: number }>;
  recent_orders: AdminOrderSummary[];
  recent_audits: AdminAuditEvent[];
  low_stock_variants: AdminVariant[];
  top_products: AdminTopProduct[];
};

export const adminDashboardSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'kpi',
    'revenue_7d',
    'recent_orders',
    'recent_audits',
    'low_stock_variants',
    'top_products'
  ],
  properties: {
    kpi: { type: 'object', additionalProperties: true },
    revenue_7d: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'revenue_vnd', 'order_count'],
        properties: {
          date: { type: 'string' },
          revenue_vnd: { type: 'integer' },
          order_count: { type: 'integer' }
        }
      }
    },
    recent_orders: { type: 'array', items: adminOrderSummarySchema },
    recent_audits: { type: 'array', items: { type: 'object', additionalProperties: true } },
    low_stock_variants: { type: 'array', items: adminVariantSchema },
    top_products: { type: 'array', items: adminTopProductSchema }
  }
} as const;

// --- Customer Management & CRM 360 ---
export type AdminCustomerSummary = {
  customer_id: string;
  email: string;
  phone: string | null;
  full_name: string;
  is_active: boolean;
  customer_tag?: CustomerTag;
  admin_note?: string;
  orders_count: number;
  delivered_orders_count?: number;
  cancelled_orders_count?: number;
  total_spent_vnd: number;
  created_at: string;
};

export const adminCustomerSummarySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'customer_id',
    'email',
    'phone',
    'full_name',
    'is_active',
    'orders_count',
    'total_spent_vnd',
    'created_at'
  ],
  properties: {
    customer_id: { type: 'string', format: 'uuid' },
    email: { type: 'string' },
    phone: { type: ['string', 'null'] },
    full_name: { type: 'string' },
    is_active: { type: 'boolean' },
    customer_tag: { type: 'string', enum: [...customerTags] },
    admin_note: { type: 'string' },
    orders_count: { type: 'integer' },
    delivered_orders_count: { type: 'integer' },
    cancelled_orders_count: { type: 'integer' },
    total_spent_vnd: { type: 'integer' },
    created_at: { type: 'string' }
  }
} as const;

export type AdminCustomerChatSession = {
  session_id: string;
  control_mode: 'AI' | 'AGENT';
  needs_human: boolean;
  messages_count: number;
  updated_at: string;
};

export const adminCustomerChatSessionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['session_id', 'control_mode', 'needs_human', 'messages_count', 'updated_at'],
  properties: {
    session_id: { type: 'string', format: 'uuid' },
    control_mode: { type: 'string', enum: ['AI', 'AGENT'] },
    needs_human: { type: 'boolean' },
    messages_count: { type: 'integer' },
    updated_at: { type: 'string' }
  }
} as const;

export type AdminCustomerDetail = AdminCustomerSummary & {
  default_shipping_address: string;
  orders: AdminOrderSummary[];
  chat_sessions?: AdminCustomerChatSession[];
  unlinked_phone_orders_count?: number;
};

export const adminCustomerDetailSchema = {
  ...adminCustomerSummarySchema,
  required: [...adminCustomerSummarySchema.required, 'default_shipping_address', 'orders'],
  properties: {
    ...adminCustomerSummarySchema.properties,
    default_shipping_address: { type: 'string' },
    orders: { type: 'array', items: adminOrderSummarySchema },
    chat_sessions: { type: 'array', items: adminCustomerChatSessionSchema },
    unlinked_phone_orders_count: { type: 'integer' }
  }
} as const;

export type AdminCustomerKpi = {
  total_members: number;
  active_members: number;
  locked_members: number;
  vip_members: number;
  watchlist_members: number;
  guest_buyers_count: number;
  total_member_revenue_vnd: number;
};

export const adminCustomerKpiSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'total_members',
    'active_members',
    'locked_members',
    'vip_members',
    'watchlist_members',
    'guest_buyers_count',
    'total_member_revenue_vnd'
  ],
  properties: {
    total_members: { type: 'integer' },
    active_members: { type: 'integer' },
    locked_members: { type: 'integer' },
    vip_members: { type: 'integer' },
    watchlist_members: { type: 'integer' },
    guest_buyers_count: { type: 'integer' },
    total_member_revenue_vnd: { type: 'integer' }
  }
} as const;

export type AdminGuestBuyerSummary = {
  phone: string;
  latest_name: string;
  latest_address: string;
  orders_count: number;
  delivered_count: number;
  cancelled_count: number;
  active_orders_count: number;
  total_spent_vnd: number;
  last_order_at: string;
  risk_flag: 'HIGH_CANCEL' | 'VIP_GUEST' | 'NORMAL';
  matched_member_id: string | null;
  matched_member_email: string | null;
  recent_orders: AdminOrderSummary[];
};

export const adminGuestBuyerSummarySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'phone',
    'latest_name',
    'latest_address',
    'orders_count',
    'delivered_count',
    'cancelled_count',
    'active_orders_count',
    'total_spent_vnd',
    'last_order_at',
    'risk_flag',
    'matched_member_id',
    'matched_member_email',
    'recent_orders'
  ],
  properties: {
    phone: { type: 'string' },
    latest_name: { type: 'string' },
    latest_address: { type: 'string' },
    orders_count: { type: 'integer' },
    delivered_count: { type: 'integer' },
    cancelled_count: { type: 'integer' },
    active_orders_count: { type: 'integer' },
    total_spent_vnd: { type: 'integer' },
    last_order_at: { type: 'string' },
    risk_flag: { type: 'string', enum: ['HIGH_CANCEL', 'VIP_GUEST', 'NORMAL'] },
    matched_member_id: { type: ['string', 'null'] },
    matched_member_email: { type: ['string', 'null'] },
    recent_orders: { type: 'array', items: adminOrderSummarySchema }
  }
} as const;

// --- Staff Management ---
export type AdminStaffMember = {
  admin_id: string;
  username: string;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
};

export const adminStaffMemberSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'admin_id',
    'username',
    'display_name',
    'role',
    'is_active',
    'last_login_at',
    'created_at'
  ],
  properties: {
    admin_id: { type: 'string', format: 'uuid' },
    username: { type: 'string' },
    display_name: { type: 'string' },
    role: { type: 'string', enum: [...adminRoles] },
    is_active: { type: 'boolean' },
    last_login_at: { type: ['string', 'null'] },
    created_at: { type: 'string' }
  }
} as const;

// --- AI Chatbot & Model Management ---
export type VerifiedModelInfo = {
  id: string;
  name: string;
  group: 'Google' | 'Anthropic' | 'DeepSeek' | 'OpenAI' | 'Qwen' | 'xAI' | 'Zhipu' | 'Other';
  latency_tier: 'fast' | 'standard' | 'reasoning';
  note: string;
  recommended: boolean;
};

export type AdminAiConfig = {
  ai_enabled_effective: boolean;
  ai_enabled_override: boolean | null;
  gateway_configured: boolean;
  gateway_base_url_masked: string;
  active_model: string;
  default_model: string;
  custom_system_instructions: string;
  welcome_message: string;
  suggested_prompts: string[];
  max_tokens_per_call: number;
  turn_timeout_ms: number;
  human_wait_timeout_sec: number;
  verified_models: VerifiedModelInfo[];
  telemetry: {
    total_turns_24h: number;
    success_rate_pct: number;
    handoff_rate_pct: number;
    avg_latency_ms: number;
    total_tokens_24h: number;
    model_breakdown: Array<{
      model: string;
      turns: number;
      prompt_tokens: number;
      completion_tokens: number;
    }>;
  };
  recent_errors: Array<{
    turn_id: string;
    model_used: string;
    error_code: string;
    latency_ms: number;
    created_at: string;
  }>;
};

export const adminAiConfigSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'ai_enabled_effective',
    'ai_enabled_override',
    'gateway_configured',
    'gateway_base_url_masked',
    'active_model',
    'default_model',
    'custom_system_instructions',
    'welcome_message',
    'suggested_prompts',
    'max_tokens_per_call',
    'turn_timeout_ms',
    'human_wait_timeout_sec',
    'verified_models',
    'telemetry',
    'recent_errors'
  ],
  properties: {
    ai_enabled_effective: { type: 'boolean' },
    ai_enabled_override: { type: ['boolean', 'null'] },
    gateway_configured: { type: 'boolean' },
    gateway_base_url_masked: { type: 'string' },
    active_model: { type: 'string' },
    default_model: { type: 'string' },
    custom_system_instructions: { type: 'string' },
    welcome_message: { type: 'string' },
    suggested_prompts: { type: 'array', items: { type: 'string' } },
    max_tokens_per_call: { type: 'integer' },
    turn_timeout_ms: { type: 'integer' },
    human_wait_timeout_sec: { type: 'integer' },
    verified_models: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'group', 'latency_tier', 'note', 'recommended'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          group: { type: 'string' },
          latency_tier: { type: 'string' },
          note: { type: 'string' },
          recommended: { type: 'boolean' }
        }
      }
    },
    telemetry: { type: 'object', additionalProperties: true },
    recent_errors: { type: 'array', items: { type: 'object', additionalProperties: true } }
  }
} as const;

export type AdminAiTestResult = {
  model: string;
  response_text: string;
  tool_calls: Array<{ id: string; name: string; arguments: string; result_preview: string }>;
  latency_ms: number;
  tokens: { prompt_tokens?: number; completion_tokens?: number } | null;
};

export const adminAiTestResultSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['model', 'response_text', 'tool_calls', 'latency_ms', 'tokens'],
  properties: {
    model: { type: 'string' },
    response_text: { type: 'string' },
    tool_calls: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'arguments', 'result_preview'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          arguments: { type: 'string' },
          result_preview: { type: 'string' }
        }
      }
    },
    latency_ms: { type: 'integer' },
    tokens: { type: ['object', 'null'], additionalProperties: true }
  }
} as const;

// --- Store Settings & Audit ---
export type AdminStoreSettings = {
  store_name: string;
  shipping_fee_vnd: number;
  price_tax_note: string;
  shipping_scope: string;
  warranty_policy: string;
  return_policy: string;
  support_hours: string;
  contact_channels: string[];
  policy_links: string[];
  updated_at: string;
};

export const adminStoreSettingsSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'store_name',
    'shipping_fee_vnd',
    'price_tax_note',
    'shipping_scope',
    'warranty_policy',
    'return_policy',
    'support_hours',
    'contact_channels',
    'policy_links',
    'updated_at'
  ],
  properties: {
    store_name: { type: 'string' },
    shipping_fee_vnd: { type: 'integer' },
    price_tax_note: { type: 'string' },
    shipping_scope: { type: 'string' },
    warranty_policy: { type: 'string' },
    return_policy: { type: 'string' },
    support_hours: { type: 'string' },
    contact_channels: { type: 'array', items: { type: 'string' } },
    policy_links: { type: 'array', items: { type: 'string' } },
    updated_at: { type: 'string' }
  }
} as const;

export type AdminAuditEvent = {
  id: string;
  actor_type: string;
  actor_id: string | null;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminCustomerPage = {
  items: AdminCustomerSummary[];
  next_cursor: string | null;
  total_count?: number;
  next_offset?: number | null;
  kpi?: AdminCustomerKpi;
};

export const adminCustomerPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminCustomerSummarySchema },
    next_cursor: { type: ['string', 'null'] },
    total_count: { type: 'integer', minimum: 0 },
    next_offset: { type: ['integer', 'null'] },
    kpi: adminCustomerKpiSchema
  }
} as const;

export type AdminGuestBuyerPage = {
  items: AdminGuestBuyerSummary[];
  total_count: number;
  next_offset: number | null;
};

export const adminGuestBuyerPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'total_count', 'next_offset'],
  properties: {
    items: { type: 'array', items: adminGuestBuyerSummarySchema },
    total_count: { type: 'integer', minimum: 0 },
    next_offset: { type: ['integer', 'null'] }
  }
} as const;

export const adminStaffListSchema = {
  type: 'array',
  items: adminStaffMemberSchema
} as const;

export const adminAuditEventSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'actor_type',
    'actor_id',
    'action',
    'entity_type',
    'entity_id',
    'metadata',
    'created_at'
  ],
  properties: {
    id: { type: 'string', format: 'uuid' },
    actor_type: { type: 'string' },
    actor_id: { type: ['string', 'null'] },
    actor_name: { type: 'string' },
    action: { type: 'string' },
    entity_type: { type: 'string' },
    entity_id: { type: ['string', 'null'] },
    metadata: { type: 'object', additionalProperties: true },
    created_at: { type: 'string' }
  }
} as const;

export const adminAuditPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: adminAuditEventSchema },
    next_cursor: { type: ['string', 'null'] }
  }
} as const;

export type AdminOrderDetail = OrderView & {
  created_at?: string;
  updated_at?: string;
  cancelled_at?: string | null;
  timeline?: AdminAuditEvent[];
};

export const adminOrderDetailSchema = {
  ...orderViewSchema,
  properties: {
    ...orderViewSchema.properties,
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    cancelled_at: { type: ['string', 'null'] },
    timeline: { type: 'array', items: adminAuditEventSchema }
  }
} as const;
