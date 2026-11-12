import {
  catalogSortModes,
  type CatalogBrandFacet,
  type CatalogPage,
  type CatalogSortMode,
  type VariantDetail,
  type VariantSummary,
  type UsageCategory
} from '@lapbot/contracts';
import { pool } from '../../db/pool.js';
import { AppError, notFound } from '../../lib/errors.js';
import { positiveInteger, stringQuery, uuid } from '../../lib/validate.js';

const columns = `v.id AS variant_id,v.laptop_id,v.sku,l.brand,l.model_name,v.cpu,v.gpu,v.ram_gb,v.ssd_gb,
  v.screen,v.color,v.usage_category,v.price_vnd,(v.stock_verified AND v.stock > 0) AS in_stock,
  CASE WHEN v.stock_verified AND v.stock > 0 THEN 'in_stock'
       WHEN v.stock_verified OR v.source_in_stock IS FALSE THEN 'out_of_stock'
       ELSE 'pending_verification' END AS availability_status,l.image_url`;
type Raw = Record<string, unknown>;
const asSummary = (row: Raw): VariantSummary => row as unknown as VariantSummary;

let cachedBrandFacets: { expiresAt: number; brands: CatalogBrandFacet[] } | null = null;

export function invalidatePublicCatalogFacetsCache(): void {
  cachedBrandFacets = null;
}

async function getPublicBrandFacets(): Promise<CatalogBrandFacet[]> {
  const now = Date.now();
  if (cachedBrandFacets && cachedBrandFacets.expiresAt > now) {
    return cachedBrandFacets.brands;
  }
  const res = await pool.query<{ brand: string; count: number }>(`
    SELECT l.brand, COUNT(*)::int AS count
    FROM laptop_variants v
    JOIN laptops l ON l.id = v.laptop_id
    WHERE l.is_active = true
      AND v.is_active = true
      AND (v.stock_verified = true OR v.source_in_stock IS FALSE)
    GROUP BY l.brand
    ORDER BY l.brand ASC
  `);
  const brands = res.rows.map(r => ({ brand: r.brand, count: Number(r.count) }));
  cachedBrandFacets = { expiresAt: now + 10_000, brands };
  return brands;
}

function nonNegativeInt(raw: unknown, name: string, max: number): number {
  if (raw === '0' || raw === 0) return 0;
  return positiveInteger(raw, name, max);
}

function cursorEncode(price: number, id: string): string {
  return Buffer.from(JSON.stringify([price, id])).toString('base64url');
}
function cursorDecode(raw: string): [number, string] {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      Number.isInteger(parsed[0]) &&
      parsed[0] >= 1 &&
      parsed[0] <= 1000000000 &&
      uuid(parsed[1])
    )
      return [parsed[0], parsed[1]];
  } catch {
    /* handled below */
  }
  throw new AppError(400, 'INVALID_CURSOR', 'Cursor không hợp lệ.');
}

export type CatalogFilter = {
  q?: string;
  min_price?: number;
  max_price?: number;
  min_ram_gb?: number;
  min_ssd_gb?: number;
  brand?: string;
  usage_category?: UsageCategory;
  available_only?: boolean;
  sort?: CatalogSortMode;
  limit: number;
  offset?: number;
  cursor?: [number, string];
};

