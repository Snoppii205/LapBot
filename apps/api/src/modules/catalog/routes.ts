import type { FastifyInstance } from 'fastify';
import { catalogPageSchema, variantDetailSchema, storeInfoSchema } from '@lapbot/contracts';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { notFound } from '../../lib/errors.js';
import { config } from '../../config.js';
import { uuid } from '../../lib/validate.js';
import { getVariant, listVariants, parseCatalogQuery } from './service.js';
import { getStoreSettings } from '../admin/settings.js';
import { getAiRuntimeSettings } from '../admin/ai.js';

export async function catalogRoutes(app: FastifyInstance) {
  app.get<{ Params: { part: string; filename: string } }>(
    '/catalog/images/:part/:filename',
    async (request, reply) => {
      const { part, filename } = request.params;
      if (
        !/^[1-9]\d*$/.test(part) ||
        !/^[a-z0-9][a-z0-9._-]*\.(?:jpg|jpeg|png|webp)$/i.test(filename) ||
        filename.includes('..')
      )
        throw notFound();
      const source = fileURLToPath(
        new URL(
          `../../../../../data/vz-catalog/vzstore-laptops-part${part}/images/${filename}`,
          import.meta.url
        )
      );
      let image: Buffer;
      try {
        image = await readFile(source);
      } catch {
        throw notFound();
      }
      const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
      reply.header('Cache-Control', 'public, max-age=86400');
      reply.type(extension === 'jpg' ? 'image/jpeg' : `image/${extension}`);
      return reply.send(image);
    }
  );

  app.get<{ Params: { filename: string } }>(
    '/catalog/uploads/:filename',
    async (request, reply) => {
      const { filename } = request.params;
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i.test(
          filename
        ) ||
        filename.includes('..')
      ) {
        throw notFound();
      }
      const source = fileURLToPath(
        new URL(`../../../../../data/uploads/${filename}`, import.meta.url)
      );
      let image: Buffer;
      try {
        image = await readFile(source);
      } catch {
        throw notFound();
      }
      const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
      reply.header('Cache-Control', 'public, max-age=86400, immutable');
      reply.type(extension === 'jpg' ? 'image/jpeg' : `image/${extension}`);
      return reply.send(image);
    }
  );

  app.get(
    '/catalog/variants',
    { schema: { response: { 200: catalogPageSchema } } },
    async request => listVariants(parseCatalogQuery(request.query as Record<string, unknown>))
  );

  app.get<{ Params: { variant_id: string } }>(
    '/catalog/variants/:variant_id',
    { schema: { response: { 200: variantDetailSchema } } },
    async request => {
      if (!uuid(request.params.variant_id)) throw notFound();
      return getVariant(request.params.variant_id);
    }
  );

  app.get('/store-info', { schema: { response: { 200: storeInfoSchema } } }, async () => {
    const settings = await getStoreSettings();
    const aiConfig = await getAiRuntimeSettings().catch(() => null);
    const aiEnabled = aiConfig
      ? aiConfig.ai_enabled_effective
      : Boolean(config.aiEnabled && config.llmBaseUrl && config.llmApiKey);

    return {
      store_name: settings.store_name,
      price_tax_note: settings.price_tax_note,
      shipping_scope: settings.shipping_scope,
      warranty_policy: settings.warranty_policy,
      return_policy: settings.return_policy,
      support_hours: settings.support_hours,
      contact_channels: settings.contact_channels,
      policy_links: settings.policy_links,
      shipping_fee_vnd: settings.shipping_fee_vnd,
      capabilities: {
        ai_enabled: aiEnabled,
        payment_methods: ['COD'] as ['COD']
      },
      ai_welcome_message: aiConfig?.welcome_message ?? null,
      ai_suggested_prompts: aiConfig?.suggested_prompts ?? null,
      human_wait_timeout_sec: aiConfig?.human_wait_timeout_sec ?? null
    };
  });
}
