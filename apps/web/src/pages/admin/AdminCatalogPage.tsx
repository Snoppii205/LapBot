import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  adminCatalogSorts,
  adminStockFilters,
  usageCategories,
  type AdminBulkVariantAction,
  type AdminBulkVariantPatchResult,
  type AdminCatalogDeleteResult,
  type AdminCatalogMeta,
  type AdminCatalogSort,
  type AdminImageMimeType,
  type AdminImageUploadResult,
  type AdminLaptop,
  type AdminLaptopImagesUpdateResult,
  type AdminLaptopPage,
  type AdminStockFilter,
  type AdminVariant,
  type AdminVariantPage,
  type UsageCategory
} from '@lapbot/contracts';
import { apiJson, ApiClientError } from '../../lib/api-client.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { downloadCsv } from '../../lib/csv.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import {
  AdminKpiGridSkeleton,
  AdminTableRowsSkeleton,
  ProgressiveImage,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArchive,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClose,
  IconCopy,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconGrid,
  IconImage,
  IconLayers,
  IconPlus,
  IconRefresh,
  IconRotateCcw,
  IconSearch,
  IconSliders,
  IconSpinner,
  IconTag,
  IconTrash,
  IconUpload
} from '../../components/icons/RetroIcons.js';

type CatalogKind = 'laptops' | 'variants';
type DrawerMode = 'closed' | 'create_laptop' | 'edit_laptop' | 'create_variant' | 'edit_variant';

type LaptopDraft = {
  brand: string;
  model_name: string;
  description: string;
  image_url: string;
  is_active: boolean;
};

type VariantDraft = {
  laptop_id: string;
  sku: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ssd_gb: number;
  screen: string;
  color: string;
  usage_category: UsageCategory;
  price_vnd: number;
  stock: number;
  stock_verified: boolean;
  is_active: boolean;
};

const USAGE_LABELS: Record<UsageCategory, string> = {
  office_study: 'Học tập & Văn phòng',
  programming: 'Lập trình & Kỹ thuật',
  gaming: 'Gaming & Đồ họa 3D',
  graphic_creator: 'Thiết kế & Creator',
  business_ultrabook: 'Doanh nhân / Ultrabook'
};

const SORT_LABELS: Record<AdminCatalogSort, string> = {
  newest: 'Mới tạo gần nhất',
  updated_desc: 'Vừa cập nhật gần nhất',
  price_asc: 'Giá bán thấp → cao',
  price_desc: 'Giá bán cao → thấp',
  stock_asc: 'Tồn kho ít → nhiều',
  stock_desc: 'Tồn kho nhiều → ít',
  name_asc: 'Tên hãng & máy (A → Z)'
};

function emptyLaptopDraft(): LaptopDraft {
  return {
    brand: '',
    model_name: '',
    description: '',
    image_url: '',
    is_active: true
  };
}

function laptopToDraft(item: AdminLaptop): LaptopDraft {
  return {
    brand: item.brand,
    model_name: item.model_name,
    description: item.description ?? '',
    image_url: item.image_url ?? '',
    is_active: item.is_active
  };
}

function emptyVariantDraft(defaultLaptopId = ''): VariantDraft {
  return {
    laptop_id: defaultLaptopId,
    sku: '',
    cpu: '',
    gpu: '',
    ram_gb: 16,
    ssd_gb: 512,
    screen: '14 inch FHD+ IPS 100% sRGB',
    color: 'Bạc',
    usage_category: 'office_study',
    price_vnd: 15990000,
    stock: 5,
    stock_verified: true,
    is_active: true
  };
}

function variantToDraft(item: AdminVariant): VariantDraft {
  return {
    laptop_id: item.laptop_id,
    sku: item.sku,
    cpu: item.cpu,
    gpu: item.gpu,
    ram_gb: item.ram_gb,
    ssd_gb: item.ssd_gb,
    screen: item.screen,
    color: item.color,
    usage_category: item.usage_category,
    price_vnd: item.price_vnd,
    stock: item.stock,
    stock_verified: item.stock_verified,
    is_active: item.is_active
  };
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không đọc được tệp ảnh.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp ảnh từ thiết bị.'));
    reader.readAsDataURL(file);
  });
}

function formatPriceRange(minP?: number | null, maxP?: number | null): string {
  if (!minP && !maxP) return 'Chưa có SKU';
  if (minP && maxP && minP !== maxP) {
    return `${money(minP)} – ${money(maxP)}`;
  }
  return money(minP ?? maxP ?? 0);
}