export function parseCatalogQuery(query: Raw): CatalogFilter {
  const allowed = new Set([
    'q',
    'min_price',
    'max_price',
    'min_ram_gb',
    'min_ssd_gb',
    'brand',
    'usage_category',
    'available_only',
    'sort',
    'limit',
    'offset',
    'cursor'
  ]);
  for (const key of Object.keys(query))
    if (!allowed.has(key))
      throw new AppError(400, 'INVALID_QUERY', `Query ${key} không được hỗ trợ.`);
  const min_price =
    query.min_price === undefined
      ? undefined
      : positiveInteger(query.min_price, 'min_price', 1000000000);
  const max_price =
    query.max_price === undefined
      ? undefined
      : positiveInteger(query.max_price, 'max_price', 1000000000);
  if (min_price !== undefined && max_price !== undefined && min_price > max_price)
    throw new AppError(400, 'INVALID_QUERY', 'min_price lớn hơn max_price.');
  const usage_category = stringQuery(query.usage_category, 'usage_category', 40);
  const usages = ['office_study', 'gaming', 'graphic_creator', 'programming', 'business_ultrabook'];
  if (usage_category && !usages.includes(usage_category))
    throw new AppError(400, 'INVALID_QUERY', 'usage_category không hợp lệ.');
  const available = query.available_only;
  if (available !== undefined && available !== 'true' && available !== 'false')
    throw new AppError(400, 'INVALID_QUERY', 'available_only không hợp lệ.');
  const sortRaw = stringQuery(query.sort, 'sort', 32);
  if (sortRaw && !catalogSortModes.includes(sortRaw as CatalogSortMode)) {
    throw new AppError(400, 'INVALID_QUERY', 'sort không hợp lệ.');
  }
  const limit = query.limit === undefined ? 20 : positiveInteger(query.limit, 'limit', 40);
  if (limit < 1) throw new AppError(400, 'INVALID_QUERY', 'limit phải ít nhất là 1.');
  const cursor = stringQuery(query.cursor, 'cursor', 256);
  const offset =
    query.offset === undefined ? undefined : nonNegativeInt(query.offset, 'offset', 10000);
  if (cursor && offset !== undefined) {
    throw new AppError(400, 'INVALID_QUERY', 'Không dùng đồng thời cursor và offset.');
  }
  return {
    q: stringQuery(query.q, 'q', 100),
    min_price,
    max_price,
    min_ram_gb:
      query.min_ram_gb === undefined
        ? undefined
        : positiveInteger(query.min_ram_gb, 'min_ram_gb', 128),
    min_ssd_gb:
      query.min_ssd_gb === undefined
        ? undefined
        : positiveInteger(query.min_ssd_gb, 'min_ssd_gb', 100000),
    brand: stringQuery(query.brand, 'brand', 40),
    usage_category: usage_category as UsageCategory | undefined,
    available_only: available === 'true',
    sort: sortRaw as CatalogSortMode | undefined,
    limit,
    offset,
    cursor: cursor ? cursorDecode(cursor) : undefined
  };
}

