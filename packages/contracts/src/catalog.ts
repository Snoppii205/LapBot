export const usageCategories = [
  'office_study',
  'gaming',
  'graphic_creator',
  'programming',
  'business_ultrabook'
] as const;
export type UsageCategory = (typeof usageCategories)[number];
export const availabilityStatuses = ['in_stock', 'out_of_stock', 'pending_verification'] as const;
export type AvailabilityStatus = (typeof availabilityStatuses)[number];
export const catalogSortModes = [
  'recommended',
  'price_asc',
  'price_desc',
  'newest',
  'ram_desc'
] as const;
export type CatalogSortMode = (typeof catalogSortModes)[number];
export type CatalogBrandFacet = { brand: string; count: number };
export type VariantSummary = {
  variant_id: string;
  laptop_id: string;
  sku: string;
  brand: string;
  model_name: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  screen: string;
  color: string;
  usage_category: UsageCategory;
  price_vnd: number;
  in_stock: boolean;
  availability_status: AvailabilityStatus;
  image_url: string | null;
};
export type ProductImage = { image_url: string; caption: string };
export type VariantDetail = VariantSummary & { description: string; images: ProductImage[] };
export type CatalogPage = {
  items: VariantSummary[];
  next_cursor: string | null;
  total_count?: number;
  next_offset?: number | null;
  facets?: {
    brands: CatalogBrandFacet[];
  };
};
export type StoreInfo = {
  store_name: string;
  price_tax_note: string;
  shipping_scope: string;
  warranty_policy: string;
  return_policy: string;
  support_hours: string;
  contact_channels: string[];
  policy_links: string[];
  shipping_fee_vnd: number;
  capabilities: { ai_enabled: boolean; payment_methods: ['COD'] };
  ai_welcome_message?: string | null;
  ai_suggested_prompts?: string[] | null;
  human_wait_timeout_sec?: number | null;
};
export const variantSummarySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'variant_id',
    'laptop_id',
    'sku',
    'brand',
    'model_name',
    'cpu',
    'gpu',
    'ram_gb',
    'ssd_gb',
    'screen',
    'color',
    'usage_category',
    'price_vnd',
    'in_stock',
    'availability_status',
    'image_url'
  ],
  properties: {
    variant_id: { type: 'string', format: 'uuid' },
    laptop_id: { type: 'string', format: 'uuid' },
    sku: { type: 'string' },
    brand: { type: 'string' },
    model_name: { type: 'string' },
    cpu: { type: 'string' },
    gpu: { type: 'string' },
    ram_gb: { type: 'integer' },
    ssd_gb: { type: 'integer' },
    screen: { type: 'string' },
    color: { type: 'string' },
    usage_category: { type: 'string', enum: [...usageCategories] },
    price_vnd: { type: 'integer', minimum: 1, maximum: 1000000000 },
    in_stock: { type: 'boolean' },
    availability_status: { type: 'string', enum: [...availabilityStatuses] },
    image_url: { type: ['string', 'null'] }
  }
} as const;
export const variantDetailSchema = {
  ...variantSummarySchema,
  required: [...variantSummarySchema.required, 'description', 'images'],
  properties: {
    ...variantSummarySchema.properties,
    description: { type: 'string' },
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
export const catalogPageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: variantSummarySchema },
    next_cursor: { type: ['string', 'null'] },
    total_count: { type: 'integer', minimum: 0 },
    next_offset: { type: ['integer', 'null'] },
    facets: {
      type: 'object',
      additionalProperties: false,
      required: ['brands'],
      properties: {
        brands: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['brand', 'count'],
            properties: {
              brand: { type: 'string' },
              count: { type: 'integer', minimum: 0 }
            }
          }
        }
      }
    }
  }
} as const;
export const storeInfoSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'store_name',
    'price_tax_note',
    'shipping_scope',
    'warranty_policy',
    'return_policy',
    'support_hours',
    'contact_channels',
    'policy_links',
    'shipping_fee_vnd',
    'capabilities'
  ],
  properties: {
    store_name: { type: 'string' },
    price_tax_note: { type: 'string' },
    shipping_scope: { type: 'string' },
    warranty_policy: { type: 'string' },
    return_policy: { type: 'string' },
    support_hours: { type: 'string' },
    contact_channels: { type: 'array', items: { type: 'string' } },
    policy_links: { type: 'array', items: { type: 'string' } },
    shipping_fee_vnd: { type: 'integer' },
    capabilities: {
      type: 'object',
      additionalProperties: false,
      required: ['ai_enabled', 'payment_methods'],
      properties: {
        ai_enabled: { type: 'boolean' },
        payment_methods: {
          type: 'array',
          items: { type: 'string', enum: ['COD'] },
          minItems: 1,
          maxItems: 1
        }
      }
    },
    ai_welcome_message: { type: ['string', 'null'] },
    ai_suggested_prompts: { type: ['array', 'null'], items: { type: 'string' } },
    human_wait_timeout_sec: { type: ['integer', 'null'] }
  }
} as const;
