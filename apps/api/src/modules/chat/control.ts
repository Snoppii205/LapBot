import type { GuestSession } from '../auth/guest.js';
import { pool } from '../../db/pool.js';
import { AppError, conflict } from '../../lib/errors.js';
import { closeGate } from './control-gate.js';
import { finalizeTurn, persistInterrupted } from './repository.js';

async function change(
  sessionId: string,
  expected: number,
  kind: 'request' | 'resume' | 'claim' | 'release',
  adminId?: string
): Promise<GuestSession> {
  let snapshot: ReturnType<typeof closeGate> = null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT * FROM chat_sessions WHERE id=$1 FOR UPDATE', [
      sessionId
    ]);
    if (!current.rowCount) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy phiên.');
    const session = current.rows[0] as GuestSession;
    if (kind === 'request' && session.control_mode === 'AI' && session.needs_human) {
      await client.query('COMMIT');
      return session;
    }
    if (
      kind === 'claim' &&
      session.control_mode === 'AGENT' &&
      session.assigned_admin_id === adminId
    ) {
      await client.query('COMMIT');
      return session;
    }
    if (session.control_version !== expected)
      throw conflict('CONTROL_VERSION_CONFLICT', 'Phiên đã đổi trạng thái.');
    if (
      (kind === 'request' && session.control_mode === 'AI' && !session.needs_human) ||
      (kind === 'claim' && session.control_mode === 'AI')
    )
      snapshot = closeGate(sessionId);
    if (kind === 'request') {
      if (session.control_mode === 'AGENT' || session.needs_human) {
        await client.query('COMMIT');
        return session;
      }
      await persistInterrupted(client, sessionId, snapshot);
      await client.query(
        `UPDATE chat_sessions SET needs_human=true,human_requested_at=now(),control_version=control_version+1,updated_at=now() WHERE id=$1`,
        [sessionId]
      );
      await client.query(
        `INSERT INTO chat_messages(session_id,role,content) VALUES ($1,'SYSTEM','Đã gửi yêu cầu hỗ trợ. Chưa có nhân viên nhận.')`,
        [sessionId]
      );
    } else if (kind === 'resume') {
      if (session.control_mode === 'AI' && !session.needs_human)
        throw conflict('INVALID_STATE', 'Không thể tiếp tục AI lúc này.');
      await client.query(
        `UPDATE chat_sessions SET control_mode='AI',assigned_admin_id=NULL,needs_human=false,human_requested_at=NULL,control_version=control_version+1,updated_at=now() WHERE id=$1`,
        [sessionId]
      );
      await client.query(
        `INSERT INTO chat_messages(session_id,role,content) VALUES ($1,'SYSTEM','Khách đã tiếp tục tư vấn với AI.')`,
        [sessionId]
      );
    } else if (kind === 'claim') {
      if (session.control_mode === 'AGENT') {
        if (session.assigned_admin_id === adminId) {
          await client.query('COMMIT');
          return session;
        }
        throw conflict('ALREADY_CLAIMED', 'Phiên đã có nhân viên khác nhận.');
      }
      await persistInterrupted(client, sessionId, snapshot);
      await client.query(
        `UPDATE chat_sessions SET control_mode='AGENT',assigned_admin_id=$2,needs_human=false,
        human_requested_at=NULL,control_version=control_version+1,updated_at=now() WHERE id=$1`,
        [sessionId, adminId]
      );
      await client.query(
        `INSERT INTO chat_messages(session_id,role,content) VALUES ($1,'SYSTEM','Nhân viên đã nhận phiên tư vấn.')`,
        [sessionId]
      );
      await client.query(
        `INSERT INTO audit_events(actor_type,actor_id,action,entity_type,entity_id) VALUES ('ADMIN',$1,'CHAT_CLAIM','CHAT_SESSION',$2)`,
        [adminId, sessionId]
      );
    } else {
      if (session.control_mode !== 'AGENT' || session.assigned_admin_id !== adminId)
        throw new AppError(403, 'NOT_ASSIGNED', 'Bạn chưa nhận phiên này.');
      await client.query(
        `UPDATE chat_sessions SET control_mode='AI',assigned_admin_id=NULL,needs_human=false,
        human_requested_at=NULL,control_version=control_version+1,updated_at=now() WHERE id=$1`,
        [sessionId]
      );
      await client.query(
        `INSERT INTO chat_messages(session_id,role,content) VALUES ($1,'SYSTEM','Nhân viên đã chuyển phiên về AI.')`,
        [sessionId]
      );
      await client.query(
        `INSERT INTO audit_events(actor_type,actor_id,action,entity_type,entity_id) VALUES ('ADMIN',$1,'CHAT_RELEASE','CHAT_SESSION',$2)`,
        [adminId, sessionId]
      );
    }
    const updated = await client.query('SELECT * FROM chat_sessions WHERE id=$1', [sessionId]);
    await client.query('COMMIT');
    return updated.rows[0] as GuestSession;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (snapshot)
      await finalizeTurn(
        sessionId,
        snapshot.turnId,
        snapshot.version,
        'INTERRUPTED',
        snapshot.text,
        snapshot.widgets
      ).catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
export const requestHuman = (sessionId: string, expected: number) =>
  change(sessionId, expected, 'request');
export const resumeAi = (sessionId: string, expected: number) =>
  change(sessionId, expected, 'resume');
export const claimChat = (sessionId: string, expected: number, adminId: string) =>
  change(sessionId, expected, 'claim', adminId);
export const releaseChat = (sessionId: string, expected: number, adminId: string) =>
  change(sessionId, expected, 'release', adminId);