export async function listVariants(filter: CatalogFilter): Promise<CatalogPage> {
  const baseArgs: unknown[] = [];
  const baseClauses = [
    'l.is_active = true',
    'v.is_active = true',
    '(v.stock_verified = true OR v.source_in_stock IS FALSE)'
  ];
  const add = (value: unknown, sql: (n: number) => string) => {
    baseArgs.push(value);
    baseClauses.push(sql(baseArgs.length));
  };
  if (filter.q)
    add(
      `%${filter.q.replace(/[\\%_]/g, '\\$&')}%`,
      n =>
        `(l.brand ILIKE $${n} ESCAPE '\\' OR l.model_name ILIKE $${n} ESCAPE '\\' OR v.sku ILIKE $${n} ESCAPE '\\' OR v.cpu ILIKE $${n} ESCAPE '\\' OR v.gpu ILIKE $${n} ESCAPE '\\')`
    );
  if (filter.min_price !== undefined) add(filter.min_price, n => `v.price_vnd >= $${n}`);
  if (filter.max_price !== undefined) add(filter.max_price, n => `v.price_vnd <= $${n}`);
  if (filter.min_ram_gb !== undefined) add(filter.min_ram_gb, n => `v.ram_gb >= $${n}`);
  if (filter.min_ssd_gb !== undefined) add(filter.min_ssd_gb, n => `v.ssd_gb >= $${n}`);
  if (filter.brand) {
    const normalizedBrand =
      filter.brand.trim().toLowerCase() === 'macbook' ? 'Apple' : filter.brand.trim();
    add(normalizedBrand, n => `LOWER(l.brand) = LOWER($${n})`);
  }
  if (filter.usage_category) add(filter.usage_category, n => `v.usage_category = $${n}`);
  if (filter.available_only) baseClauses.push('v.stock_verified = true AND v.stock > 0');

  const itemArgs = [...baseArgs];
  const itemClauses = [...baseClauses];

  const sortMode: CatalogSortMode = filter.cursor ? 'price_asc' : (filter.sort ?? 'price_asc');
  let orderBySql = 'v.price_vnd ASC, v.id ASC';
  if (sortMode === 'price_desc') {
    orderBySql = 'v.price_vnd DESC, v.id DESC';
  } else if (sortMode === 'newest') {
    orderBySql = 'v.created_at DESC, v.id DESC';
  } else if (sortMode === 'ram_desc') {
    orderBySql =
      '(v.stock_verified AND v.stock > 0) DESC, v.ram_gb DESC, v.ssd_gb DESC, v.price_vnd ASC, v.id ASC';
  } else if (sortMode === 'recommended') {
    orderBySql = '(v.stock_verified AND v.stock > 0) DESC, v.price_vnd ASC, v.id ASC';
  }

  if (filter.cursor) {
    itemArgs.push(filter.cursor[0], filter.cursor[1]);
    itemClauses.push(`(v.price_vnd, v.id) > ($${itemArgs.length - 1}, $${itemArgs.length}::uuid)`);
  }

  const effectiveOffset = filter.cursor ? 0 : (filter.offset ?? 0);
  itemArgs.push(filter.limit + 1);
  const limitParam = itemArgs.length;
  let paginationTail = `LIMIT $${limitParam}`;
  if (!filter.cursor && effectiveOffset > 0) {
    itemArgs.push(effectiveOffset);
    paginationTail += ` OFFSET $${itemArgs.length}`;
  }

  const [result, countRes, brands] = await Promise.all([
    pool.query(
      `SELECT ${columns}
       FROM laptop_variants v
       JOIN laptops l ON l.id = v.laptop_id
       WHERE ${itemClauses.join(' AND ')}
       ORDER BY ${orderBySql}
       ${paginationTail}`,
      itemArgs
    ),
    pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM laptop_variants v
       JOIN laptops l ON l.id = v.laptop_id
       WHERE ${baseClauses.join(' AND ')}`,
      baseArgs
    ),
    getPublicBrandFacets()
  ]);

  const rows = result.rows.slice(0, filter.limit).map(asSummary);
  const hasMore = result.rows.length > filter.limit;
  const last = rows.at(-1);
  const totalCount = Number(countRes.rows[0]?.total ?? 0);

  return {
    items: rows,
    next_cursor:
      hasMore && last && sortMode === 'price_asc' && filter.offset === undefined
        ? cursorEncode(last.price_vnd, last.variant_id)
        : null,
    total_count: totalCount,
    next_offset: !filter.cursor && hasMore ? effectiveOffset + rows.length : null,
    facets: { brands }
  };
}
export async function getVariant(variantId: string): Promise<VariantDetail> {
  const result = await pool.query(
    `SELECT ${columns},l.description FROM laptop_variants v JOIN laptops l ON l.id=v.laptop_id
    WHERE v.id=$1 AND v.is_active=true AND l.is_active=true AND (v.stock_verified = true OR v.source_in_stock IS FALSE)`,
    [variantId]
  );
  if (!result.rowCount) throw notFound();
  const row = result.rows[0] as VariantSummary & { description: string };
  const images = await pool.query(
    'SELECT image_url,caption FROM laptop_images WHERE laptop_id=$1 ORDER BY position',
    [row.laptop_id]
  );
  return {
    ...row,
    images: images.rows.length
      ? images.rows
      : row.image_url
        ? [{ image_url: row.image_url, caption: `${row.model_name} · Ảnh 1/1` }]
        : []
  };
}
export async function listLaptopVariants(laptopId: string): Promise<VariantSummary[]> {
  const result = await pool.query(
    `SELECT ${columns} FROM laptop_variants v JOIN laptops l ON l.id=v.laptop_id
    WHERE v.laptop_id=$1 AND v.is_active=true AND l.is_active=true AND (v.stock_verified = true OR v.source_in_stock IS FALSE) ORDER BY v.price_vnd,v.id LIMIT 20`,
    [laptopId]
  );
  return result.rows.map(asSummary);
}

const BRAND_SERIES_ALIASES: Record<string, { brand: string; seriesToken?: string }> = {
  macbook: { brand: 'Apple' },
  mac: { brand: 'Apple' },
  apple: { brand: 'Apple' },
  thinkpad: { brand: 'Lenovo', seriesToken: 'thinkpad' },
  ideapad: { brand: 'Lenovo', seriesToken: 'ideapad' },
  legion: { brand: 'Lenovo', seriesToken: 'legion' },
  loq: { brand: 'Lenovo', seriesToken: 'loq' },
  yoga: { brand: 'Lenovo', seriesToken: 'yoga' },
  rog: { brand: 'Asus', seriesToken: 'rog' },
  tuf: { brand: 'Asus', seriesToken: 'tuf' },
  vivobook: { brand: 'Asus', seriesToken: 'vivobook' },
  zenbook: { brand: 'Asus', seriesToken: 'zenbook' },
  expertbook: { brand: 'Asus', seriesToken: 'expertbook' },
  xps: { brand: 'Dell', seriesToken: 'xps' },
  latitude: { brand: 'Dell', seriesToken: 'latitude' },
  inspiron: { brand: 'Dell', seriesToken: 'ins' },
  vostro: { brand: 'Dell', seriesToken: 'vostro' },
  precision: { brand: 'Dell', seriesToken: 'precision' },
  alienware: { brand: 'Dell', seriesToken: 'alienware' },
  victus: { brand: 'HP', seriesToken: 'victus' },
  omen: { brand: 'HP', seriesToken: 'omen' },
  elitebook: { brand: 'HP', seriesToken: 'elitebook' },
  probook: { brand: 'HP', seriesToken: 'probook' },
  pavilion: { brand: 'HP', seriesToken: 'pavilion' },
  envy: { brand: 'HP', seriesToken: 'envy' },
  dragonfly: { brand: 'HP', seriesToken: 'dragonfly' },
  nitro: { brand: 'Acer', seriesToken: 'nitro' },
  aspire: { brand: 'Acer', seriesToken: 'aspire' },
  swift: { brand: 'Acer', seriesToken: 'swift' },
  predator: { brand: 'Acer', seriesToken: 'predator' },
  surface: { brand: 'Microsoft' },
  gram: { brand: 'LG', seriesToken: 'gram' }
};

const KEYWORD_STOPWORDS = new Set([
  'laptop',
  'may',
  'máy',
  'tinh',
  'tính',
  'xach',
  'xách',
  'tay',
  'mong',
  'mỏng',
  'nhe',
  'nhẹ',
  'pin',
  'trau',
  'trâu',
  'tot',
  'tốt',
  'ben',
  'bền',
  'dep',
  'đẹp',
  'gia',
  'giá',
  're',
  'rẻ',
  'cau',
  'cấu',
  'hinh',
  'hình',
  'cho',
  'sinh',
  'vien',
  'viên',
  'van',
  'văn',
  'phong',
  'phòng',
  'chinh',
  'chính',
  'hang',
  'hãng'
]);

const CATEGORY_FALLBACKS: Record<UsageCategory, UsageCategory[]> = {
  programming: ['programming', 'business_ultrabook', 'office_study'],
  business_ultrabook: ['business_ultrabook', 'office_study', 'programming'],
  graphic_creator: ['graphic_creator', 'gaming', 'programming'],
  gaming: ['gaming', 'graphic_creator'],
  office_study: ['office_study', 'business_ultrabook']
};

export type AiCatalogSearchFilter = {
  usage_category?: UsageCategory;
  min_price?: number;
  max_price?: number;
  min_ram_gb?: number;
  min_ssd_gb?: number;
  preferred_brand?: string;
  keyword?: string;
  sort_by?: 'best_match' | 'price_asc' | 'price_desc';
  limit?: number;
};

function tokenizeKeyword(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .trim()
    .split(/[\s,;/]+/)
    .map(token => token.trim())
    .filter(token => token.length >= 2 && !KEYWORD_STOPWORDS.has(token.toLowerCase()))
    .slice(0, 5);
}

function scoreVariantForAi(item: VariantSummary, filter: AiCatalogSearchFilter): number {
  let score = 0;

  // 1. Availability always dominates so ready-to-buy stock comes first
  if (item.in_stock) score += 10_000;
  else if (item.availability_status === 'pending_verification') score += 200;

  // 2. Category & form-factor fit
  if (filter.usage_category) {
    if (item.usage_category === filter.usage_category) {
      score += 180;
    } else if (
      filter.usage_category === 'business_ultrabook' &&
      /\b(air|xps|thinkpad|elitebook|dragonfly|zenbook|swift|gram|latitude)\b/i.test(
        item.model_name
      )
    ) {
      score += 165;
    }
  }

  // 3. Budget fit (never exceeds max_price because SQL enforces hard ceiling)
  if (filter.max_price !== undefined) {
    const target =
      filter.min_price !== undefined
        ? filter.min_price + (filter.max_price - filter.min_price) * 0.65
        : filter.max_price * 0.85;
    const distanceRatio = Math.abs(item.price_vnd - target) / Math.max(target, 1);
    score += Math.max(0, Math.round(300 * (1 - distanceRatio)));
  } else if (filter.min_price !== undefined) {
    const target = filter.min_price * 1.15;
    const distanceRatio = Math.abs(item.price_vnd - target) / Math.max(target, 1);
    score += Math.max(0, Math.round(220 * (1 - distanceRatio)));
  } else {
    const midDistance = Math.abs(item.price_vnd - 18_000_000) / 18_000_000;
    score += Math.max(0, Math.round(100 * (1 - midDistance)));
  }

  // 4. Hardware capability value bonus
  score += Math.min(item.ram_gb, 64) * 4;
  score += Math.round(Math.min(item.ssd_gb, 2048) / 16);

  const cpuSpec = `${item.cpu} ${item.model_name}`;
  if (
    /\b(M[1-4](?:\s+(?:Pro|Max|Ultra))?|Ultra\s*[579]|i[579]-1[234]\d{2,3}|Ryzen\s*[579]\s*[5678]\d{3}|Core\s+[579]\s+\d{3})/i.test(
      cpuSpec
    )
  ) {
    score += 75;
  }

  if (
    (filter.usage_category === 'gaming' || filter.usage_category === 'graphic_creator') &&
    /\b(RTX|Quadro|RX\s*\d{3,4})\b/i.test(`${item.gpu} ${item.model_name}`)
  ) {
    score += 95;
  }

  return score;
}

function rankAndDiversify(
  items: VariantSummary[],
  filter: AiCatalogSearchFilter,
  limit: number
): VariantSummary[] {
  const sortMode = filter.sort_by ?? 'best_match';
  const sorted = [...items].sort((a, b) => {
    const availA = a.in_stock ? 2 : a.availability_status === 'pending_verification' ? 1 : 0;
    const availB = b.in_stock ? 2 : b.availability_status === 'pending_verification' ? 1 : 0;
    if (availA !== availB) return availB - availA;

    if (sortMode === 'price_asc')
      return a.price_vnd - b.price_vnd || a.variant_id.localeCompare(b.variant_id);
    if (sortMode === 'price_desc')
      return b.price_vnd - a.price_vnd || a.variant_id.localeCompare(b.variant_id);

    const diff = scoreVariantForAi(b, filter) - scoreVariantForAi(a, filter);
    return diff !== 0 ? diff : b.price_vnd - a.price_vnd;
  });

  const chosen: VariantSummary[] = [];
  const seenLaptops = new Set<string>();
  const overflow: VariantSummary[] = [];

  for (const item of sorted) {
    if (!seenLaptops.has(item.laptop_id)) {
      seenLaptops.add(item.laptop_id);
      chosen.push(item);
      if (chosen.length === limit) return chosen;
    } else {
      overflow.push(item);
    }
  }

  for (const extra of overflow) {
    if (chosen.length === limit) break;
    chosen.push(extra);
  }
  return chosen;
}

export async function searchVariantsForAi(
  filter: AiCatalogSearchFilter
): Promise<VariantSummary[]> {
  const limit = filter.limit && filter.limit > 0 ? Math.min(filter.limit, 10) : 3;
  const candidatePoolSize = Math.max(limit * 8, 24);

  let normalizedBrand: string | undefined;
  const extraTokens: string[] = [];
  if (filter.preferred_brand) {
    const rawBrand = filter.preferred_brand.trim();
    const alias = BRAND_SERIES_ALIASES[rawBrand.toLowerCase()];
    if (alias) {
      normalizedBrand = alias.brand;
      if (alias.seriesToken) extraTokens.push(alias.seriesToken);
    } else {
      normalizedBrand = rawBrand;
    }
  }

  const tokens = [...new Set([...extraTokens, ...tokenizeKeyword(filter.keyword)])];

  const buildQuery = (opts: {
    usageOverride?: UsageCategory | UsageCategory[];
    matchAnyToken?: boolean;
  }) => {
    const args: unknown[] = [];
    const clauses = [
      'l.is_active = true',
      'v.is_active = true',
      '(v.stock_verified = true OR v.source_in_stock IS FALSE)'
    ];
    const add = (value: unknown, sql: (n: number) => string) => {
      args.push(value);
      clauses.push(sql(args.length));
    };

    if (filter.min_price !== undefined) add(filter.min_price, n => `v.price_vnd >= $${n}`);
    if (filter.max_price !== undefined) add(filter.max_price, n => `v.price_vnd <= $${n}`);
    if (filter.min_ram_gb !== undefined) add(filter.min_ram_gb, n => `v.ram_gb >= $${n}`);
    if (filter.min_ssd_gb !== undefined) add(filter.min_ssd_gb, n => `v.ssd_gb >= $${n}`);
    if (normalizedBrand) {
      add(normalizedBrand, n => `LOWER(l.brand) = LOWER($${n})`);
    }

    if (opts.usageOverride) {
      if (Array.isArray(opts.usageOverride)) {
        add(opts.usageOverride, n => `v.usage_category = ANY($${n})`);
      } else {
        add(opts.usageOverride, n => `v.usage_category = $${n}`);
      }
    }

    if (tokens.length > 0) {
      const tokenExprs = tokens.map(token => {
        args.push(`%${token.replace(/[\\%_]/g, '\\$&')}%`);
        const n = args.length;
        return `(l.brand ILIKE $${n} ESCAPE '\\' OR l.model_name ILIKE $${n} ESCAPE '\\' OR v.sku ILIKE $${n} ESCAPE '\\' OR v.cpu ILIKE $${n} ESCAPE '\\' OR v.gpu ILIKE $${n} ESCAPE '\\' OR v.screen ILIKE $${n} ESCAPE '\\')`;
      });
      clauses.push(
        opts.matchAnyToken ? `(${tokenExprs.join(' OR ')})` : `(${tokenExprs.join(' AND ')})`
      );
    }

    const orderPrice =
      filter.sort_by === 'price_asc'
        ? 'v.price_vnd ASC'
        : filter.sort_by === 'price_desc'
          ? 'v.price_vnd DESC'
          : filter.max_price !== undefined
            ? 'v.price_vnd DESC'
            : 'v.price_vnd ASC';

    args.push(candidatePoolSize);
    const sql = `SELECT ${columns} FROM laptop_variants v JOIN laptops l ON l.id = v.laptop_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY (v.stock_verified AND v.stock > 0) DESC, ${orderPrice}, v.id ASC
      LIMIT $${args.length}`;
    return { sql, args };
  };

  const primary = buildQuery({ usageOverride: filter.usage_category });
  const res = await pool.query(primary.sql, primary.args);
  let rows = res.rows.map(asSummary);

  // Fallback 1: Relax strict category boundary to sibling categories (preserving hard budget & specs)
  if (filter.usage_category && rows.length < limit) {
    const siblings = CATEGORY_FALLBACKS[filter.usage_category];
    const fallbackQuery = buildQuery({ usageOverride: siblings });
    const fallbackRes = await pool.query(fallbackQuery.sql, fallbackQuery.args);
    rows = fallbackRes.rows.map(asSummary);
  }

  // Fallback 2: If multi-token keyword + brand/category was too strict, allow OR-token match or drop category filter (still preserving hard budget & brand & RAM/SSD)
  if (rows.length === 0 && tokens.length > 1) {
    const looseTokenQuery = buildQuery({
      usageOverride: filter.usage_category ? CATEGORY_FALLBACKS[filter.usage_category] : undefined,
      matchAnyToken: true
    });
    const looseRes = await pool.query(looseTokenQuery.sql, looseTokenQuery.args);
    rows = looseRes.rows.map(asSummary);
  }

  if (rows.length === 0 && filter.usage_category && (normalizedBrand || tokens.length > 0)) {
    const brandWideQuery = buildQuery({
      usageOverride: undefined,
      matchAnyToken: tokens.length > 1
    });
    const brandWideRes = await pool.query(brandWideQuery.sql, brandWideQuery.args);
    rows = brandWideRes.rows.map(asSummary);
  }

  return rankAndDiversify(rows, filter, limit);
}
