import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { ChatMessage, ChatWidget, SessionView, StoreInfo } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { ChatSseParser } from './sse.js';

type History = {
  items: ChatMessage[];
  next_cursor: string | null;
  control_mode: SessionView['control_mode'];
  control_version: number;
  needs_human: boolean;
  human_requested_at: string | null;
  sales_context?: Record<string, unknown>;
  server_time: string;
};

export type StreamStage =
  | 'idle'
  | 'thinking'
  | 'searching'
  | 'comparing'
  | 'preparing_order'
  | 'streaming';

export type ChatState = {
  open: boolean;
  drawerExpanded: boolean;
  selectedVariant: string | null;
  session: SessionView | null;
  messages: ChatMessage[];
  streaming: string;
  streamWidgets: ChatWidget[];
  busy: boolean;
  streamStage: StreamStage;
  error: string;
  store: StoreInfo | null;
  lastPrompt: string | null;
  openChat: (variantId?: string, initialPrompt?: string) => void;
  closeChat: () => void;
  setDrawerExpanded: (expanded: boolean) => void;
  toggleDrawerExpanded: () => void;
  setSelectedVariant: (variantId: string | null) => void;
  send: (text: string, overrideVariantId?: string) => Promise<void>;
  refresh: (force?: boolean, clearStreamOnSuccess?: boolean) => Promise<History | null | void>;
  stopStreaming: () => void;
  retryLastMessage: () => Promise<void>;
  requestHuman: () => Promise<void>;
  resumeAi: () => Promise<void>;
  resumeAiAndSend: (text?: string) => Promise<void>;
  resetChat: () => Promise<void>;
};

const Context = createContext<ChatState | null>(null);

const TABLE_SEPARATOR_RE = /\|\s*:?-{3,}:?\s*\|/;

