import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ChatWidget, VariantDetail, VariantSummary } from '@lapbot/contracts';
import { useChat } from '../../features/chat/ChatContext.js';
import { toCartSnapshot, useCart } from '../../features/cart/CartContext.js';
import { cleanCpuLabel, cleanGpuLabel, formatLaptopTitle, money } from '../../lib/format.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { availabilityLabel, availabilityClass } from '../../lib/availability.js';
import { apiJson } from '../../lib/api-client.js';
import { useAnimatedPresence } from '../../lib/use-animated-presence.js';
import { ChatMessageContent } from './ChatMessageContent.js';
import {
  ChatThinkingBubble,
  KeycapHint,
  ProgressiveImage,
  RetroSkeleton,
  RetroTopProgress
} from '../os/RetroOsPrimitives.js';
import {
  IconCheck,
  IconChevronDown,
  IconClose,
  IconCpu,
  IconExternalLink,
  IconGpu,
  IconHeadset,
  IconMaximize,
  IconMinimize,
  IconPackage,
  IconPlus,
  IconRam,
  IconRefreshCw,
  IconRotateCcw,
  IconSend,
  IconShoppingBag,
  IconShoppingCart,
  IconSparkleAi,
  IconSpinner,
  IconSsd,
  IconStop,
  IconZap
} from '../icons/RetroIcons.js';

const COPILOT_MASCOT_URL = '/assets/retro-os/lapbot-copilot-mascot.jpg';

const USAGE_LABELS: Record<string, string> = {
  office_study: 'Học tập / Văn phòng',
  gaming: 'Gaming',
  graphic_creator: 'Đồ họa / Creator',
  programming: 'Lập trình',
  business_ultrabook: 'Mỏng nhẹ / Doanh nhân'
};

function formatSsd(ssdGb: number): string {
  if (ssdGb >= 1024 && ssdGb % 1024 === 0) {
    return `${ssdGb / 1024}TB`;
  }
  return `${ssdGb}GB`;
}

function shortLaptopLabel(item: VariantSummary): string {
  const full = formatLaptopTitle(item.brand, item.model_name).trim();
  if (full.length <= 22) return full;
  const words = full.split(/\s+/);
  let acc = '';
  for (const w of words) {
    const next = acc ? `${acc} ${w}` : w;
    if (next.length > 22) break;
    acc = next;
  }
  return acc || `${full.slice(0, 20)}…`;
}

