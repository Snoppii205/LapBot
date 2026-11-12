import type { PoolClient } from 'pg';
import type { ChatMessage, ChatWidget, ChatTurnStatus } from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { AppError, conflict } from '../../lib/errors.js';
import { closeGate } from './control-gate.js';

export type Receipt = {
  id: string;
  session_id: string;
  client_message_id: string;
  request_hash: string;
  generation_version: number | null;
  route_control_mode: 'AI' | 'AGENT';
  route_needs_human: boolean;
  status: ChatTurnStatus;
  started_at: Date;
  finished_at: Date | null;
};
export async function receipt(sessionId: string, clientId: string): Promise<Receipt | null> {
  const result = await pool.query(
    'SELECT * FROM chat_turns WHERE session_id=$1 AND client_message_id=$2',
    [sessionId, clientId]
  );
  return (result.rows[0] as Receipt | undefined) ?? null;
}
export async function createTurn(
  sessionId: string,
  clientId: string,
  hash: string,
  message: string,
  selectedVariantId: string | null,
  autoEscalateWhenAiDisabled = false
): Promise<{ turn: Receipt; reused: boolean }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const state = await client.query(
      'SELECT control_mode, needs_human, control_version FROM chat_sessions WHERE id = $1 FOR UPDATE',
      [sessionId]
    );
    const retry = await client.query(
      'SELECT * FROM chat_turns WHERE session_id = $1 AND client_message_id = $2',
      [sessionId, clientId]
    );
    if (retry.rowCount) {
      await client.query('COMMIT');
      return { turn: retry.rows[0] as Receipt, reused: true };
    }
    let validSelectedVariantId = selectedVariantId;
    let clearStalePinnedVariant = false;
    if (validSelectedVariantId) {
      const selected = await client.query(
        `SELECT v.id FROM laptop_variants v JOIN laptops l ON l.id = v.laptop_id
         WHERE v.id = $1 AND v.is_active = true AND l.is_active = true`,
        [validSelectedVariantId]
      );
      if (!selected.rowCount) {
        validSelectedVariantId = null;
        clearStalePinnedVariant = true;
      }
    }
    const activeSnapshot = closeGate(sessionId);
    if (activeSnapshot) {
      await persistInterrupted(client, sessionId, activeSnapshot);
    }
    await client.query(
      `UPDATE chat_turns SET status = 'INTERRUPTED', finished_at = now()
       WHERE session_id = $1 AND status = 'PROCESSING'`,
      [sessionId]
    );

    let mode = state.rows[0];
    if (!mode) throw new AppError(401, 'SESSION_REQUIRED', 'Phiên khách không tồn tại.');

    let autoEscalated = false;
    if (autoEscalateWhenAiDisabled && mode.control_mode === 'AI' && !mode.needs_human) {
      const escalated = await client.query(
        `UPDATE chat_sessions
         SET needs_human = true,
             human_requested_at = COALESCE(human_requested_at, now()),
             control_version = control_version + 1,
             updated_at = now()
         WHERE id = $1
         RETURNING control_mode, needs_human, control_version`,
        [sessionId]
      );
      mode = escalated.rows[0];
      autoEscalated = true;
    }

    const forwarded = mode.control_mode !== 'AI' || mode.needs_human;
    const status = forwarded ? 'FORWARDED' : 'PROCESSING';
    const inserted = await client.query(
      `INSERT INTO chat_turns(session_id, client_message_id, request_hash, generation_version, route_control_mode, route_needs_human, status, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $7 = 'FORWARDED' THEN now() ELSE NULL END) RETURNING *`,
      [
        sessionId,
        clientId,
        hash,
        forwarded ? null : mode.control_version,
        mode.control_mode,
        mode.needs_human,
        status
      ]
    );
    await client.query(
      `INSERT INTO chat_messages(session_id, turn_id, role, content, client_message_id)
       VALUES ($1, $2, 'USER', $3, $4)`,
      [sessionId, inserted.rows[0].id, message, clientId]
    );
    if (autoEscalated) {
      await client.query(
        `INSERT INTO chat_messages(session_id, role, content)
         VALUES ($1, 'SYSTEM', 'Trợ lý AI hiện đang tạm nghỉ. Yêu cầu của bạn đã được chuyển tới hàng đợi nhân viên tư vấn.')`,
        [sessionId]
      );
    }
    if (validSelectedVariantId) {
      await client.query(
        `UPDATE chat_sessions
         SET sales_context = jsonb_set(COALESCE(sales_context, '{}'::jsonb), '{selected_variant_id}', to_jsonb($2::text), true),
             updated_at = now()
         WHERE id = $1`,
        [sessionId, validSelectedVariantId]
      );
    } else if (clearStalePinnedVariant) {
      await client.query(
        `UPDATE chat_sessions
         SET sales_context = COALESCE(sales_context, '{}'::jsonb) - 'selected_variant_id',
             updated_at = now()
         WHERE id = $1`,
        [sessionId]
      );
    }
    await client.query('COMMIT');
    return { turn: inserted.rows[0] as Receipt, reused: false };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw conflict('TURN_IN_PROGRESS', 'Phiên đang xử lý một tin khác.');
    }
    throw error;
  } finally {
    client.release();
  }
}
export type TurnTelemetry = {
  model_used?: string;
  provider_calls?: number;
  tool_calls_count?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  latency_ms?: number;
  error_code?: string;
};

