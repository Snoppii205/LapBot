import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { catalogRoutes } from './modules/catalog/routes.js';
import { guestRoutes as authRoutes } from './modules/auth/routes.js';
import { orderRoutes } from './modules/orders/routes.js';
import { chatRoutes } from './modules/chat/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { registerOpenApiDocs } from './modules/docs/openapi.js';
import { AppError } from './lib/errors.js';

const STATIC_MIME_TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const ROOT_STATIC_FILE_RE =
  /^\/[a-zA-Z0-9._-]+\.(?:png|ico|svg|jpg|jpeg|webp|txt|webmanifest|json)$/;

export function createApp() {
  const app = Fastify({
    genReqId: () => randomUUID(),
    trustProxy: config.trustProxy,
    logger: {
      level: config.logLevel,
      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers.set-cookie']
    },
    bodyLimit: 16 * 1024,
    ajv: {
      customOptions: {
        removeAdditional: false,
        coerceTypes: false,
        allErrors: false
      }
    }
  });

  app.addHook('onRequest', async request => {
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      const origin = request.headers.origin;
      if (origin !== config.publicOrigin) {
        throw new AppError(403, 'INVALID_ORIGIN', 'Origin không được phép.');
      }
      const contentLength = request.headers['content-length'];
      const hasBody =
        request.method !== 'DELETE' || (contentLength !== undefined && contentLength !== '0');
      if (
        hasBody &&
        !request.headers['content-type']?.toLowerCase().startsWith('application/json')
      ) {
        throw new AppError(400, 'INVALID_CONTENT_TYPE', 'Yêu cầu JSON.');
      }
    }
  });

  app.setErrorHandler((error, request, reply) => {
    const known = error instanceof AppError ? error : null;
    const validation = typeof error === 'object' && error !== null && 'validation' in error;
    const status = known ? known.statusCode : validation ? 400 : 500;
    const code = known ? known.code : status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    const message = known
      ? known.message
      : status === 400
        ? 'Dữ liệu không hợp lệ.'
        : 'Máy chủ gặp lỗi.';

    if (status >= 500) {
      request.log.error({ err: error }, 'request failed');
    }

    reply.status(status).send({
      error: {
        code,
        message,
        ...(known?.fieldErrors ? { field_errors: known.fieldErrors } : {})
      },
      request_id: request.id
    });
  });

  app.addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  });

  registerOpenApiDocs(app);

  app.get('/api/v1/health', async () => ({ status: 'ok' }));
  app.get('/api/v1/health/ready', async (_request, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ready' };
    } catch {
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
  app.register(catalogRoutes, { prefix: '/api/v1' });
  app.register(authRoutes, { prefix: '/api/v1' });
  app.register(orderRoutes, { prefix: '/api/v1' });
  app.register(chatRoutes, { prefix: '/api/v1' });
  app.register(adminRoutes, { prefix: '/api/v1' });

  if (config.nodeEnv === 'production') {
    const webRoot = new URL('../../web/dist/', import.meta.url);

    app.get('/*', async (request, reply) => {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy.' },
          request_id: request.id
        });
      }

      const isHashedAsset = pathname.startsWith('/assets/');
      const isRootStatic = !isHashedAsset && ROOT_STATIC_FILE_RE.test(pathname);
      if (
        pathname.includes('..') ||
        (isHashedAsset && !/^\/assets\/[a-zA-Z0-9._/-]+$/.test(pathname))
      ) {
        return reply.status(404).send('Not found');
      }

      const serveStaticFile = isHashedAsset || isRootStatic;
      const filePath = fileURLToPath(
        new URL(serveStaticFile ? `.${pathname}` : 'index.html', webRoot)
      );
      try {
        const data = await readFile(filePath);
        const extension = serveStaticFile
          ? pathname.slice(pathname.lastIndexOf('.')).toLowerCase()
          : '.html';
        reply.header('Content-Type', STATIC_MIME_TYPES[extension] ?? 'text/html; charset=utf-8');
        reply.header(
          'Cache-Control',
          isHashedAsset
            ? 'public, max-age=31536000, immutable'
            : isRootStatic
              ? 'public, max-age=86400'
              : 'no-cache'
        );
        return reply.send(data);
      } catch {
        return reply.status(404).send('Not found');
      }
    });
  }

  return app;
}
