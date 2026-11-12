import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  nullableShippingAddressPartsSchema,
  orderViewSchema,
  paymentMethods
} from '@lapbot/contracts';
import { getOrCreateGuest, optionalGuestSession } from '../auth/guest.js';
import { optionalCustomerSession } from '../auth/customer.js';
import { AppError } from '../../lib/errors.js';
import { limit } from '../../lib/limiter.js';
import { positiveInteger } from '../../lib/validate.js';
import {
  cancelOrder,
  confirmOrder,
  getOrder,
  listOrders,
  previewOrder,
  type PreviewInput
} from './service.js';

const emptyBody = { type: 'object', additionalProperties: false, maxProperties: 0 } as const;
const idParams = {
  type: 'object',
  additionalProperties: false,
  required: ['order_id'],
  properties: { order_id: { type: 'string', format: 'uuid' } }
} as const;

const previewBody = {
  type: 'object',
  additionalProperties: false,
  required: [
    'client_request_id',
    'variant_id',
    'customer_name',
    'customer_phone',
    'shipping_address'
  ],
  properties: {
    client_request_id: { type: 'string', format: 'uuid' },
    variant_id: { type: 'string', format: 'uuid' },
    customer_name: { type: 'string', minLength: 2, maxLength: 100 },
    customer_phone: { type: 'string', maxLength: 30 },
    shipping_address: { type: 'string', minLength: 10, maxLength: 500 },
    note: { type: 'string', maxLength: 500 },
    payment_method: { type: 'string', enum: [...paymentMethods] },
    shipping_address_meta: nullableShippingAddressPartsSchema,
    save_default_address: { type: 'boolean' }
  }
} as const;

const orderListSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'next_cursor'],
  properties: {
    items: { type: 'array', items: orderViewSchema },
    next_cursor: { type: ['string', 'null'] }
  }
} as const;

async function requireOrderActor(request: FastifyRequest): Promise<{
  sessionId: string | null;
  customerId: string | null;
  rateKey: string;
}> {
  const [guest, customer] = await Promise.all([
    optionalGuestSession(request),
    optionalCustomerSession(request)
  ]);
  if (!guest && !customer) {
    throw new AppError(401, 'SESSION_REQUIRED', 'Phiên khách đã hết hạn hoặc không còn.');
  }
  return {
    sessionId: guest?.id ?? null,
    customerId: customer?.customer_id ?? null,
    rateKey: guest?.id ?? customer!.customer_id
  };
}

export async function orderRoutes(app: FastifyInstance) {
  app.post<{ Body: PreviewInput }>(
    '/orders/preview',
    { schema: { body: previewBody, response: { 200: orderViewSchema, 201: orderViewSchema } } },
    async (request, reply) => {
      const customer = await optionalCustomerSession(request);
      const guest = await getOrCreateGuest(request, reply);
      limit(`preview:s:${guest.id}`, 15, 60000);
      limit(`preview:ip:${request.ip}`, 60, 60000);
      const result = await previewOrder(guest.id, request.body, customer?.customer_id);
      reply.status(result.created ? 201 : 200);
      return result.order;
    }
  );

  app.post<{ Params: { order_id: string } }>(
    '/orders/:order_id/confirm',
    { schema: { params: idParams, body: emptyBody, response: { 200: orderViewSchema } } },
    async request => {
      const actor = await requireOrderActor(request);
      limit(`mutation:s:${actor.rateKey}`, 20, 60000);
      limit(`mutation:ip:${request.ip}`, 60, 60000);
      return confirmOrder(request.params.order_id, actor.sessionId, actor.customerId);
    }
  );

  app.post<{ Params: { order_id: string } }>(
    '/orders/:order_id/cancel',
    { schema: { params: idParams, body: emptyBody, response: { 200: orderViewSchema } } },
    async request => {
      const actor = await requireOrderActor(request);
      limit(`mutation:s:${actor.rateKey}`, 20, 60000);
      limit(`mutation:ip:${request.ip}`, 60, 60000);
      return cancelOrder(request.params.order_id, actor.sessionId, actor.customerId);
    }
  );

  app.get<{ Params: { order_id: string } }>(
    '/orders/:order_id',
    { schema: { params: idParams, response: { 200: orderViewSchema } } },
    async request => {
      const actor = await requireOrderActor(request);
      return getOrder(request.params.order_id, actor.sessionId, actor.customerId);
    }
  );

  app.get('/orders', { schema: { response: { 200: orderListSchema } } }, async request => {
    const actor = await requireOrderActor(request);
    const query = request.query as Record<string, unknown>;
    if (Object.keys(query).some(key => !['limit', 'cursor'].includes(key))) {
      throw new AppError(400, 'INVALID_QUERY', 'Query không hợp lệ.');
    }
    const count = query.limit === undefined ? 20 : positiveInteger(query.limit, 'limit', 20);
    if (count < 1) throw new AppError(400, 'INVALID_QUERY', 'limit phải ít nhất là 1.');
    const cursor = query.cursor;
    if (cursor !== undefined && (typeof cursor !== 'string' || cursor.length > 256)) {
      throw new AppError(400, 'INVALID_CURSOR', 'Cursor không hợp lệ.');
    }
    return listOrders(actor.sessionId, count, cursor as string | undefined, actor.customerId);
  });
}
