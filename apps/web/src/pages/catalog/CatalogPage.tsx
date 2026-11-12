import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  catalogSortModes,
  type CatalogBrandFacet,
  type CatalogPage as CatalogData,
  type CatalogSortMode,
  type VariantSummary
} from '@lapbot/contracts';
import {
  CATEGORY_LABELS,
  formatStorageCapacity,
  VariantCard
} from '../../components/catalog/VariantCard.js';
import {
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconRefreshCw,
  IconRotateCcw,
  IconScale,
  IconSearch,
  IconShieldCheck,
  IconSliders,
  IconSparkleAi,
  IconSpinner,
  IconTrash,
  IconTruckCod,
  IconZap
} from '../../components/icons/RetroIcons.js';
import {
  KeycapHint,
  RetroSkeleton,
  RetroTopProgress,
  VariantCardSkeletonGrid,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import { useChat } from '../../features/chat/ChatContext.js';
import { apiJson } from '../../lib/api-client.js';
import { availabilityClass, availabilityLabel } from '../../lib/availability.js';
import { catalogImageUrl } from '../../lib/catalog-image.js';
import { formatLaptopTitle, money } from '../../lib/format.js';
import { usePresenceValue } from '../../lib/use-animated-presence.js';

const FALLBACK_BRANDS: CatalogBrandFacet[] = [
  { brand: 'Apple', count: 0 },
  { brand: 'Asus', count: 0 },
  { brand: 'Dell', count: 0 },
  { brand: 'HP', count: 0 },
  { brand: 'Lenovo', count: 0 },
  { brand: 'Acer', count: 0 },
  { brand: 'MSI', count: 0 },
  { brand: 'Lecoo', count: 0 }
];

const USAGE_OPTIONS = [
  { id: '', label: 'Tất cả nhu cầu' },
  { id: 'office_study', label: 'Văn phòng · Học tập' },
  { id: 'programming', label: 'Lập trình & Dev' },
  { id: 'gaming', label: 'Gaming RTX' },
  { id: 'graphic_creator', label: 'Đồ họa · Creator' },
  { id: 'business_ultrabook', label: 'Doanh nhân cao cấp' }
];

const PRICE_BRACKETS = [
  { id: 'all', label: 'Tất cả mức giá', min: undefined, max: undefined },
  { id: 'under_10', label: '< 10 triệu', min: undefined, max: 10000000 },
  { id: '10_18', label: '10 – 18 triệu', min: 10000000, max: 18000000 },
  { id: '18_28', label: '18 – 28 triệu', min: 18000000, max: 28000000 },
  { id: 'above_28', label: '> 28 triệu', min: 28000000, max: undefined }
];

const RAM_OPTIONS = [
  { id: '', label: 'Tất cả RAM' },
  { id: '8', label: 'RAM 8GB+' },
  { id: '16', label: 'RAM 16GB+' },
  { id: '32', label: 'RAM 32GB+' }
];

const SSD_OPTIONS = [
  { id: '', label: 'Tất cả SSD' },
  { id: '256', label: 'SSD 256GB+' },
  { id: '512', label: 'SSD 512GB+' },
  { id: '1024', label: 'SSD 1TB+' }
];

const SORT_OPTIONS: Array<{ id: CatalogSortMode; label: string }> = [
  { id: 'recommended', label: 'Đề xuất sẵn kho' },
  { id: 'price_asc', label: 'Giá thấp → cao' },
  { id: 'price_desc', label: 'Giá cao → thấp' },
  { id: 'ram_desc', label: 'RAM & SSD lớn nhất' },
  { id: 'newest', label: 'Mới cập nhật' }
];

const QUICK_STARTERS = [
  {
    code: 'F1',
    label: 'Học tập & Văn phòng (< 15tr)',
    prompt:
      'Tìm giúp tôi laptop phục vụ học tập, làm việc văn phòng giá dưới 15 triệu, pin tốt và bền bỉ'
  },
  {
    code: 'F2',
    label: 'Lập trình & Đa nhiệm (RAM 16GB+)',
    prompt:
      'Tư vấn laptop cho lập trình viên, RAM tối thiểu 16GB, CPU mạnh để chạy Docker và IDE mượt'
  },
  {
    code: 'F3',
    label: 'Gaming & Đồ họa RTX',
    prompt: 'Gợi ý laptop gaming và đồ họa có card rời khỏe trong tầm giá 20 đến 35 triệu'
  },
  {
    code: 'F4',
    label: 'Mỏng nhẹ Doanh nhân',
    prompt: 'Tìm laptop mỏng nhẹ cao cấp cho doanh nhân, màn hình đẹp, thiết kế sang trọng'
  }
];

const COMPARE_STORAGE_KEY = 'lapbot_compare_skus_v1';
const PAGE_SIZE = 24;

function loadInitialCompare(): VariantSummary[] {
  try {
    const raw = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 3) as VariantSummary[];
  } catch {
    return [];
  }
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<VariantSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [brandFacets, setBrandFacets] = useState<CatalogBrandFacet[]>(FALLBACK_BRANDS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [heroPrompt, setHeroPrompt] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchDraft, setSearchDraft] = useState(params.get('q') ?? '');
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [customMin, setCustomMin] = useState(
    params.get('min_price') ? String(Number(params.get('min_price')) / 1000000) : ''
  );
  const [customMax, setCustomMax] = useState(
    params.get('max_price') ? String(Number(params.get('max_price')) / 1000000) : ''
  );

  // Compare Deck state (up to 3 SKUs)
  const [compareItems, setCompareItems] = useState<VariantSummary[]>(loadInitialCompare);
  const [compareNotice, setCompareNotice] = useState('');
  const [showCompareModal, setShowCompareModal] = useState(false);

  const compareTrayPresence = usePresenceValue(compareItems.length > 0 ? compareItems : null, 160);
  const compareModalPresence = usePresenceValue(
    showCompareModal && compareItems.length >= 2 ? compareItems : null,
    155
  );
  const trayItems = compareTrayPresence.activeValue;
  const modalItems = compareModalPresence.activeValue;

  const chat = useChat();

  useEffect(() => {
    try {
      sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareItems));
    } catch {
      // ignore storage quota errors
    }
  }, [compareItems]);

  // Sync controlled inputs when URL params change externally (e.g. Back/Forward or Reset)
  const urlQ = params.get('q') ?? '';
  const urlMinPrice = params.get('min_price');
  const urlMaxPrice = params.get('max_price');

  useEffect(() => {
    setSearchDraft(urlQ);
  }, [urlQ]);

  useEffect(() => {
    setCustomMin(urlMinPrice ? String(Number(urlMinPrice) / 1000000) : '');
    setCustomMax(urlMaxPrice ? String(Number(urlMaxPrice) / 1000000) : '');
  }, [urlMinPrice, urlMaxPrice]);

  const updateFilter = useCallback(
    (updates: Record<string, string | undefined>, replace = false) => {
      const next = new URLSearchParams(params);
      next.delete('cursor');
      next.delete('offset');
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      setParams(next, { replace });
    },
    [params, setParams]
  );

  // Debounce live search (300ms) without snapping focus
  useEffect(() => {
    const trimmed = searchDraft.trim();
    if (trimmed === urlQ.trim()) return;
    const timer = window.setTimeout(() => {
      updateFilter({ q: trimmed || undefined }, true);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, urlQ, updateFilter]);

  const baseFilterQuery = useMemo(() => {
    const clean = new URLSearchParams();
    clean.set('limit', String(PAGE_SIZE));
    for (const key of [
      'q',
      'brand',
      'usage_category',
      'min_price',
      'max_price',
      'min_ram_gb',
      'min_ssd_gb',
      'available_only',
      'sort'
    ]) {
      const val = params.get(key);
      if (val) clean.set(key, val);
    }
    return clean.toString();
  }, [params]);

  // Fetch initial page whenever filter/sort params change
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    apiJson<CatalogData>(`/catalog/variants?${baseFilterQuery}`, { signal: controller.signal })
      .then(res => {
        setItems(res.items);
        setTotalCount(res.total_count ?? res.items.length);
        setNextOffset(res.next_offset ?? null);
        if (res.facets?.brands && res.facets.brands.length > 0) {
          setBrandFacets(res.facets.brands);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Không thể tải danh mục sản phẩm.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [baseFilterQuery]);

  const handleLoadMore = async () => {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      const res = await apiJson<CatalogData>(
        `/catalog/variants?${baseFilterQuery}&offset=${nextOffset}`
      );
      setItems(prev => {
        const seen = new Set(prev.map(i => i.variant_id));
        const appended = res.items.filter(i => !seen.has(i.variant_id));
        return [...prev, ...appended];
      });
      if (res.total_count !== undefined) setTotalCount(res.total_count);
      setNextOffset(res.next_offset ?? null);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải thêm cấu hình.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateFilter({ q: searchDraft.trim() || undefined });
  };

  const clearSearch = () => {
    setSearchDraft('');
    updateFilter({ q: undefined });
  };

  const currentBrand = params.get('brand') ?? '';
  const selectBrand = (brandName: string) => {
    updateFilter({ brand: brandName || undefined });
  };

  const currentUsage = params.get('usage_category') ?? '';
  const selectUsage = (u: string) => {
    updateFilter({ usage_category: u || undefined });
  };

  const activeBracket = (() => {
    if (!urlMinPrice && !urlMaxPrice) return 'all';
    if (!urlMinPrice && urlMaxPrice === '10000000') return 'under_10';
    if (urlMinPrice === '10000000' && urlMaxPrice === '18000000') return '10_18';
    if (urlMinPrice === '18000000' && urlMaxPrice === '28000000') return '18_28';
    if (urlMinPrice === '28000000' && !urlMaxPrice) return 'above_28';
    return 'custom';
  })();

  const selectPriceBracket = (b: (typeof PRICE_BRACKETS)[number]) => {
    setShowCustomPrice(false);
    updateFilter({
      min_price: b.min !== undefined ? String(b.min) : undefined,
      max_price: b.max !== undefined ? String(b.max) : undefined
    });
  };

  const applyCustomPrice = (e: FormEvent) => {
    e.preventDefault();
    const minV = customMin.trim() ? Math.round(Number(customMin) * 1000000) : undefined;
    const maxV = customMax.trim() ? Math.round(Number(customMax) * 1000000) : undefined;
    updateFilter({
      min_price: minV ? String(minV) : undefined,
      max_price: maxV ? String(maxV) : undefined
    });
  };

  const currentRam = params.get('min_ram_gb') ?? '';
  const selectRam = (r: string) => {
    updateFilter({ min_ram_gb: r || undefined });
  };

  const currentSsd = params.get('min_ssd_gb') ?? '';
  const selectSsd = (s: string) => {
    updateFilter({ min_ssd_gb: s || undefined });
  };

  const rawSort = params.get('sort') ?? 'recommended';
  const currentSort: CatalogSortMode = catalogSortModes.includes(rawSort as CatalogSortMode)
    ? (rawSort as CatalogSortMode)
    : 'recommended';

  const selectSort = (s: CatalogSortMode) => {
    updateFilter({ sort: s === 'recommended' ? undefined : s });
  };

  const inStockOnly = params.get('available_only') === 'true';
  const toggleInStock = () => {
    updateFilter({ available_only: inStockOnly ? undefined : 'true' });
  };

  const hasActiveFilters = Boolean(
    params.get('q') ||
      params.get('brand') ||
      params.get('usage_category') ||
      params.get('min_price') ||
      params.get('max_price') ||
      params.get('min_ram_gb') ||
      params.get('min_ssd_gb') ||
      params.get('available_only') ||
      (params.get('sort') && params.get('sort') !== 'recommended')
  );

  const resetAllFilters = () => {
    setParams({});
    setSearchDraft('');
    setShowCustomPrice(false);
    setCustomMin('');
    setCustomMax('');
  };

  function handleHeroSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = heroPrompt.trim();
    if (!prompt) {
      chat.openChat();
      return;
    }
    setHeroPrompt('');
    chat.openChat(undefined, prompt);
  }

  function handleQuickPrompt(promptText: string) {
    chat.openChat(undefined, promptText);
  }

  // Compare actions
  const comparedIdSet = useMemo(() => new Set(compareItems.map(i => i.variant_id)), [compareItems]);

  const handleToggleCompare = useCallback((variant: VariantSummary) => {
    setCompareNotice('');
    setCompareItems(prev => {
      if (prev.some(v => v.variant_id === variant.variant_id)) {
        return prev.filter(v => v.variant_id !== variant.variant_id);
      }
      if (prev.length >= 3) {
        setCompareNotice(
          'Khay đối chiếu hỗ trợ tối đa 3 cấu hình cùng lúc. Hãy bỏ bớt 1 máy để chọn máy mới.'
        );
        return prev;
      }
      return [...prev, variant];
    });
  }, []);

  const handleAskAiCompare = () => {
    if (compareItems.length === 0) return;
    const summaryLines = compareItems
      .map(
        (v, idx) =>
          `${idx + 1}) ${formatLaptopTitle(v.brand, v.model_name)} (SKU: ${v.sku} · ${v.cpu} · RAM ${v.ram_gb}GB · SSD ${formatStorageCapacity(v.ssd_gb)} · Giá ${money(v.price_vnd)})`
      )
      .join(' vs ');
    setShowCompareModal(false);
    chat.openChat(
      compareItems[0]?.variant_id,
      `So sánh chi tiết ưu nhược điểm và tư vấn nên chọn máy nào tối ưu nhất giữa: ${summaryLines}`
    );
  };

  // Best-value highlights inside Compare Matrix
  const comparedMatrixSource = modalItems ?? compareItems;
  const minComparedPrice =
    comparedMatrixSource.length >= 2
      ? Math.min(...comparedMatrixSource.map(v => v.price_vnd))
      : null;
  const maxComparedRam =
    comparedMatrixSource.length >= 2 && new Set(comparedMatrixSource.map(v => v.ram_gb)).size > 1
      ? Math.max(...comparedMatrixSource.map(v => v.ram_gb))
      : null;
  const maxComparedSsd =
    comparedMatrixSource.length >= 2 && new Set(comparedMatrixSource.map(v => v.ssd_gb)).size > 1
      ? Math.max(...comparedMatrixSource.map(v => v.ssd_gb))
      : null;

  const totalAllBrandsCount = useMemo(
    () => brandFacets.reduce((sum, b) => sum + b.count, 0),
    [brandFacets]
  );

  return (
    <div
      className="catalog-container"
      style={compareItems.length > 0 ? { paddingBottom: '120px' } : undefined}
    >
      {/* AI Hero Concierge Window */}
      <WindowFrame
        title="LAPBOT_ADVISOR.APP"
        subtitle="CHAT-TO-ORDER CONCIERGE"
        accent="amber"
        className="catalog-hero-window"
        rightSlot={
          chat.store && !chat.store.capabilities.ai_enabled ? (
            <span className="os-header-badge os-header-badge-amber">CSKH TRỰC TUYẾN</span>
          ) : (
            <span className="os-header-badge">AI READY</span>
          )
        }
      >
        <div className="hero-split-grid">
          <div className="hero-content">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              TRỢ LÝ AI CHUYÊN SÂU · TƯ VẤN ĐÚNG SKU · CHỐT ĐƠN COD & VIETQR
            </p>
            <h1>
              Chọn chiếc máy
              <br />
              phù hợp chuẩn xác với bạn.
            </h1>
            <p className="hero-desc">
              Mô tả nhu cầu học tập, code, đồ họa hoặc ngân sách bằng tiếng Việt tự nhiên. LapBot
              đối chiếu trực tiếp thông số thực tế từ kho và hỗ trợ đặt giao đồng kiểm ngay trong
              khung chat.
            </p>

            {/* AI Command Prompt Bar */}
            <form className="hero-ai-bar" onSubmit={handleHeroSubmit}>
              <div className="ai-bar-input-box">
                <span className="ai-prompt-glyph" aria-hidden="true">
                  &gt;_
                </span>
                <input
                  type="text"
                  aria-label="Nhập nhu cầu tư vấn laptop"
                  placeholder="Nhập nhu cầu & ngân sách (VD: Laptop lập trình 20 triệu RAM 16GB...)"
                  value={heroPrompt}
                  onChange={e => setHeroPrompt(e.target.value)}
                />
                <KeycapHint label="↵ ENTER" />
              </div>
              <button className="primary-button ai-bar-submit" type="submit">
                <IconZap size={16} />
                <span>Tư vấn qua Chat ngay</span>
              </button>
            </form>

            {/* Quick Starter Mechanical Keycaps */}
            <div className="hero-quick-chips">
              <span className="chips-label">PHÍM TẮT NHU CẦU:</span>
              {QUICK_STARTERS.map(item => (
                <button
                  key={item.code}
                  type="button"
                  className="hero-chip-btn"
                  onClick={() => handleQuickPrompt(item.prompt)}
                >
                  <span className="chip-key-code">{item.code}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hero-visual-stage" aria-hidden="true">
            <div className="hero-illustration-frame">
              <img
                src="/assets/retro-os/hero-concierge-illustration.jpg"
                alt=""
                width="440"
                height="260"
                loading="eager"
              />
            </div>
            <div className="hero-visual-caption">
              <IconSparkleAi size={15} />
              <span>
                {totalAllBrandsCount > 0
                  ? `${totalAllBrandsCount} cấu hình chính hãng`
                  : '100+ cấu hình chính hãng'}{' '}
                · Báo giá minh bạch theo từng SKU
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="hero-trust-strip">
          <div className="trust-pill">
            <IconShieldCheck size={16} />
            <span>Bảo hành chính hãng 12 tháng</span>
          </div>
          <div className="trust-pill">
            <IconRefreshCw size={16} />
            <span>1 đổi 1 trong 7 ngày lỗi NSX</span>
          </div>
          <div className="trust-pill">
            <IconTruckCod size={16} />
            <span>Đồng kiểm COD toàn quốc & VietQR</span>
          </div>
        </div>
      </WindowFrame>

      {/* Smart Neo-Retro Filter Console */}
      <WindowFrame
        title="FILTER_CONSOLE.SYS"
        subtitle={loading ? 'ĐANG LỌC KHO...' : `${totalCount} CẤU HÌNH PHÙ HỢP`}
        compact
        className="catalog-filter-window"
        rightSlot={
          <div className="filter-window-controls">
            {hasActiveFilters && (
              <button
                type="button"
                className="btn-clear-filters btn-with-icon"
                onClick={resetAllFilters}
                title="Xóa toàn bộ bộ lọc đang chọn"
              >
                <IconRotateCcw size={13} />
                <span>Xóa lọc</span>
              </button>
            )}
            <button
              type="button"
              className="filter-collapse-btn"
              onClick={() => setFiltersOpen(prev => !prev)}
              aria-expanded={filtersOpen}
            >
              {filtersOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              <span>{filtersOpen ? 'Thu gọn' : 'Bộ lọc'}</span>
            </button>
          </div>
        }
      >
        {filtersOpen && (
          <div className="smart-filter-console">
            {/* Top Bar: Search Input + In-stock Toggle */}
            <div className="filter-search-strip">
              <form className="filter-search-box" onSubmit={handleSearchSubmit}>
                <IconSearch size={16} className="filter-search-icon" />
                <input
                  type="text"
                  placeholder="Gõ để lọc tức thì theo tên máy, hãng, CPU, GPU, mã SKU..."
                  value={searchDraft}
                  onChange={e => setSearchDraft(e.target.value)}
                />
                {searchDraft && (
                  <button
                    type="button"
                    className="filter-search-clear"
                    onClick={clearSearch}
                    title="Xóa ô tìm kiếm"
                  >
                    <IconClose size={13} />
                  </button>
                )}
                <button type="submit" className="filter-search-btn" title="Tìm kiếm">
                  <KeycapHint label="↵ TÌM" />
                </button>
              </form>

              <button
                type="button"
                className={`stock-toggle-pill ${inStockOnly ? 'active' : ''}`}
                onClick={toggleInStock}
                title="Bật/tắt chỉ hiển thị các máy đang có sẵn hàng đã xác thực trong kho"
              >
                <span className="stock-led-dot" />
                <span>Chỉ máy sẵn kho</span>
              </button>
            </div>

            {/* Quick Filter Rows */}
            <div className="filter-pill-groups">
              {/* Row 1: Dynamic Brands from DB */}
              <div className="filter-row">
                <span className="filter-row-label">HÃNG:</span>
                <div className="filter-pill-list">
                  <button
                    type="button"
                    className={`filter-chip ${!currentBrand ? 'active' : ''}`}
                    onClick={() => selectBrand('')}
                  >
                    <span>Tất cả</span>
                    {totalAllBrandsCount > 0 && (
                      <span className="filter-brand-count">{totalAllBrandsCount}</span>
                    )}
                  </button>
                  {brandFacets.map(item => {
                    const active = currentBrand.toLowerCase() === item.brand.toLowerCase();
                    return (
                      <button
                        key={item.brand}
                        type="button"
                        className={`filter-chip ${active ? 'active' : ''}`}
                        onClick={() => selectBrand(item.brand)}
                      >
                        <span>{item.brand}</span>
                        {item.count > 0 && <span className="filter-brand-count">{item.count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Usage Category */}
              <div className="filter-row">
                <span className="filter-row-label">NHU CẦU:</span>
                <div className="filter-pill-list">
                  {USAGE_OPTIONS.map(u => {
                    const active = (u.id === '' && !currentUsage) || currentUsage === u.id;
                    return (
                      <button
                        key={u.id || 'all'}
                        type="button"
                        className={`filter-chip ${active ? 'active' : ''}`}
                        onClick={() => selectUsage(u.id)}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Price Brackets */}
              <div className="filter-row">
                <span className="filter-row-label">MỨC GIÁ:</span>
                <div className="filter-pill-list">
                  {PRICE_BRACKETS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      className={`filter-chip ${activeBracket === b.id && !showCustomPrice ? 'active' : ''}`}
                      onClick={() => selectPriceBracket(b)}
                    >
                      {b.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`filter-chip ${showCustomPrice || activeBracket === 'custom' ? 'active' : ''}`}
                    onClick={() => setShowCustomPrice(prev => !prev)}
                  >
                    Tùy chọn khoảng giá...
                  </button>
                </div>
              </div>

              {(showCustomPrice || activeBracket === 'custom') && (
                <form className="custom-price-strip" onSubmit={applyCustomPrice}>
                  <span className="custom-price-hint">Nhập mức giá (triệu VNĐ):</span>
                  <div className="custom-price-inputs">
                    <span>Từ</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.5"
                      placeholder="10"
                      value={customMin}
                      onChange={e => setCustomMin(e.target.value)}
                    />
                    <span>tr — Đến</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      step="0.5"
                      placeholder="25"
                      value={customMax}
                      onChange={e => setCustomMax(e.target.value)}
                    />
                    <span>tr</span>
                    <button type="submit" className="custom-price-apply-btn">
                      Áp dụng
                    </button>
                  </div>
                </form>
              )}

              {/* Row 4: RAM & SSD */}
              <div className="filter-row">
                <span className="filter-row-label">RAM & SSD:</span>
                <div className="filter-pill-list">
                  {RAM_OPTIONS.map(r => {
                    const active = (r.id === '' && !currentRam) || currentRam === r.id;
                    return (
                      <button
                        key={`ram-${r.id || 'all'}`}
                        type="button"
                        className={`filter-chip ${active ? 'active' : ''}`}
                        onClick={() => selectRam(r.id)}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                  <span
                    aria-hidden="true"
                    style={{
                      width: '1.5px',
                      height: '20px',
                      background: 'var(--border-light)',
                      margin: '0 4px',
                      alignSelf: 'center'
                    }}
                  />
                  {SSD_OPTIONS.map(s => {
                    const active = (s.id === '' && !currentSsd) || currentSsd === s.id;
                    return (
                      <button
                        key={`ssd-${s.id || 'all'}`}
                        type="button"
                        className={`filter-chip ${active ? 'active' : ''}`}
                        onClick={() => selectSsd(s.id)}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </WindowFrame>

      {compareNotice && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            background: 'var(--accent-amber-light)',
            border: '1.5px solid var(--ink-border)',
            borderRadius: 'var(--radius-card)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{compareNotice}</span>
          <button
            type="button"
            className="retro-icon-btn"
            onClick={() => setCompareNotice('')}
            aria-label="Đóng thông báo"
          >
            <IconClose size={14} />
          </button>
        </div>
      )}

      {/* Results Count & Sort Toolbar */}
      {loading && items.length === 0 && !error && (
        <div className="catalog-results-toolbar" aria-hidden="true">
          <RetroSkeleton variant="text" width={210} height={16} />
          <RetroSkeleton height={32} width={190} radius={6} />
        </div>
      )}

      {!error && items.length > 0 && (
        <div className="catalog-results-toolbar">
          <div
            className="catalog-results-count"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {loading && <IconSpinner size={14} />}
            <span>
              Đang hiển thị <strong>{items.length}</strong> / <strong>{totalCount}</strong> cấu hình
            </span>
            {currentBrand && <span> · Hãng: {currentBrand}</span>}
          </div>

          <label className="catalog-sort-select-wrap">
            <IconSliders size={14} />
            <span>SẮP XẾP:</span>
            <select
              value={currentSort}
              onChange={e => selectSort(e.target.value as CatalogSortMode)}
              aria-label="Sắp xếp danh mục laptop"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Non-blocking Top Progress when filtering/sorting existing items */}
      <RetroTopProgress
        active={loading && items.length > 0}
        label="Đang lọc và cập nhật danh sách cấu hình..."
      />

      {/* Initial Skeleton Grid (Zero CLS) */}
      {loading && items.length === 0 && !error && <VariantCardSkeletonGrid count={6} />}

      {error && (
        <div role="alert" className="catalog-error">
          <p>{error}</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => setParams(new URLSearchParams(params))}
          >
            Thử tải lại
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <WindowFrame title="SEARCH_RESULT // EMPTY" accent="warm" className="catalog-empty-window">
          <div className="catalog-empty">
            <img
              src="/assets/retro-os/empty-catalog-os.svg"
              alt=""
              width="140"
              height="105"
              className="empty-state-svg"
            />
            <h3>Không tìm thấy cấu hình khớp bộ lọc</h3>
            <p>
              Hãy thử nới rộng khoảng giá, xóa từ khóa hoặc nhắn cho LapBot AI để được gợi ý mẫu máy
              tương đương đang sẵn hàng.
            </p>
            <div className="actions">
              <button className="primary-button" type="button" onClick={resetAllFilters}>
                Xem tất cả cấu hình
              </button>
              <button
                type="button"
                onClick={() =>
                  chat.openChat(
                    undefined,
                    'Gợi ý giúp tôi các mẫu laptop đang sẵn hàng đáng mua nhất'
                  )
                }
              >
                Nhờ AI tìm máy thay thế
              </button>
            </div>
          </div>
        </WindowFrame>
      )}

      {!error && items.length > 0 && (
        <div className={`catalog-grid ${loading ? 'is-refreshing-pane' : ''}`.trim()}>
          {items.map(item => (
            <VariantCard
              key={item.variant_id}
              variant={item}
              isCompared={comparedIdSet.has(item.variant_id)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (nextOffset !== null || items.length > PAGE_SIZE) && (
        <div
          className="catalog-pagination"
          style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}
        >
          {nextOffset !== null && (
            <button
              type="button"
              disabled={loadingMore || loading}
              className={`primary-button btn-with-icon ${loadingMore ? 'is-busy' : ''}`.trim()}
              onClick={() => void handleLoadMore()}
            >
              {loadingMore && <IconSpinner size={15} />}
              <span>
                {loadingMore
                  ? 'Đang tải thêm cấu hình...'
                  : `Tải thêm cấu hình (còn ${Math.max(0, totalCount - items.length)} máy)`}
              </span>
              {!loadingMore && <IconArrowRight size={15} />}
            </button>
          )}
          {items.length > PAGE_SIZE && (
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Lên đầu danh mục
            </button>
          )}
        </div>
      )}

      {/* Sticky Bottom Hardware Comparison Tray (COMPARE_DECK.SYS) */}
      {trayItems && (
        <aside
          className={`compare-tray ${compareTrayPresence.stateClass}`}
          aria-label="Khay so sánh cấu hình laptop"
        >
          <div className="compare-tray-head">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconScale size={14} />
              <span>COMPARE_DECK.SYS // ĐÃ CHỌN {trayItems.length}/3 CẤU HÌNH</span>
            </span>
            <button
              type="button"
              className="retro-icon-btn on-dark"
              onClick={() => {
                setCompareItems([]);
                setCompareNotice('');
              }}
              title="Xóa toàn bộ máy trong khay so sánh"
            >
              <IconTrash size={13} />
              <span style={{ fontSize: '0.7rem' }}>Xóa khay</span>
            </button>
          </div>

          <div className="compare-tray-body">
            <div className="compare-tray-slots">
              {[0, 1, 2].map(slotIdx => {
                const slotItem = trayItems[slotIdx];
                if (!slotItem) {
                  return (
                    <div key={slotIdx} className="compare-tray-slot empty">
                      + Chọn thêm máy #{slotIdx + 1}
                    </div>
                  );
                }
                return (
                  <div key={slotItem.variant_id} className="compare-tray-slot">
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatLaptopTitle(slotItem.brand, slotItem.model_name)}
                      </strong>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 700
                        }}
                      >
                        {money(slotItem.price_vnd)} · {slotItem.ram_gb}GB/
                        {formatStorageCapacity(slotItem.ssd_gb)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="retro-icon-btn"
                      onClick={() => handleToggleCompare(slotItem)}
                      aria-label={`Bỏ ${slotItem.model_name} khỏi so sánh`}
                    >
                      <IconClose size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="retro-btn retro-btn-amber"
                onClick={handleAskAiCompare}
              >
                <IconSparkleAi size={14} />
                <span>Nhờ AI tư vấn</span>
              </button>
              <button
                type="button"
                disabled={trayItems.length < 2}
                className="retro-btn retro-btn-primary"
                onClick={() => setShowCompareModal(true)}
                title={
                  trayItems.length < 2
                    ? 'Chọn ít nhất 2 cấu hình để mở bảng đối chiếu song song'
                    : undefined
                }
              >
                <IconScale size={14} />
                <span>
                  {trayItems.length < 2 ? 'Chọn thêm 1 máy để so sánh' : 'Đối chiếu thông số'}
                </span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Side-by-Side Hardware Comparison Matrix Modal */}
      {modalItems && (
        <div
          className={`compare-matrix-backdrop ${compareModalPresence.stateClass}`}
          onClick={() => setShowCompareModal(false)}
        >
          <div className="compare-matrix-box" onClick={e => e.stopPropagation()}>
            <div className="retro-window-header">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <IconScale size={15} />
                <span>COMPARE_MATRIX.EXE // ĐỐI CHIẾU {modalItems.length} CẤU HÌNH PHẦN CỨNG</span>
              </span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setShowCompareModal(false)}
                aria-label="Đóng bảng so sánh"
              >
                <IconClose size={15} />
              </button>
            </div>

            <div className="compare-matrix-scroll">
              <table className="compare-matrix-table">
                <thead>
                  <tr>
                    <th>Tiêu chí phần cứng</th>
                    {modalItems.map(v => {
                      const img = catalogImageUrl(v.image_url);
                      return (
                        <td
                          key={v.variant_id}
                          style={{ minWidth: '220px', background: 'var(--bg-surface-raised)' }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '6px'
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.7rem',
                                  color: 'var(--text-muted)'
                                }}
                              >
                                {v.sku}
                              </span>
                              <button
                                type="button"
                                className="retro-icon-btn"
                                onClick={() => {
                                  handleToggleCompare(v);
                                  if (compareItems.length <= 2) setShowCompareModal(false);
                                }}
                                title="Bỏ máy này khỏi bảng"
                              >
                                <IconClose size={13} />
                              </button>
                            </div>
                            {img && (
                              <img
                                src={img}
                                alt={v.model_name}
                                style={{
                                  width: '120px',
                                  height: '76px',
                                  objectFit: 'contain',
                                  margin: '0 auto'
                                }}
                              />
                            )}
                            <Link
                              to={`/products/${v.variant_id}`}
                              onClick={() => setShowCompareModal(false)}
                              style={{
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                textDecoration: 'underline'
                              }}
                            >
                              {formatLaptopTitle(v.brand, v.model_name)}
                            </Link>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Giá niêm yết</th>
                    {modalItems.map(v => (
                      <td
                        key={v.variant_id}
                        className={
                          minComparedPrice !== null && v.price_vnd === minComparedPrice
                            ? 'compare-best-cell'
                            : undefined
                        }
                      >
                        <strong
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            color: 'var(--accent-primary)'
                          }}
                        >
                          {money(v.price_vnd)}
                        </strong>
                        {minComparedPrice !== null && v.price_vnd === minComparedPrice && (
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.68rem',
                              color: 'var(--status-success)'
                            }}
                          >
                            GIÁ TỐT NHẤT NHÓM
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Tình trạng kho</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id}>
                        <span
                          className={`stock-status ${availabilityClass(v.availability_status)}`}
                        >
                          {availabilityLabel(v.availability_status) ??
                            (v.in_stock ? 'Sẵn kho' : 'Tạm hết')}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Nhu cầu tối ưu</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id}>
                        {CATEGORY_LABELS[v.usage_category] ?? v.usage_category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Vi xử lý (CPU)</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id} style={{ fontWeight: 600 }}>
                        {v.cpu}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Đồ họa (GPU)</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id}>
                        {v.gpu && v.gpu !== 'Chưa xác minh' ? v.gpu : 'Đồ họa tích hợp'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Bộ nhớ RAM</th>
                    {modalItems.map(v => (
                      <td
                        key={v.variant_id}
                        className={
                          maxComparedRam !== null && v.ram_gb === maxComparedRam
                            ? 'compare-best-cell'
                            : undefined
                        }
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      >
                        {v.ram_gb} GB
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Ổ cứng SSD</th>
                    {modalItems.map(v => (
                      <td
                        key={v.variant_id}
                        className={
                          maxComparedSsd !== null && v.ssd_gb === maxComparedSsd
                            ? 'compare-best-cell'
                            : undefined
                        }
                        style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      >
                        {formatStorageCapacity(v.ssd_gb)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Màn hình & Màu</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id}>
                        <div>{v.screen}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Màu: {v.color}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Hành động</th>
                    {modalItems.map(v => (
                      <td key={v.variant_id}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {v.in_stock ? (
                            <Link
                              to={`/checkout/${v.variant_id}`}
                              className="retro-btn retro-btn-primary retro-btn-sm"
                              onClick={() => setShowCompareModal(false)}
                            >
                              <IconZap size={12} />
                              <span>Mua ngay</span>
                            </Link>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Tạm hết hàng
                            </span>
                          )}
                          <Link
                            to={`/products/${v.variant_id}`}
                            className="retro-btn retro-btn-sm"
                            onClick={() => setShowCompareModal(false)}
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="admin-drawer-footer">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Cần phân tích sâu hiệu năng thực tế (code, render, pin, nhiệt độ) giữa{' '}
                {modalItems.length} mẫu máy này?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="retro-btn"
                  onClick={() => setShowCompareModal(false)}
                >
                  Đóng bảng
                </button>
                <button
                  type="button"
                  className="retro-btn retro-btn-amber"
                  onClick={handleAskAiCompare}
                >
                  <IconSparkleAi size={15} />
                  <span>Nhờ LapBot AI phân tích & chọn máy tối ưu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