function AddressFormTicketCard({
  variantId,
  onBuyNow,
  onSelectVariant,
  onOpenCart
}: {
  variantId: string;
  onBuyNow: (variantId: string) => void;
  onSelectVariant: (variantId: string) => void;
  onOpenCart: () => void;
}) {
  const cart = useCart();
  const [detail, setDetail] = useState<VariantDetail | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  useEffect(() => {
    let active = true;
    setLoadingTicket(true);
    void apiJson<VariantDetail>(`/catalog/variants/${variantId}`)
      .then(res => {
        if (active) setDetail(res);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingTicket(false);
      });
    return () => {
      active = false;
    };
  }, [variantId]);

  const inCart = cart.hasItem(variantId);
  const thumbUrl = detail ? catalogImageUrl(detail.image_url) : null;
  const title = detail ? formatLaptopTitle(detail.brand, detail.model_name) : 'Cấu hình đã chọn';

  return (
    <div className="chat-widget">
      <div className="chat-order-ticket-card">
        <div className="chat-order-ticket-info">
          {loadingTicket && !detail ? (
            <RetroSkeleton width={80} height={60} radius={6} />
          ) : thumbUrl ? (
            <Link
              to={`/products/${variantId}`}
              className="chat-product-thumb"
              onClick={() => onSelectVariant(variantId)}
              tabIndex={-1}
              aria-hidden="true"
            >
              <ProgressiveImage src={thumbUrl} alt={title} width={80} height={60} loading="lazy" />
            </Link>
          ) : (
            <span className="chat-order-ticket-icon">
              <IconShoppingBag size={16} />
            </span>
          )}
          <div style={{ flex: 1 }}>
            {loadingTicket && !detail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <RetroSkeleton variant="text" width="76%" height={15} />
                <RetroSkeleton variant="text" width="90%" height={12} />
              </div>
            ) : (
              <>
                <strong>{title}</strong>
                {detail ? (
                  <p>
                    <strong
                      style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {money(detail.price_vnd)}
                    </strong>{' '}
                    · {cleanCpuLabel(detail.cpu, detail.model_name)} · RAM {detail.ram_gb}GB · SSD{' '}
                    {formatSsd(detail.ssd_gb)}
                  </p>
                ) : (
                  <p>
                    Chuyển sang trang Checkout rộng rãi để hoàn tất địa chỉ & duyệt phiếu 15 phút.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="chat-ticket-actions">
          <button
            type="button"
            className="chat-btn-buy"
            disabled={detail ? !detail.in_stock : false}
            onClick={() => onBuyNow(variantId)}
          >
            <IconZap size={13} />
            <span>{detail && !detail.in_stock ? 'Hết hàng' : 'Mua ngay'}</span>
          </button>

          {(!detail || detail.in_stock) && (
            <button
              type="button"
              className={`chat-btn-cart ${inCart ? 'in-cart' : ''}`}
              onClick={() => {
                if (inCart) {
                  onOpenCart();
                } else {
                  cart.addItem(variantId, {
                    snapshot: detail ? toCartSnapshot(detail) : undefined
                  });
                }
              }}
            >
              {inCart ? <IconCheck size={13} /> : <IconShoppingCart size={13} />}
              <span>{inCart ? 'Mở giỏ' : 'Thêm giỏ'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Widget({
  widget,
  onBuyNow,
  onAddCart,
  hasInCart,
  onOpenCart,
  onSelectVariant,
  onAskVariant
}: {
  widget: ChatWidget;
  onBuyNow: (variantId: string) => void;
  onAddCart: (item: VariantSummary) => void;
  hasInCart: (variantId: string) => boolean;
  onOpenCart: () => void;
  onSelectVariant: (variantId: string) => void;
  onAskVariant: (variantId: string, title: string) => void;
}) {
  if (widget.widget_type === 'address_form') {
    return (
      <AddressFormTicketCard
        variantId={widget.payload.variant_id}
        onBuyNow={onBuyNow}
        onSelectVariant={onSelectVariant}
        onOpenCart={onOpenCart}
      />
    );
  }

  if (widget.widget_type === 'laptop_spec' || widget.widget_type === 'variant_customizer') {
    const isCustomizer = widget.widget_type === 'variant_customizer';
    const variants = widget.payload.variants;
    return (
      <div className="chat-widget">
        <div className="chat-widget-header">
          <span className="chat-widget-tag">
            {isCustomizer ? 'CÁC PHIÊN BẢN CÙNG MODEL' : 'GỢI Ý CẤU HÌNH TỪ KHO LAPBOT'}
          </span>
          <span className="chat-widget-count">{variants.length} cấu hình</span>
        </div>

        <div className={`chat-product-grid ${variants.length >= 2 ? 'has-multiple' : ''}`}>
          {variants.map(item => {
            const thumbUrl = catalogImageUrl(item.image_url);
            const title = formatLaptopTitle(item.brand, item.model_name);
            const availText = availabilityLabel(item.availability_status);
            const inCart = hasInCart(item.variant_id);
            return (
              <article key={item.variant_id} className="chat-product-card">
                <div className="chat-product-top">
                  {thumbUrl ? (
                    <Link
                      to={`/products/${item.variant_id}`}
                      className="chat-product-thumb"
                      onClick={() => onSelectVariant(item.variant_id)}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <ProgressiveImage
                        src={thumbUrl}
                        alt={title}
                        loading="lazy"
                        width={104}
                        height={78}
                      />
                    </Link>
                  ) : null}

                  <div className="chat-product-info">
                    <div className="chat-product-meta-row">
                      <span className="chat-product-sku">{item.sku}</span>
                      {availText ? (
                        <span
                          className={`chat-avail-badge ${availabilityClass(item.availability_status)}`}
                        >
                          {availText}
                        </span>
                      ) : null}
                    </div>
                    <Link
                      to={`/products/${item.variant_id}`}
                      className="chat-product-title-link"
                      onClick={() => onSelectVariant(item.variant_id)}
                    >
                      <strong>{title}</strong>
                    </Link>
                    <p className="chat-product-price">
                      <span className="price-val">{money(item.price_vnd)}</span>
                    </p>
                  </div>
                </div>

                <div className="chat-spec-chips" aria-label="Thông số phần cứng chính">
                  <span
                    className="chat-spec-chip"
                    title={`Vi xử lý: ${cleanCpuLabel(item.cpu, item.model_name)}`}
                  >
                    <IconCpu size={13} />
                    <span>{cleanCpuLabel(item.cpu, item.model_name)}</span>
                  </span>
                  <span className="chat-spec-chip" title={`Đồ họa: ${cleanGpuLabel(item.gpu)}`}>
                    <IconGpu size={13} />
                    <span>{cleanGpuLabel(item.gpu)}</span>
                  </span>
                  <span className="chat-spec-chip">
                    <IconRam size={13} />
                    <span>RAM {item.ram_gb}GB</span>
                  </span>
                  <span className="chat-spec-chip">
                    <IconSsd size={13} />
                    <span>SSD {formatSsd(item.ssd_gb)}</span>
                  </span>
                </div>

                <div className="chat-product-actions">
                  {item.in_stock && (
                    <>
                      <button
                        type="button"
                        className="chat-btn-buy"
                        onClick={() => onBuyNow(item.variant_id)}
                      >
                        <IconZap size={13} />
                        <span>Mua ngay</span>
                      </button>

                      <button
                        type="button"
                        className={`chat-btn-cart ${inCart ? 'in-cart' : ''}`}
                        onClick={() => (inCart ? onOpenCart() : onAddCart(item))}
                      >
                        {inCart ? <IconCheck size={13} /> : <IconShoppingCart size={13} />}
                        <span>{inCart ? 'Đã thêm' : 'Thêm giỏ'}</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="chat-btn-ask"
                    onClick={() => onAskVariant(item.variant_id, title)}
                  >
                    <IconSparkleAi size={13} />
                    <span>Tư vấn</span>
                  </button>
                  <Link
                    to={`/products/${item.variant_id}`}
                    className="chat-btn-view"
                    onClick={() => onSelectVariant(item.variant_id)}
                  >
                    <span>Chi tiết</span>
                    <IconExternalLink size={12} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return <p>Không hiển thị được thẻ tư vấn. Vui lòng tải lại hội thoại.</p>;
}

export function ChatDrawer() {
  const chat = useChat();
  const cart = useCart();
  const navigate = useNavigate();
  const { rendered, closing, stateClass } = useAnimatedPresence(chat.open, 180);
  const [draft, setDraft] = useState('');
  const [pinnedDetail, setPinnedDetail] = useState<VariantDetail | null>(null);
  const [loadingPinned, setLoadingPinned] = useState(false);
  const [controlAction, setControlAction] = useState<'reset' | 'human' | 'resume' | null>(null);
  const [waitExceeded, setWaitExceeded] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const closeButton = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLElement>(null);
  const serverOffsetRef = useRef(0);
  const userScrolledUpRef = useRef(false);
  const lastMsgCountRef = useRef(0);

  const storeInfo = chat.store;

  useEffect(() => {
    if (chat.session?.server_time) {
      const parsed = Date.parse(chat.session.server_time);
      if (Number.isFinite(parsed)) {
        serverOffsetRef.current = parsed - Date.now();
      }
    }
  }, [chat.session?.server_time]);

  useEffect(() => {
    const requestedAt = chat.session?.human_requested_at;
    const isWaitingForHuman = Boolean(
      chat.session?.needs_human && chat.session.control_mode === 'AI' && requestedAt
    );
    if (!isWaitingForHuman || !requestedAt) {
      setWaitExceeded(false);
      return;
    }
    const requestedMs = Date.parse(requestedAt);
    if (!Number.isFinite(requestedMs)) {
      setWaitExceeded(false);
      return;
    }
    const timeoutSec = storeInfo?.human_wait_timeout_sec ?? 120;
    const check = () => {
      const nowServerMs = Date.now() + serverOffsetRef.current;
      setWaitExceeded((nowServerMs - requestedMs) / 1000 >= timeoutSec);
    };
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [
    chat.session?.needs_human,
    chat.session?.control_mode,
    chat.session?.human_requested_at,
    storeInfo?.human_wait_timeout_sec
  ]);

  useEffect(() => {
    if (!chat.selectedVariant) {
      setPinnedDetail(null);
      setLoadingPinned(false);
      return;
    }
    let active = true;
    setLoadingPinned(true);
    void apiJson<VariantDetail>(`/catalog/variants/${chat.selectedVariant}`)
      .then(res => {
        if (active) setPinnedDetail(res);
      })
      .catch(() => {
        if (active) setPinnedDetail(null);
      })
      .finally(() => {
        if (active) setLoadingPinned(false);
      });
    return () => {
      active = false;
    };
  }, [chat.selectedVariant]);

  useEffect(() => {
    if (chat.open) {
      trigger.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => {
        textareaRef.current?.focus();
      }, 40);
      return () => clearTimeout(t);
    } else if (trigger.current) {
      trigger.current.focus();
    }
  }, [chat.open]);

  useEffect(() => {
    if (!chat.open) return;
    userScrolledUpRef.current = false;
    const timer = setTimeout(() => {
      if (list.current) {
        list.current.scrollTop = list.current.scrollHeight;
        setShowScrollBottom(false);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [chat.open]);

  useEffect(() => {
    const element = list.current;
    if (!element) return;

    const latestMsg = chat.messages.at(-1);
    const hasNewUserMsg =
      chat.messages.length !== lastMsgCountRef.current && latestMsg?.role === 'USER';
    lastMsgCountRef.current = chat.messages.length;

    if (hasNewUserMsg) {
      userScrolledUpRef.current = false;
    }

    if (!userScrolledUpRef.current) {
      element.scrollTop = element.scrollHeight;
      setShowScrollBottom(false);
    } else {
      const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
      setShowScrollBottom(distanceFromBottom > 160);
    }
  }, [chat.messages, chat.streaming, chat.streamWidgets]);

  const handleScroll = useCallback(() => {
    const element = list.current;
    if (!element) return;
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    userScrolledUpRef.current = distanceFromBottom > 110;
    setShowScrollBottom(distanceFromBottom > 160);
  }, []);

  const scrollToLatest = useCallback(() => {
    if (!list.current) return;
    userScrolledUpRef.current = false;
    list.current.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
    setShowScrollBottom(false);
  }, []);

  useEffect(() => {
    if (!chat.open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        chat.closeChat();
        return;
      }
      if (event.key !== 'Tab' || !dialog.current) return;
      const focusable = [
        ...dialog.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled])'
        )
      ].filter(el => !el.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [chat]);

  const followUpPrompts = useMemo((): Array<{
    label: string;
    prompt: string;
    variantId?: string;
  }> => {
    const assistantTurns = chat.messages.filter(m => m.role === 'ASSISTANT');
    const lastAssistant = assistantTurns.at(-1);
    if (!lastAssistant) return [];
    if (lastAssistant.widgets.some(w => w.widget_type === 'address_form')) {
      return [];
    }

    const extractVariants = (widgets: ChatWidget[]): VariantSummary[] =>
      widgets.flatMap(w =>
        w.widget_type === 'laptop_spec' || w.widget_type === 'variant_customizer'
          ? w.payload.variants
          : []
      );

    const directVariants = extractVariants(lastAssistant.widgets);
    if (directVariants.length >= 2) {
      const topInStock = directVariants.find(v => v.in_stock);
      const chips: Array<{ label: string; prompt: string; variantId?: string }> = [
        {
          label: 'So sánh bảng chi tiết',
          prompt:
            'Lập bảng so sánh chi tiết hiệu năng, màn hình, pin và tản nhiệt giữa các mẫu máy trên giúp tôi'
        }
      ];
      if (topInStock) {
        const fullTitle = formatLaptopTitle(topInStock.brand, topInStock.model_name);
        chips.push({
          label: `Chốt mua ${shortLaptopLabel(topInStock)}`,
          prompt: `Tôi muốn đặt mua mẫu ${fullTitle} (${topInStock.sku})`,
          variantId: topInStock.variant_id
        });
      } else {
        chips.push({
          label: 'Pin & nâng cấp RAM/SSD',
          prompt: 'Các mẫu trên thời lượng pin và khả năng nâng cấp RAM/SSD thế nào?'
        });
      }
      chips.push({
        label: 'Mẫu khác giá mềm hơn',
        prompt: 'Có mẫu nào đáp ứng nhu cầu tương đương nhưng mức giá tiết kiệm hơn không?'
      });
      return chips;
    }

    if (directVariants.length === 1) {
      const only = directVariants[0]!;
      const fullTitle = formatLaptopTitle(only.brand, only.model_name);
      const chips: Array<{ label: string; prompt: string; variantId?: string }> = [
        {
          label: 'Ưu nhược điểm & nâng cấp',
          prompt: `Phân tích kỹ ưu nhược điểm thực tế, tản nhiệt và khả năng nâng cấp của ${fullTitle} giúp tôi`,
          variantId: only.variant_id
        }
      ];
      if (only.in_stock) {
        chips.push({
          label: `Chốt mua ${shortLaptopLabel(only)}`,
          prompt: `Tôi muốn đặt mua mẫu ${fullTitle} (${only.sku})`,
          variantId: only.variant_id
        });
      } else {
        chips.push({
          label: 'Bảo hành & giao COD',
          prompt: 'Chính sách bảo hành, đổi trả và giao hàng COD đồng kiểm như thế nào?'
        });
      }
      chips.push({
        label: 'Tìm đối thủ cùng tầm giá',
        prompt: 'Gợi ý thêm các mẫu đối thủ cùng tầm giá để tôi đối chiếu thêm'
      });
      return chips;
    }

    // Post-comparison turn (no duplicate cards emitted, but recent turn recommended SKUs)
    const prevWithCards = assistantTurns
      .slice(-3, -1)
      .reverse()
      .find(m => extractVariants(m.widgets).length > 0);
    if (prevWithCards && lastAssistant.content.includes('|')) {
      const compared = extractVariants(prevWithCards.widgets);
      const topInStock = compared.find(v => v.in_stock);
      if (topInStock) {
        const fullTitle = formatLaptopTitle(topInStock.brand, topInStock.model_name);
        return [
          {
            label: `Chốt mua ${shortLaptopLabel(topInStock)}`,
            prompt: `Tôi muốn đặt mua mẫu ${fullTitle} (${topInStock.sku})`,
            variantId: topInStock.variant_id
          },
          {
            label: 'Khả năng nâng cấp RAM/SSD',
            prompt: 'Khả năng nâng cấp RAM và SSD thực tế của các mẫu vừa so sánh thế nào?'
          },
          {
            label: 'Mẫu khác giá mềm hơn',
            prompt: 'Có lựa chọn nào khác mức giá tiết kiệm hơn để tôi cân nhắc không?'
          }
        ];
      }
    }

    return [
      {
        label: 'Văn phòng mỏng nhẹ < 15tr',
        prompt: 'Tư vấn giúp tôi laptop học tập và văn phòng mỏng nhẹ bền bỉ dưới 15 triệu'
      },
      {
        label: 'Lập trình RAM 16GB+ < 22tr',
        prompt: 'Tìm laptop lập trình chạy Docker mượt RAM từ 16GB dưới 22 triệu'
      },
      {
        label: 'Gaming / Đồ họa card rời',
        prompt: 'Gợi ý laptop gaming hoặc đồ họa có card rời RTX tản nhiệt tốt'
      }
    ];
  }, [chat.messages]);

  if (!rendered) return null;

  const isAiActive = storeInfo ? storeInfo.capabilities.ai_enabled : true;
  const isAiOffNotice = Boolean(
    chat.session && !isAiActive && chat.session.control_mode === 'AI' && !chat.session.needs_human
  );
  const isHumanMode = Boolean(chat.session?.needs_human || chat.session?.control_mode === 'AGENT');
  const canSend = Boolean(chat.session && !chat.busy && draft.trim().length > 0);

  const stateLabel =
    chat.session?.control_mode === 'AGENT'
      ? 'Nhân viên đang tư vấn'
      : chat.session?.needs_human
        ? 'Đang chờ nhân viên'
        : isAiActive
          ? 'Trợ lý AI sẵn sàng'
          : 'Tư vấn AI tạm nghỉ';

  const isLive = Boolean(isAiActive || chat.session?.control_mode === 'AGENT');

  function handleDraftChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(event.target.value);
    const el = event.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value || !canSend) return;
    userScrolledUpRef.current = false;
    setDraft('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    void chat.send(value);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (chat.busy) return;
      submit(event);
    }
  }

  const handleBuyNow = (variantId: string) => {
    chat.closeChat();
    navigate(`/checkout/${variantId}`);
  };

  const handleSelectVariant = (variantId: string) => {
    chat.setSelectedVariant(variantId);
  };

  const handleAddCart = (item: VariantSummary) => {
    cart.addItem(item.variant_id, { snapshot: toCartSnapshot(item) });
  };

  const handleOpenCartFromChat = () => {
    chat.closeChat();
    cart.openCart();
  };

  const handleAskVariant = (variantId: string, title: string) => {
    chat.setSelectedVariant(variantId);
    if (isHumanMode && isAiActive) {
      void chat.resumeAiAndSend(
        `Phân tích kỹ ưu nhược điểm, tản nhiệt và khả năng nâng cấp của mẫu ${title} giúp tôi`
      );
      return;
    }
    void chat.send(
      `Phân tích kỹ ưu nhược điểm, tản nhiệt và khả năng nâng cấp của mẫu ${title} giúp tôi`,
      variantId
    );
  };

  const runControlAction = async (kind: 'reset' | 'human' | 'resume', fn: () => Promise<void>) => {
    setControlAction(kind);
    try {
      await fn();
    } finally {
      setControlAction(null);
    }
  };

  const pinnedThumb = pinnedDetail ? catalogImageUrl(pinnedDetail.image_url) : null;
  const pinnedTitle = pinnedDetail
    ? formatLaptopTitle(pinnedDetail.brand, pinnedDetail.model_name)
    : '';

  return (
    <aside
      ref={dialog}
      className={`chat-drawer ${chat.drawerExpanded ? 'chat-drawer-expanded' : ''} ${stateClass}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={closing || undefined}
      aria-label="Tư vấn LapBot"
    >
      {/* Unified Streamlined Warm OS Header (~60px) */}
      <header className="chat-head">
        <div className="chat-head-brand">
          <div className="os-window-dots chat-head-dots" aria-hidden="true">
            <span className="os-dot os-dot-coral" />
            <span className="os-dot os-dot-amber" />
            <span className="os-dot os-dot-mint" />
          </div>
          <img
            src={COPILOT_MASCOT_URL}
            alt="LapBot"
            className="chat-head-avatar"
            width="36"
            height="36"
          />
          <div className="chat-head-copy">
            <div className="chat-head-title-row">
              <strong>Tư vấn LapBot</strong>
              <span className="chat-head-tag">{chat.drawerExpanded ? 'RỘNG 720' : 'COPILOT'}</span>
            </div>
            <p className="chat-head-status">
              <span className={`chat-status-dot ${isLive ? 'active' : ''}`} aria-hidden="true" />
              <span>{stateLabel}</span>
            </p>
          </div>
        </div>

        <div className="chat-head-actions">
          <button
            type="button"
            className={`chat-head-icon-btn ${chat.drawerExpanded ? 'is-active' : ''}`}
            onClick={chat.toggleDrawerExpanded}
            aria-label={chat.drawerExpanded ? 'Thu hẹp khung chat' : 'Mở rộng khung chat'}
            title={
              chat.drawerExpanded
                ? 'Thu hẹp về khung tiêu chuẩn (540px)'
                : 'Mở rộng khung tư vấn & đặt hàng (720px)'
            }
          >
            {chat.drawerExpanded ? <IconMinimize size={15} /> : <IconMaximize size={15} />}
          </button>

          <button
            type="button"
            disabled={controlAction === 'reset'}
            className={`chat-head-new-btn ${controlAction === 'reset' ? 'is-busy' : ''}`.trim()}
            onClick={() => void runControlAction('reset', () => chat.resetChat())}
            title="Bắt đầu đoạn chat mới"
          >
            {controlAction === 'reset' ? <IconSpinner size={13} /> : <IconPlus size={13} />}
            <span>Chat mới</span>
          </button>

          <button
            ref={closeButton}
            type="button"
            className="chat-close-btn"
            onClick={chat.closeChat}
            aria-label="Đóng chat"
            title="Đóng chat (Esc)"
          >
            <IconClose size={17} />
          </button>
        </div>
      </header>

      <RetroTopProgress
        active={(!chat.session && !chat.error) || controlAction !== null}
        label="Đang đồng bộ phiên trò chuyện..."
      />

      {/* Smart Compact Context Strip */}
      {loadingPinned && !pinnedDetail && (
        <div className="chat-pinned-bar" aria-hidden="true">
          <div className="chat-pinned-top">
            <RetroSkeleton width={48} height={36} radius={4} />
            <div
              className="chat-pinned-info"
              style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}
            >
              <RetroSkeleton variant="text" width="65%" height={13} />
              <RetroSkeleton variant="text" width="80%" height={11} />
            </div>
          </div>
        </div>
      )}

      {pinnedDetail && (
        <div className="chat-pinned-bar">
          <div className="chat-pinned-top">
            {pinnedThumb ? (
              <div className="pinned-thumb-frame">
                <img src={pinnedThumb} alt="" width="48" height="36" />
              </div>
            ) : null}

            <div className="chat-pinned-info">
              <div className="pinned-title-row">
                <span className="pinned-tag">ĐANG XEM</span>
                <strong title={pinnedTitle}>{pinnedTitle}</strong>
              </div>
              <p className="pinned-specs">
                <span className="pinned-price">{money(pinnedDetail.price_vnd)}</span> ·{' '}
                {cleanCpuLabel(pinnedDetail.cpu, pinnedDetail.model_name)} · {pinnedDetail.ram_gb}
                GB/
                {formatSsd(pinnedDetail.ssd_gb)}
              </p>
            </div>

            <div className="chat-pinned-actions">
              {!isAiOffNotice && (
                <button
                  type="button"
                  className="pinned-chip-btn"
                  disabled={chat.busy}
                  onClick={() =>
                    void chat.send(
                      `Đánh giá chi tiết ưu nhược điểm cấu hình máy ${pinnedTitle} giúp tôi`
                    )
                  }
                >
                  <IconSparkleAi size={12} />
                  <span>Đánh giá</span>
                </button>
              )}

              {pinnedDetail.in_stock && (
                <>
                  <button
                    type="button"
                    className="pinned-chip-btn"
                    onClick={() =>
                      cart.hasItem(pinnedDetail.variant_id)
                        ? handleOpenCartFromChat()
                        : cart.addItem(pinnedDetail.variant_id, {
                            snapshot: toCartSnapshot(pinnedDetail)
                          })
                    }
                  >
                    {cart.hasItem(pinnedDetail.variant_id) ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconShoppingCart size={12} />
                    )}
                    <span>{cart.hasItem(pinnedDetail.variant_id) ? 'Mở giỏ' : 'Thêm giỏ'}</span>
                  </button>

                  <button
                    type="button"
                    className="pinned-chip-btn pinned-buy-btn"
                    onClick={() => handleBuyNow(pinnedDetail.variant_id)}
                  >
                    <IconZap size={12} />
                    <span>Mua ngay</span>
                  </button>
                </>
              )}

              <button
                type="button"
                className="pinned-unpin-btn"
                onClick={() => chat.setSelectedVariant(null)}
                title="Bỏ ghim máy này"
                aria-label="Bỏ ghim máy"
              >
                <IconClose size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills Bar */}
      {(() => {
        const filter = chat.session?.sales_context?.filter as Record<string, unknown> | undefined;
        if (!filter || Object.keys(filter).length === 0) return null;
        const brand = typeof filter.preferred_brand === 'string' ? filter.preferred_brand : null;
        const usage = typeof filter.usage_category === 'string' ? filter.usage_category : null;
        const minPrice = typeof filter.min_price === 'number' ? filter.min_price : null;
        const maxPrice = typeof filter.max_price === 'number' ? filter.max_price : null;
        const minRam = typeof filter.min_ram_gb === 'number' ? filter.min_ram_gb : null;
        const minSsd = typeof filter.min_ssd_gb === 'number' ? filter.min_ssd_gb : null;
        const keyword = typeof filter.keyword === 'string' ? filter.keyword : null;
        if (!brand && !usage && !minPrice && !maxPrice && !minRam && !minSsd && !keyword)
          return null;
        return (
          <div className="chat-active-filter-bar">
            <span className="filter-bar-tag">NHU CẦU:</span>
            {brand && <span className="filter-pill">{brand}</span>}
            {usage && <span className="filter-pill">{USAGE_LABELS[usage] ?? usage}</span>}
            {keyword && <span className="filter-pill">&ldquo;{keyword}&rdquo;</span>}
            {minPrice && maxPrice ? (
              <span className="filter-pill">
                {money(minPrice)} – {money(maxPrice)}
              </span>
            ) : (
              <>
                {minPrice && <span className="filter-pill">&ge; {money(minPrice)}</span>}
                {maxPrice && <span className="filter-pill">&le; {money(maxPrice)}</span>}
              </>
            )}
            {minRam && <span className="filter-pill">&ge; {minRam}GB RAM</span>}
            {minSsd && <span className="filter-pill">&ge; {formatSsd(minSsd)} SSD</span>}
          </div>
        );
      })()}

      <div className="chat-body-stage">
        <div className="chat-scroll" ref={list} onScroll={handleScroll}>
          {!chat.messages.length && (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <img src={COPILOT_MASCOT_URL} alt="" width="64" height="64" />
              </div>
              <span className="chat-welcome-tag">READY // CHAT-TO-ORDER</span>
              <h3>Xin chào! Mình là LapBot</h3>
              <p>
                {storeInfo?.ai_welcome_message ||
                  'Chuyên viên AI giúp bạn chọn đúng cấu hình laptop theo ngân sách thực tế, đối chiếu phần cứng chuẩn xác và chốt đơn COD đồng kiểm hoặc VietQR ngay tại đây.'}
              </p>
              <div className="chat-welcome-chips">
                {!isAiOffNotice &&
                  (storeInfo?.ai_suggested_prompts && storeInfo.ai_suggested_prompts.length > 0 ? (
                    storeInfo.ai_suggested_prompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="chat-chip"
                        title={p}
                        disabled={chat.busy}
                        onClick={() => void chat.send(p)}
                      >
                        <IconSparkleAi size={15} />
                        <span className="chat-chip-label">
                          {p.length > 32 ? `${p.slice(0, 31)}…` : p}
                        </span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        type="button"
                        className="chat-chip"
                        disabled={chat.busy}
                        onClick={() =>
                          void chat.send(
                            'Tư vấn giúp tôi laptop học tập và làm việc văn phòng dưới 15 triệu'
                          )
                        }
                      >
                        <IconSparkleAi size={15} />
                        <span className="chat-chip-label">Văn phòng &lt; 15tr</span>
                      </button>
                      <button
                        type="button"
                        className="chat-chip"
                        disabled={chat.busy}
                        onClick={() =>
                          void chat.send('Gợi ý laptop gaming đồ họa tầm giá 20 đến 30 triệu')
                        }
                      >
                        <IconZap size={15} />
                        <span className="chat-chip-label">Gaming RTX 20–30tr</span>
                      </button>
                    </>
                  ))}
                <Link to="/orders" className="chat-chip" onClick={chat.closeChat}>
                  <IconPackage size={15} />
                  <span className="chat-chip-label">Đơn của tôi</span>
                </Link>
                <button
                  type="button"
                  className={`chat-chip ${controlAction === 'human' ? 'is-busy' : ''}`.trim()}
                  disabled={!chat.session || controlAction !== null}
                  onClick={() => void runControlAction('human', () => chat.requestHuman())}
                >
                  {controlAction === 'human' ? (
                    <IconSpinner size={15} />
                  ) : (
                    <IconHeadset size={15} />
                  )}
                  <span className="chat-chip-label">Gặp nhân viên</span>
                </button>
              </div>
            </div>
          )}

          {isAiOffNotice && (
            <div className="chat-ai-disabled-banner" role="status">
              <p>
                Trợ lý AI hiện đang tạm nghỉ bảo trì. Mọi tin nhắn bạn gửi bên dưới sẽ được chuyển
                thẳng tới nhân viên tư vấn trực tiếp, hoặc bạn có thể đặt hàng COD ngay tại cửa
                hàng.
              </p>
              <div className="chat-ai-disabled-actions">
                <button
                  type="button"
                  className="chat-btn-resume-ai"
                  onClick={() => void chat.requestHuman()}
                >
                  <IconHeadset size={13} />
                  <span>Gặp nhân viên tư vấn</span>
                </button>
                <Link to="/" className="chat-btn-new-convo" onClick={chat.closeChat}>
                  <span>Xem danh mục máy</span>
                </Link>
              </div>
            </div>
          )}

          {chat.messages.map(message => {
            if (message.role === 'SYSTEM') {
              return (
                <div key={message.id} className="chat-system-notice" role="status">
                  <span className="chat-system-badge">HỆ THỐNG</span>
                  {message.content && <span className="chat-system-text">{message.content}</span>}
                  {message.widgets.length > 0 && (
                    <div className="chat-widget-lane">
                      {message.widgets.map(widget => (
                        <Widget
                          key={widget.widget_id}
                          widget={widget}
                          onBuyNow={handleBuyNow}
                          onAddCart={handleAddCart}
                          hasInCart={cart.hasItem}
                          onOpenCart={handleOpenCartFromChat}
                          onSelectVariant={handleSelectVariant}
                          onAskVariant={handleAskVariant}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const isUser = message.role === 'USER';
            const isAgent = message.role === 'AGENT';
            const hasText = Boolean(message.content?.trim());

            return (
              <div
                key={message.id}
                className={`chat-turn-block ${isUser ? 'is-user' : 'is-assistant'}`}
              >
                {hasText && (
                  <div
                    className={`chat-msg-row ${isUser ? 'chat-msg-row-user' : 'chat-msg-row-assistant'}`}
                  >
                    {!isUser &&
                      (isAgent ? (
                        <div className="chat-msg-avatar chat-msg-avatar-agent" aria-hidden="true">
                          <IconHeadset size={17} />
                        </div>
                      ) : (
                        <img
                          src={COPILOT_MASCOT_URL}
                          alt=""
                          className="chat-msg-avatar"
                          width="32"
                          height="32"
                        />
                      ))}
                    <div
                      className={`chat-bubble ${
                        isUser
                          ? 'chat-bubble-user'
                          : isAgent
                            ? 'chat-bubble-assistant chat-bubble-agent'
                            : 'chat-bubble-assistant'
                      }`}
                    >
                      <div className={`chat-bubble-sender ${isAgent ? 'sender-agent' : ''}`}>
                        {isUser ? 'BẠN' : isAgent ? 'NHÂN VIÊN TƯ VẤN' : 'LAPBOT.AI'}
                      </div>
                      {isUser ? (
                        <p className="chat-user-text">{message.content}</p>
                      ) : (
                        <ChatMessageContent content={message.content} />
                      )}
                    </div>
                  </div>
                )}

                {message.widgets.length > 0 && (
                  <div className="chat-widget-lane">
                    {message.widgets.map(widget => (
                      <Widget
                        key={widget.widget_id}
                        widget={widget}
                        onBuyNow={handleBuyNow}
                        onAddCart={handleAddCart}
                        hasInCart={cart.hasItem}
                        onOpenCart={handleOpenCartFromChat}
                        onSelectVariant={handleSelectVariant}
                        onAskVariant={handleAskVariant}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {(chat.streaming || chat.streamWidgets.length > 0) && (
            <div className="chat-turn-block is-assistant">
              {chat.streaming && (
                <div className="chat-msg-row chat-msg-row-assistant">
                  <img
                    src={COPILOT_MASCOT_URL}
                    alt=""
                    className="chat-msg-avatar"
                    width="32"
                    height="32"
                  />
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="chat-bubble-sender chat-bubble-sender-streaming">
                      <div className="chat-bubble-sender-left">
                        <span>LAPBOT.AI</span>
                        <span className="chat-streaming-badge">
                          <span className="chat-streaming-pulse-dot" />
                          <span>ĐANG SOẠN…</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="chat-streaming-stop-btn"
                        onClick={chat.stopStreaming}
                        title="Dừng tạo phản hồi"
                        aria-label="Dừng tạo phản hồi"
                      >
                        <IconClose size={11} />
                        <span>Dừng</span>
                      </button>
                    </div>
                    <ChatMessageContent content={chat.streaming} isStreaming={true} />
                  </div>
                </div>
              )}

              {chat.streamWidgets.length > 0 && (
                <div className="chat-widget-lane">
                  {chat.streamWidgets.map(widget => (
                    <Widget
                      key={widget.widget_id}
                      widget={widget}
                      onBuyNow={handleBuyNow}
                      onAddCart={handleAddCart}
                      hasInCart={cart.hasItem}
                      onOpenCart={handleOpenCartFromChat}
                      onSelectVariant={handleSelectVariant}
                      onAskVariant={handleAskVariant}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {chat.busy && !chat.streaming && chat.streamWidgets.length === 0 && (
            <div className="chat-turn-block is-assistant">
              <div className="chat-msg-row chat-msg-row-assistant">
                <img
                  src={COPILOT_MASCOT_URL}
                  alt=""
                  className="chat-msg-avatar"
                  width="32"
                  height="32"
                />
                <ChatThinkingBubble
                  label={
                    chat.streamStage === 'preparing_order'
                      ? 'Đang chuẩn bị phiếu đặt hàng bảo mật…'
                      : chat.streamStage === 'comparing'
                        ? 'Đang đối chiếu chi tiết phần cứng từng mẫu…'
                        : chat.streamStage === 'searching'
                          ? 'Đang rà soát kho & chọn cấu hình sát ngân sách…'
                          : 'Đang phân tích nhu cầu của bạn…'
                  }
                  onStop={chat.stopStreaming}
                />
              </div>
            </div>
          )}

          {chat.error && (
            <div role="alert" className="chat-error-alert">
              <span className="chat-error-text">{chat.error}</span>
              <div className="chat-error-actions">
                {chat.lastPrompt && !isAiOffNotice && (
                  <button
                    type="button"
                    className="chat-retry-btn"
                    onClick={() => void chat.retryLastMessage()}
                    disabled={chat.busy}
                  >
                    <IconRefreshCw size={12} />
                    <span>Thử lại</span>
                  </button>
                )}
                <button
                  type="button"
                  className="chat-retry-btn chat-reset-btn"
                  onClick={() => void chat.resetChat()}
                  disabled={chat.busy}
                >
                  <IconRotateCcw size={12} />
                  <span>Đoạn chat mới</span>
                </button>
              </div>
            </div>
          )}

          {!chat.busy &&
            !chat.error &&
            !isAiOffNotice &&
            chat.session?.control_mode === 'AI' &&
            !chat.session.needs_human &&
            followUpPrompts.length > 0 && (
              <div className="chat-followup-chips">
                <span className="followup-title">Gợi ý hỏi nhanh:</span>
                {followUpPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chat-followup-chip"
                    onClick={() => {
                      userScrolledUpRef.current = false;
                      if (item.variantId) {
                        chat.setSelectedVariant(item.variantId);
                      }
                      void chat.send(item.prompt, item.variantId);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
        </div>

        {showScrollBottom && (
          <button
            type="button"
            className="chat-scroll-bottom-pill"
            onClick={scrollToLatest}
            aria-label="Cuộn xuống nội dung mới nhất"
          >
            <IconChevronDown size={14} />
            <span>Xem nội dung mới</span>
          </button>
        )}
      </div>

      {/* Clear Sticky Notice Bar when session is in Human Queue / Agent Mode (prevents silent 202 confusion) */}
      {isHumanMode && (
        <div className="chat-human-sticky-bar" role="status">
          <div className="chat-human-sticky-copy">
            <span className="waiting-pulse-dot" aria-hidden="true" />
            <div>
              <strong>
                {chat.session?.control_mode === 'AGENT'
                  ? 'Nhân viên đang trực tiếp hỗ trợ phiên này'
                  : 'Đang chờ nhân viên — AI tạm dừng trả lời tự động'}
              </strong>
              {waitExceeded && chat.session?.control_mode === 'AI' && storeInfo ? (
                <p>
                  Hỗ trợ nhanh ({storeInfo.support_hours}): {storeInfo.contact_channels.join(' · ')}
                </p>
              ) : (
                <p>
                  {chat.session?.control_mode === 'AGENT'
                    ? 'Tin nhắn bạn gửi sẽ tới nhân viên tư vấn, hoặc chuyển lại AI bất kỳ lúc nào.'
                    : 'Bật lại AI nếu bạn muốn nhận tư vấn cấu hình & báo giá tự động ngay lập tức.'}
                </p>
              )}
            </div>
          </div>

          <div className="chat-human-sticky-actions">
            {isAiActive && (
              <button
                type="button"
                disabled={controlAction !== null}
                className={`chat-btn-resume-ai ${controlAction === 'resume' ? 'is-busy' : ''}`.trim()}
                onClick={() => {
                  const pending = draft.trim();
                  if (pending) {
                    setDraft('');
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                    void runControlAction('resume', () => chat.resumeAiAndSend(pending));
                  } else {
                    void runControlAction('resume', () => chat.resumeAi());
                  }
                }}
              >
                {controlAction === 'resume' ? (
                  <IconSpinner size={13} />
                ) : (
                  <IconSparkleAi size={13} />
                )}
                <span>{draft.trim() ? 'Bật AI & Gửi ngay' : 'Bật lại AI ngay'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <form className="chat-compose" onSubmit={submit}>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            id="chat-draft"
            rows={2}
            maxLength={3000}
            placeholder={
              isAiOffNotice
                ? 'AI đang tạm nghỉ — nhập câu hỏi để gửi trực tiếp cho nhân viên hỗ trợ... (Enter gửi)'
                : isHumanMode
                  ? 'Nhập tin nhắn gửi nhân viên (hoặc bấm Bật lại AI ở trên)...'
                  : 'Nhập nhu cầu, ngân sách, hỏi cấu hình hoặc chốt đơn... (Enter gửi)'
            }
            value={draft}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            disabled={!chat.session || chat.busy}
          />
          <button
            className={`chat-send-btn ${chat.busy ? 'is-busy' : ''}`}
            type={chat.busy ? 'button' : 'submit'}
            onClick={chat.busy ? () => chat.stopStreaming() : undefined}
            aria-label={chat.busy ? 'Dừng tạo phản hồi' : 'Gửi tin nhắn'}
            title={chat.busy ? 'Dừng tạo phản hồi (Esc hoặc nhấn)' : 'Gửi tin nhắn (Enter)'}
            disabled={!chat.busy && !canSend}
          >
            {chat.busy ? <IconStop size={15} /> : <IconSend size={16} />}
          </button>
        </div>
        <div className="chat-compose-footer">
          <span className="chat-compose-tip">
            <KeycapHint label="↵" /> gửi · <KeycapHint label="SHIFT+↵" /> xuống dòng
          </span>
          {chat.session?.control_mode === 'AI' && !chat.session.needs_human && (
            <button
              type="button"
              disabled={controlAction !== null}
              className={`chat-link-human ${controlAction === 'human' ? 'is-busy' : ''}`.trim()}
              onClick={() => void runControlAction('human', () => chat.requestHuman())}
            >
              {controlAction === 'human' ? <IconSpinner size={13} /> : <IconHeadset size={13} />}
              <span>Gặp nhân viên</span>
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
