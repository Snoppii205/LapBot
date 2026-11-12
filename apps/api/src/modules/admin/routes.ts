import type { FastifyInstance } from 'fastify';
import {
  AI_HUMAN_WAIT_MAX_SEC,
  AI_HUMAN_WAIT_MIN_SEC,
  AI_MAX_CUSTOM_INSTRUCTIONS_LENGTH,
  AI_MAX_TEST_PROMPT_LENGTH,
  AI_MAX_TOKENS_MAX,
  AI_MAX_TOKENS_MIN,
  AI_TURN_TIMEOUT_MAX_MS,
  AI_TURN_TIMEOUT_MIN_MS,
  STAFF_MIN_PASSWORD_LENGTH,
  adminAiConfigSchema,
  adminAiTestResultSchema,
  adminAuditPageSchema,
  adminBulkVariantActions,
  adminBulkVariantPatchResultSchema,
  adminCatalogDeleteResultSchema,
  adminCatalogMetaSchema,
  adminCatalogSorts,
  adminChatBulkCleanResultSchema,
  adminChatCleanScopes,
  adminChatDeleteResultSchema,
  adminChatHistorySchema,
  adminChatPageSchema,
  adminCustomerDetailSchema,
  adminCustomerPageSchema,
  adminDashboardSchema,
  adminGuestBuyerPageSchema,
  adminImageUploadResultSchema,
  adminLaptopImagesUpdateResultSchema,
  adminLaptopPageSchema,
  adminLaptopSchema,
  adminOrderDetailSchema,
  adminOrderPageSchema,
  adminProfileSchema,
  adminRoles,
  adminStaffListSchema,
  adminStaffMemberSchema,
  adminStockFilters,
  adminStoreSettingsSchema,
  adminVariantPageSchema,
  adminVariantSchema,
  chatMessageSchema,
  customerSorts,
  customerTags,
  guestBuyerFilters,
  orderStatuses,
  usageCategories,
  type AdminBulkVariantAction,
  type AdminCatalogSort,
  type AdminChatCleanScope,
  type AdminImageUploadInput,
  type AdminRole,
  type AdminStockFilter,
  type CustomerSort,
  type CustomerTag,
  type GuestBuyerFilter,
  type UsageCategory
} from '@lapbot/contracts';
import { adminSession, login, logout } from '../auth/admin.js';
import { claimChat, releaseChat } from '../chat/control.js';
import { AppError } from '../../lib/errors.js';
import { limit } from '../../lib/limiter.js';
import { bigintCursor, stringQuery } from '../../lib/validate.js';
import { getAiConfig, testAiModel, updateAiConfig } from './ai.js';
import {
  bulkPatchVariants,
  createCatalog,
  deleteCatalog,
  getAdminCatalogMeta,
  listAdminCatalog,
  patchCatalog,
  updateLaptopImages
} from './catalog.js';
import {
  adminChatHistory,
  adminChatSessions,
  bulkCleanAdminChatSessions,
  cleanAdminChatSession,
  sendAgentMessage
} from './chat.js';
import {
  createAdminCustomer,
  getCustomer,
  listCustomers,
  listGuestBuyers,
  patchCustomer,
  promoteGuestToCustomer
} from './customers.js';
import { getDashboardStats } from './dashboard.js';
import { uploadAdminImage } from './images.js';
import { adminOrder, adminOrders, transitionOrder } from './orders.js';
import {
  idParams,
  idSchema,
  imageUploadBody,
  laptopProperties,
  objectBody,
  parseAllowedQuery,
  parseCursor,
  parseLimit,
  parseOffset,
  strSchema,
  variantProperties,
  versionBody
} from './schemas.js';
import { getStoreSettings, listAuditEvents, updateStoreSettings } from './settings.js';
import {
  changeOwnPassword,
  createStaff,
  listStaff,
  patchStaff,
  revokeStaffSessions
} from './staff.js';

