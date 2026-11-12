import { createHash, randomBytes } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SessionView } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { config } from '../../config.js';
import { AppError } from '../../lib/errors.js';

export type GuestSession = {
  id: string;
  control_mode: 'AI' | 'AGENT';
  control_version: number;
  needs_human: boolean;
  human_requested_at: Date | null;
  sales_context: Record<string, unknown>;
  expires_at: Date;
  assigned_admin_id: string | null;
  active_preview_id: string | null;
  last_order_id: string | null;
  customer_id?: string | null;
};

const cookieName = 'lapbot_guest';
const customerCookieName = 'lapbot_customer';
const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export function cookieValue(request: FastifyRequest, name: string): string | null {
  const match = request.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return match?.slice(name.length + 1) ?? null;
}

async function resolveActiveCustomerId(request: FastifyRequest): Promise<string | null> {
  const token = cookieValue(request, customerCookieName);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const res = await pool.query<{ customer_id: string }>(
    `SELECT s.customer_id
     FROM customer_sessions s
     JOIN customers c ON c.id = s.customer_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND c.is_active = true`,
    [digest(token)]
  );
  return res.rows[0]?.customer_id ?? null;
}

export async function guestSession(request: FastifyRequest): Promise<GuestSession> {
  const token = cookieValue(request, cookieName);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    throw new AppError(401, 'SESSION_REQUIRED', 'Phiên khách đã hết hạn hoặc không còn.');
  }
  const result = await pool.query(
    `SELECT id, control_mode, control_version, needs_human, human_requested_at, sales_context,
            expires_at, assigned_admin_id, active_preview_id, last_order_id, customer_id
     FROM chat_sessions
     WHERE guest_token_hash = $1 AND expires_at > now()`,
    [digest(token)]
  );
  if (!result.rowCount) {
    throw new AppError(401, 'SESSION_REQUIRED', 'Phiên khách đã hết hạn hoặc không còn.');
  }
  return result.rows[0] as GuestSession;
}

export async function optionalGuestSession(request: FastifyRequest): Promise<GuestSession | null> {
  try {
    return await guestSession(request);
  } catch {
    return null;
  }
}

export async function getOrCreateGuest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<GuestSession> {
  const customerId = await resolveActiveCustomerId(request);
  try {
    const existing = await guestSession(request);
    if (customerId && !existing.customer_id) {
      await pool.query(
        'UPDATE chat_sessions SET customer_id = $1, updated_at = now() WHERE id = $2 AND customer_id IS NULL',
        [customerId, existing.id]
      );
      existing.customer_id = customerId;
    }
    return existing;
  } catch (error) {
    if (!(error instanceof AppError) || error.code !== 'SESSION_REQUIRED') throw error;
  }
  return createNewGuest(reply, customerId);
}

export async function createNewGuest(
  reply: FastifyReply,
  customerId?: string | null
): Promise<GuestSession> {
  const token = randomBytes(32).toString('hex');
  const result = await pool.query(
    `INSERT INTO chat_sessions(guest_token_hash, customer_id, expires_at)
     VALUES ($1, $2, now() + interval '30 days')
     RETURNING id, control_mode, control_version, needs_human, human_requested_at, sales_context,
               expires_at, assigned_admin_id, active_preview_id, last_order_id, customer_id`,
    [digest(token), customerId || null]
  );
  reply.header(
    'Set-Cookie',
    `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
      config.nodeEnv === 'production' ? '; Secure' : ''
    }`
  );
  return result.rows[0] as GuestSession;
}

export function toSessionView(session: GuestSession): SessionView {
  return {
    session_id: session.id,
    control_mode: session.control_mode,
    control_version: session.control_version,
    needs_human: session.needs_human,
    human_requested_at: session.human_requested_at?.toISOString() ?? null,
    sales_context: {
      ...session.sales_context,
      active_preview_id: session.active_preview_id,
      last_order_id: session.last_order_id
    },
    expires_at: session.expires_at.toISOString(),
    server_time: new Date().toISOString()
  };
}