export function useChat() {
  const value = useContext(Context);
  if (!value) throw new Error('ChatProvider missing');
  return value;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [session, setSessionState] = useState<SessionView | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState('');
  const [streamWidgets, setStreamWidgets] = useState<ChatWidget[]>([]);
  const [busy, setBusy] = useState(false);
  const [streamStage, setStreamStage] = useState<StreamStage>('idle');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [store, setStore] = useState<StoreInfo | null>(null);

  const sessionRef = useRef<SessionView | null>(null);
  const initPromiseRef = useRef<Promise<SessionView | null> | null>(null);
  const loading = useRef(false);
  const busyRef = useRef(false);
  const supersededRef = useRef(false);
  const version = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string | null>(null);
  const pendingDeltaRef = useRef('');
  const rafIdRef = useRef<number | null>(null);

  const setSession = useCallback(
    (updater: SessionView | null | ((prev: SessionView | null) => SessionView | null)) => {
      setSessionState(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        sessionRef.current = next;
        return next;
      });
    },
    []
  );

  const toggleDrawerExpanded = useCallback(() => {
    setDrawerExpanded(prev => !prev);
  }, []);

  const flushPendingDelta = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (pendingDeltaRef.current) {
      const chunkText = pendingDeltaRef.current;
      pendingDeltaRef.current = '';
      setStreaming(previous => {
        const combined = previous + chunkText;
        if (TABLE_SEPARATOR_RE.test(combined)) {
          setDrawerExpanded(true);
        }
        return combined;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const refresh = useCallback(
    async (force = false, clearStreamOnSuccess = false) => {
      if (!force && (loading.current || busyRef.current)) return;
      loading.current = true;
      try {
        const state = await apiJson<History>('/chat/messages');
        setMessages(state.items);
        if (clearStreamOnSuccess) {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          pendingDeltaRef.current = '';
          setStreaming('');
          setStreamWidgets([]);
          setStreamStage('idle');
          setBusy(false);
        }
        setSession(previous =>
          previous
            ? {
                ...previous,
                control_mode: state.control_mode,
                control_version: state.control_version,
                needs_human: state.needs_human,
                human_requested_at: state.human_requested_at,
                sales_context: (state.sales_context ?? previous.sales_context) as Record<
                  string,
                  unknown
                >,
                server_time: state.server_time
              }
            : previous
        );
        if (version.current !== null && version.current !== state.control_version) {
          setStreaming('');
          setStreamWidgets([]);
        }
        version.current = state.control_version;
        setError(prev =>
          prev === 'Không tải được hội thoại.' || prev === 'Không thể tải dữ liệu.' ? '' : prev
        );
        return state;
      } catch (cause) {
        if (force) {
          setError(cause instanceof Error ? cause.message : 'Không tải được hội thoại.');
        }
        return null;
      } finally {
        loading.current = false;
      }
    },
    [setSession]
  );

  const initSession = useCallback(async (): Promise<SessionView | null> => {
    if (sessionRef.current) return sessionRef.current;
    if (initPromiseRef.current) return initPromiseRef.current;

    const promise = (async () => {
      try {
        const state = await apiJson<SessionView>('/chat/session', { method: 'POST', body: '{}' });
        setSession(state);
        version.current = state.control_version;
        void apiJson<StoreInfo>('/store-info')
          .then(storeData => {
            if (storeData) setStore(storeData);
          })
          .catch(() => {});
        await refresh();
        return state;
      } catch (cause) {
        initPromiseRef.current = null;
        setError(cause instanceof Error ? cause.message : 'Không mở được chat.');
        return null;
      }
    })();

    initPromiseRef.current = promise;
    return promise;
  }, [refresh, setSession]);

  useEffect(() => {
    void initSession();
  }, [initSession]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      if (!document.hidden && !busyRef.current) void refresh();
    }, 5000);
    const visible = () => {
      if (!document.hidden && !busyRef.current) void refresh();
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [open, refresh]);

  const stopStreaming = useCallback((silent = false) => {
    if (silent) {
      supersededRef.current = true;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingDeltaRef.current = '';
    busyRef.current = false;
    setBusy(false);
    setStreamStage('idle');
  }, []);

  const send = useCallback(
    async (text: string, overrideVariantId?: string) => {
      const trimmed = text.trim();
      if (!trimmed || busyRef.current) return;

      busyRef.current = true;
      supersededRef.current = false;
      setBusy(true);
      setStreamStage('thinking');
      setError('');
      setStreaming('');
      setStreamWidgets([]);

      if (!sessionRef.current) {
        const readySession = await initSession();
        if (!readySession) {
          busyRef.current = false;
          setBusy(false);
          setStreamStage('idle');
          return;
        }
      }

      const currentVariant = overrideVariantId !== undefined ? overrideVariantId : selectedVariant;
      lastPromptRef.current = trimmed;
      setLastPrompt(trimmed);

      const optimisticUserMsg: ChatMessage = {
        id: `opt-${Date.now()}`,
        role: 'USER',
        content: trimmed,
        widgets: [],
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticUserMsg]);

      const clientId = crypto.randomUUID();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let timedOut = false;
      let watchdogId: ReturnType<typeof setTimeout> | null = null;
      const armWatchdog = () => {
        if (watchdogId !== null) clearTimeout(watchdogId);
        watchdogId = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, 45000);
      };
      armWatchdog();

      try {
        const response = await fetch('/api/v1/chat/message-stream', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            client_message_id: clientId,
            message: trimmed,
            ...(currentVariant ? { selected_variant_id: currentVariant } : {})
          })
        });

        armWatchdog();

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(body?.error?.message ?? 'Không gửi được tin nhắn.');
        }

        if (response.status === 202) {
          busyRef.current = false;
          await refresh(true, true);
          return;
        }

        if (
          !response.headers.get('content-type')?.includes('text/event-stream') ||
          !response.body
        ) {
          throw new Error('Phản hồi chat không hợp lệ.');
        }

        const parser = new ChatSseParser();
        const reader = response.body.getReader();
        let done = false;

        const handleFrame = (frame: { event: string; data: Record<string, unknown> }) => {
          if (frame.event === 'start') {
            if (rafIdRef.current !== null) {
              cancelAnimationFrame(rafIdRef.current);
              rafIdRef.current = null;
            }
            pendingDeltaRef.current = '';
            setStreaming('');
            setStreamWidgets([]);
          }
          if (
            frame.event === 'status' &&
            (frame.data.stage === 'searching' ||
              frame.data.stage === 'comparing' ||
              frame.data.stage === 'preparing_order')
          ) {
            const nextStage = frame.data.stage;
            setStreamStage(prev => (prev === 'streaming' ? prev : nextStage));
          }
          if (frame.event === 'text_delta' && typeof frame.data.text === 'string') {
            setStreamStage('streaming');
            pendingDeltaRef.current += frame.data.text;
            if (rafIdRef.current === null) {
              rafIdRef.current = requestAnimationFrame(() => {
                rafIdRef.current = null;
                if (pendingDeltaRef.current) {
                  const chunkText = pendingDeltaRef.current;
                  pendingDeltaRef.current = '';
                  setStreaming(previous => {
                    const combined = previous + chunkText;
                    if (TABLE_SEPARATOR_RE.test(combined)) {
                      setDrawerExpanded(true);
                    }
                    return combined;
                  });
                }
              });
            }
          }
          if (frame.event === 'widget' && typeof frame.data.widget_id === 'string') {
            flushPendingDelta();
            setStreamStage('streaming');
            const widget = frame.data as ChatWidget;
            setStreamWidgets(previous =>
              previous.some(w => w.widget_id === widget.widget_id)
                ? previous
                : [...previous, widget]
            );
          }
          if (frame.event === 'error') {
            flushPendingDelta();
            setError(
              typeof frame.data.message === 'string' ? frame.data.message : 'Tư vấn AI gặp lỗi.'
            );
          }
          if (frame.event === 'done') {
            flushPendingDelta();
            done = true;
          }
        };

        while (!done) {
          const chunk = await reader.read();
          armWatchdog();
          if (chunk.done) break;
          for (const frame of parser.push(chunk.value)) {
            handleFrame(frame);
          }
        }
        for (const frame of parser.push(new Uint8Array(0), true)) {
          handleFrame(frame);
        }
        flushPendingDelta();

        if (abortControllerRef.current === controller) {
          busyRef.current = false;
          await refresh(true, true);
        }
      } catch (cause) {
        flushPendingDelta();
        if (timedOut) {
          setError('Kết nối tư vấn phản hồi quá lâu, vui lòng nhấn Thử lại.');
        } else if (controller.signal.aborted) {
          if (!supersededRef.current) {
            setError('Đã dừng tạo câu trả lời.');
          }
        } else {
          setError(cause instanceof Error ? cause.message : 'Kết nối chat bị ngắt.');
        }
        if (abortControllerRef.current === controller || !busyRef.current) {
          busyRef.current = false;
          await refresh(true, true);
        }
      } finally {
        if (watchdogId !== null) clearTimeout(watchdogId);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          pendingDeltaRef.current = '';
          busyRef.current = false;
          setBusy(false);
          setStreamStage('idle');
          setStreaming('');
          setStreamWidgets([]);
        }
      }
    },
    [flushPendingDelta, initSession, refresh, selectedVariant]
  );

  const sendRef = useRef(send);
  sendRef.current = send;

  const retryLastMessage = useCallback(async () => {
    if (lastPromptRef.current && !busyRef.current) {
      await sendRef.current(lastPromptRef.current);
    }
  }, []);

  const openChat = useCallback(
    (variantId?: string, initialPrompt?: string) => {
      if (variantId) setSelectedVariant(variantId);
      setOpen(true);
      const prompt = initialPrompt?.trim();
      if (prompt) {
        if (busyRef.current) {
          stopStreaming(true);
        }
        queueMicrotask(() => {
          void sendRef.current(prompt, variantId);
        });
      }
    },
    [stopStreaming]
  );

  const closeChat = useCallback(() => setOpen(false), []);

  const control = useCallback(
    async (path: 'request-human' | 'resume-ai'): Promise<boolean> => {
      const currentSession = sessionRef.current ?? (await initSession());
      if (!currentSession) return false;
      setError('');
      try {
        const latest = await refresh(true);
        const currentVersion = latest?.control_version ?? currentSession.control_version;
        const updated = await apiJson<SessionView>(`/chat/${path}`, {
          method: 'POST',
          body: JSON.stringify({ expected_control_version: currentVersion })
        });
        setSession(updated);
        version.current = updated.control_version;
        setStreaming('');
        setStreamWidgets([]);
        await refresh(true);
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Không đổi được trạng thái.');
        await refresh(true);
        return false;
      }
    },
    [initSession, refresh, setSession]
  );

  const resumeAiAndSend = useCallback(
    async (text?: string) => {
      const ok = await control('resume-ai');
      if (ok && text?.trim()) {
        await sendRef.current(text.trim());
      }
    },
    [control]
  );

  const resetChat = useCallback(async () => {
    stopStreaming(true);
    setError('');
    try {
      const freshSession = await apiJson<SessionView>('/chat/session/new', {
        method: 'POST',
        body: '{}'
      });
      setSession(freshSession);
      version.current = freshSession.control_version;
      setMessages([]);
      setSelectedVariant(null);
      setStreaming('');
      setStreamWidgets([]);
      setStreamStage('idle');
      await refresh(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tạo được đoạn chat mới.');
    }
  }, [stopStreaming, refresh, setSession]);

  useEffect(() => {
    const handleAuthChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: 'login' | 'logout' }>).detail;
      if (detail?.type === 'logout') {
        void resetChat();
      } else {
        void apiJson<SessionView>('/chat/session', { method: 'POST', body: '{}' })
          .then(state => {
            setSession(state);
            version.current = state.control_version;
            return refresh(true, true);
          })
          .catch(() => {});
      }
    };
    window.addEventListener('lapbot:auth-changed', handleAuthChanged);
    return () => window.removeEventListener('lapbot:auth-changed', handleAuthChanged);
  }, [refresh, resetChat, setSession]);

  return (
    <Context.Provider
      value={{
        open,
        drawerExpanded,
        selectedVariant,
        session,
        messages,
        streaming,
        streamWidgets,
        busy,
        streamStage,
        error,
        store,
        lastPrompt,
        openChat,
        closeChat,
        setDrawerExpanded,
        toggleDrawerExpanded,
        setSelectedVariant,
        send,
        refresh,
        stopStreaming: () => stopStreaming(false),
        retryLastMessage,
        requestHuman: async () => {
          await control('request-human');
        },
        resumeAi: async () => {
          await control('resume-ai');
        },
        resumeAiAndSend,
        resetChat
      }}
    >
      {children}
    </Context.Provider>
  );
}