export async function finalizeTurn(
  sessionId: string,
  turnId: string,
  version: number,
  status: Exclude<ChatTurnStatus, 'PROCESSING' | 'FORWARDED'>,
  text: string,
  widgets: ChatWidget[],
  telemetry?: TurnTelemetry
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const session = await client.query(
      'SELECT control_version FROM chat_sessions WHERE id = $1 FOR UPDATE',
      [sessionId]
    );
    if (session.rows[0]?.control_version !== version) {
      await client.query('ROLLBACK');
      return false;
    }
    const changed = await client.query(
      `UPDATE chat_turns SET
         status = $3,
         finished_at = now(),
         model_used = COALESCE($5, model_used),
         provider_calls = COALESCE($6, provider_calls),
         tool_calls_count = COALESCE($7, tool_calls_count),
         prompt_tokens = COALESCE($8, prompt_tokens),
         completion_tokens = COALESCE($9, completion_tokens),
         latency_ms = COALESCE($10, latency_ms),
         error_code = COALESCE($11, error_code)
       WHERE id = $1 AND session_id = $2 AND status = 'PROCESSING' AND generation_version = $4 RETURNING id`,
      [
        turnId,
        sessionId,
        status,
        version,
        telemetry?.model_used || null,
        telemetry?.provider_calls ?? 0,
        telemetry?.tool_calls_count ?? 0,
        telemetry?.prompt_tokens || null,
        telemetry?.completion_tokens || null,
        telemetry?.latency_ms || null,
        telemetry?.error_code || null
      ]
    );
    if (!changed.rowCount) {
      await client.query('ROLLBACK');
      return false;
    }
    if (text || widgets.length) {
      await client.query(
        `INSERT INTO chat_messages(session_id, turn_id, role, content, widgets)
         VALUES ($1, $2, 'ASSISTANT', $3, $4) ON CONFLICT DO NOTHING`,
        [sessionId, turnId, text, JSON.stringify(widgets)]
      );
    }
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
export async function persistInterrupted(
  client: PoolClient,
  sessionId: string,
  snapshot: { turnId: string; version: number; text: string; widgets: ChatWidget[] } | null
) {
  if (!snapshot) return;
  const changed = await client.query(
    `UPDATE chat_turns SET status='INTERRUPTED',finished_at=now() WHERE id=$1 AND session_id=$2 AND status='PROCESSING' RETURNING id`,
    [snapshot.turnId, sessionId]
  );
  if (changed.rowCount && (snapshot.text || snapshot.widgets.length))
    await client.query(
      `INSERT INTO chat_messages(session_id,turn_id,role,content,widgets)
    VALUES ($1,$2,'ASSISTANT',$3,$4) ON CONFLICT DO NOTHING`,
      [sessionId, snapshot.turnId, snapshot.text, JSON.stringify(snapshot.widgets)]
    );
}
export async function turnSnapshot(
  sessionId: string,
  turnId: string
): Promise<{ text: string; widgets: ChatWidget[] }> {
  const result = await pool.query(
    `SELECT content,widgets FROM chat_messages WHERE session_id=$1 AND turn_id=$2 AND role='ASSISTANT'`,
    [sessionId, turnId]
  );
  return { text: result.rows[0]?.content ?? '', widgets: result.rows[0]?.widgets ?? [] };
}
export async function updateSalesContext(
  sessionId: string,
  patch: Record<string, unknown>
): Promise<void> {
  await pool.query(
    `UPDATE chat_sessions
     SET sales_context = COALESCE(sales_context, '{}'::jsonb) || $2::jsonb, updated_at = now()
     WHERE id = $1`,
    [sessionId, JSON.stringify(patch)]
  );
}

export async function mergeSalesFilter(
  sessionId: string,
  expectedVersion: number,
  nextArgs: Record<string, unknown>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{
      sales_context: Record<string, unknown>;
      control_version: number;
    }>('SELECT sales_context, control_version FROM chat_sessions WHERE id = $1 FOR UPDATE', [
      sessionId
    ]);
    if (!current.rowCount || current.rows[0]?.control_version !== expectedVersion) {
      await client.query('ROLLBACK');
      return;
    }
    const prevCtx = current.rows[0].sales_context ?? {};
    const prevFilter =
      prevCtx.filter && typeof prevCtx.filter === 'object' && !Array.isArray(prevCtx.filter)
        ? { ...(prevCtx.filter as Record<string, unknown>) }
        : {};

    // If new search specifies any price bound, replace previous price bounds cleanly
    if (nextArgs.min_price !== undefined || nextArgs.max_price !== undefined) {
      delete prevFilter.min_price;
      delete prevFilter.max_price;
    }
    for (const [key, val] of Object.entries(nextArgs)) {
      if (val !== undefined) prevFilter[key] = val;
    }

    await client.query(
      `UPDATE chat_sessions
       SET sales_context = COALESCE(sales_context, '{}'::jsonb) || $2::jsonb, updated_at = now()
       WHERE id = $1`,
      [sessionId, JSON.stringify({ filter: prevFilter, last_search_at: new Date().toISOString() })]
    );
    await client.query('COMMIT');
  } catch {
    await client.query('ROLLBACK').catch(() => {});
  } finally {
    client.release();
  }
}

