export const orderStatuses = [
  'PENDING_CONFIRMATION',
  'CONFIRMED_COD',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED'
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const paymentMethods = ['COD', 'VIETQR'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export type ProductSnapshot = {
  laptop_id: string;
  brand: string;
  model_name: string;
  sku: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  screen: string;
  color: string;
  price_vnd: number;
};
export type OrderView = {
  order_id: string;
  order_code: string;
  status: OrderStatus;
  variant_id: string;
  product_snapshot: ProductSnapshot;
  unit_price_vnd: number;
  shipping_fee_vnd: number;
  total_vnd: number;
  payment_method: PaymentMethod;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  note: string;
  quote_expires_at: string;
  confirmed_at: string | null;
  server_time: string;
};
export const orderViewSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'order_id',
    'order_code',
    'status',
    'variant_id',
    'product_snapshot',
    'unit_price_vnd',
    'shipping_fee_vnd',
    'total_vnd',
    'payment_method',
    'customer_name',
    'customer_phone',
    'shipping_address',
    'note',
    'quote_expires_at',
    'confirmed_at',
    'server_time'
  ],
  properties: {
    order_id: { type: 'string', format: 'uuid' },
    order_code: { type: 'string' },
    status: { type: 'string', enum: [...orderStatuses] },
    variant_id: { type: 'string', format: 'uuid' },
    product_snapshot: {
      type: 'object',
      additionalProperties: false,
      required: [
        'laptop_id',
        'brand',
        'model_name',
        'sku',
        'cpu',
        'gpu',
        'ram_gb',
        'ssd_gb',
        'screen',
        'color',
        'price_vnd'
      ],
      properties: {
        laptop_id: { type: 'string', format: 'uuid' },
        brand: { type: 'string' },
        model_name: { type: 'string' },
        sku: { type: 'string' },
        cpu: { type: 'string' },
        gpu: { type: 'string' },
        ram_gb: { type: 'integer' },
        ssd_gb: { type: 'integer' },
        screen: { type: 'string' },
        color: { type: 'string' },
        price_vnd: { type: 'integer' }
      }
    },
    unit_price_vnd: { type: 'integer' },
    shipping_fee_vnd: { type: 'integer' },
    total_vnd: { type: 'integer' },
    payment_method: { type: 'string', enum: [...paymentMethods] },
    customer_name: { type: 'string' },
    customer_phone: { type: 'string' },
    shipping_address: { type: 'string' },
    note: { type: 'string' },
    quote_expires_at: { type: 'string' },
    confirmed_at: { type: ['string', 'null'] },
    server_time: { type: 'string' }
  }
} as const;
