import { randomUUID } from 'node:crypto';
import type {
  AdminChatBulkCleanResult,
  AdminChatCleanScope,
  AdminChatDeleteResult,
  AdminChatSession,
  ChatWidget,
  VariantSummary
} from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { getVariant } from '../catalog/service.js';
import { closeGate } from '../chat/control-gate.js';
import { history } from '../chat/repository.js';

const NOT_CLEANED_EMPTY_SQL = `NOT (
  COALESCE(cs.sales_context->>'_admin_cleaned', 'false') = 'true'
  AND NOT EXISTS (SELECT 1 FROM chat_messages cm WHERE cm.session_id = cs.id)
)`;

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
      COUNT(*) FILTER (WHERE cs.control_mode = 'AI' AND cs.needs_human = true)::int AS waiting,
      COUNT(*) FILTER (WHERE cs.control_mode = 'AGENT')::int AS agent,
      COUNT(*) FILTER (WHERE cs.control_mode = 'AI' AND cs.needs_human = false)::int AS ai
    FROM chat_sessions cs
    WHERE ${NOT_CLEANED_EMPTY_SQL}
  `);
  const cRow = countsRes.rows[0] || {};
  const counts_by_mode = {
    waiting: Number(cRow.waiting) || 0,
    agent: Number(cRow.agent) || 0,
    ai: Number(cRow.ai) || 0
  };

  const args: unknown[] = [];
  const whereClauses: string[] = [NOT_CLEANED_EMPTY_SQL];

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
      c.email AS customer_email,
      (SELECT COUNT(*)::int FROM chat_messages cm WHERE cm.session_id = cs.id) AS message_count
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
      customer_email: (row.customer_email as string) || null,
      message_count: Number(row.message_count) || 0
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

export async function cleanAdminChatSession(
  sessionId: string,
  adminId: string
): Promise<AdminChatDeleteResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sessionRes = await client.query(
      'SELECT id, control_mode, assigned_admin_id FROM chat_sessions WHERE id = $1 FOR UPDATE',
      [sessionId]
    );
    if (!sessionRes.rowCount) throw notFound('Không tìm thấy phiên hội thoại.');
    const sessionRow = sessionRes.rows[0]!;

    if (
      sessionRow.control_mode === 'AGENT' &&
      sessionRow.assigned_admin_id &&
      sessionRow.assigned_admin_id !== adminId
    ) {
      throw conflict(
        'SESSION_CLAIMED_BY_OTHER',
        'Phiên này đang được nhân viên khác tiếp nhận. Hãy trả phiên về AI trước khi xóa.'
      );
    }

    closeGate(sessionId);

    const cancelledQuotes = await client.query(
      `UPDATE orders
       SET status = 'CANCELLED_EXPIRED',
           cancelled_at = now(),
           updated_at = now()
       WHERE session_id = $1 AND status = 'PENDING_CONFIRMATION'
       RETURNING id`,
      [sessionId]
    );
    const cancelled_quotes_count = cancelledQuotes.rowCount ?? 0;

    const deletedMessages = await client.query('DELETE FROM chat_messages WHERE session_id = $1', [
      sessionId
    ]);
    const deleted_messages_count = deletedMessages.rowCount ?? 0;
    await client.query('DELETE FROM chat_turns WHERE session_id = $1', [sessionId]);

    const orderRefRes = await client.query(
      'SELECT COUNT(*)::int AS cnt FROM orders WHERE session_id = $1',
      [sessionId]
    );
    const hasOrders = Number(orderRefRes.rows[0]?.cnt ?? 0) > 0;

    let mode: 'deleted' | 'cleared' = 'deleted';
    if (!hasOrders) {
      await client.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);
      mode = 'deleted';
    } else {
      await client.query(
        `UPDATE chat_sessions
         SET control_mode = 'AI',
             control_version = control_version + 1,
             needs_human = false,
             human_requested_at = NULL,
             assigned_admin_id = NULL,
             sales_context = '{"_admin_cleaned": true}'::jsonb,
             updated_at = now()
         WHERE id = $1`,
        [sessionId]
      );
      mode = 'cleared';
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'CHAT_SESSION_CLEAN', 'CHAT_SESSION', $2, $3::jsonb)`,
      [
        adminId,
        sessionId,
        JSON.stringify({
          mode,
          deleted_messages_count,
          cancelled_quotes_count
        })
      ]
    );

    await client.query('COMMIT');
    return {
      session_id: sessionId,
      mode,
      deleted_messages_count,
      cancelled_quotes_count,
      message:
        mode === 'deleted'
          ? `Đã xóa hoàn toàn phiên #${sessionId.slice(0, 8)} (${deleted_messages_count} tin nhắn).`
          : `Đã làm sạch lịch sử phiên #${sessionId.slice(0, 8)} (${deleted_messages_count} tin nhắn) và giữ liên kết đơn hàng.`
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function bulkCleanAdminChatSessions(
  scope: AdminChatCleanScope,
  adminId: string
): Promise<AdminChatBulkCleanResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let scopeFilterSql = '';
    if (scope === 'empty_or_expired') {
      scopeFilterSql = `
        cs.control_mode = 'AI'
        AND cs.needs_human = false
        AND (
          NOT EXISTS (SELECT 1 FROM chat_messages cm WHERE cm.session_id = cs.id)
          OR cs.expires_at < now()
        )
      `;
    } else if (scope === 'inactive_ai_24h') {
      scopeFilterSql = `
        cs.control_mode = 'AI'
        AND cs.needs_human = false
        AND cs.updated_at < now() - interval '24 hours'
      `;
    } else {
      scopeFilterSql = `
        cs.control_mode = 'AI'
        AND cs.needs_human = false
      `;
    }

    const targetRes = await client.query<{ id: string }>(
      `SELECT cs.id
       FROM chat_sessions cs
       WHERE (${scopeFilterSql})
         AND ${NOT_CLEANED_EMPTY_SQL}
       FOR UPDATE SKIP LOCKED`
    );

    const targetIds = targetRes.rows.map(r => r.id);
    for (const id of targetIds) {
      closeGate(id);
    }

    let cancelled_quotes_count = 0;
    let deleted_messages_count = 0;
    let deleted_sessions_count = 0;
    let cleared_sessions_count = 0;

    if (targetIds.length > 0) {
      const cancelledQuotes = await client.query(
        `UPDATE orders
         SET status = 'CANCELLED_EXPIRED',
             cancelled_at = now(),
             updated_at = now()
         WHERE session_id = ANY($1::uuid[]) AND status = 'PENDING_CONFIRMATION'`,
        [targetIds]
      );
      cancelled_quotes_count = cancelledQuotes.rowCount ?? 0;

      const deletedMsgs = await client.query(
        'DELETE FROM chat_messages WHERE session_id = ANY($1::uuid[])',
        [targetIds]
      );
      deleted_messages_count = deletedMsgs.rowCount ?? 0;

      await client.query('DELETE FROM chat_turns WHERE session_id = ANY($1::uuid[])', [targetIds]);

      const hardDeleted = await client.query(
        `DELETE FROM chat_sessions cs
         WHERE cs.id = ANY($1::uuid[])
           AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.session_id = cs.id)
         RETURNING cs.id`,
        [targetIds]
      );
      deleted_sessions_count = hardDeleted.rowCount ?? 0;

      const hardDeletedSet = new Set(hardDeleted.rows.map(r => r.id));
      const remainingIds = targetIds.filter(id => !hardDeletedSet.has(id));
      if (remainingIds.length > 0) {
        const clearedRes = await client.query(
          `UPDATE chat_sessions
           SET control_mode = 'AI',
               control_version = control_version + 1,
               needs_human = false,
               human_requested_at = NULL,
               assigned_admin_id = NULL,
               sales_context = '{"_admin_cleaned": true}'::jsonb,
               updated_at = now()
           WHERE id = ANY($1::uuid[])`,
          [remainingIds]
        );
        cleared_sessions_count = clearedRes.rowCount ?? 0;
      }
    }

    const purgedAdminAuth = await client.query(
      'DELETE FROM admin_sessions WHERE expires_at < now()'
    );
    const purgedCustomerAuth = await client.query(
      'DELETE FROM customer_sessions WHERE expires_at < now()'
    );
    const purged_auth_sessions_count =
      (purgedAdminAuth.rowCount ?? 0) + (purgedCustomerAuth.rowCount ?? 0);

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'CHAT_SESSIONS_BULK_CLEAN', 'CHAT_SESSION', NULL, $2::jsonb)`,
      [
        adminId,
        JSON.stringify({
          scope,
          deleted_sessions_count,
          cleared_sessions_count,
          deleted_messages_count,
          cancelled_quotes_count,
          purged_auth_sessions_count
        })
      ]
    );

    await client.query('COMMIT');
    const totalCleaned = deleted_sessions_count + cleared_sessions_count;
    return {
      scope,
      deleted_sessions_count,
      cleared_sessions_count,
      deleted_messages_count,
      cancelled_quotes_count,
      purged_auth_sessions_count,
      message:
        totalCleaned > 0 || purged_auth_sessions_count > 0
          ? `Đã dọn dẹp ${totalCleaned} phiên hội thoại (${deleted_messages_count} tin nhắn) và ${purged_auth_sessions_count} phiên đăng nhập hết hạn.`
          : 'Hệ thống đã gọn sạch — không có phiên dư thừa nào cần dọn dẹp.'
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