export async function recentMessages(
  sessionId: string
): Promise<{ role: string; content: string }[]> {
  const result = await pool.query(
    `SELECT role,content,widgets FROM chat_messages WHERE session_id=$1 AND role IN ('USER','ASSISTANT')
    ORDER BY id DESC LIMIT 10`,
    [sessionId]
  );
  return result.rows.reverse().map(row => {
    let content = String(row.content || '');
    try {
      if (row.role === 'ASSISTANT' && Array.isArray(row.widgets) && row.widgets.length > 0) {
        const summaries: string[] = [];
        for (const w of row.widgets) {
          if (!w || typeof w !== 'object') continue;
          if (w.widget_type === 'laptop_spec' && Array.isArray(w.payload?.variants)) {
            w.payload.variants.forEach((v: Record<string, unknown> | null, idx: number) => {
              if (!v || typeof v !== 'object') return;
              const price = Number(v.price_vnd);
              const priceStr = Number.isFinite(price)
                ? `${price.toLocaleString('vi-VN')}đ`
                : 'Liên hệ';
              const brandStr = typeof v.brand === 'string' ? v.brand.trim() : '';
              const modelStr = typeof v.model_name === 'string' ? v.model_name.trim() : '';
              const name =
                brandStr && modelStr && modelStr.toLowerCase().startsWith(brandStr.toLowerCase())
                  ? modelStr
                  : [brandStr, modelStr].filter(Boolean).join(' ') || `Máy #${idx + 1}`;
              summaries.push(
                `Máy #${idx + 1}: ${name} (variant_id="${v.variant_id ?? ''}", CPU: ${v.cpu ?? 'N/A'}, RAM: ${v.ram_gb ?? 'N/A'}GB, SSD: ${v.ssd_gb ?? 'N/A'}GB, Giá: ${priceStr}, Còn hàng: ${v.in_stock ? 'Có' : 'Hết'})`
              );
            });
          } else if (w.widget_type === 'variant_customizer' && Array.isArray(w.payload?.variants)) {
            w.payload.variants.forEach((v: Record<string, unknown> | null, idx: number) => {
              if (!v || typeof v !== 'object') return;
              const price = Number(v.price_vnd);
              const priceStr = Number.isFinite(price)
                ? `${price.toLocaleString('vi-VN')}đ`
                : 'Liên hệ';
              summaries.push(
                `Phiên bản #${idx + 1}: (variant_id="${v.variant_id ?? ''}", CPU: ${v.cpu ?? 'N/A'}, RAM: ${v.ram_gb ?? 'N/A'}GB, SSD: ${v.ssd_gb ?? 'N/A'}GB, Giá: ${priceStr}, Còn hàng: ${v.in_stock ? 'Có' : 'Hết'})`
              );
            });
          }
        }
        if (summaries.length > 0) {
          content = `${content}\n[Thẻ cấu hình đã hiển thị:\n${summaries.join('\n')}]`.trim();
        }
      }
    } catch {
      // In case of any malformed widget payload in legacy messages, preserve text content without crashing
    }
    return { role: row.role, content };
  });
}
export async function history(
  sessionId: string,
  after?: string,
  before?: string,
  limit = 50
): Promise<{ items: ChatMessage[]; next_cursor: string | null }> {
  const args: unknown[] = [sessionId];
  let filter = '',
    order = 'DESC';
  if (after) {
    args.push(after);
    filter = 'AND id > $2::bigint';
    order = 'ASC';
  }
  if (before) {
    args.push(before);
    filter = 'AND id < $2::bigint';
  }
  args.push(limit + 1);
  const result = await pool.query(
    `SELECT id::text AS id,role,content,widgets,created_at FROM chat_messages
    WHERE session_id=$1 ${filter} ORDER BY id ${order} LIMIT $${args.length}`,
    args
  );
  const more = result.rows.length > limit;
  const rows = result.rows.slice(0, limit);
  if (order === 'DESC') rows.reverse();
  return {
    items: rows.map(row => ({ ...row, created_at: new Date(row.created_at).toISOString() })),
    next_cursor: more ? ((order === 'DESC' ? rows[0]?.id : rows.at(-1)?.id) ?? null) : null
  };
}