export function AdminCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [kind, setKind] = useState<CatalogKind>(() =>
    searchParams.get('kind') === 'variants' ? 'variants' : 'laptops'
  );

  // Search & filter state (debounced searchDraft -> committedQ)
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get('q') ?? '');
  const [committedQ, setCommittedQ] = useState(() => searchParams.get('q') ?? '');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'' | UsageCategory>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | AdminStockFilter>(() => {
    const sf = searchParams.get('stock_filter');
    return sf && adminStockFilters.includes(sf as AdminStockFilter)
      ? (sf as AdminStockFilter)
      : 'all';
  });
  const [filterLaptopId, setFilterLaptopId] = useState('');
  const [sortMode, setSortMode] = useState<AdminCatalogSort>('newest');
  const [pageSize, setPageSize] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);

  // Sync incoming URL deep-links (e.g. from Dashboard or Order Detail)
  const handledInitialDeepLinkRef = useRef(false);
  useEffect(() => {
    const urlKind = searchParams.get('kind');
    const urlQ = searchParams.get('q');
    const urlStock = searchParams.get('stock_filter');
    if (urlKind === 'variants' || urlKind === 'laptops') {
      setKind(urlKind);
    }
    if (urlQ !== null && urlQ !== committedQ) {
      setSearchDraft(urlQ);
      setCommittedQ(urlQ);
      setOffset(0);
    }
    if (urlStock && adminStockFilters.includes(urlStock as AdminStockFilter)) {
      setStockFilter(urlStock as AdminStockFilter);
      setOffset(0);
    }
  }, [searchParams]);

  // Debounce searchDraft -> committedQ (280ms)
  useEffect(() => {
    const trimmed = searchDraft.trim();
    if (trimmed === committedQ.trim()) return;
    const timer = window.setTimeout(() => {
      setCommittedQ(trimmed);
      setOffset(0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchDraft, committedQ]);

  // Meta (KPIs, all brands, all laptop options)
  const [meta, setMeta] = useState<AdminCatalogMeta | null>(null);

  // Data table state
  const [loading, setLoading] = useState(true);
  const [laptopItems, setLaptopItems] = useState<AdminLaptop[]>([]);
  const [variantItems, setVariantItems] = useState<AdminVariant[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);

  // Expandable child SKUs on Laptop Models table
  const [expandedLaptopId, setExpandedLaptopId] = useState<string | null>(null);
  const [expandedChildren, setExpandedChildren] = useState<Record<string, AdminVariant[]>>({});
  const [loadingExpandedId, setLoadingExpandedId] = useState<string | null>(null);

  // Per-row inline quick-edit & optimistic busy state
  const [rowBusyIds, setRowBusyIds] = useState<Set<string>>(() => new Set());
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  // Multi-select & Sticky Bulk Bar (Variants tab)
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<AdminBulkVariantAction>('set_stock');
  const [bulkValue, setBulkValue] = useState<string>('10');
  const [bulkBusy, setBulkBusy] = useState(false);

  // Slide-over Drawer state
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed');
  const [selectedLaptop, setSelectedLaptop] = useState<AdminLaptop | null>(null);
  const [laptopDraft, setLaptopDraft] = useState<LaptopDraft | null>(null);
  const [drawerChildVariants, setDrawerChildVariants] = useState<AdminVariant[]>([]);

  const [selectedVariant, setSelectedVariant] = useState<AdminVariant | null>(null);
  const [variantDraft, setVariantDraft] = useState<VariantDraft | null>(null);

  // Feedback & modals
  const [busy, setBusy] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Gallery modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [galleryTargetLaptop, setGalleryTargetLaptop] = useState<AdminLaptop | null>(null);
  const [galleryImages, setGalleryImages] = useState<Array<{ image_url: string; caption: string }>>(
    []
  );
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [gallerySaving, setGallerySaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Delete / Archive modal
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: 'laptops'; item: AdminLaptop } | { kind: 'variants'; item: AdminVariant } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  // Unsaved-changes confirmation inside Drawer
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMeta = useCallback(async () => {
    try {
      const res = await apiJson<AdminCatalogMeta>('/admin/catalog/meta');
      setMeta(res);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const query = new URLSearchParams();
      query.set('limit', String(pageSize));
      if (offset > 0) query.set('offset', String(offset));
      if (sortMode !== 'newest') query.set('sort', sortMode);
      if (committedQ.trim()) query.set('q', committedQ.trim());
      if (brandFilter) query.set('brand', brandFilter);
      if (categoryFilter) query.set('usage_category', categoryFilter);
      if (activeFilter !== 'all') query.set('is_active', activeFilter);
      if (stockFilter !== 'all') query.set('stock_filter', stockFilter);
      if (kind === 'variants' && filterLaptopId) {
        query.set('laptop_id', filterLaptopId);
      }

      setLoading(true);
      try {
        if (kind === 'laptops') {
          const res = await apiJson<AdminLaptopPage>(`/admin/catalog/laptops?${query}`, { signal });
          setLaptopItems(res.items);
          setTotalCount(res.total_count ?? res.items.length);
          setNextOffset(res.next_offset ?? null);
        } else {
          const res = await apiJson<AdminVariantPage>(`/admin/catalog/variants?${query}`, {
            signal
          });
          setVariantItems(res.items);
          setTotalCount(res.total_count ?? res.items.length);
          setNextOffset(res.next_offset ?? null);

          // One-shot auto-open Drawer when navigated via deep-link ?kind=variants&q=EXACT_SKU
          const urlQ = searchParams.get('q')?.trim().toUpperCase();
          if (urlQ && !handledInitialDeepLinkRef.current && res.items.length > 0) {
            handledInitialDeepLinkRef.current = true;
            const exact = res.items.find(v => v.sku.toUpperCase() === urlQ);
            if (exact) {
              setSelectedVariant(exact);
              setVariantDraft(variantToDraft(exact));
              setDrawerMode('edit_variant');
            }
          }
        }
      } catch (cause) {
        if (!signal?.aborted) {
          setError(cause instanceof Error ? cause.message : 'Không tải được danh mục sản phẩm.');
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      kind,
      pageSize,
      offset,
      sortMode,
      committedQ,
      brandFilter,
      categoryFilter,
      activeFilter,
      stockFilter,
      filterLaptopId,
      searchParams
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const fetchChildrenForLaptop = useCallback(async (laptopId: string) => {
    setLoadingExpandedId(laptopId);
    try {
      const res = await apiJson<AdminVariantPage>(
        `/admin/catalog/variants?laptop_id=${encodeURIComponent(laptopId)}&limit=100`
      );
      setExpandedChildren(prev => ({ ...prev, [laptopId]: res.items }));
      return res.items;
    } catch {
      return [];
    } finally {
      setLoadingExpandedId(prev => (prev === laptopId ? null : prev));
    }
  }, []);

  const toggleExpandLaptop = async (laptopId: string) => {
    if (expandedLaptopId === laptopId) {
      setExpandedLaptopId(null);
      return;
    }
    setExpandedLaptopId(laptopId);
    if (!expandedChildren[laptopId]) {
      await fetchChildrenForLaptop(laptopId);
    }
  };

  // Dirty check for Drawer
  const isDrawerDirty = useMemo(() => {
    if (drawerMode === 'create_laptop' && laptopDraft) {
      return Boolean(
        laptopDraft.brand.trim() ||
          laptopDraft.model_name.trim() ||
          laptopDraft.description.trim() ||
          laptopDraft.image_url.trim()
      );
    }
    if (drawerMode === 'edit_laptop' && laptopDraft && selectedLaptop) {
      return (
        laptopDraft.brand !== selectedLaptop.brand ||
        laptopDraft.model_name !== selectedLaptop.model_name ||
        laptopDraft.description !== (selectedLaptop.description ?? '') ||
        laptopDraft.image_url !== (selectedLaptop.image_url ?? '') ||
        laptopDraft.is_active !== selectedLaptop.is_active
      );
    }
    if (drawerMode === 'create_variant' && variantDraft) {
      return Boolean(variantDraft.sku.trim() || variantDraft.cpu.trim());
    }
    if (drawerMode === 'edit_variant' && variantDraft && selectedVariant) {
      return (
        variantDraft.laptop_id !== selectedVariant.laptop_id ||
        variantDraft.sku !== selectedVariant.sku ||
        variantDraft.cpu !== selectedVariant.cpu ||
        variantDraft.gpu !== selectedVariant.gpu ||
        Number(variantDraft.ram_gb) !== selectedVariant.ram_gb ||
        Number(variantDraft.ssd_gb) !== selectedVariant.ssd_gb ||
        variantDraft.screen !== selectedVariant.screen ||
        variantDraft.color !== selectedVariant.color ||
        variantDraft.usage_category !== selectedVariant.usage_category ||
        Number(variantDraft.price_vnd) !== selectedVariant.price_vnd ||
        Number(variantDraft.stock) !== selectedVariant.stock ||
        variantDraft.stock_verified !== selectedVariant.stock_verified ||
        variantDraft.is_active !== selectedVariant.is_active
      );
    }
    return false;
  }, [drawerMode, laptopDraft, selectedLaptop, variantDraft, selectedVariant]);

  const requestCloseDrawer = () => {
    if (busy) return;
    if (isDrawerDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    forceCloseDrawer();
  };

  const forceCloseDrawer = () => {
    setConfirmDiscardOpen(false);
    setDrawerMode('closed');
    setSelectedLaptop(null);
    setLaptopDraft(null);
    setSelectedVariant(null);
    setVariantDraft(null);
  };

  const openCreateLaptopDrawer = () => {
    setError('');
    setSuccessMsg('');
    setSelectedLaptop(null);
    setLaptopDraft(emptyLaptopDraft());
    setDrawerChildVariants([]);
    setDrawerMode('create_laptop');
  };

  const openEditLaptopDrawer = (item: AdminLaptop) => {
    setError('');
    setSuccessMsg('');
    setSelectedLaptop(item);
    setLaptopDraft(laptopToDraft(item));
    setDrawerMode('edit_laptop');
    void fetchChildrenForLaptop(item.id).then(setDrawerChildVariants);
  };

  const openCreateVariantDrawer = (forLaptopId?: string) => {
    const defaultParent =
      forLaptopId ?? filterLaptopId ?? selectedLaptop?.id ?? meta?.laptop_options[0]?.id ?? '';
    setError('');
    setSuccessMsg('');
    setSelectedVariant(null);
    setVariantDraft(emptyVariantDraft(defaultParent));
    setDrawerMode('create_variant');
  };

  const openEditVariantDrawer = (item: AdminVariant) => {
    setError('');
    setSuccessMsg('');
    setSelectedVariant(item);
    setVariantDraft(variantToDraft(item));
    setDrawerMode('edit_variant');
  };

  const handleDuplicateVariant = (source: AdminVariant) => {
    setError('');
    setSuccessMsg(
      'Đã nhân bản cấu hình sang biểu mẫu tạo mới. Hãy kiểm tra mã SKU và giá bán trước khi bấm Tạo.'
    );
    setSelectedVariant(null);
    setVariantDraft({
      ...variantToDraft(source),
      sku: `${source.sku}-NEW`
    });
    setDrawerMode('create_variant');
  };

  const openGalleryModal = (laptop: AdminLaptop) => {
    setGalleryTargetLaptop(laptop);
    setGalleryImages(
      laptop.images && laptop.images.length > 0
        ? [...laptop.images]
        : laptop.image_url
          ? [{ image_url: laptop.image_url, caption: `${laptop.brand} ${laptop.model_name}` }]
          : []
    );
    setNewImgUrl('');
    setNewImgCaption('');
    setShowImageModal(true);
  };

  const switchKind = (
    target: CatalogKind,
    nextStock: 'all' | AdminStockFilter = stockFilter,
    keepLaptop = false
  ) => {
    setKind(target);
    setStockFilter(nextStock);
    setOffset(0);
    setSelectedVariantIds([]);
    if (!keepLaptop) setFilterLaptopId('');
    setError('');
  };

  const handleResetFilters = () => {
    setSearchDraft('');
    setCommittedQ('');
    setBrandFilter('');
    setCategoryFilter('');
    setActiveFilter('all');
    setStockFilter('all');
    setFilterLaptopId('');
    setSortMode('newest');
    setOffset(0);
    setSelectedVariantIds([]);
    setSearchParams({}, { replace: true });
  };

  // Propagate updated variant across all local states without full-screen reload flash
  const syncUpdatedVariantInState = useCallback(
    (updated: AdminVariant) => {
      setVariantItems(prev => prev.map(v => (v.id === updated.id ? updated : v)));
      setDrawerChildVariants(prev => prev.map(v => (v.id === updated.id ? updated : v)));
      setExpandedChildren(prev => {
        const list = prev[updated.laptop_id];
        if (!list) return prev;
        return { ...prev, [updated.laptop_id]: list.map(v => (v.id === updated.id ? updated : v)) };
      });
      setSelectedVariant(prev => (prev?.id === updated.id ? updated : prev));
      setVariantDraft(prev =>
        selectedVariant?.id === updated.id && prev ? variantToDraft(updated) : prev
      );
    },
    [selectedVariant?.id]
  );

  // Optimistic per-row quick patch (does NOT set global `busy`, only `rowBusyIds`)
  const quickPatchVariantRow = async (
    target: AdminVariant,
    patch: Record<string, unknown>,
    successLabel: string
  ) => {
    setRowBusyIds(prev => new Set(prev).add(target.id));
    setError('');
    try {
      const updated = await apiJson<AdminVariant>(`/admin/catalog/variants/${target.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ expected_revision: target.revision, ...patch })
      });
      syncUpdatedVariantInState(updated);
      setStockInputs(prev => {
        const next = { ...prev };
        delete next[updated.id];
        return next;
      });
      setSuccessMsg(`${successLabel}: ${updated.sku} (rev ${updated.revision})`);
      void loadMeta();
      if (kind === 'laptops') {
        void load();
      }
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === 'REVISION_CONFLICT') {
        setError(`SKU ${target.sku} vừa thay đổi ở phiên khác. Đã tự động đồng bộ lại kho.`);
        await Promise.all([
          load(),
          loadMeta(),
          ...(expandedLaptopId ? [fetchChildrenForLaptop(expandedLaptopId)] : [])
        ]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Cập nhật nhanh SKU thất bại.');
      }
    } finally {
      setRowBusyIds(prev => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
    }
  };

  const quickToggleLaptopActive = async (target: AdminLaptop) => {
    setRowBusyIds(prev => new Set(prev).add(target.id));
    setError('');
    try {
      const updated = await apiJson<AdminLaptop>(`/admin/catalog/laptops/${target.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ expected_revision: target.revision, is_active: !target.is_active })
      });
      setLaptopItems(prev => prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)));
      if (selectedLaptop?.id === updated.id) {
        setSelectedLaptop(updated);
        setLaptopDraft(laptopToDraft(updated));
      }
      setSuccessMsg(
        `Đã ${updated.is_active ? 'mở hiển thị' : 'tạm ẩn'} dòng máy "${updated.brand} ${updated.model_name}".`
      );
      void loadMeta();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không đổi được trạng thái dòng máy.');
      void load();
    } finally {
      setRowBusyIds(prev => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
    }
  };

  // Commit inline price edit
  const commitInlinePrice = async (v: AdminVariant) => {
    const parsed = Math.round(Number(editingPriceValue.replace(/[^\d]/g, '')));
    setEditingPriceId(null);
    if (!Number.isFinite(parsed) || parsed < 1000 || parsed === v.price_vnd) return;
    await quickPatchVariantRow(v, { price_vnd: parsed }, `Đã cập nhật giá ${money(parsed)}`);
  };

  // Commit inline stock input
  const commitInlineStock = async (v: AdminVariant) => {
    const raw = stockInputs[v.id];
    if (raw === undefined) return;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1000000) {
      setError('Số lượng tồn kho phải là số nguyên từ 0 đến 1.000.000.');
      return;
    }
    if (parsed === v.stock && v.stock_verified) {
      setStockInputs(prev => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      return;
    }
    await quickPatchVariantRow(
      v,
      { stock: parsed, stock_verified: true },
      `Đã đặt tồn kho = ${parsed}`
    );
  };

  // Bulk actions on selected variants
  const executeBulkPatch = async (actionOverride?: AdminBulkVariantAction) => {
    if (selectedVariantIds.length === 0) return;
    const chosenAction = actionOverride ?? bulkAction;
    const needsNumericValue =
      chosenAction === 'set_stock' ||
      chosenAction === 'adjust_stock_delta' ||
      chosenAction === 'adjust_price_pct' ||
      chosenAction === 'adjust_price_delta';

    let numericVal: number | undefined;
    if (needsNumericValue) {
      numericVal = Number(bulkValue);
      if (!Number.isFinite(numericVal)) {
        setError('Vui lòng nhập giá trị số hợp lệ cho thao tác hàng loạt.');
        return;
      }
    }

    setBulkBusy(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await apiJson<AdminBulkVariantPatchResult>('/admin/catalog/variants/bulk-patch', {
        method: 'POST',
        body: JSON.stringify({
          variant_ids: selectedVariantIds,
          action: chosenAction,
          ...(numericVal !== undefined ? { value: numericVal } : {})
        })
      });
      setSuccessMsg(res.message);
      setSelectedVariantIds([]);
      await Promise.all([load(), loadMeta()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Thao tác hàng loạt thất bại.');
    } finally {
      setBulkBusy(false);
    }
  };

  // Image upload helpers
  const uploadSingleImageFile = async (file: File): Promise<AdminImageUploadResult> => {
    const allowed: AdminImageMimeType[] = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type as AdminImageMimeType)) {
      throw new Error('Chỉ hỗ trợ tệp ảnh JPEG (.jpg), PNG (.png) hoặc WebP (.webp).');
    }
    if (file.size > 4 * 1024 * 1024) {
      throw new Error(`Tệp "${file.name}" vượt quá giới hạn 4 MB.`);
    }
    const data_base64 = await readFileAsBase64(file);
    return apiJson<AdminImageUploadResult>('/admin/catalog/images/upload', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        mime_type: file.type as AdminImageMimeType,
        data_base64
      })
    });
  };

  const handleCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !laptopDraft) return;
    setUploadingCover(true);
    setError('');
    try {
      const uploaded = await uploadSingleImageFile(file);
      setLaptopDraft(prev => (prev ? { ...prev, image_url: uploaded.url } : prev));
      setSuccessMsg(
        `Đã tải ảnh bìa lên (${Math.round(uploaded.size_bytes / 1024)} KB). Bấm Lưu dòng máy để đồng bộ Storefront.`
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tải ảnh thất bại.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (!files.length) return;
    setUploadingGallery(true);
    setError('');
    try {
      const uploadedItems: Array<{ image_url: string; caption: string }> = [];
      for (const file of files) {
        const uploaded = await uploadSingleImageFile(file);
        const cleanCaption = file.name
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim();
        uploadedItems.push({
          image_url: uploaded.url,
          caption:
            cleanCaption ||
            `${galleryTargetLaptop?.brand ?? ''} ${galleryTargetLaptop?.model_name ?? ''}`.trim()
        });
      }
      setGalleryImages(prev => [...prev, ...uploadedItems]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được ảnh vào thư viện.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleSaveGallery = async () => {
    if (!galleryTargetLaptop) return;
    setGallerySaving(true);
    setError('');
    try {
      const res = await apiJson<AdminLaptopImagesUpdateResult>(
        `/admin/catalog/laptops/${galleryTargetLaptop.id}/images`,
        {
          method: 'PUT',
          body: JSON.stringify({ images: galleryImages })
        }
      );
      setGalleryImages(res.items);
      if (selectedLaptop?.id === galleryTargetLaptop.id) {
        setSelectedLaptop(prev =>
          prev
            ? { ...prev, image_url: res.image_url, revision: res.revision, images: res.items }
            : prev
        );
        setLaptopDraft(prev => (prev ? { ...prev, image_url: res.image_url ?? '' } : prev));
      }
      setShowImageModal(false);
      setSuccessMsg(
        `Đã lưu bộ sưu tập ${res.items.length} ảnh cho ${galleryTargetLaptop.model_name}!`
      );
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Lưu thư viện ảnh thất bại.');
    } finally {
      setGallerySaving(false);
    }
  };

  const saveLaptop = async (event: FormEvent) => {
    event.preventDefault();
    if (!laptopDraft) return;
    setBusy(true);
    setError('');
    setSuccessMsg('');

    const normalizedPayload: Record<string, string | boolean | null> = {
      brand: laptopDraft.brand.trim(),
      model_name: laptopDraft.model_name.trim(),
      description: laptopDraft.description,
      image_url: laptopDraft.image_url.trim() ? laptopDraft.image_url.trim() : null,
      is_active: laptopDraft.is_active
    };

    try {
      if (drawerMode === 'create_laptop' || !selectedLaptop) {
        const created = await apiJson<AdminLaptop>('/admin/catalog/laptops', {
          method: 'POST',
          body: JSON.stringify(normalizedPayload)
        });
        setSelectedLaptop(created);
        setLaptopDraft(laptopToDraft(created));
        setDrawerChildVariants([]);
        setDrawerMode('edit_laptop');
        setSuccessMsg(
          `Đã tạo dòng máy "${created.brand} ${created.model_name}". Bạn có thể thêm ngay SKU bên dưới!`
        );
      } else {
        const patch: Record<string, unknown> = {};
        if (normalizedPayload.brand !== selectedLaptop.brand) patch.brand = normalizedPayload.brand;
        if (normalizedPayload.model_name !== selectedLaptop.model_name)
          patch.model_name = normalizedPayload.model_name;
        if (normalizedPayload.description !== selectedLaptop.description)
          patch.description = normalizedPayload.description;
        if (normalizedPayload.image_url !== selectedLaptop.image_url)
          patch.image_url = normalizedPayload.image_url;
        if (normalizedPayload.is_active !== selectedLaptop.is_active)
          patch.is_active = normalizedPayload.is_active;

        if (!Object.keys(patch).length) {
          setError('Chưa có thông tin nào thay đổi để lưu.');
          setBusy(false);
          return;
        }

        const updated = await apiJson<AdminLaptop>(`/admin/catalog/laptops/${selectedLaptop.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ expected_revision: selectedLaptop.revision, ...patch })
        });
        setSelectedLaptop(updated);
        setLaptopDraft(laptopToDraft(updated));
        setSuccessMsg(
          `Đã cập nhật dòng máy "${updated.brand} ${updated.model_name}" (rev ${updated.revision}).`
        );
      }
      await Promise.all([load(), loadMeta()]);
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === 'REVISION_CONFLICT') {
        setError('Dữ liệu dòng máy vừa được sửa ở phiên khác. Đã tải lại danh sách mới.');
        await load();
      } else {
        setError(cause instanceof Error ? cause.message : 'Không lưu được dòng máy.');
      }
    } finally {
      setBusy(false);
    }
  };

  const saveVariant = async (event: FormEvent) => {
    event.preventDefault();
    if (!variantDraft) return;
    setBusy(true);
    setError('');
    setSuccessMsg('');

    const normalizedPayload = {
      laptop_id: variantDraft.laptop_id,
      sku: variantDraft.sku.trim(),
      cpu: variantDraft.cpu.trim(),
      gpu: variantDraft.gpu.trim(),
      ram_gb: Number(variantDraft.ram_gb),
      ssd_gb: Number(variantDraft.ssd_gb),
      screen: variantDraft.screen.trim(),
      color: variantDraft.color.trim(),
      usage_category: variantDraft.usage_category,
      price_vnd: Number(variantDraft.price_vnd),
      stock: Number(variantDraft.stock),
      stock_verified: Boolean(variantDraft.stock_verified),
      is_active: Boolean(variantDraft.is_active)
    };

    try {
      if (drawerMode === 'create_variant' || !selectedVariant) {
        const created = await apiJson<AdminVariant>('/admin/catalog/variants', {
          method: 'POST',
          body: JSON.stringify(normalizedPayload)
        });
        setSelectedVariant(created);
        setVariantDraft(variantToDraft(created));
        setDrawerMode('edit_variant');
        setSuccessMsg(`Đã tạo mã SKU "${created.sku}" thành công!`);
      } else {
        const patch: Record<string, unknown> = {};
        (Object.keys(normalizedPayload) as Array<keyof typeof normalizedPayload>).forEach(key => {
          if (normalizedPayload[key] !== selectedVariant[key]) {
            patch[key] = normalizedPayload[key];
          }
        });

        if (!Object.keys(patch).length) {
          setError('Chưa có thông số SKU nào thay đổi để lưu.');
          setBusy(false);
          return;
        }

        const updated = await apiJson<AdminVariant>(
          `/admin/catalog/variants/${selectedVariant.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ expected_revision: selectedVariant.revision, ...patch })
          }
        );
        setSelectedVariant(updated);
        setVariantDraft(variantToDraft(updated));
        syncUpdatedVariantInState(updated);
        setSuccessMsg(`Đã cập nhật SKU "${updated.sku}" (rev ${updated.revision}).`);
      }

      await Promise.all([
        load(),
        loadMeta(),
        ...(expandedLaptopId ? [fetchChildrenForLaptop(expandedLaptopId)] : [])
      ]);
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.code === 'REVISION_CONFLICT') {
        setError('Phiên bản SKU đã thay đổi ở phiên khác. Đã làm mới dữ liệu.');
        await load();
      } else {
        setError(cause instanceof Error ? cause.message : 'Không lưu được phiên bản SKU.');
      }
    } finally {
      setBusy(false);
    }
  };

  const executeDeleteOrArchive = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      const endpoint =
        deleteTarget.kind === 'laptops'
          ? `/admin/catalog/laptops/${deleteTarget.item.id}`
          : `/admin/catalog/variants/${deleteTarget.item.id}`;
      const res = await apiJson<AdminCatalogDeleteResult>(endpoint, { method: 'DELETE' });
      setSuccessMsg(res.message);
      setDeleteTarget(null);
      if (
        (deleteTarget.kind === 'laptops' && selectedLaptop?.id === deleteTarget.item.id) ||
        (deleteTarget.kind === 'variants' && selectedVariant?.id === deleteTarget.item.id)
      ) {
        forceCloseDrawer();
      }
      await Promise.all([
        load(),
        loadMeta(),
        ...(expandedLaptopId ? [fetchChildrenForLaptop(expandedLaptopId)] : [])
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Xóa / Lưu trữ thất bại.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCatalogCsv = async () => {
    setExportingCsv(true);
    try {
      const query = new URLSearchParams({ limit: '200' });
      if (sortMode !== 'newest') query.set('sort', sortMode);
      if (committedQ.trim()) query.set('q', committedQ.trim());
      if (brandFilter) query.set('brand', brandFilter);
      if (categoryFilter) query.set('usage_category', categoryFilter);
      if (activeFilter !== 'all') query.set('is_active', activeFilter);
      if (stockFilter !== 'all') query.set('stock_filter', stockFilter);
      if (kind === 'variants' && filterLaptopId) query.set('laptop_id', filterLaptopId);

      if (kind === 'laptops') {
        const res = await apiJson<AdminLaptopPage>(`/admin/catalog/laptops?${query}`);
        downloadCsv(
          `lapbot-dong-may-${new Date().toISOString().slice(0, 10)}.csv`,
          [
            'Hãng',
            'Tên dòng máy',
            'Giá thấp nhất',
            'Giá cao nhất',
            'Số SKU',
            'Tổng tồn kho',
            'Chờ kiểm kho',
            'Trạng thái',
            'Cập nhật lúc'
          ],
          res.items.map(item => [
            item.brand,
            item.model_name,
            item.min_price_vnd ?? 0,
            item.max_price_vnd ?? 0,
            item.variant_count ?? 0,
            item.total_stock ?? 0,
            item.unverified_count ?? 0,
            item.is_active ? 'Đang bán' : 'Lưu trữ ẩn',
            new Date(item.updated_at).toLocaleString('vi-VN')
          ])
        );
      } else {
        const res = await apiJson<AdminVariantPage>(`/admin/catalog/variants?${query}`);
        downloadCsv(
          `lapbot-ton-kho-sku-${new Date().toISOString().slice(0, 10)}.csv`,
          [
            'Mã SKU',
            'Hãng',
            'Dòng máy',
            'Phân khúc',
            'CPU',
            'GPU',
            'RAM (GB)',
            'SSD (GB)',
            'Giá bán (VND)',
            'Tồn kho',
            'Đã xác thực kho',
            'Hiển thị'
          ],
          res.items.map(v => [
            v.sku,
            v.brand ?? '',
            v.model_name ?? '',
            USAGE_LABELS[v.usage_category] || v.usage_category,
            v.cpu,
            v.gpu,
            v.ram_gb,
            v.ssd_gb,
            v.price_vnd,
            v.stock,
            v.stock_verified ? 'DA_XAC_THUC' : 'CHO_KIEM_KHO',
            v.is_active ? 'DANG_BAN' : 'TAM_AN'
          ])
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Xuất CSV thất bại.');
    } finally {
      setExportingCsv(false);
    }
  };

  // Selection helpers on Variants tab
  const pageVariantIds = useMemo(() => variantItems.map(v => v.id), [variantItems]);
  const allPageSelected =
    pageVariantIds.length > 0 && pageVariantIds.every(id => selectedVariantIds.includes(id));
  const unverifiedOnPageIds = useMemo(
    () => variantItems.filter(v => !v.stock_verified).map(v => v.id),
    [variantItems]
  );

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedVariantIds(prev => prev.filter(id => !pageVariantIds.includes(id)));
    } else {
      setSelectedVariantIds(prev => Array.from(new Set([...prev, ...pageVariantIds])));
    }
  };

  const toggleSelectOneVariant = (id: string) => {
    setSelectedVariantIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const currentPageNumber = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasFilters = Boolean(
    committedQ ||
      brandFilter ||
      categoryFilter ||
      activeFilter !== 'all' ||
      stockFilter !== 'all' ||
      filterLaptopId ||
      sortMode !== 'newest'
  );

  const activeParentOption = useMemo(
    () => meta?.laptop_options.find(o => o.id === filterLaptopId),
    [meta?.laptop_options, filterLaptopId]
  );
  const hasExistingRows = kind === 'laptops' ? laptopItems.length > 0 : variantItems.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header & Primary Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
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
            <IconGrid size={21} />
            <span>QUẢN TRỊ DANH MỤC SẢN PHẨM & TỒN KHO SKU</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Bảng dữ liệu mật độ cao · Chỉnh nhanh giá & tồn kho trên từng dòng · Kiểm kho & điều
            chỉnh giá hàng loạt.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginLeft: 'auto'
          }}
        >
          <button
            type="button"
            disabled={loading}
            className={`retro-btn ${loading ? 'is-busy' : ''}`}
            onClick={() => void Promise.all([load(), loadMeta()])}
          >
            <IconRefresh size={14} className={loading ? 'retro-spin' : ''} />
            <span>{loading ? 'ĐANG TẢI...' : 'LÀM MỚI'}</span>
          </button>
          <button
            type="button"
            disabled={exportingCsv}
            className={`retro-btn ${exportingCsv ? 'is-busy' : ''}`}
            onClick={() => void handleExportCatalogCsv()}
          >
            {exportingCsv ? <IconSpinner size={14} /> : <IconDownload size={14} />}
            <span>{exportingCsv ? 'ĐANG XUẤT...' : 'XUẤT CSV'}</span>
          </button>
          <button
            type="button"
            className="retro-btn retro-btn-amber"
            onClick={openCreateLaptopDrawer}
          >
            <IconPlus size={15} />
            <span>THÊM DÒNG MÁY</span>
          </button>
          <button
            type="button"
            className="retro-btn retro-btn-primary"
            onClick={() => openCreateVariantDrawer()}
          >
            <IconPlus size={15} />
            <span>THÊM MÃ SKU MỚI</span>
          </button>
        </div>
      </div>

      {/* 6-Card Clickable Inventory KPI Strip */}
      {!meta && loading && <AdminKpiGridSkeleton count={6} mini />}
      {meta && (
        <div className="admin-kpi-strip-compact">
          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'laptops' && stockFilter === 'all' ? 'active' : ''}`}
            onClick={() => switchKind('laptops', 'all')}
          >
            <span className="admin-kpi-mini-label">DÒNG MÁY LAPTOP</span>
            <span className="admin-kpi-mini-val">{meta.summary.laptops_total}</span>
            <span className="admin-kpi-mini-sub">
              {meta.summary.laptops_active} đang bán · {meta.summary.laptops_archived} lưu trữ
            </span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'variants' && stockFilter === 'all' ? 'active' : ''}`}
            onClick={() => switchKind('variants', 'all')}
          >
            <span className="admin-kpi-mini-label">TỔNG PHIÊN BẢN SKU</span>
            <span className="admin-kpi-mini-val">{meta.summary.variants_total}</span>
            <span className="admin-kpi-mini-sub">{meta.summary.variants_active} đang mở bán</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'variants' && stockFilter === 'in_stock' ? 'active' : ''}`}
            onClick={() => switchKind('variants', 'in_stock')}
          >
            <span className="admin-kpi-mini-label">SẴN KHO (ĐÃ KIỂM)</span>
            <span className="admin-kpi-mini-val" style={{ color: 'var(--status-success)' }}>
              {meta.summary.variants_in_stock}
            </span>
            <span className="admin-kpi-mini-sub">Khách chốt COD ngay</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'variants' && stockFilter === 'unverified' ? 'active' : ''}`}
            onClick={() => switchKind('variants', 'unverified')}
          >
            <span className="admin-kpi-mini-label">CHỜ XÁC THỰC KHO</span>
            <span
              className="admin-kpi-mini-val"
              style={{
                color:
                  meta.summary.variants_unverified > 0
                    ? 'var(--status-warning)'
                    : 'var(--ink-primary)'
              }}
            >
              {meta.summary.variants_unverified}
            </span>
            <span className="admin-kpi-mini-sub">Cần bấm xác thực tồn</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'variants' && stockFilter === 'low_stock' ? 'active' : ''}`}
            onClick={() => switchKind('variants', 'low_stock')}
          >
            <span className="admin-kpi-mini-label">SẮP HẾT (1–2 MÁY)</span>
            <span className="admin-kpi-mini-val" style={{ color: 'var(--accent-primary)' }}>
              {meta.summary.variants_low_stock}
            </span>
            <span className="admin-kpi-mini-sub">Ưu tiên nhập bổ sung</span>
          </button>

          <button
            type="button"
            className={`admin-kpi-mini-card ${kind === 'variants' && stockFilter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => switchKind('variants', 'out_of_stock')}
          >
            <span className="admin-kpi-mini-label">HẾT HÀNG (TỒN = 0)</span>
            <span className="admin-kpi-mini-val" style={{ color: 'var(--status-danger)' }}>
              {meta.summary.variants_out_of_stock}
            </span>
            <span className="admin-kpi-mini-sub">Tạm ngừng nhận COD</span>
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          style={{
            background: '#FFF2F0',
            border: '1.5px solid var(--status-danger)',
            color: 'var(--status-danger)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span>
            <strong>Lỗi:</strong> {error}
          </span>
          <button
            type="button"
            className="retro-icon-btn"
            onClick={() => setError('')}
            aria-label="Đóng"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          style={{
            background: 'var(--accent-mint)',
            border: '1.5px solid var(--ink-border)',
            color: 'var(--status-success)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span>{successMsg}</span>
          <button
            type="button"
            className="retro-icon-btn"
            onClick={() => setSuccessMsg('')}
            aria-label="Đóng"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {/* Mode Switcher + Filter & Sort Console */}
      <div
        style={{
          background: 'var(--bg-surface-pure)',
          border: '2px solid var(--ink-border)',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-hard-xs)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {/* Segmented View Tabs */}
          <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`retro-btn ${kind === 'laptops' ? 'retro-btn-primary' : ''}`}
              onClick={() => switchKind('laptops')}
            >
              <span>DÒNG MÁY LAPTOP</span>
              {meta && <span style={{ opacity: 0.85 }}>({meta.summary.laptops_total})</span>}
            </button>
            <button
              type="button"
              className={`retro-btn ${kind === 'variants' ? 'retro-btn-primary' : ''}`}
              onClick={() => switchKind('variants')}
            >
              <span>PHIÊN BẢN CẤU HÌNH (SKU)</span>
              {meta && <span style={{ opacity: 0.85 }}>({meta.summary.variants_total})</span>}
            </button>

            {kind === 'variants' && unverifiedOnPageIds.length > 0 && (
              <button
                type="button"
                className="retro-btn retro-btn-amber retro-btn-sm"
                onClick={() =>
                  setSelectedVariantIds(prev =>
                    Array.from(new Set([...prev, ...unverifiedOnPageIds]))
                  )
                }
                title="Chọn tất cả mã SKU chưa xác thực kho đang hiển thị để xác thực 1 chạm"
              >
                <IconLayers size={13} />
                <span>Chọn nhanh {unverifiedOnPageIds.length} SKU chờ kiểm kho</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {hasFilters && (
              <button type="button" className="retro-btn retro-btn-sm" onClick={handleResetFilters}>
                <IconRotateCcw size={13} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}
            >
              <IconSliders size={13} />
              <span>SẮP XẾP:</span>
              <select
                value={sortMode}
                onChange={e => {
                  setSortMode(e.target.value as AdminCatalogSort);
                  setOffset(0);
                }}
                style={{
                  padding: '5px 8px',
                  border: '1.5px solid var(--ink-border)',
                  borderRadius: '4px',
                  background: 'var(--bg-surface-raised)',
                  fontSize: '12px'
                }}
              >
                {adminCatalogSorts.map(s => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Search & Multi-Facet Filter Strip */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              flex: '1 1 260px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              background: 'var(--bg-surface)'
            }}
          >
            <IconSearch size={15} />
            <input
              type="text"
              placeholder="Gõ tìm tức thì theo tên máy, hãng, mã SKU, CPU, GPU..."
              value={searchDraft}
              onChange={e => setSearchDraft(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px'
              }}
            />
            {searchDraft && (
              <button
                type="button"
                className="retro-icon-btn"
                onClick={() => {
                  setSearchDraft('');
                  setCommittedQ('');
                  setOffset(0);
                }}
                aria-label="Xóa tìm kiếm"
              >
                <IconClose size={13} />
              </button>
            )}
          </div>

          <select
            value={brandFilter}
            onChange={e => {
              setBrandFilter(e.target.value);
              setOffset(0);
            }}
            style={{
              padding: '7px 10px',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              fontSize: '12px',
              background: 'var(--bg-surface)'
            }}
          >
            <option value="">Tất cả hãng ({meta?.brands.length ?? 0})</option>
            {(meta?.brands ?? []).map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value as '' | UsageCategory);
              setOffset(0);
            }}
            style={{
              padding: '7px 10px',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              fontSize: '12px',
              background: 'var(--bg-surface)'
            }}
          >
            <option value="">Tất cả phân khúc</option>
            {usageCategories.map(cat => (
              <option key={cat} value={cat}>
                {USAGE_LABELS[cat]}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={e => {
              setStockFilter(e.target.value as 'all' | AdminStockFilter);
              setOffset(0);
            }}
            style={{
              padding: '7px 10px',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              fontSize: '12px',
              background: 'var(--bg-surface)'
            }}
          >
            <option value="all">Mọi tình trạng kho</option>
            <option value="in_stock">Sẵn kho (đã xác thực)</option>
            <option value="unverified">Chờ kiểm kho</option>
            <option value="low_stock">Sắp hết (1–2 máy)</option>
            <option value="out_of_stock">Hết hàng (tồn = 0)</option>
          </select>

          <select
            value={activeFilter}
            onChange={e => {
              setActiveFilter(e.target.value as 'all' | 'true' | 'false');
              setOffset(0);
            }}
            style={{
              padding: '7px 10px',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              fontSize: '12px',
              background: 'var(--bg-surface)'
            }}
          >
            <option value="all">Mọi hiển thị</option>
            <option value="true">Đang mở bán</option>
            <option value="false">Đang tạm ẩn / Lưu trữ</option>
          </select>
        </div>

        {kind === 'variants' && filterLaptopId && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '6px 10px',
              background: 'var(--accent-amber-light)',
              border: '1px solid var(--ink-border)',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <span>
              Đang lọc các mã SKU thuộc dòng máy:{' '}
              <strong>
                {activeParentOption
                  ? `${activeParentOption.brand} ${activeParentOption.model_name}`
                  : filterLaptopId}
              </strong>
            </span>
            <button
              type="button"
              className="retro-btn retro-btn-sm"
              onClick={() => {
                setFilterLaptopId('');
                setOffset(0);
              }}
            >
              Xem toàn bộ SKU
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bulk Action Bar (Variants tab) */}
      {kind === 'variants' && selectedVariantIds.length > 0 && (
        <div className="admin-bulk-bar">
          <div className="admin-bulk-count">
            <IconLayers size={16} />
            <span>ĐÃ CHỌN {selectedVariantIds.length} MÃ SKU</span>
            <button
              type="button"
              className="retro-btn retro-btn-sm"
              disabled={bulkBusy}
              onClick={() => setSelectedVariantIds([])}
            >
              Bỏ chọn
            </button>
          </div>

          <div className="admin-bulk-actions">
            <button
              type="button"
              disabled={bulkBusy}
              className="retro-btn retro-btn-success retro-btn-sm"
              onClick={() => void executeBulkPatch('verify_stock')}
            >
              <IconCheck size={13} />
              <span>Xác thực kho ({selectedVariantIds.length})</span>
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              className="retro-btn retro-btn-sm"
              onClick={() => void executeBulkPatch('activate')}
            >
              Mở bán
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              className="retro-btn retro-btn-sm"
              onClick={() => void executeBulkPatch('deactivate')}
            >
              Tạm ẩn
            </button>

            <span
              style={{
                width: '1.5px',
                height: '20px',
                background: 'var(--ink-border)',
                opacity: 0.25
              }}
            />

            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value as AdminBulkVariantAction)}
              style={{
                padding: '4px 8px',
                border: '1.5px solid var(--ink-border)',
                borderRadius: '4px',
                fontSize: '12px',
                background: '#fff'
              }}
            >
              <option value="set_stock">Đặt tồn kho cố định =</option>
              <option value="adjust_stock_delta">Cộng / trừ tồn kho (±)</option>
              <option value="adjust_price_pct">Điều chỉnh giá theo % (±%)</option>
              <option value="adjust_price_delta">Cộng / trừ giá bán (±VNĐ)</option>
            </select>

            <input
              type="number"
              step={bulkAction === 'adjust_price_pct' ? '0.5' : '1'}
              value={bulkValue}
              onChange={e => setBulkValue(e.target.value)}
              className="admin-inline-edit-input"
              style={{ width: '96px' }}
            />

            <button
              type="button"
              disabled={bulkBusy}
              className={`retro-btn retro-btn-primary retro-btn-sm ${bulkBusy ? 'is-busy' : ''}`}
              onClick={() => void executeBulkPatch()}
            >
              {bulkBusy && <IconSpinner size={12} />}
              <span>{bulkBusy ? 'Đang áp dụng...' : 'Áp dụng'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Full-Width High-Density Data Table */}
      <div className="admin-table-wrap" style={{ position: 'relative' }}>
        <RetroTopProgress active={loading && hasExistingRows} label="Đang tải danh mục sản phẩm" />
        {kind === 'laptops' ? (
          <table
            className={`admin-table ${loading && laptopItems.length > 0 ? 'is-refreshing-pane' : ''}`}
          >
            <thead>
              <tr>
                <th style={{ width: '74px' }}>Ảnh bìa</th>
                <th>Hãng & Dòng máy</th>
                <th>Khoảng giá niêm yết</th>
                <th>Cấu hình & Tồn kho</th>
                <th>Hiển thị</th>
                <th>Cập nhật</th>
                <th style={{ textAlign: 'right' }}>Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody>
              {loading && laptopItems.length === 0 ? (
                <AdminTableRowsSkeleton columns={7} rows={6} />
              ) : laptopItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}
                  >
                    Không có dòng máy nào khớp bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                laptopItems.map(item => {
                  const thumb = catalogImageUrl(item.image_url);
                  const isExpanded = expandedLaptopId === item.id;
                  const rowBusy = rowBusyIds.has(item.id);
                  const children = expandedChildren[item.id] ?? [];
                  const galleryCount = item.images?.length ?? (item.image_url ? 1 : 0);

                  return (
                    <FragmentRow
                      key={item.id}
                      mainRow={
                        <tr
                          style={{
                            background: isExpanded ? 'var(--accent-amber-light)' : undefined
                          }}
                        >
                          <td>
                            <div className="admin-catalog-thumb">
                              <ProgressiveImage
                                src={thumb}
                                alt={item.model_name}
                                loading="lazy"
                                fallback={<IconImage size={16} />}
                              />
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  background: 'var(--bg-surface-warm)',
                                  border: '1px solid var(--ink-border)',
                                  borderRadius: '3px'
                                }}
                              >
                                {item.brand}
                              </span>
                              <button
                                type="button"
                                className="retro-icon-btn"
                                style={{
                                  fontWeight: 800,
                                  fontSize: '13.5px',
                                  padding: '2px 4px',
                                  textAlign: 'left'
                                }}
                                onClick={() => openEditLaptopDrawer(item)}
                              >
                                {formatLaptopTitle(item.brand, item.model_name)}
                              </button>
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginTop: '2px'
                              }}
                            >
                              Thư viện: {galleryCount} ảnh · rev {item.revision}
                            </div>
                          </td>
                          <td
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: 'var(--accent-primary)'
                            }}
                          >
                            {formatPriceRange(item.min_price_vnd, item.max_price_vnd)}
                          </td>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <button
                                type="button"
                                className="retro-btn retro-btn-sm"
                                onClick={() => void toggleExpandLaptop(item.id)}
                              >
                                {isExpanded ? (
                                  <IconChevronUp size={12} />
                                ) : (
                                  <IconChevronDown size={12} />
                                )}
                                <span>{item.variant_count ?? 0} SKU</span>
                              </button>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}
                              >
                                Tổng tồn: {item.total_stock ?? 0}
                              </span>
                              {(item.unverified_count ?? 0) > 0 && (
                                <span
                                  className="admin-badge status-warning"
                                  style={{ fontSize: '10px' }}
                                >
                                  {item.unverified_count} chờ kiểm
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              disabled={rowBusy}
                              onClick={() => void quickToggleLaptopActive(item)}
                              className={`admin-badge ${item.is_active ? 'status-success' : 'status-neutral'}`}
                              style={{ cursor: 'pointer', boxShadow: 'none' }}
                              title="Bấm để bật/tắt hiển thị dòng máy trên Storefront"
                            >
                              {item.is_active ? 'ĐANG BÁN' : 'LƯU TRỮ ẨN'}
                            </button>
                          </td>
                          <td
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '6px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <button
                                type="button"
                                className="retro-btn retro-btn-sm"
                                onClick={() => openGalleryModal(item)}
                                title="Quản lý bộ sưu tập ảnh sản phẩm"
                              >
                                <IconImage size={13} />
                                <span>Ảnh ({galleryCount})</span>
                              </button>
                              <button
                                type="button"
                                className="retro-btn retro-btn-sm"
                                onClick={() => openCreateVariantDrawer(item.id)}
                                title="Thêm phiên bản cấu hình SKU cho dòng máy này"
                              >
                                <IconPlus size={13} />
                                <span>SKU</span>
                              </button>
                              <button
                                type="button"
                                className="retro-btn retro-btn-sm"
                                onClick={() => openEditLaptopDrawer(item)}
                              >
                                <IconEdit size={13} />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                className="retro-btn retro-btn-danger retro-btn-sm"
                                onClick={() => setDeleteTarget({ kind: 'laptops', item })}
                                title="Xóa hoặc Lưu trữ dòng máy"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                      expandedRow={
                        isExpanded ? (
                          <tr className="admin-expanded-row">
                            <td colSpan={7}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '8px',
                                  flexWrap: 'wrap',
                                  gap: '8px'
                                }}
                              >
                                <strong
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                                >
                                  DANH SÁCH SKU THUỘC {item.brand.toUpperCase()}{' '}
                                  {item.model_name.toUpperCase()}
                                </strong>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    className="retro-btn retro-btn-sm"
                                    onClick={() => {
                                      setFilterLaptopId(item.id);
                                      switchKind('variants', 'all', true);
                                    }}
                                  >
                                    Mở ở bảng SKU đầy đủ
                                  </button>
                                  <button
                                    type="button"
                                    className="retro-btn retro-btn-primary retro-btn-sm"
                                    onClick={() => openCreateVariantDrawer(item.id)}
                                  >
                                    <IconPlus size={12} />
                                    <span>Thêm SKU mới</span>
                                  </button>
                                </div>
                              </div>

                              {loadingExpandedId === item.id ? (
                                <div
                                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                                  role="status"
                                  aria-busy="true"
                                >
                                  <RetroSkeleton height={44} radius={4} />
                                  <RetroSkeleton height={44} radius={4} />
                                </div>
                              ) : children.length === 0 ? (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  Dòng máy này chưa có phiên bản cấu hình SKU nào.
                                </div>
                              ) : (
                                <div
                                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                                >
                                  {children.map(cv => {
                                    const cvBusy = rowBusyIds.has(cv.id);
                                    return (
                                      <div
                                        key={cv.id}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          flexWrap: 'wrap',
                                          gap: '10px',
                                          padding: '8px 12px',
                                          background: '#fff',
                                          border: '1px solid var(--ink-border)',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px'
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px'
                                            }}
                                          >
                                            <strong
                                              style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '12.5px'
                                              }}
                                            >
                                              {cv.sku}
                                            </strong>
                                            <span
                                              className={`admin-badge ${cv.is_active ? 'status-success' : 'status-neutral'}`}
                                              style={{ fontSize: '10px' }}
                                            >
                                              {cv.is_active ? 'Đang bán' : 'Tạm ẩn'}
                                            </span>
                                            {!cv.stock_verified && (
                                              <span
                                                className="admin-badge status-warning"
                                                style={{ fontSize: '10px' }}
                                              >
                                                Chờ kiểm kho
                                              </span>
                                            )}
                                          </div>
                                          <span
                                            style={{
                                              fontSize: '12px',
                                              color: 'var(--text-secondary)'
                                            }}
                                          >
                                            {cv.cpu} · {cv.gpu} · {cv.ram_gb}GB / {cv.ssd_gb}GB ·{' '}
                                            {cv.screen}
                                          </span>
                                        </div>

                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                          }}
                                        >
                                          <strong
                                            style={{
                                              fontFamily: 'var(--font-mono)',
                                              color: 'var(--accent-primary)'
                                            }}
                                          >
                                            {money(cv.price_vnd)}
                                          </strong>
                                          <div className="admin-inline-stepper">
                                            <button
                                              type="button"
                                              disabled={cvBusy || cv.stock <= 0}
                                              className="retro-btn retro-btn-sm"
                                              onClick={() =>
                                                void quickPatchVariantRow(
                                                  cv,
                                                  {
                                                    stock: Math.max(0, cv.stock - 1),
                                                    stock_verified: true
                                                  },
                                                  'Giảm tồn -1'
                                                )
                                              }
                                            >
                                              -1
                                            </button>
                                            <span
                                              style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: 700,
                                                minWidth: '32px',
                                                textAlign: 'center'
                                              }}
                                            >
                                              {cv.stock}
                                            </span>
                                            <button
                                              type="button"
                                              disabled={cvBusy}
                                              className="retro-btn retro-btn-sm"
                                              onClick={() =>
                                                void quickPatchVariantRow(
                                                  cv,
                                                  { stock: cv.stock + 1, stock_verified: true },
                                                  'Tăng tồn +1'
                                                )
                                              }
                                            >
                                              +1
                                            </button>
                                          </div>
                                          {!cv.stock_verified && (
                                            <button
                                              type="button"
                                              disabled={cvBusy}
                                              className="retro-btn retro-btn-amber retro-btn-sm"
                                              onClick={() =>
                                                void quickPatchVariantRow(
                                                  cv,
                                                  { stock_verified: true },
                                                  'Đã xác thực tồn kho'
                                                )
                                              }
                                            >
                                              Xác thực
                                            </button>
                                          )}
                                          <Link
                                            to={`/products/${cv.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="retro-btn retro-btn-sm"
                                            title="Xem trang chi tiết trên Storefront"
                                          >
                                            <IconExternalLink size={12} />
                                          </Link>
                                          <button
                                            type="button"
                                            className="retro-btn retro-btn-sm"
                                            onClick={() => openEditVariantDrawer(cv)}
                                          >
                                            <IconEdit size={12} />
                                            <span>Sửa SKU</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        ) : null
                      }
                    />
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table
            className={`admin-table ${loading && variantItems.length > 0 ? 'is-refreshing-pane' : ''}`}
          >
            <thead>
              <tr>
                <th style={{ width: '38px' }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAllPage}
                    aria-label="Chọn tất cả SKU trên trang"
                  />
                </th>
                <th>Mã SKU & Dòng máy</th>
                <th>Thông số phần cứng</th>
                <th>Giá bán (Chỉnh nhanh)</th>
                <th>Tồn kho & Kiểm kho</th>
                <th>Hiển thị</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && variantItems.length === 0 ? (
                <AdminTableRowsSkeleton columns={7} rows={6} />
              ) : variantItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}
                  >
                    Không tìm thấy mã SKU nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                variantItems.map(v => {
                  const isChecked = selectedVariantIds.includes(v.id);
                  const rowBusy = rowBusyIds.has(v.id);
                  const currentStockDraft = stockInputs[v.id] ?? String(v.stock);

                  return (
                    <tr
                      key={v.id}
                      style={{
                        background: isChecked ? 'var(--accent-amber-light)' : undefined,
                        opacity: rowBusy ? 0.7 : 1
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOneVariant(v.id)}
                          aria-label={`Chọn SKU ${v.sku}`}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="retro-icon-btn"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 800,
                              fontSize: '12.5px',
                              padding: '2px 4px'
                            }}
                            onClick={() => openEditVariantDrawer(v)}
                          >
                            {v.sku}
                          </button>
                          <Link
                            to={`/products/${v.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="retro-icon-btn"
                            title="Mở xem trên Storefront"
                          >
                            <IconExternalLink size={12} />
                          </Link>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                          }}
                        >
                          {v.brand
                            ? formatLaptopTitle(v.brand, v.model_name ?? '')
                            : v.laptop_id.slice(0, 8)}
                        </div>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {USAGE_LABELS[v.usage_category] ?? v.usage_category}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', lineHeight: 1.45 }}>
                        <div>
                          <strong>{v.cpu}</strong> · {v.gpu}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11.5px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          RAM {v.ram_gb}GB · SSD {v.ssd_gb}GB · {v.screen} · {v.color}
                        </div>
                      </td>
                      <td>
                        {editingPriceId === v.id ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              min={1000}
                              step={10000}
                              autoFocus
                              value={editingPriceValue}
                              onChange={e => setEditingPriceValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') void commitInlinePrice(v);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              className="admin-inline-edit-input"
                              style={{ width: '112px' }}
                            />
                            <button
                              type="button"
                              className="retro-btn retro-btn-primary retro-btn-sm"
                              onClick={() => void commitInlinePrice(v)}
                              aria-label="Lưu giá"
                            >
                              <IconCheck size={12} />
                            </button>
                            <button
                              type="button"
                              className="retro-icon-btn"
                              onClick={() => setEditingPriceId(null)}
                              aria-label="Hủy sửa giá"
                            >
                              <IconClose size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={rowBusy}
                            className="admin-inline-price-btn"
                            onClick={() => {
                              setEditingPriceId(v.id);
                              setEditingPriceValue(String(v.price_vnd));
                            }}
                            title="Bấm để chỉnh nhanh giá bán trực tiếp"
                          >
                            <span>{money(v.price_vnd)}</span>
                            <IconEdit size={11} />
                          </button>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div className="admin-inline-stepper">
                            <button
                              type="button"
                              disabled={rowBusy || v.stock <= 0}
                              className="retro-btn retro-btn-sm"
                              onClick={() =>
                                void quickPatchVariantRow(
                                  v,
                                  { stock: Math.max(0, v.stock - 1), stock_verified: true },
                                  'Giảm tồn -1'
                                )
                              }
                            >
                              -1
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={1000000}
                              disabled={rowBusy}
                              value={currentStockDraft}
                              onChange={e =>
                                setStockInputs(prev => ({
                                  ...prev,
                                  [v.id]: e.target.value
                                }))
                              }
                              onBlur={() => {
                                if (
                                  stockInputs[v.id] !== undefined &&
                                  Number(stockInputs[v.id]) !== v.stock
                                ) {
                                  void commitInlineStock(v);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                  void commitInlineStock(v);
                                }
                              }}
                              className="admin-inline-edit-input"
                              style={{ width: '62px', textAlign: 'center' }}
                              aria-label={`Tồn kho ${v.sku}`}
                            />
                            <button
                              type="button"
                              disabled={rowBusy}
                              className="retro-btn retro-btn-sm"
                              onClick={() =>
                                void quickPatchVariantRow(
                                  v,
                                  { stock: v.stock + 1, stock_verified: true },
                                  'Tăng tồn +1'
                                )
                              }
                            >
                              +1
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {v.stock_verified ? (
                              <span
                                className={`admin-badge ${
                                  v.stock === 0
                                    ? 'status-danger'
                                    : v.stock <= 2
                                      ? 'status-warning'
                                      : 'status-success'
                                }`}
                                style={{ fontSize: '10px' }}
                              >
                                {v.stock === 0
                                  ? 'Hết hàng'
                                  : v.stock <= 2
                                    ? 'Sắp hết'
                                    : 'Đã kiểm kho'}
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={rowBusy}
                                className="retro-btn retro-btn-amber retro-btn-sm"
                                style={{ fontSize: '10.5px', padding: '2px 7px' }}
                                onClick={() =>
                                  void quickPatchVariantRow(
                                    v,
                                    { stock_verified: true },
                                    'Đã xác thực kho'
                                  )
                                }
                              >
                                <IconCheck size={11} />
                                <span>Xác thực kho</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={rowBusy}
                          onClick={() =>
                            void quickPatchVariantRow(
                              v,
                              { is_active: !v.is_active },
                              v.is_active ? 'Đã tạm ẩn SKU' : 'Đã mở bán SKU'
                            )
                          }
                          className={`admin-badge ${v.is_active ? 'status-success' : 'status-neutral'}`}
                          style={{ cursor: 'pointer', boxShadow: 'none' }}
                          title="Bấm để bật/tắt mở bán SKU này"
                        >
                          {v.is_active ? 'ĐANG BÁN' : 'TẠM ẨN'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            className="retro-btn retro-btn-sm"
                            onClick={() => openEditVariantDrawer(v)}
                          >
                            <IconEdit size={12} />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            className="retro-btn retro-btn-sm"
                            onClick={() => handleDuplicateVariant(v)}
                            title="Nhân bản cấu hình sang SKU mới"
                          >
                            <IconCopy size={12} />
                          </button>
                          <button
                            type="button"
                            className="retro-btn retro-btn-danger retro-btn-sm"
                            onClick={() => setDeleteTarget({ kind: 'variants', item: v })}
                            title="Xóa hoặc Lưu trữ ẩn SKU"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Table Footer Pagination Bar */}
        <div className="admin-pagination-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span>
              Tổng cộng: <strong>{totalCount}</strong> {kind === 'laptops' ? 'dòng máy' : 'mã SKU'}{' '}
              · Trang <strong>{currentPageNumber}</strong> / <strong>{totalPages}</strong>
            </span>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setOffset(0);
                }}
                style={{
                  padding: '3px 6px',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '3px',
                  background: '#fff'
                }}
              >
                <option value={25}>25 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={offset === 0 || loading}
              className="retro-btn retro-btn-sm"
              onClick={() => setOffset(prev => Math.max(0, prev - pageSize))}
            >
              <IconChevronLeft size={14} />
              <span>Trang trước</span>
            </button>
            <button
              type="button"
              disabled={nextOffset === null || loading}
              className="retro-btn retro-btn-sm"
              onClick={() => {
                if (nextOffset !== null) setOffset(nextOffset);
              }}
            >
              <span>Trang tiếp</span>
              <IconChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer for Create / Edit Laptop or SKU */}
      {drawerMode !== 'closed' && (
        <div className="admin-drawer-backdrop" onClick={requestCloseDrawer}>
          <aside
            className="admin-drawer"
            style={{ position: 'relative' }}
            onClick={e => e.stopPropagation()}
            aria-label="Biểu mẫu chỉnh sửa sản phẩm"
          >
            <RetroTopProgress active={busy || uploadingCover} label="Đang lưu thay đổi danh mục" />
            <div className="admin-drawer-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <IconTag size={15} />
                <span>
                  {drawerMode === 'create_laptop' && 'THÊM DÒNG MÁY LAPTOP MỚI'}
                  {drawerMode === 'edit_laptop' &&
                    `HIỆU CHỈNH DÒNG MÁY // ${selectedLaptop?.brand ?? ''} ${selectedLaptop?.model_name ?? ''}`}
                  {drawerMode === 'create_variant' && 'THÊM PHIÊN BẢN CẤU HÌNH (SKU) MỚI'}
                  {drawerMode === 'edit_variant' &&
                    `HIỆU CHỈNH SKU // ${selectedVariant?.sku ?? ''}`}
                </span>
              </span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={requestCloseDrawer}
                aria-label="Đóng ngăn chỉnh sửa"
              >
                <IconClose size={16} />
              </button>
            </div>

            {(drawerMode === 'create_laptop' || drawerMode === 'edit_laptop') && laptopDraft && (
              <form
                onSubmit={saveLaptop}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
              >
                <div className="admin-drawer-body">
                  <div className="admin-grid-brand-model">
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Thương hiệu (Brand) *
                      </label>
                      <input
                        list="admin-brand-suggestions"
                        required
                        placeholder="Asus, Apple, Lenovo, MSI..."
                        value={laptopDraft.brand}
                        onChange={e => setLaptopDraft({ ...laptopDraft, brand: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                      <datalist id="admin-brand-suggestions">
                        {(meta?.brands ?? []).map(b => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Tên dòng máy (Model Name) *
                      </label>
                      <input
                        required
                        placeholder="VD: ThinkPad X1 Carbon Gen 12"
                        value={laptopDraft.model_name}
                        onChange={e =>
                          setLaptopDraft({ ...laptopDraft, model_name: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Cover Image Section */}
                  <div
                    style={{
                      padding: '12px',
                      background: 'var(--bg-surface-raised)',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        ẢNH ĐẠI DIỆN CHÍNH (ĐỒNG BỘ VỊ TRÍ #1 GALLERY)
                      </strong>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleCoverFileChange}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          disabled={uploadingCover}
                          className={`retro-btn retro-btn-sm ${uploadingCover ? 'is-busy' : ''}`}
                          onClick={() => coverFileInputRef.current?.click()}
                        >
                          {uploadingCover ? <IconSpinner size={13} /> : <IconUpload size={13} />}
                          <span>{uploadingCover ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
                        </button>
                        {selectedLaptop && (
                          <button
                            type="button"
                            className="retro-btn retro-btn-amber retro-btn-sm"
                            onClick={() => openGalleryModal(selectedLaptop)}
                          >
                            <IconImage size={13} />
                            <span>Thư viện ảnh ({selectedLaptop.images?.length ?? 0})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div
                        className="admin-catalog-thumb"
                        style={{ width: '84px', height: '60px' }}
                      >
                        <ProgressiveImage
                          src={catalogImageUrl(laptopDraft.image_url)}
                          alt="Xem trước"
                          fallback={<IconImage size={20} />}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="URL ảnh đại diện (https://... hoặc /api/v1/catalog/uploads/...)"
                        value={laptopDraft.image_url}
                        onChange={e =>
                          setLaptopDraft({ ...laptopDraft, image_url: e.target.value })
                        }
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '12.5px',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Mô tả điểm nổi bật & Thiết kế
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Mô tả chi tiết ưu điểm tản nhiệt, chất liệu vỏ, cổng kết nối, thời lượng pin..."
                      value={laptopDraft.description}
                      onChange={e =>
                        setLaptopDraft({ ...laptopDraft, description: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <label
                    className="admin-checkbox-row"
                    style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={laptopDraft.is_active}
                      onChange={e =>
                        setLaptopDraft({ ...laptopDraft, is_active: e.target.checked })
                      }
                    />
                    <span>Cho phép hiển thị dòng máy này trên Storefront & Trợ lý AI</span>
                  </label>

                  {selectedLaptop && (
                    <div
                      style={{ borderTop: '1.5px dashed var(--border-light)', paddingTop: '12px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}
                      >
                        <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                          CÁC PHIÊN BẢN SKU THUỘC DÒNG MÁY ({drawerChildVariants.length})
                        </strong>
                        <button
                          type="button"
                          className="retro-btn retro-btn-sm"
                          onClick={() => openCreateVariantDrawer(selectedLaptop.id)}
                        >
                          <IconPlus size={12} />
                          <span>Thêm SKU</span>
                        </button>
                      </div>
                      {drawerChildVariants.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                          Chưa có SKU nào. Hãy thêm ít nhất 1 SKU để sản phẩm xuất hiện trên
                          Storefront.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {drawerChildVariants.map(cv => (
                            <div
                              key={cv.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '7px 10px',
                                background: '#fff',
                                border: '1px solid var(--ink-border)',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            >
                              <div>
                                <strong style={{ fontFamily: 'var(--font-mono)' }}>{cv.sku}</strong>{' '}
                                · {cv.ram_gb}GB/{cv.ssd_gb}GB
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    color: 'var(--accent-primary)'
                                  }}
                                >
                                  {money(cv.price_vnd)}
                                </span>
                                <span>Tồn: {cv.stock}</span>
                                <button
                                  type="button"
                                  className="retro-btn retro-btn-sm"
                                  onClick={() => openEditVariantDrawer(cv)}
                                >
                                  Sửa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="admin-drawer-footer">
                  <div>
                    {selectedLaptop && (
                      <button
                        type="button"
                        className="retro-btn retro-btn-danger"
                        onClick={() => setDeleteTarget({ kind: 'laptops', item: selectedLaptop })}
                      >
                        <IconArchive size={14} />
                        <span>Xóa / Lưu trữ</span>
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="retro-btn" onClick={requestCloseDrawer}>
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className={`retro-btn retro-btn-primary ${busy ? 'is-busy' : ''}`}
                    >
                      {busy ? <IconSpinner size={14} /> : <IconCheck size={14} />}
                      <span>
                        {busy
                          ? 'Đang lưu...'
                          : drawerMode === 'create_laptop'
                            ? 'Tạo dòng máy'
                            : 'Lưu thay đổi'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {(drawerMode === 'create_variant' || drawerMode === 'edit_variant') && variantDraft && (
              <form
                onSubmit={saveVariant}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
              >
                <div className="admin-drawer-body">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Thuộc dòng máy Laptop (Parent Model) *
                    </label>
                    <select
                      required
                      value={variantDraft.laptop_id}
                      onChange={e =>
                        setVariantDraft({ ...variantDraft, laptop_id: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '4px',
                        fontSize: '13px',
                        background: '#fff'
                      }}
                    >
                      <option value="">-- Chọn dòng máy Laptop --</option>
                      {(meta?.laptop_options ?? []).map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.brand} — {opt.model_name} {!opt.is_active ? '(Lưu trữ)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-grid-2col">
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Mã định danh SKU *
                      </label>
                      <input
                        required
                        placeholder="VD: ASUS-TUF-F15-I7-16-512"
                        value={variantDraft.sku}
                        onChange={e => setVariantDraft({ ...variantDraft, sku: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Phân khúc sử dụng *
                      </label>
                      <select
                        value={variantDraft.usage_category}
                        onChange={e =>
                          setVariantDraft({
                            ...variantDraft,
                            usage_category: e.target.value as UsageCategory
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px',
                          background: '#fff'
                        }}
                      >
                        {usageCategories.map(cat => (
                          <option key={cat} value={cat}>
                            {USAGE_LABELS[cat]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-grid-2col">
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Vi xử lý (CPU) *
                      </label>
                      <input
                        required
                        placeholder="Intel Core Ultra 7 155H / Apple M3..."
                        value={variantDraft.cpu}
                        onChange={e => setVariantDraft({ ...variantDraft, cpu: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Card đồ họa (GPU) *
                      </label>
                      <input
                        required
                        placeholder="RTX 4060 8GB / Intel Arc Graphics..."
                        value={variantDraft.gpu}
                        onChange={e => setVariantDraft({ ...variantDraft, gpu: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-grid-2col">
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Dung lượng RAM (GB) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={1024}
                        value={variantDraft.ram_gb}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, ram_gb: Number(e.target.value) })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Ổ cứng SSD (GB — 1024 = 1TB) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={100000}
                        value={variantDraft.ssd_gb}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, ssd_gb: Number(e.target.value) })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="admin-grid-2col">
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Thông số màn hình *
                      </label>
                      <input
                        required
                        placeholder="15.6 inch 2.5K 165Hz 100% DCI-P3"
                        value={variantDraft.screen}
                        onChange={e => setVariantDraft({ ...variantDraft, screen: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Màu sắc vỏ máy *
                      </label>
                      <input
                        required
                        placeholder="Xám Titan / Đen / Bạc..."
                        value={variantDraft.color}
                        onChange={e => setVariantDraft({ ...variantDraft, color: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="admin-grid-2col"
                    style={{
                      padding: '12px',
                      background: 'var(--bg-surface-raised)',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Giá niêm yết (VNĐ) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1000}
                        max={1000000000}
                        step={10000}
                        value={variantDraft.price_vnd}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, price_vnd: Number(e.target.value) })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--accent-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          marginTop: '4px'
                        }}
                      >
                        Hiển thị: {money(Number(variantDraft.price_vnd) || 0)}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginBottom: '4px'
                        }}
                      >
                        Số lượng tồn kho vật lý *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={1000000}
                        value={variantDraft.stock}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, stock: Number(e.target.value) })
                        }
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '14px',
                          background: '#fff'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label
                      className="admin-checkbox-row"
                      style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={variantDraft.stock_verified}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, stock_verified: e.target.checked })
                        }
                      />
                      <span>Đã kiểm đếm xác thực tồn kho thực tế (cho phép chốt COD tự động)</span>
                    </label>

                    <label
                      className="admin-checkbox-row"
                      style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={variantDraft.is_active}
                        onChange={e =>
                          setVariantDraft({ ...variantDraft, is_active: e.target.checked })
                        }
                      />
                      <span>Mở bán mã SKU này trên Storefront</span>
                    </label>
                  </div>
                </div>

                <div className="admin-drawer-footer">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedVariant && (
                      <>
                        <button
                          type="button"
                          className="retro-btn retro-btn-danger"
                          onClick={() =>
                            setDeleteTarget({ kind: 'variants', item: selectedVariant })
                          }
                        >
                          <IconArchive size={14} />
                          <span>Xóa / Lưu trữ</span>
                        </button>
                        <button
                          type="button"
                          className="retro-btn"
                          onClick={() => handleDuplicateVariant(selectedVariant)}
                        >
                          <IconCopy size={14} />
                          <span>Nhân bản</span>
                        </button>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="retro-btn" onClick={requestCloseDrawer}>
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className={`retro-btn retro-btn-primary ${busy ? 'is-busy' : ''}`}
                    >
                      {busy ? <IconSpinner size={14} /> : <IconCheck size={14} />}
                      <span>
                        {busy
                          ? 'Đang lưu...'
                          : drawerMode === 'create_variant'
                            ? 'Tạo mã SKU'
                            : 'Lưu cấu hình'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </aside>
        </div>
      )}

      {/* Unsaved Changes Guard Modal */}
      {confirmDiscardOpen && (
        <div className="admin-modal-backdrop" onClick={() => setConfirmDiscardOpen(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '420px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>THAY ĐỔI CHƯA LƯU</span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setConfirmDiscardOpen(false)}
              >
                <IconClose size={14} />
              </button>
            </div>
            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}
            >
              <p style={{ margin: 0 }}>
                Biểu mẫu đang có thông tin thay đổi chưa được lưu. Bạn có muốn hủy bỏ thay đổi và
                đóng ngăn chỉnh sửa không?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => setConfirmDiscardOpen(false)}
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  type="button"
                  className="retro-btn retro-btn-danger"
                  onClick={forceCloseDrawer}
                >
                  Hủy thay đổi & Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Image Gallery Modal */}
      {showImageModal && galleryTargetLaptop && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !gallerySaving && setShowImageModal(false)}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: '680px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <RetroTopProgress
              active={uploadingGallery || gallerySaving}
              label="Đang xử lý thư viện ảnh"
            />
            <div className="retro-window-header">
              <span>
                THƯ VIỆN ẢNH // {galleryTargetLaptop.brand.toUpperCase()}{' '}
                {galleryTargetLaptop.model_name.toUpperCase()}
              </span>
              <button
                type="button"
                disabled={gallerySaving}
                className="retro-icon-btn on-dark"
                onClick={() => setShowImageModal(false)}
              >
                <IconClose size={15} />
              </button>
            </div>

            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Ảnh ở vị trí <strong>#1</strong> sẽ tự động làm ảnh bìa đại diện cho toàn bộ SKU
                  thuộc dòng máy này.
                </span>
                <div>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleGalleryFilesChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    disabled={uploadingGallery}
                    className={`retro-btn retro-btn-amber retro-btn-sm ${uploadingGallery ? 'is-busy' : ''}`}
                    onClick={() => galleryFileInputRef.current?.click()}
                  >
                    {uploadingGallery ? <IconSpinner size={13} /> : <IconUpload size={13} />}
                    <span>{uploadingGallery ? 'Đang tải tệp...' : 'Tải nhiều ảnh từ máy'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Hoặc dán URL ảnh (https://...)"
                  value={newImgUrl}
                  onChange={e => setNewImgUrl(e.target.value)}
                  style={{
                    flex: '2 1 220px',
                    padding: '7px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '12.5px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Chú thích ảnh (tùy chọn)"
                  value={newImgCaption}
                  onChange={e => setNewImgCaption(e.target.value)}
                  style={{
                    flex: '1 1 140px',
                    padding: '7px 10px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '12.5px'
                  }}
                />
                <button
                  type="button"
                  className="retro-btn retro-btn-sm"
                  onClick={() => {
                    if (!newImgUrl.trim()) return;
                    setGalleryImages(prev => [
                      ...prev,
                      { image_url: newImgUrl.trim(), caption: newImgCaption.trim() }
                    ]);
                    setNewImgUrl('');
                    setNewImgCaption('');
                  }}
                >
                  <IconPlus size={13} />
                  <span>Thêm URL</span>
                </button>
              </div>

              {galleryImages.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    border: '1.5px dashed var(--border-light)',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                >
                  Chưa có ảnh nào trong thư viện.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '340px',
                    overflowY: 'auto'
                  }}
                >
                  {galleryImages.map((img, idx) => (
                    <div
                      key={`${img.image_url}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        background: idx === 0 ? 'var(--accent-amber-light)' : '#fff',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '5px'
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '12px',
                          minWidth: '28px'
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <div className="admin-catalog-thumb">
                        <ProgressiveImage
                          src={catalogImageUrl(img.image_url)}
                          alt={img.caption}
                          fallback={<IconImage size={15} />}
                        />
                      </div>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={e =>
                          setGalleryImages(prev =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, caption: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Chú thích góc chụp..."
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid var(--ink-border)',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: '#fff'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {idx > 0 && (
                          <button
                            type="button"
                            className="retro-btn retro-btn-sm"
                            onClick={() =>
                              setGalleryImages(prev => {
                                const picked = prev[idx]!;
                                return [picked, ...prev.filter((_, i) => i !== idx)];
                              })
                            }
                            title="Đặt làm ảnh bìa #1"
                          >
                            Đặt ảnh bìa
                          </button>
                        )}
                        <button
                          type="button"
                          className="retro-btn retro-btn-danger retro-btn-sm"
                          onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                          aria-label="Xóa ảnh"
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  paddingTop: '6px'
                }}
              >
                <button
                  type="button"
                  disabled={gallerySaving}
                  className="retro-btn"
                  onClick={() => setShowImageModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={gallerySaving}
                  className={`retro-btn retro-btn-primary ${gallerySaving ? 'is-busy' : ''}`}
                  onClick={() => void handleSaveGallery()}
                >
                  {gallerySaving ? <IconSpinner size={14} /> : <IconCheck size={14} />}
                  <span>{gallerySaving ? 'Đang lưu...' : 'Lưu bộ sưu tập ảnh'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete / Archive Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '480px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <RetroTopProgress active={deleting} label="Đang xử lý lưu trữ sản phẩm" />
            <div className="retro-window-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconAlertTriangle size={15} />
                <span>XÁC NHẬN XÓA HOẶC LƯU TRỮ AN TOÀN</span>
              </span>
              <button
                type="button"
                disabled={deleting}
                className="retro-icon-btn on-dark"
                onClick={() => setDeleteTarget(null)}
              >
                <IconClose size={14} />
              </button>
            </div>
            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}
            >
              <p style={{ margin: 0, lineHeight: 1.55 }}>
                Bạn đang yêu cầu xóa{' '}
                <strong>
                  {deleteTarget.kind === 'laptops'
                    ? `${deleteTarget.item.brand} ${deleteTarget.item.model_name}`
                    : `mã SKU ${deleteTarget.item.sku}`}
                </strong>
                .
              </p>
              <div
                style={{
                  padding: '10px 12px',
                  background: 'var(--accent-amber-light)',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                Hệ thống tự động kiểm tra lịch sử đơn COD: nếu chưa từng phát sinh đơn hàng sẽ{' '}
                <strong>xóa vĩnh viễn</strong>; nếu đã có đơn lịch sử sẽ chuyển sang{' '}
                <strong>Lưu trữ ẩn (tồn kho = 0)</strong> để bảo toàn chứng từ kế toán.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  disabled={deleting}
                  className="retro-btn"
                  onClick={() => setDeleteTarget(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  className={`retro-btn retro-btn-danger ${deleting ? 'is-busy' : ''}`}
                  onClick={() => void executeDeleteOrArchive()}
                >
                  {deleting && <IconSpinner size={14} />}
                  <span>{deleting ? 'Đang xử lý...' : 'Xác nhận thực hiện'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FragmentRow({
  mainRow,
  expandedRow
}: {
  mainRow: React.ReactNode;
  expandedRow: React.ReactNode;
}) {
  return (
    <>
      {mainRow}
      {expandedRow}
    </>
  );
}
