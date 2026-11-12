import type { FastifyInstance, FastifyReply } from 'fastify';
import { chatMessageSchema, sessionViewSchema } from '@lapbot/contracts';
import { guestSession, toSessionView } from '../auth/guest.js';
import { AppError, conflict } from '../../lib/errors.js';
import { limit } from '../../lib/limiter.js';
import { bigintCursor, positiveInteger } from '../../lib/validate.js';
import { activeCount } from './control-gate.js';
import { requestHuman, resumeAi } from './control.js';
import { createTurn, finalizeTurn, history, receipt, turnSnapshot } from './repository.js';
import { requestHash, runAiTurn } from './service.js';
import { getAiRuntimeSettings } from '../admin/ai.js';

let pendingAi = 0;
const uuidSchema = { type: 'string', format: 'uuid' } as const;
const versionBody = {
  type: 'object',
  additionalProperties: false,
  required: ['expected_control_version'],
  properties: { expected_control_version: { type: 'integer', minimum: 1 } }
} as const;
const messageBody = {
  type: 'object',
  additionalProperties: false,
  required: ['client_message_id', 'message'],
  properties: {
    client_message_id: uuidSchema,
    message: { type: 'string', minLength: 1, maxLength: 3000 },
    selected_variant_id: uuidSchema
  }
} as const;
function openSse(reply: FastifyReply) {
  reply.hijack();
  reply.raw.on('error', () => {});
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
    Connection: 'keep-alive'
  });
  const heartbeat = setInterval(() => {
    if (!reply.raw.writableEnded && !reply.raw.destroyed) {
      reply.raw.write(': keep-alive\n\n', () => {});
    }
  }, 12000);
  reply.raw.once('close', () => clearInterval(heartbeat));
  return (event: string, data: Record<string, unknown>) => {
    if (!reply.raw.writableEnded && !reply.raw.destroyed) {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`, () => {});
    }
  };
}
export async function chatRoutes(app: FastifyInstance) {
  app.get(
    '/chat/messages',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: [
              'items',
              'next_cursor',
              'control_mode',
              'control_version',
              'needs_human',
              'human_requested_at',
              'server_time'
            ],
            properties: {
              items: { type: 'array', items: chatMessageSchema },
              next_cursor: { type: ['string', 'null'] },
              control_mode: { type: 'string' },
              control_version: { type: 'integer' },
              needs_human: { type: 'boolean' },
              human_requested_at: { type: ['string', 'null'] },
              sales_context: { type: 'object', additionalProperties: true },
              server_time: { type: 'string' }
            }
          }
        }
      }
    },
    async request => {
      const guest = await guestSession(request),
        query = request.query as Record<string, unknown>;
      if (Object.keys(query).some(key => !['after_id', 'before_id', 'limit'].includes(key)))
        throw new AppError(400, 'INVALID_QUERY', 'Query không hợp lệ.');
      if (query.after_id !== undefined && query.before_id !== undefined)
        throw new AppError(400, 'INVALID_CURSOR', 'Chỉ dùng một cursor.');
      const after = query.after_id,
        before = query.before_id;
      for (const value of [after, before])
        if (value !== undefined && !bigintCursor(value))
          throw new AppError(400, 'INVALID_CURSOR', 'Cursor không hợp lệ.');
      const count = query.limit === undefined ? 50 : positiveInteger(query.limit, 'limit', 50);
      if (count < 1) throw new AppError(400, 'INVALID_QUERY', 'limit phải ít nhất 1.');
      const data = await history(
        guest.id,
        after as string | undefined,
        before as string | undefined,
        count
      );
      const latest = await guestSession(request);
      return {
        ...data,
        control_mode: latest.control_mode,
        control_version: latest.control_version,
        needs_human: latest.needs_human,
        human_requested_at: latest.human_requested_at?.toISOString() ?? null,
        sales_context: latest.sales_context,
        server_time: new Date().toISOString()
      };
    }
  );
  app.post<{ Body: { client_message_id: string; message: string; selected_variant_id?: string } }>(
    '/chat/message-stream',
    { schema: { body: messageBody } },
    async (request, reply) => {
      const guest = await guestSession(request);
      const message = request.body.message.trim();
      if (!message) throw new AppError(400, 'INVALID_MESSAGE', 'Tin nhắn trống.');
      const selected = request.body.selected_variant_id ?? null;
      const hash = requestHash(message, selected);
      const old = await receipt(guest.id, request.body.client_message_id);
      if (old) {
        if (old.request_hash !== hash)
          throw conflict('IDEMPOTENCY_CONFLICT', 'Mã tin nhắn đã dùng với nội dung khác.');
        if (old.status === 'PROCESSING')
          throw conflict('TURN_IN_PROGRESS', 'Tin nhắn đang được xử lý.');
        if (old.status === 'FORWARDED') {
          reply.status(202);
          return {
            turn_id: old.id,
            status: 'FORWARDED',
            control_mode: old.route_control_mode,
            needs_human: old.route_needs_human
          };
        }
        const snapshot = await turnSnapshot(guest.id, old.id);
        const send = openSse(reply);
        send('start', { turn_id: old.id });
        if (snapshot.text) send('text_delta', { turn_id: old.id, text: snapshot.text });
        for (const widget of snapshot.widgets) send('widget', { turn_id: old.id, ...widget });
        send('done', { turn_id: old.id, status: old.status });
        reply.raw.end();
        return;
      }
      const runtimeAi = await getAiRuntimeSettings();
      const aiEnabled = runtimeAi.ai_enabled_effective;
      const forwarding = guest.control_mode === 'AGENT' || guest.needs_human || !aiEnabled;
      limit(`chat:s:${guest.id}`, 10, 60000);
      limit(`chat:ip:${request.ip}`, 30, 60000);
      if (!forwarding && activeCount() + pendingAi >= 10)
        throw new AppError(503, 'AI_BUSY', 'Trợ lý AI đang bận.');
      if (!forwarding) pendingAi++;
      let result: Awaited<ReturnType<typeof createTurn>>;
      try {
        result = await createTurn(
          guest.id,
          request.body.client_message_id,
          hash,
          message,
          selected,
          !aiEnabled
        );
      } finally {
        if (!forwarding) pendingAi--;
      }
      if (result.turn.request_hash !== hash)
        throw conflict('IDEMPOTENCY_CONFLICT', 'Mã tin nhắn đã dùng với nội dung khác.');
      if (result.turn.status === 'FORWARDED') {
        reply.status(202);
        return {
          turn_id: result.turn.id,
          status: 'FORWARDED',
          control_mode: result.turn.route_control_mode,
          needs_human: result.turn.route_needs_human
        };
      }
      if (result.reused) throw conflict('TURN_IN_PROGRESS', 'Tin nhắn đang được xử lý.');
      const freshAi = await getAiRuntimeSettings();
      if (!freshAi.ai_enabled_effective || activeCount() >= 10) {
        await finalizeTurn(
          guest.id,
          result.turn.id,
          result.turn.generation_version!,
          'FAILED',
          '',
          []
        );
        throw new AppError(
          503,
          !freshAi.ai_enabled_effective ? 'AI_DISABLED' : 'AI_BUSY',
          'Tư vấn AI tạm thời không khả dụng.'
        );
      }
      const send = openSse(reply);
      send('start', { turn_id: result.turn.id });
      const connection = new AbortController();
      reply.raw.on('close', () => {
        if (!reply.raw.writableEnded) connection.abort();
      });
      await runAiTurn(guest.id, result.turn, send, connection.signal);
      if (!reply.raw.writableEnded) reply.raw.end();
    }
  );
  app.post<{ Body: { expected_control_version: number } }>(
    '/chat/request-human',
    { schema: { body: versionBody, response: { 200: sessionViewSchema } } },
    async request => {
      const guest = await guestSession(request);
      return toSessionView(await requestHuman(guest.id, request.body.expected_control_version));
    }
  );
  app.post<{ Body: { expected_control_version: number } }>(
    '/chat/resume-ai',
    { schema: { body: versionBody, response: { 200: sessionViewSchema } } },
    async request => {
      const guest = await guestSession(request);
      return toSessionView(await resumeAi(guest.id, request.body.expected_control_version));
    }
  );
}
