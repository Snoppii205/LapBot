import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { VariantDetail, VariantSummary } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';

const STORAGE_KEY = 'lapbot_cart_v1';

export type CartItemSnapshot = {
  brand: string;
  model_name: string;
  sku: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  price_vnd: number;
  image_url: string | null;
  in_stock: boolean;
  availability_status: VariantSummary['availability_status'];
};

type StoredCartEntry = {
  variant_id: string;
  selected: boolean;
  added_at: string;
  snapshot?: CartItemSnapshot;
};

export type CartItemView = {
  variant_id: string;
  selected: boolean;
  added_at: string;
  brand: string;
  model_name: string;
  sku: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  price_vnd: number;
  image_url: string | null;
  in_stock: boolean;
  availability_status: VariantSummary['availability_status'];
  unavailable: boolean;
  hydrating: boolean;
};

export type CartToastState = {
  id: number;
  title: string;
  alreadyInCart: boolean;
} | null;

type CartContextValue = {
  open: boolean;
  items: CartItemView[];
  syncing: boolean;
  count: number;
  selectedIds: string[];
  selectedTotalVnd: number;
  toast: CartToastState;
  dismissToast: () => void;
  hasItem: (variantId: string) => boolean;
  addItem: (
    variantId: string,
    options?: { openDrawer?: boolean; snapshot?: CartItemSnapshot }
  ) => void;
  removeItem: (variantId: string) => void;
  removeItems: (variantIds: string[]) => void;
  toggleSelect: (variantId: string) => void;
  selectAll: (selected: boolean) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredEntries(): StoredCartEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const valid: StoredCartEntry[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      if (typeof rec.variant_id !== 'string' || !rec.variant_id || seen.has(rec.variant_id))
        continue;
      seen.add(rec.variant_id);
      valid.push({
        variant_id: rec.variant_id,
        selected: rec.selected !== false,
        added_at: typeof rec.added_at === 'string' ? rec.added_at : new Date().toISOString(),
        snapshot:
          rec.snapshot && typeof rec.snapshot === 'object'
            ? (rec.snapshot as CartItemSnapshot)
            : undefined
      });
    }
    return valid;
  } catch {
    return [];
  }
}

