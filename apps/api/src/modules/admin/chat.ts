import { randomUUID } from 'node:crypto';
import type { AdminChatSession, ChatWidget, VariantSummary } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { getVariant } from '../catalog/service.js';
import { history } from '../chat/repository.js';

export async function adminChatSessions(
  needsHuman: boolean | undefined,
  limit: number,
  cursor?: string,
  mode?: 'WAITING' | 'AGENT' | 'AI',
  q?: string
): Promise<{
  items: AdminChatSession[];
  next_cursor: string | null;
  counts_by_mode: { waiting: number; agent: number; ai: number };
}> {
  const b = decodeKeysetCursor(cursor);

  const countsRes = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE control_mode = 'AI' AND needs_human = true)::int AS waiting,
      COUNT(*) FILTER (WHERE control_mode = 'AGENT')::int AS agent,
      COUNT(*) FILTER (WHERE control_mode = 'AI' AND needs_human = false)::int AS ai
    FROM chat_sessions
  `);
  const cRow = countsRes.rows[0] || {};
  const counts_by_mode = {
    waiting: Number(cRow.waiting) || 0,
    agent: Number(cRow.agent) || 0,
    ai: Number(cRow.ai) || 0
  };

  const args: unknown[] = [];
  const whereClauses: string[] = ['true'];

  if (mode === 'WAITING') {
    whereClauses.push(`cs.needs_human = true AND cs.control_mode = 'AI'`);
  } else if (mode === 'AGENT') {
    whereClauses.push(`cs.control_mode = 'AGENT'`);
  } else if (mode === 'AI') {
    whereClauses.push(`cs.control_mode = 'AI' AND cs.needs_human = false`);
  } else if (needsHuman !== undefined) {
    args.push(needsHuman);
    whereClauses.push(`cs.needs_human = $${args.length}`);
  }

  if (q && q.trim()) {
    args.push(`%${q.trim()}%`);
    const p = `$${args.length}`;
    whereClauses.push(
      `(cs.id::text ILIKE ${p} OR COALESCE(c.full_name, '') ILIKE ${p} OR COALESCE(c.email, '') ILIKE ${p} OR COALESCE(c.phone, '') ILIKE ${p})`
    );
  }

  if (b) {
    args.push(b[0], b[1]);
    whereClauses.push(
      `(cs.updated_at, cs.id) < ($${args.length - 1}::timestamptz, $${args.length}::uuid)`
    );
  }

  args.push(limit + 1);

  const sql = `
    SELECT
      cs.id AS session_id,
      cs.control_mode,
      cs.control_version,
      cs.needs_human,
      cs.human_requested_at,
      cs.assigned_admin_id,
      cs.sales_context,
      cs.created_at,
      cs.updated_at,
      cs.customer_id,
      c.full_name AS customer_name,
      c.email AS customer_email
    FROM chat_sessions cs
    LEFT JOIN customers c ON c.id = cs.customer_id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY cs.updated_at DESC, cs.id DESC
    LIMIT $${args.length}
  `;

  const result = await pool.query(sql, args);
  const rows = result.rows.slice(0, limit);
  const last = rows.at(-1);

  return {
    items: rows.map(row => ({
      session_id: row.session_id as string,
      control_mode: row.control_mode,
      control_version: Number(row.control_version),
      needs_human: Boolean(row.needs_human),
      human_requested_at: row.human_requested_at
        ? new Date(row.human_requested_at).toISOString()
        : null,
      assigned_admin_id: (row.assigned_admin_id as string) || null,
      sales_context: (row.sales_context as Record<string, unknown>) || {},
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
      customer_id: (row.customer_id as string) || null,
      customer_name: (row.customer_name as string) || null,
      customer_email: (row.customer_email as string) || null
    })),
    next_cursor:
      result.rows.length > limit && last
        ? encodeKeysetCursor(last.updated_at, last.session_id)
        : null,
    counts_by_mode
  };
}

export async function adminChatHistory(
  sessionId: string,
  after?: string,
  before?: string,
  limit = 50
) {
  const session = await pool.query(
    `SELECT
       cs.control_mode,
       cs.control_version,
       cs.needs_human,
       cs.human_requested_at,
       cs.assigned_admin_id,
       cs.sales_context,
       cs.customer_id,
       c.full_name,
       c.phone,
       c.email
     FROM chat_sessions cs
     LEFT JOIN customers c ON c.id = cs.customer_id
     WHERE cs.id = $1`,
    [sessionId]
  );
  if (!session.rowCount) throw notFound();
  const row = session.rows[0]!;
  const messages = await history(sessionId, after, before, limit);

  let customer_info: Record<string, unknown> | undefined = undefined;
  if (row.customer_id) {
    customer_info = {
      customer_id: row.customer_id,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email
    };
  }

  return {
    ...messages,
    control_mode: row.control_mode,
    control_version: Number(row.control_version),
    needs_human: Boolean(row.needs_human),
    human_requested_at: row.human_requested_at
      ? new Date(row.human_requested_at).toISOString()
      : null,
    assigned_admin_id: row.assigned_admin_id || null,
    sales_context: row.sales_context || {},
    customer_info,
    server_time: new Date().toISOString()
  };
}

export type AgentWidgetAttachment = {
  variant_id: string;
  widget_type: 'laptop_spec' | 'address_form';
};

async function buildAgentWidgets(attachment?: AgentWidgetAttachment): Promise<ChatWidget[]> {
  if (!attachment) return [];
  const detail = await getVariant(attachment.variant_id);
  if (attachment.widget_type === 'address_form') {
    if (!detail.in_stock) {
      throw conflict(
        'OUT_OF_STOCK',
        'Phiên bản SKU này hiện hết hàng hoặc đang chờ kiểm kho nên chưa thể mở phiếu đặt COD.'
      );
    }
    return [
      {
        widget_id: randomUUID(),
        schema_version: 1,
        widget_type: 'address_form',
        payload: { variant_id: detail.variant_id }
      }
    ];
  }

  const summary: VariantSummary = {
    variant_id: detail.variant_id,
    laptop_id: detail.laptop_id,
    sku: detail.sku,
    brand: detail.brand,
    model_name: detail.model_name,
    cpu: detail.cpu,
    gpu: detail.gpu,
    ram_gb: detail.ram_gb,
    ssd_gb: detail.ssd_gb,
    screen: detail.screen,
    color: detail.color,
    usage_category: detail.usage_category,
    price_vnd: detail.price_vnd,
    in_stock: detail.in_stock,
    availability_status: detail.availability_status,
    image_url: detail.image_url
  };

  return [
    {
      widget_id: randomUUID(),
      schema_version: 1,
      widget_type: 'laptop_spec',
      payload: { variants: [summary] }
    }
  ];
}

export async function sendAgentMessage(
  sessionId: string,
  adminId: string,
  clientId: string,
  message: string,
  attachment?: AgentWidgetAttachment
) {
  const widgets = await buildAgentWidgets(attachment);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const state = await client.query(
      'SELECT control_mode, assigned_admin_id FROM chat_sessions WHERE id=$1 FOR UPDATE',
      [sessionId]
    );
    if (!state.rowCount) throw notFound();
    if (state.rows[0]!.control_mode !== 'AGENT' || state.rows[0]!.assigned_admin_id !== adminId) {
      throw new AppError(403, 'NOT_ASSIGNED', 'Bạn chưa nhận phiên này.');
    }
    const existing = await client.query(
      `SELECT id::text AS id, content, widgets, created_at FROM chat_messages
      WHERE session_id=$1 AND role='AGENT' AND client_message_id=$2`,
      [sessionId, clientId]
    );
    if (existing.rowCount) {
      const row = existing.rows[0]!;
      if (row.content !== message) {
        throw conflict('IDEMPOTENCY_CONFLICT', 'Mã tin nhắn đã dùng với nội dung khác.');
      }
      await client.query('COMMIT');
      return {
        id: row.id as string,
        role: 'AGENT' as const,
        content: row.content as string,
        widgets: Array.isArray(row.widgets) ? (row.widgets as ChatWidget[]) : [],
        created_at: new Date(row.created_at).toISOString()
      };
    }

    const inserted = await client.query(
      `INSERT INTO chat_messages(session_id, role, sender_admin_id, content, widgets, client_message_id)
       VALUES ($1, 'AGENT', $2, $3, $4::jsonb, $5)
       RETURNING id::text AS id, content, widgets, created_at`,
      [sessionId, adminId, message, JSON.stringify(widgets), clientId]
    );

    if (attachment?.variant_id) {
      await client.query(
        `UPDATE chat_sessions
         SET sales_context = jsonb_set(COALESCE(sales_context, '{}'::jsonb), '{selected_variant_id}', to_jsonb($2::text), true),
             updated_at = now()
         WHERE id = $1`,
        [sessionId, attachment.variant_id]
      );
    } else {
      await client.query('UPDATE chat_sessions SET updated_at = now() WHERE id = $1', [sessionId]);
    }

    await client.query('COMMIT');
    const insertedRow = inserted.rows[0]!;
    return {
      id: insertedRow.id as string,
      role: 'AGENT' as const,
      content: insertedRow.content as string,
      widgets: Array.isArray(insertedRow.widgets) ? (insertedRow.widgets as ChatWidget[]) : widgets,
      created_at: new Date(insertedRow.created_at).toISOString()
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
