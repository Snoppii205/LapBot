export const addressLabelTypes = ['HOME', 'OFFICE', 'CAMPUS'] as const;
export type AddressLabelType = (typeof addressLabelTypes)[number];

export type ShippingAddressParts = {
  province: string;
  ward: string;
  street_detail: string;
  province_code?: string;
  ward_code?: string;
  district?: string;
  address_type?: AddressLabelType;
};

export const shippingAddressPartsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['province', 'ward', 'street_detail'],
  properties: {
    province: { type: 'string', minLength: 2, maxLength: 100 },
    ward: { type: 'string', minLength: 2, maxLength: 100 },
    street_detail: { type: 'string', minLength: 3, maxLength: 240 },
    province_code: { type: 'string', maxLength: 10 },
    ward_code: { type: 'string', maxLength: 10 },
    district: { type: 'string', maxLength: 100 },
    address_type: { type: 'string', enum: [...addressLabelTypes] }
  }
} as const;

export const nullableShippingAddressPartsSchema = {
  anyOf: [shippingAddressPartsSchema, { type: 'null' }]
} as const;

export type CustomerProfile = {
  customer_id: string;
  email: string;
  phone: string | null;
  full_name: string;
  default_shipping_address: string;
  shipping_address_meta: ShippingAddressParts | null;
  created_at: string;
};

export const customerProfileSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'customer_id',
    'email',
    'phone',
    'full_name',
    'default_shipping_address',
    'shipping_address_meta',
    'created_at'
  ],
  properties: {
    customer_id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email', maxLength: 160 },
    phone: { type: ['string', 'null'], maxLength: 20 },
    full_name: { type: 'string', minLength: 2, maxLength: 100 },
    default_shipping_address: { type: 'string', maxLength: 500 },
    shipping_address_meta: nullableShippingAddressPartsSchema,
    created_at: { type: 'string' }
  }
} as const;

export type CustomerRegisterInput = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  default_shipping_address?: string;
  shipping_address_meta?: ShippingAddressParts | null;
};

export const customerRegisterSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password', 'full_name'],
  properties: {
    email: { type: 'string', format: 'email', minLength: 5, maxLength: 160 },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    full_name: { type: 'string', minLength: 2, maxLength: 100 },
    phone: { type: 'string', maxLength: 20 },
    default_shipping_address: { type: 'string', maxLength: 500 },
    shipping_address_meta: nullableShippingAddressPartsSchema
  }
} as const;

export type CustomerLoginInput = {
  identifier: string; // Email hoặc Số điện thoại
  password: string;
};

export const customerLoginSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['identifier', 'password'],
  properties: {
    identifier: { type: 'string', minLength: 3, maxLength: 160 },
    password: { type: 'string', minLength: 1, maxLength: 128 }
  }
} as const;

export type CustomerProfilePatchInput = {
  full_name?: string;
  phone?: string | null;
  default_shipping_address?: string;
  shipping_address_meta?: ShippingAddressParts | null;
};

export const customerProfilePatchSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    full_name: { type: 'string', minLength: 2, maxLength: 100 },
    phone: { type: ['string', 'null'], maxLength: 20 },
    default_shipping_address: { type: 'string', maxLength: 500 },
    shipping_address_meta: nullableShippingAddressPartsSchema
  }
} as const;

export type PasswordChangeInput = {
  current_password: string;
  new_password: string;
};

export const passwordChangeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['current_password', 'new_password'],
  properties: {
    current_password: { type: 'string', minLength: 1, maxLength: 128 },
    new_password: { type: 'string', minLength: 8, maxLength: 128 }
  }
} as const;
