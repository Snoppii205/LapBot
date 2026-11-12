import type { FastifyInstance } from 'fastify';
import {
  customerLoginSchema,
  customerProfilePatchSchema,
  customerProfileSchema,
  customerRegisterSchema,
  passwordChangeSchema,
  sessionViewSchema,
  type CustomerLoginInput,
  type CustomerProfilePatchInput,
  type CustomerRegisterInput,
  type PasswordChangeInput
} from '@lapbot/contracts';
import { createNewGuest, getOrCreateGuest, toSessionView } from './guest.js';
import {
  changeCustomerPassword,
  customerSession,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile
} from './customer.js';
import { limit } from '../../lib/limiter.js';

export async function guestRoutes(app: FastifyInstance) {
  // Session ẩn danh cho Chat / Guest checkout
  app.post(
    '/chat/session',
    {
      schema: {
        body: { type: 'object', additionalProperties: false, maxProperties: 0 },
        response: { 200: sessionViewSchema }
      }
    },
    async (request, reply) => toSessionView(await getOrCreateGuest(request, reply))
  );

  app.post(
    '/chat/session/new',
    {
      schema: {
        body: { type: 'object', additionalProperties: false, maxProperties: 0 },
        response: { 200: sessionViewSchema }
      }
    },
    async (request, reply) => {
      const customer = await customerSession(request).catch(() => null);
      return toSessionView(await createNewGuest(reply, customer?.customer_id));
    }
  );

  // Authentication Khách hàng thành viên
  app.post<{ Body: CustomerRegisterInput }>(
    '/auth/register',
    { schema: { body: customerRegisterSchema, response: { 201: customerProfileSchema } } },
    async (request, reply) => {
      limit(`auth:register:${request.ip}`, 10, 60 * 60 * 1000);
      reply.status(201);
      return registerCustomer(request.body, request, reply);
    }
  );

  app.post<{ Body: CustomerLoginInput }>(
    '/auth/login',
    { schema: { body: customerLoginSchema, response: { 200: customerProfileSchema } } },
    async (request, reply) => {
      limit(`auth:login:${request.ip}`, 15, 15 * 60 * 1000);
      return loginCustomer(request.body, request, reply);
    }
  );

  app.post(
    '/auth/logout',
    { schema: { body: { type: 'object', additionalProperties: false, maxProperties: 0 } } },
    async (request, reply) => {
      await logoutCustomer(request, reply);
      return { ok: true };
    }
  );

  app.get('/auth/me', { schema: { response: { 200: customerProfileSchema } } }, async request =>
    customerSession(request)
  );

  app.patch<{ Body: CustomerProfilePatchInput }>(
    '/auth/profile',
    { schema: { body: customerProfilePatchSchema, response: { 200: customerProfileSchema } } },
    async request => {
      const customer = await customerSession(request);
      return updateCustomerProfile(customer.customer_id, request.body);
    }
  );

  app.post<{ Body: PasswordChangeInput }>(
    '/auth/change-password',
    { schema: { body: passwordChangeSchema } },
    async request => {
      const customer = await customerSession(request);
      await changeCustomerPassword(customer.customer_id, request.body, request);
      return { ok: true };
    }
  );
}
