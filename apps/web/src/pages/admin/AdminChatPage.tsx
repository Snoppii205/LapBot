import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type {
  AdminChatSession,
  AdminProfile,
  AdminVariant,
  ChatMessage,
  ChatWidget
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { money } from '../../lib/format.js';
import { ChatMessageContent } from '../../components/chat/ChatMessageContent.js';
import {
  AdminDetailPaneSkeleton,
  AdminSplitListSkeleton,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconExternalLink,
  IconMessageSquare,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconSend,
  IconShoppingBag,
  IconSparkles,
  IconSpinner,
  IconUsers
} from '../../components/icons/RetroIcons.js';

type List = {
  items: AdminChatSession[];
  next_cursor: string | null;
  counts_by_mode?: { waiting: number; agent: number; ai: number };
};

type Detail = {
  items: ChatMessage[];
  next_cursor: string | null;
  control_mode: 'AI' | 'AGENT';
  control_version: number;
  needs_human: boolean;
  human_requested_at: string | null;
  assigned_admin_id: string | null;
  sales_context: Record<string, unknown>;
  customer_info?: {
    customer_id: string;
    full_name: string;
    phone: string | null;
    email: string;
  };
  server_time: string;
};

const quickReplies = [
  'Xin chào anh/chị! Em là nhân viên tư vấn LapBot, em có thể giúp gì cho mình về cấu hình máy ạ?',
  'Dạ mẫu laptop này bên em đang có sẵn hàng tại kho, hỗ trợ ship COD đồng kiểm mở hộp trước khi thanh toán ạ!',
  'Dạ bên em bảo hành 12 tháng chính hãng và 1 đổi 1 trong 30 ngày nếu phát sinh lỗi phần cứng ạ!',
  'Dạ mình có thể điền thông tin nhận hàng vào phiếu đặt COD em vừa gửi để giữ máy ngay trong 15 phút nhé!'
];

function AdminWidgetPreview({ widget }: { widget: ChatWidget }) {
  if (widget.widget_type === 'address_form') {
    return (
      <div
        className="admin-widget-card"
        style={{
          marginTop: '8px',
          padding: '8px 10px',
          background: '#FFF7DF',
          border: '1.5px solid var(--ink-border)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconShoppingBag size={14} />
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            PHIẾU ĐẶT HÀNG COD ĐÃ MỞ
          </strong>
          <span
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px'
            }}
          >
            ({widget.payload.variant_id.slice(0, 8)}...)
          </span>
        </div>
        <Link
          to={`/admin/catalog?kind=variants&q=${encodeURIComponent(widget.payload.variant_id)}`}
          className="retro-btn retro-btn-sm"
        >
          <span>Xem SKU</span>
          <IconExternalLink size={12} />
        </Link>
      </div>
    );
  }
  if (widget.widget_type === 'laptop_spec' || widget.widget_type === 'variant_customizer') {
    return (
      <div
        className="admin-widget-card"
        style={{
          marginTop: '8px',
          padding: '8px 10px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--ink-border)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '12px'
        }}
      >
        <span
          style={{
            alignSelf: 'flex-start',
            padding: '1px 6px',
            borderRadius: '3px',
            background: 'var(--accent-amber)',
            border: '1px solid var(--ink-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 800
          }}
        >
          {widget.widget_type === 'variant_customizer'
            ? 'CÁC PHIÊN BẢN CÙNG DÒNG'
            : 'THẺ GỢI Ý CẤU HÌNH'}
        </span>
        {widget.payload.variants.map(item => (
          <div
            key={item.variant_id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <strong>
                {item.brand} {item.model_name}
              </strong>{' '}
              · {item.cpu} · {item.ram_gb}GB/{item.ssd_gb}GB ·{' '}
              <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {money(item.price_vnd)}
              </strong>{' '}
              <span style={{ color: item.in_stock ? '#27ae60' : '#c0392b', fontWeight: 700 }}>
                ({item.in_stock ? 'Còn hàng' : 'Hết hàng'})
              </span>
            </div>
            <Link
              to={`/admin/catalog?kind=variants&q=${encodeURIComponent(item.sku)}`}
              className="retro-btn retro-btn-sm"
            >
              <span>Kho SKU</span>
            </Link>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AdminChatPage() {
  const [me, setMe] = useState<AdminProfile | null>(null);
  const [mode, setMode] = useState<'all' | 'WAITING' | 'AGENT' | 'AI'>('all');
  const [sessionQ, setSessionQ] = useState('');
  const [appliedSessionQ, setAppliedSessionQ] = useState('');
  const [list, setList] = useState<List | null>(null);
  const [cursor, setCursor] = useState('');
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionKind, setActionKind] = useState<'claim' | 'release' | 'send' | 'widget' | null>(
    null
  );

  // Agent SKU / Checkout Widget Pusher state
  const [showWidgetDrawer, setShowWidgetDrawer] = useState(false);
  const [skuQuery, setSkuQuery] = useState('');
  const [skuResults, setSkuResults] = useState<AdminVariant[]>([]);
  const [skuLoading, setSkuLoading] = useState(false);

  const listBusy = useRef(false);
  const detailBusy = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void apiJson<AdminProfile>('/admin/me').then(setMe);
  }, []);

  const loadList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (document.hidden || listBusy.current) return;
      listBusy.current = true;
      if (!opts?.silent) setListLoading(true);
      try {
        const q = new URLSearchParams();
        if (mode !== 'all') q.set('mode', mode);
        if (appliedSessionQ.trim()) q.set('q', appliedSessionQ.trim());
        if (cursor) q.set('cursor', cursor);
        setList(await apiJson<List>(`/admin/chat/sessions?${q}`));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Không tải được danh sách phiên chat.');
      } finally {
        listBusy.current = false;
        if (!opts?.silent) setListLoading(false);
      }
    },
    [mode, appliedSessionQ, cursor]
  );

  const loadDetail = useCallback(async (id: string, opts?: { silent?: boolean }) => {
    if (document.hidden || detailBusy.current) return;
    detailBusy.current = true;
    if (!opts?.silent) setDetailLoading(true);
    try {
      setDetail(await apiJson<Detail>(`/admin/chat/${id}/messages`));
      setLoadedSessionId(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được lịch sử hội thoại.');
    } finally {
      detailBusy.current = false;
      if (!opts?.silent) setDetailLoading(false);
    }
  }, []);

  const searchAgentSkus = useCallback(async (keyword: string) => {
    setSkuLoading(true);
    try {
      const params = new URLSearchParams({ is_active: 'true', limit: '8' });
      if (keyword.trim()) params.set('q', keyword.trim());
      const res = await apiJson<{ items: AdminVariant[] }>(`/admin/catalog/variants?${params}`);
      setSkuResults(res.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tra cứu được danh mục SKU.');
    } finally {
      setSkuLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showWidgetDrawer && skuResults.length === 0) {
      void searchAgentSkus(skuQuery);
    }
  }, [showWidgetDrawer, skuQuery, skuResults.length, searchAgentSkus]);

  useEffect(() => {
    void loadList({ silent: false });
    const timer = setInterval(() => void loadList({ silent: true }), 10000);
    const visible = () => {
      if (!document.hidden) void loadList({ silent: true });
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [loadList]);

  useEffect(() => {
    if (!selected) return;
    void loadDetail(selected, { silent: false });
    const timer = setInterval(() => void loadDetail(selected, { silent: true }), 4000);
    const visible = () => {
      if (!document.hidden) void loadDetail(selected, { silent: true });
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [selected, loadDetail]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 260) {
      el.scrollTop = el.scrollHeight;
    }
  }, [detail?.items]);

  async function control(kind: 'claim' | 'release') {
    if (!selected || !detail) return;
    setBusy(true);
    setActionKind(kind);
    setError('');
    try {
      await apiJson(`/admin/chat/${selected}/${kind}`, {
        method: 'POST',
        body: JSON.stringify({ expected_control_version: detail.control_version })
      });
      await Promise.all([loadDetail(selected, { silent: true }), loadList({ silent: true })]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đổi được quyền điều khiển.');
      await loadDetail(selected, { silent: true });
    } finally {
      setBusy(false);
      setActionKind(null);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selected || !draft.trim()) return;
    const message = draft.trim();
    setBusy(true);
    setActionKind('send');
    setError('');
    try {
      await apiJson(`/admin/chat/${selected}/messages`, {
        method: 'POST',
        body: JSON.stringify({ client_message_id: crypto.randomUUID(), message })
      });
      setDraft('');
      await Promise.all([loadDetail(selected, { silent: true }), loadList({ silent: true })]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không gửi được tin nhắn.');
    } finally {
      setBusy(false);
      setActionKind(null);
    }
  }

  async function pushWidgetToCustomer(
    variant: AdminVariant,
    widgetType: 'laptop_spec' | 'address_form'
  ) {
    if (!selected) return;
    setBusy(true);
    setActionKind('widget');
    setError('');
    const autoText =
      draft.trim() ||
      (widgetType === 'address_form'
        ? `Dạ em vừa mở sẵn phiếu đặt hàng COD cho mẫu ${variant.brand} ${variant.model_name} (${variant.sku}) giá ${money(variant.price_vnd)}. Anh/chị điền thông tin nhận hàng trực tiếp vào biểu mẫu bên dưới để giữ máy 15 phút nhé!`
        : `Dạ em gửi anh/chị thông số chi tiết và giá bán của mẫu ${variant.brand} ${variant.model_name} (${variant.sku}) để mình tham khảo ạ:`);
    try {
      await apiJson(`/admin/chat/${selected}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          client_message_id: crypto.randomUUID(),
          message: autoText,
          attach_variant_id: variant.id,
          widget_type: widgetType
        })
      });
      setDraft('');
      setShowWidgetDrawer(false);
      await Promise.all([loadDetail(selected, { silent: true }), loadList({ silent: true })]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Không đẩy được widget sản phẩm cho khách.'
      );
    } finally {
      setBusy(false);
      setActionKind(null);
    }
  }

  const assignedToMe = Boolean(detail && me && detail.assigned_admin_id === me.admin_id);
  const counts = list?.counts_by_mode;
  const totalSessionsCount = counts ? counts.waiting + counts.agent + counts.ai : undefined;

  const salesCtx = detail?.sales_context ?? {};
  const ctxSelectedVariantId =
    typeof salesCtx.selected_variant_id === 'string' ? salesCtx.selected_variant_id : null;
  const ctxBrand = typeof salesCtx.brand === 'string' ? salesCtx.brand : null;
  const ctxUsage = typeof salesCtx.usage_category === 'string' ? salesCtx.usage_category : null;
  const ctxBudgetMax =
    typeof salesCtx.budget_max_vnd === 'number'
      ? salesCtx.budget_max_vnd
      : typeof salesCtx.max_price_vnd === 'number'
        ? salesCtx.max_price_vnd
        : null;

  return (
    <section className="admin-section" style={{ gap: '20px' }}>
      {/* Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <IconMessageSquare size={22} />
            <span>TỔNG ĐÀI CSKH & TƯ VẤN TRỰC TIẾP (HUMAN-IN-THE-LOOP)</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Tiếp quản các phiên khách hàng cần nhân viên hỗ trợ, tư vấn cấu hình và đẩy thẻ SKU /
            phiếu COD trực tiếp vào khung chat.
          </p>
        </div>

        <button
          type="button"
          disabled={listLoading}
          onClick={() => {
            void loadList({ silent: false });
            if (selected) void loadDetail(selected, { silent: false });
          }}
          className={`retro-btn ${listLoading ? 'is-busy' : ''}`.trim()}
        >
          <IconRefresh size={14} className={listLoading ? 'retro-spin' : undefined} />
          <span>{listLoading && list ? 'ĐANG LÀM MỚI...' : 'LÀM MỚI DANH SÁCH'}</span>
        </button>
      </div>

      {/* Mode Filter Tabs + Session Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '2px solid var(--ink-border)',
          paddingBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { key: 'all', label: 'TẤT CẢ PHIÊN', count: totalSessionsCount },
            {
              key: 'WAITING',
              label: 'CẦN HỖ TRỢ (WAITING)',
              count: counts?.waiting,
              isAlert: true
            },
            { key: 'AGENT', label: 'NHÂN SỰ ĐANG TRỰC', count: counts?.agent },
            { key: 'AI', label: 'AI TỰ ĐỘNG', count: counts?.ai }
          ].map(tab => (
            <button
              type="button"
              key={tab.key}
              onClick={() => {
                setMode(tab.key as 'all' | 'WAITING' | 'AGENT' | 'AI');
                setCursor('');
                setCursorStack([]);
              }}
              className={`retro-btn ${mode === tab.key ? 'retro-btn-amber' : ''}`}
              style={{ fontSize: '12px' }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: tab.isAlert && tab.count > 0 ? '#c0392b' : 'rgba(28, 26, 23, 0.12)',
                    color: tab.isAlert && tab.count > 0 ? '#fff' : 'inherit'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            setCursor('');
            setCursorStack([]);
            setAppliedSessionQ(sessionQ);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--ink-border)',
            borderRadius: '4px',
            padding: '4px 10px',
            minWidth: '250px'
          }}
        >
          <IconSearch size={14} />
          <input
            type="text"
            placeholder="Tìm mã phiên, tên, email, SĐT..."
            value={sessionQ}
            onChange={e => setSessionQ(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12px',
              padding: '4px 0'
            }}
          />
          {(sessionQ || appliedSessionQ) && (
            <button
              type="button"
              className="retro-icon-btn"
              aria-label="Xóa tìm kiếm"
              onClick={() => {
                setSessionQ('');
                setAppliedSessionQ('');
                setCursor('');
                setCursorStack([]);
              }}
            >
              <IconClose size={12} />
            </button>
          )}
          <button type="submit" className="retro-btn retro-btn-sm">
            Lọc
          </button>
        </form>
      </div>

      {error && (
        <div
          style={{
            background: '#fdf2f2',
            border: '1px solid #e74c3c',
            color: '#c0392b',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Lỗi: </strong> {error}
        </div>
      )}

      {/* Main 3-Column Responsive Layout */}
      <div className={`admin-chat-layout ${selected ? 'admin-chat-viewing' : ''}`}>
        {/* Left Session List */}
        <div
          className={`admin-list admin-chat-list-pane ${listLoading && list ? 'is-refreshing-pane' : ''}`}
          style={{ maxHeight: '74vh', overflowY: 'auto', position: 'relative' }}
        >
          <RetroTopProgress
            active={listLoading && Boolean(list)}
            label="Đang làm mới danh sách phiên chat"
          />
          {listLoading && !list && <AdminSplitListSkeleton rows={5} />}
          {list?.items.map(session => {
            const isSelected = selected === session.session_id;
            const isWaiting = session.needs_human && session.control_mode === 'AI';
            return (
              <button
                type="button"
                key={session.session_id}
                className={`${isSelected ? 'selected' : ''} ${isWaiting ? 'needs-human' : ''}`}
                onClick={() => setSelected(session.session_id)}
                style={{
                  background: isSelected
                    ? 'var(--accent-amber-light, #fef9e7)'
                    : 'var(--bg-surface)',
                  border: '1.5px solid var(--ink-border)',
                  borderLeft: isWaiting ? '6px solid #e74c3c' : undefined,
                  borderRadius: '4px',
                  boxShadow: isSelected ? '2px 2px 0px var(--ink-border)' : 'none',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <strong
                    style={{
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {session.customer_name
                      ? `${session.customer_name} (${session.session_id.slice(0, 6)})`
                      : session.customer_email
                        ? `${session.customer_email} (${session.session_id.slice(0, 6)})`
                        : `Khách ${session.session_id.slice(0, 8)}`}
                  </strong>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      background: session.control_mode === 'AGENT' ? '#2980b9' : '#8e44ad',
                      color: '#fff',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {session.control_mode}
                  </span>
                </div>

                {isWaiting && (
                  <div
                    style={{
                      color: '#c0392b',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <IconAlertTriangle size={12} />
                    <span>KHÁCH ĐANG CHỜ NHÂN VIÊN</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>{session.customer_email ? 'Thành viên' : 'Khách vãng lai'}</span>
                  <span>
                    {new Date(session.updated_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </button>
            );
          })}

          {list?.items.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                background: 'var(--bg-surface)',
                border: '1.5px dashed var(--ink-border)',
                borderRadius: '4px'
              }}
            >
              Không có phiên chat nào khớp bộ lọc hiện tại.
            </div>
          )}

          {(cursorStack.length > 0 || list?.next_cursor) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                disabled={cursorStack.length === 0}
                onClick={() => {
                  const prev = cursorStack[cursorStack.length - 1] ?? '';
                  setCursorStack(s => s.slice(0, -1));
                  setCursor(prev);
                }}
                className="retro-btn"
                style={{ flex: 1, fontSize: '12px' }}
              >
                <IconChevronLeft size={14} />
                <span>Trước</span>
              </button>
              <button
                type="button"
                disabled={!list?.next_cursor}
                onClick={() => {
                  if (!list?.next_cursor) return;
                  setCursorStack(s => [...s, cursor]);
                  setCursor(list.next_cursor);
                }}
                className="retro-btn"
                style={{ flex: 1, fontSize: '12px' }}
              >
                <span>Tiếp</span>
                <IconChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Middle Transcript Area */}
        <div
          className="admin-detail"
          style={{
            background: 'var(--bg-surface)',
            border: '2px solid var(--ink-border)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-hard-sm)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            height: '74vh',
            minWidth: 0
          }}
        >
          <RetroTopProgress
            active={(detailLoading && selected === loadedSessionId) || busy}
            label="Đang đồng bộ hội thoại..."
          />
          {selected && detailLoading && loadedSessionId !== selected ? (
            <AdminDetailPaneSkeleton variant="chat" />
          ) : selected && detail ? (
            <>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1.5px solid var(--ink-border)',
                  paddingBottom: '10px'
                }}
              >
                <div>
                  <button
                    type="button"
                    className="retro-btn retro-btn-sm"
                    onClick={() => setSelected(null)}
                    style={{ marginBottom: '6px' }}
                  >
                    <IconArrowLeft size={13} />
                    <span>Danh sách phiên</span>
                  </button>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    PHIÊN: <code>{selected}</code>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: detail.control_mode === 'AGENT' ? '#2980b9' : '#8e44ad',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}
                    >
                      CHẾ ĐỘ: {detail.control_mode}
                    </span>
                    {detail.needs_human && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: '#e74c3c',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}
                      >
                        KHÁCH YÊU CẦU NGƯỜI THẬT
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {detail.control_mode === 'AGENT' && assignedToMe && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setShowWidgetDrawer(v => !v)}
                      className={`retro-btn ${showWidgetDrawer ? 'retro-btn-amber' : ''}`}
                      style={{ fontSize: '12px' }}
                    >
                      <IconPackage size={14} />
                      <span>{showWidgetDrawer ? 'ẨN KHO SKU' : 'ĐẨY SKU / PHIẾU COD'}</span>
                    </button>
                  )}

                  {detail.control_mode === 'AI' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void control('claim')}
                      className={`retro-btn retro-btn-primary ${actionKind === 'claim' ? 'is-busy' : ''}`.trim()}
                      style={{ fontSize: '12px' }}
                    >
                      {actionKind === 'claim' && <IconSpinner size={13} />}
                      <span>NHẬN PHIÊN (CLAIM)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void control('release')}
                      className={`retro-btn retro-btn-amber ${actionKind === 'release' ? 'is-busy' : ''}`.trim()}
                      style={{ fontSize: '12px' }}
                    >
                      {actionKind === 'release' && <IconSpinner size={13} />}
                      <span>TRẢ VỀ AI (RELEASE)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Agent Interactive SKU & COD Widget Pusher */}
              {detail.control_mode === 'AGENT' && assignedToMe && showWidgetDrawer && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: '#FFF7DF',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      GỬI THẺ CẤU HÌNH HOẶC MỞ BIỂU MẪU ĐẶT HÀNG COD TRỰC TIẾP CHO KHÁCH:
                    </strong>
                    <button
                      type="button"
                      className="retro-icon-btn"
                      aria-label="Đóng kho SKU"
                      onClick={() => setShowWidgetDrawer(false)}
                    >
                      <IconClose size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Tìm theo tên máy, hãng, CPU hoặc mã SKU (VD: TUF, MacBook, ThinkPad)..."
                      value={skuQuery}
                      onChange={e => setSkuQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void searchAgentSkus(skuQuery);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '12px',
                        background: '#fff'
                      }}
                    />
                    <button
                      type="button"
                      disabled={skuLoading}
                      onClick={() => void searchAgentSkus(skuQuery)}
                      className={`retro-btn retro-btn-sm ${skuLoading ? 'is-busy' : ''}`}
                    >
                      {skuLoading ? <IconSpinner size={13} /> : <IconSearch size={13} />}
                      <span>{skuLoading ? 'Đang tìm...' : 'Tra cứu SKU'}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: '175px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {skuLoading && skuResults.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '4px 0'
                        }}
                        role="status"
                        aria-busy="true"
                      >
                        <RetroSkeleton height={44} radius={4} />
                        <RetroSkeleton height={44} radius={4} />
                      </div>
                    ) : skuResults.length === 0 ? (
                      <div
                        style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0' }}
                      >
                        Không tìm thấy SKU đang mở bán khớp từ khóa.
                      </div>
                    ) : (
                      skuResults.map(v => {
                        const sellable = v.is_active && v.stock > 0 && v.stock_verified;
                        return (
                          <div
                            key={v.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              padding: '6px 10px',
                              background: '#fff',
                              border: '1px solid var(--ink-border)',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                              <div style={{ fontWeight: 700 }}>
                                {v.brand} {v.model_name}{' '}
                                <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  ({v.sku})
                                </code>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {v.cpu} · {v.ram_gb}GB / {v.ssd_gb}GB ·{' '}
                                <strong
                                  style={{
                                    color: 'var(--accent-primary)',
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                >
                                  {money(v.price_vnd)}
                                </strong>{' '}
                                ·{' '}
                                <span
                                  style={{
                                    color: sellable ? '#27ae60' : '#c0392b',
                                    fontWeight: 700
                                  }}
                                >
                                  {sellable
                                    ? `Sẵn kho: ${v.stock}`
                                    : v.stock <= 0
                                      ? 'Hết hàng'
                                      : 'Chờ kiểm kho'}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void pushWidgetToCustomer(v, 'laptop_spec')}
                                className="retro-btn retro-btn-sm"
                              >
                                Đẩy thẻ máy
                              </button>
                              <button
                                type="button"
                                disabled={busy || !sellable}
                                title={
                                  !sellable
                                    ? 'Chỉ mở phiếu COD cho SKU còn hàng đã xác thực kho'
                                    : 'Mở biểu mẫu điền địa chỉ COD ngay trên màn hình khách'
                                }
                                onClick={() => void pushWidgetToCustomer(v, 'address_form')}
                                className="retro-btn retro-btn-primary retro-btn-sm"
                              >
                                <IconShoppingBag size={12} />
                                <span>Mở phiếu COD</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Chat Message Transcript */}
              <div
                ref={transcriptRef}
                className="admin-transcript"
                style={{
                  flex: 1,
                  marginTop: '10px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '12px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '4px'
                }}
              >
                {detail.items.map(m => (
                  <div
                    key={m.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '4px',
                      border:
                        m.role === 'SYSTEM'
                          ? '1px dashed var(--ink-border)'
                          : '1.5px solid var(--ink-border)',
                      background:
                        m.role === 'USER'
                          ? '#FFF7DF'
                          : m.role === 'AGENT'
                            ? '#eaf2f8'
                            : m.role === 'SYSTEM'
                              ? 'var(--bg-surface-warm, #f2ece1)'
                              : '#fff',
                      alignSelf:
                        m.role === 'USER'
                          ? 'flex-end'
                          : m.role === 'SYSTEM'
                            ? 'center'
                            : 'flex-start',
                      maxWidth: m.role === 'SYSTEM' ? '92%' : '85%'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        marginBottom: '4px'
                      }}
                    >
                      <strong
                        style={{
                          color:
                            m.role === 'AGENT'
                              ? '#2980b9'
                              : m.role === 'SYSTEM'
                                ? 'var(--ink-secondary)'
                                : 'var(--ink-primary)'
                        }}
                      >
                        {m.role === 'USER'
                          ? 'KHÁCH HÀNG'
                          : m.role === 'AGENT'
                            ? 'NHÂN VIÊN CSKH'
                            : m.role === 'SYSTEM'
                              ? 'HỆ THỐNG'
                              : 'LAPBOT AI'}
                      </strong>
                      <span>{new Date(m.created_at).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    {m.content &&
                      (m.role === 'USER' || m.role === 'SYSTEM' ? (
                        <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {m.content}
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          <ChatMessageContent content={m.content} />
                        </div>
                      ))}
                    {m.widgets.length > 0 && (
                      <div className="admin-widget-list">
                        {m.widgets.map(w => (
                          <AdminWidgetPreview key={w.widget_id} widget={w} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Reply Template Pills */}
              {detail.control_mode === 'AGENT' && assignedToMe && (
                <div
                  style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0 4px' }}
                >
                  {quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDraft(qr)}
                      className="retro-btn retro-btn-sm"
                      style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
                    >
                      {qr.slice(0, 34)}...
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Form */}
              <form onSubmit={send} style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                <input
                  aria-label="Trả lời khách hàng"
                  disabled={detail.control_mode !== 'AGENT' || !assignedToMe || busy}
                  placeholder={
                    detail.control_mode !== 'AGENT'
                      ? 'Bấm "NHẬN PHIÊN (CLAIM)" để chat trực tiếp với khách...'
                      : !assignedToMe
                        ? 'Phiên này đang do nhân sự khác phụ trách.'
                        : 'Nhập tin nhắn phản hồi cho khách hàng...'
                  }
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="submit"
                  disabled={
                    detail.control_mode !== 'AGENT' || !assignedToMe || !draft.trim() || busy
                  }
                  className={`retro-btn retro-btn-primary ${actionKind === 'send' ? 'is-busy' : ''}`.trim()}
                >
                  {actionKind === 'send' ? <IconSpinner size={14} /> : <IconSend size={14} />}
                  <span>Gửi</span>
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                margin: 'auto',
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <p style={{ margin: 0, fontSize: '14px' }}>
                Chọn một phiên hội thoại từ danh sách bên trái để theo dõi tin nhắn, đẩy cấu hình
                máy và hỗ trợ khách hàng.
              </p>
            </div>
          )}
        </div>

        {/* Right Customer Info & Sales Context Sidebar */}
        <div
          className="admin-chat-context-pane"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {selected && detail ? (
            <>
              {/* Customer Profile Card */}
              <div className="retro-window">
                <div className="retro-window-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <IconUsers size={14} />
                    <span>HỒ SƠ KHÁCH HÀNG</span>
                  </span>
                </div>
                <div
                  style={{
                    padding: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {detail.customer_info ? (
                    <>
                      <div>
                        Họ tên: <strong>{detail.customer_info.full_name}</strong>
                      </div>
                      <div>
                        Email: <strong>{detail.customer_info.email}</strong>
                      </div>
                      <div>
                        Điện thoại: <strong>{detail.customer_info.phone || 'Chưa cập nhật'}</strong>
                      </div>
                      <div
                        style={{
                          color: '#27ae60',
                          fontWeight: 700,
                          fontSize: '11px',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <IconCheck size={12} />
                        <span>THÀNH VIÊN ĐÃ ĐĂNG NHẬP</span>
                      </div>
                      <div
                        style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}
                      >
                        <Link
                          to={`/admin/orders?q=${encodeURIComponent(detail.customer_info.phone || detail.customer_info.full_name)}`}
                          className="retro-btn retro-btn-sm"
                        >
                          <span>Đơn hàng của khách</span>
                          <IconExternalLink size={12} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      Khách vãng lai (Chưa đăng nhập tài khoản thành viên)
                    </div>
                  )}
                </div>
              </div>

              {/* Structured Sales Context Card */}
              <div className="retro-window">
                <div className="retro-window-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <IconSparkles size={14} />
                    <span>NGỮ CẢNH TƯ VẤN (AI CONTEXT)</span>
                  </span>
                </div>
                <div
                  style={{
                    padding: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {ctxSelectedVariantId || ctxBrand || ctxUsage || ctxBudgetMax ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '8px 10px',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--ink-border)',
                        borderRadius: '4px'
                      }}
                    >
                      {ctxSelectedVariantId && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <span>SKU đang ghim:</span>
                          <Link
                            to={`/admin/catalog?kind=variants&q=${encodeURIComponent(ctxSelectedVariantId)}`}
                            className="retro-btn retro-btn-sm"
                          >
                            <code>{ctxSelectedVariantId.slice(0, 8)}...</code>
                            <IconExternalLink size={11} />
                          </Link>
                        </div>
                      )}
                      {ctxBrand && (
                        <div>
                          Hãng quan tâm: <strong>{ctxBrand}</strong>
                        </div>
                      )}
                      {ctxUsage && (
                        <div>
                          Nhu cầu: <strong>{ctxUsage}</strong>
                        </div>
                      )}
                      {ctxBudgetMax !== null && (
                        <div>
                          Ngân sách tối đa:{' '}
                          <strong
                            style={{
                              color: 'var(--accent-primary)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {money(ctxBudgetMax)}
                          </strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      Chưa ghi nhận tiêu chí lọc hoặc SKU ghim trong phiên này.
                    </div>
                  )}

                  <details>
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      XEM DỮ LIỆU JSON GỐC
                    </summary>
                    <pre
                      style={{
                        margin: '6px 0 0',
                        padding: '8px',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}
                    >
                      {JSON.stringify(detail.sales_context, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '20px',
                border: '1.5px dashed var(--ink-border)',
                borderRadius: '4px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '12px',
                background: 'var(--bg-surface)'
              }}
            >
              Thông tin khách và ngữ cảnh sản phẩm sẽ hiển thị tại đây khi chọn phiên chat.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