export async function adminRoutes(app: FastifyInstance) {
  // --- Admin Auth ---
  app.post<{ Body: { username: string; password: string } }>(
    '/admin/login',
    {
      schema: {
        body: objectBody({ username: strSchema(80), password: strSchema(1024) }, [
          'username',
          'password'
        ]),
        response: { 200: adminProfileSchema }
      }
    },
    async (request, reply) => {
      limit(`admin-login:${request.ip}`, 5, 15 * 60_000);
      return login(request.body.username, request.body.password, reply);
    }
  );

  app.post('/admin/logout', { schema: { body: objectBody({}, []) } }, async (request, reply) => {
    await adminSession(request);
    await logout(request, reply);
    return { ok: true };
  });

  app.get('/admin/me', { schema: { response: { 200: adminProfileSchema } } }, request =>
    adminSession(request)
  );

  app.post<{ Body: { old_password: string; new_password: string } }>(
    '/admin/me/password',
    {
      schema: {
        body: objectBody(
          {
            old_password: strSchema(1024),
            new_password: strSchema(1024, STAFF_MIN_PASSWORD_LENGTH)
          },
          ['old_password', 'new_password']
        )
      }
    },
    async request => {
      const admin = await adminSession(request);
      await changeOwnPassword(admin.admin_id, {
        current_password: request.body.old_password,
        new_password: request.body.new_password
      });
      return { ok: true };
    }
  );

  // --- Dashboard ---
  app.get(
    '/admin/dashboard',
    { schema: { response: { 200: adminDashboardSchema } } },
    async request => {
      await adminSession(request);
      return getDashboardStats();
    }
  );

  // --- Orders ---
  app.get(
    '/admin/orders',
    { schema: { response: { 200: adminOrderPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, ['status', 'limit', 'cursor', 'q', 'from', 'to']);
      const status = stringQuery(q.status, 'status', 40);
      if (status && !orderStatuses.includes(status as (typeof orderStatuses)[number])) {
        throw new AppError(400, 'INVALID_QUERY', 'Trạng thái không hợp lệ.');
      }
      return adminOrders(
        status,
        parseLimit(q.limit),
        parseCursor(q.cursor),
        stringQuery(q.q, 'q', 160),
        stringQuery(q.from, 'from', 20),
        stringQuery(q.to, 'to', 20)
      );
    }
  );

  app.get<{ Params: { id: string } }>(
    '/admin/orders/:id',
    { schema: { params: idParams, response: { 200: adminOrderDetailSchema } } },
    async request => {
      await adminSession(request);
      return adminOrder(request.params.id);
    }
  );

  app.post<{
    Params: { id: string };
    Body: { from_status: string; to_status: string; note?: string };
  }>(
    '/admin/orders/:id/transition',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            from_status: { type: 'string', enum: [...orderStatuses] },
            to_status: { type: 'string', enum: [...orderStatuses] },
            note: { type: 'string', maxLength: 500 }
          },
          ['from_status', 'to_status']
        ),
        response: { 200: adminOrderDetailSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return transitionOrder(
        request.params.id,
        request.body.from_status,
        request.body.to_status,
        admin.admin_id,
        request.body.note
      );
    }
  );

  // --- Catalog ---
  app.get(
    '/admin/catalog/meta',
    { schema: { response: { 200: adminCatalogMetaSchema } } },
    async request => {
      await adminSession(request);
      return getAdminCatalogMeta();
    }
  );

  const parseCatalogExtra = (q: Record<string, unknown>) => {
    if (q.is_active !== undefined && q.is_active !== 'true' && q.is_active !== 'false') {
      throw new AppError(400, 'INVALID_QUERY', 'is_active không hợp lệ.');
    }
    const stockFilter = stringQuery(q.stock_filter, 'stock_filter', 20) as
      | AdminStockFilter
      | undefined;
    if (stockFilter && !adminStockFilters.includes(stockFilter)) {
      throw new AppError(400, 'INVALID_QUERY', 'stock_filter không hợp lệ.');
    }
    const usageCategory = stringQuery(q.usage_category, 'usage_category', 40) as
      | UsageCategory
      | undefined;
    if (usageCategory && !usageCategories.includes(usageCategory)) {
      throw new AppError(400, 'INVALID_QUERY', 'usage_category không hợp lệ.');
    }
    const sort = stringQuery(q.sort, 'sort', 30) as AdminCatalogSort | undefined;
    if (sort && !adminCatalogSorts.includes(sort)) {
      throw new AppError(400, 'INVALID_QUERY', 'sort không hợp lệ.');
    }
    return {
      laptop_id: stringQuery(q.laptop_id, 'laptop_id', 36),
      stock_filter: stockFilter,
      is_active: q.is_active === 'true' ? true : q.is_active === 'false' ? false : undefined,
      brand: stringQuery(q.brand, 'brand', 80),
      usage_category: usageCategory,
      sort,
      offset: parseOffset(q.offset)
    };
  };

  app.get(
    '/admin/catalog/laptops',
    { schema: { response: { 200: adminLaptopPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, [
        'q',
        'limit',
        'cursor',
        'offset',
        'sort',
        'brand',
        'usage_category',
        'is_active',
        'stock_filter'
      ]);
      return listAdminCatalog(
        'laptops',
        parseLimit(q.limit),
        parseCursor(q.cursor),
        stringQuery(q.q, 'q', 160),
        parseCatalogExtra(q)
      );
    }
  );

  app.get(
    '/admin/catalog/variants',
    { schema: { response: { 200: adminVariantPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, [
        'q',
        'limit',
        'cursor',
        'offset',
        'sort',
        'laptop_id',
        'stock_filter',
        'is_active',
        'brand',
        'usage_category'
      ]);
      return listAdminCatalog(
        'variants',
        parseLimit(q.limit),
        parseCursor(q.cursor),
        stringQuery(q.q, 'q', 160),
        parseCatalogExtra(q)
      );
    }
  );

  app.post<{
    Body: {
      variant_ids: string[];
      action: AdminBulkVariantAction;
      value?: number;
    };
  }>(
    '/admin/catalog/variants/bulk-patch',
    {
      schema: {
        body: objectBody(
          {
            variant_ids: {
              type: 'array',
              minItems: 1,
              maxItems: 100,
              items: idSchema
            },
            action: { type: 'string', enum: [...adminBulkVariantActions] },
            value: { type: 'number', minimum: -500000000, maximum: 1000000000 }
          },
          ['variant_ids', 'action']
        ),
        response: { 200: adminBulkVariantPatchResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return bulkPatchVariants(
        request.body.variant_ids,
        request.body.action,
        request.body.value,
        admin.admin_id
      );
    }
  );

  app.post<{ Body: Record<string, string | number | boolean | null> }>(
    '/admin/catalog/laptops',
    {
      schema: {
        body: objectBody(laptopProperties, ['brand', 'model_name']),
        response: { 201: adminLaptopSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request);
      reply.status(201);
      return createCatalog('laptops', request.body, admin.admin_id);
    }
  );

  app.post<{ Body: Record<string, string | number | boolean | null> }>(
    '/admin/catalog/variants',
    {
      schema: {
        body: objectBody({ laptop_id: idSchema, sku: strSchema(80), ...variantProperties }, [
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
          'stock'
        ]),
        response: { 201: adminVariantSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request);
      reply.status(201);
      return createCatalog('variants', request.body, admin.admin_id);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: Record<string, string | number | boolean | null> & { expected_revision: number };
  }>(
    '/admin/catalog/laptops/:id',
    {
      schema: {
        params: idParams,
        body: objectBody(
          { expected_revision: { type: 'integer', minimum: 1 }, ...laptopProperties },
          ['expected_revision']
        ),
        response: { 200: adminLaptopSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      const { expected_revision, ...data } = request.body;
      return patchCatalog('laptops', request.params.id, expected_revision, data, admin.admin_id);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: Record<string, string | number | boolean | null> & { expected_revision: number };
  }>(
    '/admin/catalog/variants/:id',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            expected_revision: { type: 'integer', minimum: 1 },
            laptop_id: idSchema,
            sku: strSchema(80),
            ...variantProperties
          },
          ['expected_revision']
        ),
        response: { 200: adminVariantSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      const { expected_revision, ...data } = request.body;
      return patchCatalog('variants', request.params.id, expected_revision, data, admin.admin_id);
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/admin/catalog/laptops/:id',
    {
      schema: {
        params: idParams,
        response: { 200: adminCatalogDeleteResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return deleteCatalog('laptops', request.params.id, admin.admin_id);
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/admin/catalog/variants/:id',
    {
      schema: {
        params: idParams,
        response: { 200: adminCatalogDeleteResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return deleteCatalog('variants', request.params.id, admin.admin_id);
    }
  );

  app.post<{ Body: AdminImageUploadInput }>(
    '/admin/catalog/images/upload',
    {
      bodyLimit: 6 * 1024 * 1024,
      schema: {
        body: imageUploadBody,
        response: { 201: adminImageUploadResultSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request);
      reply.status(201);
      return uploadAdminImage(admin.admin_id, request.body);
    }
  );

  app.put<{
    Params: { id: string };
    Body: { images: Array<{ image_url: string; caption?: string }> };
  }>(
    '/admin/catalog/laptops/:id/images',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            images: {
              type: 'array',
              maxItems: 20,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['image_url'],
                properties: {
                  image_url: strSchema(2000),
                  caption: { type: 'string', maxLength: 255 }
                }
              }
            }
          },
          ['images']
        ),
        response: { 200: adminLaptopImagesUpdateResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return updateLaptopImages(request.params.id, request.body.images, admin.admin_id);
    }
  );

  // --- Live Chat (HITL) ---
  app.get(
    '/admin/chat/sessions',
    { schema: { response: { 200: adminChatPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, ['needs_human', 'mode', 'q', 'limit', 'cursor']);
      if (q.needs_human !== undefined && q.needs_human !== 'true' && q.needs_human !== 'false') {
        throw new AppError(400, 'INVALID_QUERY', 'needs_human không hợp lệ.');
      }
      const mode = stringQuery(q.mode, 'mode', 20) as 'WAITING' | 'AGENT' | 'AI' | undefined;
      if (mode && !['WAITING', 'AGENT', 'AI'].includes(mode)) {
        throw new AppError(400, 'INVALID_QUERY', 'mode không hợp lệ.');
      }
      return adminChatSessions(
        q.needs_human === undefined ? undefined : q.needs_human === 'true',
        parseLimit(q.limit),
        parseCursor(q.cursor),
        mode,
        stringQuery(q.q, 'q', 160)
      );
    }
  );

  app.get<{ Params: { id: string } }>(
    '/admin/chat/:id/messages',
    { schema: { params: idParams, response: { 200: adminChatHistorySchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, ['after_id', 'before_id', 'limit']);
      if (q.after_id !== undefined && q.before_id !== undefined) {
        throw new AppError(400, 'INVALID_CURSOR', 'Chỉ dùng một cursor.');
      }
      for (const value of [q.after_id, q.before_id]) {
        if (value !== undefined && !bigintCursor(value)) {
          throw new AppError(400, 'INVALID_CURSOR', 'Cursor không hợp lệ.');
        }
      }
      return adminChatHistory(
        request.params.id,
        q.after_id as string | undefined,
        q.before_id as string | undefined,
        parseLimit(q.limit)
      );
    }
  );

  app.post<{ Params: { id: string }; Body: { expected_control_version: number } }>(
    '/admin/chat/:id/claim',
    { schema: { params: idParams, body: versionBody } },
    async request => {
      const admin = await adminSession(request);
      return claimChat(request.params.id, request.body.expected_control_version, admin.admin_id);
    }
  );

  app.post<{ Params: { id: string }; Body: { expected_control_version: number } }>(
    '/admin/chat/:id/release',
    { schema: { params: idParams, body: versionBody } },
    async request => {
      const admin = await adminSession(request);
      return releaseChat(request.params.id, request.body.expected_control_version, admin.admin_id);
    }
  );

  app.post<{
    Params: { id: string };
    Body: {
      client_message_id: string;
      message: string;
      attach_variant_id?: string;
      widget_type?: 'laptop_spec' | 'address_form';
    };
  }>(
    '/admin/chat/:id/messages',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            client_message_id: idSchema,
            message: strSchema(3000),
            attach_variant_id: idSchema,
            widget_type: { type: 'string', enum: ['laptop_spec', 'address_form'] }
          },
          ['client_message_id', 'message']
        ),
        response: { 200: chatMessageSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      const message = request.body.message.trim();
      if (!message) throw new AppError(400, 'INVALID_MESSAGE', 'Tin nhắn trống.');
      const attachment = request.body.attach_variant_id
        ? {
            variant_id: request.body.attach_variant_id,
            widget_type: request.body.widget_type ?? 'laptop_spec'
          }
        : undefined;
      return sendAgentMessage(
        request.params.id,
        admin.admin_id,
        request.body.client_message_id,
        message,
        attachment
      );
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/admin/chat/:id',
    {
      schema: {
        params: idParams,
        response: { 200: adminChatDeleteResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return cleanAdminChatSession(request.params.id, admin.admin_id);
    }
  );

  app.post<{ Body: { scope: AdminChatCleanScope } }>(
    '/admin/chat/cleanup',
    {
      schema: {
        body: objectBody(
          {
            scope: { type: 'string', enum: [...adminChatCleanScopes] }
          },
          ['scope']
        ),
        response: { 200: adminChatBulkCleanResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return bulkCleanAdminChatSessions(request.body.scope, admin.admin_id);
    }
  );

  // --- Customers & CRM 360 ---
  app.get(
    '/admin/customers',
    { schema: { response: { 200: adminCustomerPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, [
        'q',
        'is_active',
        'customer_tag',
        'sort',
        'limit',
        'cursor',
        'offset'
      ]);
      if (q.is_active !== undefined && q.is_active !== 'true' && q.is_active !== 'false') {
        throw new AppError(400, 'INVALID_QUERY', 'is_active không hợp lệ.');
      }
      const isActive = q.is_active === 'true' ? true : q.is_active === 'false' ? false : undefined;
      const customerTag = stringQuery(q.customer_tag, 'customer_tag', 24) as
        | CustomerTag
        | undefined;
      if (customerTag && !customerTags.includes(customerTag)) {
        throw new AppError(400, 'INVALID_QUERY', 'customer_tag không hợp lệ.');
      }
      const sort = stringQuery(q.sort, 'sort', 30) as CustomerSort | undefined;
      if (sort && !customerSorts.includes(sort)) {
        throw new AppError(400, 'INVALID_QUERY', 'sort không hợp lệ.');
      }
      return listCustomers(
        stringQuery(q.q, 'q', 160),
        isActive,
        parseLimit(q.limit),
        parseCursor(q.cursor),
        {
          customer_tag: customerTag,
          sort,
          offset: parseOffset(q.offset)
        }
      );
    }
  );

  app.post<{
    Body: {
      email: string;
      password: string;
      full_name: string;
      phone?: string | null;
      default_shipping_address?: string;
      customer_tag?: CustomerTag;
      admin_note?: string;
      link_guest_orders?: boolean;
    };
  }>(
    '/admin/customers',
    {
      schema: {
        body: objectBody(
          {
            email: strSchema(160, 3),
            password: strSchema(128, 8),
            full_name: strSchema(100, 2),
            phone: { type: ['string', 'null'], maxLength: 32 },
            default_shipping_address: { type: 'string', maxLength: 500 },
            customer_tag: { type: 'string', enum: [...customerTags] },
            admin_note: { type: 'string', maxLength: 2000 },
            link_guest_orders: { type: 'boolean' }
          },
          ['email', 'password', 'full_name']
        ),
        response: { 201: adminCustomerDetailSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request);
      reply.status(201);
      return createAdminCustomer(admin.admin_id, request.body);
    }
  );

  app.get(
    '/admin/customers/guests',
    { schema: { response: { 200: adminGuestBuyerPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, ['q', 'filter', 'sort', 'limit', 'offset']);
      const filter = stringQuery(q.filter, 'filter', 24) as GuestBuyerFilter | undefined;
      if (filter && !guestBuyerFilters.includes(filter)) {
        throw new AppError(400, 'INVALID_QUERY', 'filter không hợp lệ.');
      }
      const sort = stringQuery(q.sort, 'sort', 30) as CustomerSort | undefined;
      if (sort && !customerSorts.includes(sort)) {
        throw new AppError(400, 'INVALID_QUERY', 'sort không hợp lệ.');
      }
      return listGuestBuyers({
        q: stringQuery(q.q, 'q', 160),
        filter,
        sort,
        limit: parseLimit(q.limit),
        offset: parseOffset(q.offset)
      });
    }
  );

  app.post<{
    Body: {
      phone: string;
      email: string;
      password: string;
      full_name?: string;
      default_shipping_address?: string;
      customer_tag?: CustomerTag;
      admin_note?: string;
    };
  }>(
    '/admin/customers/guests/promote',
    {
      schema: {
        body: objectBody(
          {
            phone: strSchema(32, 8),
            email: strSchema(160, 3),
            password: strSchema(128, 8),
            full_name: { type: 'string', maxLength: 100 },
            default_shipping_address: { type: 'string', maxLength: 500 },
            customer_tag: { type: 'string', enum: [...customerTags] },
            admin_note: { type: 'string', maxLength: 2000 }
          },
          ['phone', 'email', 'password']
        ),
        response: { 201: adminCustomerDetailSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request);
      reply.status(201);
      return promoteGuestToCustomer(admin.admin_id, request.body);
    }
  );

  app.get<{ Params: { id: string } }>(
    '/admin/customers/:id',
    { schema: { params: idParams, response: { 200: adminCustomerDetailSchema } } },
    async request => {
      await adminSession(request);
      return getCustomer(request.params.id);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: {
      is_active?: boolean;
      full_name?: string;
      email?: string;
      phone?: string | null;
      default_shipping_address?: string;
      customer_tag?: CustomerTag;
      admin_note?: string;
      new_password?: string;
      link_phone_orders?: boolean;
    };
  }>(
    '/admin/customers/:id',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            is_active: { type: 'boolean' },
            full_name: strSchema(100, 2),
            email: strSchema(160, 3),
            phone: { type: ['string', 'null'], maxLength: 32 },
            default_shipping_address: { type: 'string', maxLength: 500 },
            customer_tag: { type: 'string', enum: [...customerTags] },
            admin_note: { type: 'string', maxLength: 2000 },
            new_password: strSchema(128, 8),
            link_phone_orders: { type: 'boolean' }
          },
          []
        ),
        response: { 200: adminCustomerDetailSchema }
      }
    },
    async request => {
      const admin = await adminSession(request);
      return patchCustomer(admin.admin_id, request.params.id, request.body);
    }
  );

  // --- Staff Management (SUPER_ADMIN) ---
  app.get(
    '/admin/staff',
    { schema: { response: { 200: adminStaffListSchema } } },
    async request => {
      await adminSession(request);
      return listStaff();
    }
  );

  app.post<{ Params: { id: string } }>(
    '/admin/staff/:id/revoke-sessions',
    {
      schema: {
        params: idParams,
        body: objectBody({}, []),
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['ok', 'revoked_count'],
            properties: {
              ok: { type: 'boolean' },
              revoked_count: { type: 'integer', minimum: 0 }
            }
          }
        }
      }
    },
    async request => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      return revokeStaffSessions(admin.admin_id, request.params.id);
    }
  );

  app.post<{ Body: { username: string; display_name: string; password: string; role: AdminRole } }>(
    '/admin/staff',
    {
      schema: {
        body: objectBody(
          {
            username: strSchema(80, 3),
            display_name: strSchema(120),
            password: strSchema(1024, STAFF_MIN_PASSWORD_LENGTH),
            role: { type: 'string', enum: [...adminRoles] }
          },
          ['username', 'display_name', 'password', 'role']
        ),
        response: { 201: adminStaffMemberSchema }
      }
    },
    async (request, reply) => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      reply.status(201);
      return createStaff(admin.admin_id, request.body);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { display_name?: string; role?: AdminRole; is_active?: boolean; new_password?: string };
  }>(
    '/admin/staff/:id',
    {
      schema: {
        params: idParams,
        body: objectBody(
          {
            display_name: strSchema(120),
            role: { type: 'string', enum: [...adminRoles] },
            is_active: { type: 'boolean' },
            new_password: strSchema(1024, STAFF_MIN_PASSWORD_LENGTH)
          },
          []
        ),
        response: { 200: adminStaffMemberSchema }
      }
    },
    async request => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      return patchStaff(admin.admin_id, request.params.id, {
        display_name: request.body.display_name,
        role: request.body.role,
        is_active: request.body.is_active,
        password: request.body.new_password
      });
    }
  );

  // --- AI Management (SUPER_ADMIN for mutations) ---
  app.get(
    '/admin/ai/config',
    { schema: { response: { 200: adminAiConfigSchema } } },
    async request => {
      await adminSession(request);
      return getAiConfig();
    }
  );

  app.patch<{
    Body: {
      ai_enabled_override?: boolean | null;
      active_model?: string;
      custom_system_instructions?: string;
      welcome_message?: string;
      suggested_prompts?: string[];
      max_tokens_per_call?: number;
      turn_timeout_ms?: number;
      human_wait_timeout_sec?: number;
    };
  }>(
    '/admin/ai/config',
    {
      schema: {
        body: objectBody(
          {
            ai_enabled_override: { type: ['boolean', 'null'] },
            active_model: strSchema(80),
            custom_system_instructions: {
              type: 'string',
              maxLength: AI_MAX_CUSTOM_INSTRUCTIONS_LENGTH
            },
            welcome_message: { type: 'string', maxLength: 1000 },
            suggested_prompts: { type: 'array', items: { type: 'string', maxLength: 200 } },
            max_tokens_per_call: {
              type: 'integer',
              minimum: AI_MAX_TOKENS_MIN,
              maximum: AI_MAX_TOKENS_MAX
            },
            turn_timeout_ms: {
              type: 'integer',
              minimum: AI_TURN_TIMEOUT_MIN_MS,
              maximum: AI_TURN_TIMEOUT_MAX_MS
            },
            human_wait_timeout_sec: {
              type: 'integer',
              minimum: AI_HUMAN_WAIT_MIN_SEC,
              maximum: AI_HUMAN_WAIT_MAX_SEC
            }
          },
          []
        ),
        response: { 200: adminAiConfigSchema }
      }
    },
    async request => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      return updateAiConfig(admin.admin_id, request.body);
    }
  );

  app.post<{ Body: { model: string; test_prompt: string } }>(
    '/admin/ai/test',
    {
      schema: {
        body: objectBody(
          {
            model: strSchema(80),
            test_prompt: strSchema(AI_MAX_TEST_PROMPT_LENGTH)
          },
          ['model', 'test_prompt']
        ),
        response: { 200: adminAiTestResultSchema }
      }
    },
    async request => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      return testAiModel(admin.admin_id, {
        model: request.body.model,
        prompt: request.body.test_prompt
      });
    }
  );

  // --- Store Settings & Audit ---
  app.get(
    '/admin/settings',
    { schema: { response: { 200: adminStoreSettingsSchema } } },
    async request => {
      await adminSession(request);
      return getStoreSettings();
    }
  );

  app.patch<{
    Body: {
      store_name?: string;
      shipping_fee_vnd?: number;
      price_tax_note?: string;
      shipping_scope?: string;
      warranty_policy?: string;
      return_policy?: string;
      support_hours?: string;
      contact_channels?: string[];
      policy_links?: string[];
    };
  }>(
    '/admin/settings',
    {
      schema: {
        body: objectBody(
          {
            store_name: strSchema(160),
            shipping_fee_vnd: { type: 'integer', minimum: 0, maximum: 10000000 },
            price_tax_note: strSchema(255),
            shipping_scope: strSchema(255),
            warranty_policy: { type: 'string', maxLength: 5000 },
            return_policy: { type: 'string', maxLength: 5000 },
            support_hours: strSchema(255),
            contact_channels: { type: 'array', items: { type: 'string', maxLength: 255 } },
            policy_links: { type: 'array', items: { type: 'string', maxLength: 500 } }
          },
          []
        ),
        response: { 200: adminStoreSettingsSchema }
      }
    },
    async request => {
      const admin = await adminSession(request, 'SUPER_ADMIN');
      return updateStoreSettings(admin.admin_id, request.body);
    }
  );

  app.get(
    '/admin/audit',
    { schema: { response: { 200: adminAuditPageSchema } } },
    async request => {
      await adminSession(request);
      const q = parseAllowedQuery(request.query, [
        'limit',
        'cursor',
        'action',
        'entity_type',
        'actor_type',
        'q',
        'from',
        'to'
      ]);
      return listAuditEvents({
        limit: parseLimit(q.limit),
        cursor: parseCursor(q.cursor),
        action: stringQuery(q.action, 'action', 80),
        entity_type: stringQuery(q.entity_type, 'entity_type', 80),
        actor_type: stringQuery(q.actor_type, 'actor_type', 40),
        q: stringQuery(q.q, 'q', 160),
        from: stringQuery(q.from, 'from', 20),
        to: stringQuery(q.to, 'to', 20)
      });
    }
  );
}