function writeStoredEntries(entries: StoredCartEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

function snapshotFromDetail(detail: VariantDetail): CartItemSnapshot {
  return {
    brand: detail.brand,
    model_name: detail.model_name,
    sku: detail.sku,
    cpu: detail.cpu,
    gpu: detail.gpu,
    ram_gb: detail.ram_gb,
    ssd_gb: detail.ssd_gb,
    price_vnd: detail.price_vnd,
    image_url: detail.image_url,
    in_stock: detail.in_stock,
    availability_status: detail.availability_status
  };
}

export function toCartSnapshot(item: VariantSummary | VariantDetail): CartItemSnapshot {
  return {
    brand: item.brand,
    model_name: item.model_name,
    sku: item.sku,
    cpu: item.cpu,
    gpu: item.gpu,
    ram_gb: item.ram_gb,
    ssd_gb: item.ssd_gb,
    price_vnd: item.price_vnd,
    image_url: item.image_url,
    in_stock: item.in_stock,
    availability_status: item.availability_status
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<StoredCartEntry[]>(() => readStoredEntries());
  const [unavailableIds, setUnavailableIds] = useState<Record<string, boolean>>({});
  const [hydratingIds, setHydratingIds] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<CartToastState>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    writeStoredEntries(entries);
  }, [entries]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const hydrateVariant = useCallback(async (variantId: string) => {
    setHydratingIds(prev => ({ ...prev, [variantId]: true }));
    try {
      const detail = await apiJson<VariantDetail>(`/catalog/variants/${variantId}`);
      const snap = snapshotFromDetail(detail);
      setUnavailableIds(prev => {
        if (!prev[variantId]) return prev;
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      });
      setEntries(prev =>
        prev.map(entry =>
          entry.variant_id === variantId
            ? {
                ...entry,
                snapshot: snap,
                selected: snap.in_stock ? entry.selected : false
              }
            : entry
        )
      );
    } catch {
      setUnavailableIds(prev => ({ ...prev, [variantId]: true }));
      setEntries(prev =>
        prev.map(entry => (entry.variant_id === variantId ? { ...entry, selected: false } : entry))
      );
    } finally {
      setHydratingIds(prev => {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      });
    }
  }, []);

  const refreshCart = useCallback(async () => {
    const current = entriesRef.current;
    if (!current.length) return;
    setSyncing(true);
    try {
      await Promise.all(current.map(entry => hydrateVariant(entry.variant_id)));
    } finally {
      setSyncing(false);
    }
  }, [hydrateVariant]);

  useEffect(() => {
    if (entriesRef.current.length > 0) {
      void refreshCart();
    }
  }, [refreshCart]);

  useEffect(() => {
    if (open && entriesRef.current.length > 0) {
      void refreshCart();
    }
  }, [open, refreshCart]);

  const showToast = useCallback((title: string, alreadyInCart: boolean) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), title, alreadyInCart });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  const addItem = useCallback(
    (variantId: string, options?: { openDrawer?: boolean; snapshot?: CartItemSnapshot }) => {
      const existing = entriesRef.current.find(e => e.variant_id === variantId);
      const label = options?.snapshot
        ? `${options.snapshot.brand} ${options.snapshot.model_name}`.trim()
        : existing?.snapshot
          ? `${existing.snapshot.brand} ${existing.snapshot.model_name}`.trim()
          : 'Cấu hình đã chọn';

      setEntries(prev => {
        const idx = prev.findIndex(item => item.variant_id === variantId);
        if (idx >= 0) {
          return prev.map((item, i) =>
            i === idx
              ? {
                  ...item,
                  selected: options?.snapshot ? options.snapshot.in_stock : true,
                  snapshot: options?.snapshot ?? item.snapshot
                }
              : item
          );
        }
        return [
          {
            variant_id: variantId,
            selected: options?.snapshot ? options.snapshot.in_stock : true,
            added_at: new Date().toISOString(),
            snapshot: options?.snapshot
          },
          ...prev
        ];
      });

      void hydrateVariant(variantId);

      if (options?.openDrawer) {
        setOpen(true);
        dismissToast();
      } else {
        showToast(label, Boolean(existing));
      }
    },
    [dismissToast, hydrateVariant, showToast]
  );

  const removeItem = useCallback((variantId: string) => {
    setEntries(prev => prev.filter(item => item.variant_id !== variantId));
  }, []);

  const removeItems = useCallback((variantIds: string[]) => {
    if (!variantIds.length) return;
    const set = new Set(variantIds);
    setEntries(prev => prev.filter(item => !set.has(item.variant_id)));
  }, []);

  const toggleSelect = useCallback((variantId: string) => {
    setEntries(prev =>
      prev.map(item =>
        item.variant_id === variantId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const selectAll = useCallback(
    (selected: boolean) => {
      setEntries(prev =>
        prev.map(item => {
          const canSelect =
            !unavailableIds[item.variant_id] && (item.snapshot ? item.snapshot.in_stock : true);
          return { ...item, selected: selected && canSelect };
        })
      );
    },
    [unavailableIds]
  );

  const clearCart = useCallback(() => {
    setEntries([]);
  }, []);

  const hasItem = useCallback(
    (variantId: string) => entries.some(item => item.variant_id === variantId),
    [entries]
  );

  const items = useMemo<CartItemView[]>(() => {
    return entries.map(entry => {
      const snap = entry.snapshot;
      const unavailable = Boolean(unavailableIds[entry.variant_id]);
      const inStock = !unavailable && Boolean(snap?.in_stock);
      return {
        variant_id: entry.variant_id,
        selected: entry.selected && inStock,
        added_at: entry.added_at,
        brand: snap?.brand ?? 'LapBot',
        model_name: snap?.model_name ?? 'Đang tải thông tin cấu hình...',
        sku: snap?.sku ?? entry.variant_id.slice(0, 8).toUpperCase(),
        cpu: snap?.cpu ?? '...',
        gpu: snap?.gpu ?? '',
        ram_gb: snap?.ram_gb ?? 0,
        ssd_gb: snap?.ssd_gb ?? 0,
        price_vnd: snap?.price_vnd ?? 0,
        image_url: snap?.image_url ?? null,
        in_stock: inStock,
        availability_status: unavailable
          ? 'out_of_stock'
          : (snap?.availability_status ?? 'in_stock'),
        unavailable,
        hydrating: Boolean(hydratingIds[entry.variant_id])
      };
    });
  }, [entries, hydratingIds, unavailableIds]);

  const selectedIds = useMemo(
    () => items.filter(item => item.selected && item.in_stock).map(item => item.variant_id),
    [items]
  );

  const selectedTotalVnd = useMemo(
    () =>
      items
        .filter(item => item.selected && item.in_stock)
        .reduce((sum, item) => sum + item.price_vnd, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        open,
        items,
        syncing,
        count: items.length,
        selectedIds,
        selectedTotalVnd,
        toast,
        dismissToast,
        hasItem,
        addItem,
        removeItem,
        removeItems,
        toggleSelect,
        selectAll,
        clearCart,
        openCart: () => {
          dismissToast();
          setOpen(true);
        },
        closeCart: () => setOpen(false),
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('CartProvider missing');
  return ctx;
}
