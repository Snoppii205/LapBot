import type {
  AdminBulkVariantAction,
  AdminBulkVariantPatchResult,
  AdminCatalogDeleteResult,
  AdminCatalogMeta,
  AdminCatalogSort,
  AdminLaptop,
  AdminLaptopImagesUpdateResult,
  AdminLaptopPage,
  AdminStockFilter,
  AdminVariant,
  AdminVariantPage,
  UsageCategory
} from '@lapbot/contracts';
import type { PoolClient } from 'pg';
import { pool } from '../../db/pool.js';
import { decodeKeysetCursor, encodeKeysetCursor } from '../../lib/cursor.js';
import { AppError, conflict, notFound } from '../../lib/errors.js';
import { invalidatePublicCatalogFacetsCache } from '../catalog/service.js';

export const laptopFields = [
  'brand',
  'model_name',
  'description',
  'image_url',
  'is_active'
] as const;
export const variantFields = [
  'cpu',
  'gpu',
  'ram_gb',
  'ssd_gb',
  'screen',
  'color',
  'usage_category',
  'price_vnd',
  'stock',
  'stock_verified',
  'is_active'
] as const;

export type Values = Record<string, string | number | boolean | null>;

const nonEmptyTextFields = new Set(['brand', 'model_name', 'sku', 'cpu', 'gpu', 'screen', 'color']);

function normalizeCatalogData(kind: 'laptops' | 'variants', raw: Values): Values {
  const out: Values = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val === undefined) continue;
    if (key === 'image_url') {
      if (val === null) {
        out[key] = null;
      } else if (typeof val === 'string') {
        const trimmed = val.trim();
        out[key] = trimmed ? trimmed : null;
      }
      continue;
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (nonEmptyTextFields.has(key) && !trimmed) {
        throw new AppError(400, 'VALIDATION_ERROR', `Trường ${key} không được để trống.`);
      }
      out[key] = trimmed;
      continue;
    }
    out[key] = val;
  }
  if (kind === 'laptops' && out.description === null) {
    out.description = '';
  }
  return out;
}

function isPgUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

function mapLaptopRow(r: Record<string, unknown>): AdminLaptop {
  return {
    id: r.id as string,
    brand: r.brand as string,
    model_name: r.model_name as string,
    description: (r.description as string) ?? '',
    image_url: (r.image_url as string) ?? null,
    is_active: Boolean(r.is_active),
    revision: Number(r.revision),
    created_at: new Date(r.created_at as string | Date).toISOString(),
    updated_at: new Date(r.updated_at as string | Date).toISOString(),
    variant_count: r.variant_count !== undefined ? Number(r.variant_count) : undefined,
    total_stock: r.total_stock !== undefined ? Number(r.total_stock) : undefined,
    unverified_count: r.unverified_count !== undefined ? Number(r.unverified_count) : undefined,
    min_price_vnd:
      r.min_price_vnd === null || r.min_price_vnd === undefined ? null : Number(r.min_price_vnd),
    max_price_vnd:
      r.max_price_vnd === null || r.max_price_vnd === undefined ? null : Number(r.max_price_vnd),
    images: Array.isArray(r.images)
      ? (r.images as Array<{ image_url: string; caption: string }>)
      : []
  };
}

function mapVariantRow(r: Record<string, unknown>): AdminVariant {
  return {
    id: r.id as string,
    laptop_id: r.laptop_id as string,
    sku: r.sku as string,
    cpu: r.cpu as string,
    gpu: r.gpu as string,
    ram_gb: Number(r.ram_gb),
    ssd_gb: Number(r.ssd_gb),
    screen: r.screen as string,
    color: r.color as string,
    usage_category: r.usage_category as UsageCategory,
    price_vnd: Number(r.price_vnd),
    stock: Number(r.stock),
    source_in_stock:
      r.source_in_stock === null || r.source_in_stock === undefined
        ? null
        : Boolean(r.source_in_stock),
    stock_verified: Boolean(r.stock_verified),
    is_active: Boolean(r.is_active),
    revision: Number(r.revision),
    created_at: new Date(r.created_at as string | Date).toISOString(),
    updated_at: new Date(r.updated_at as string | Date).toISOString(),
    ...(r.brand ? { brand: r.brand as string } : {}),
    ...(r.model_name ? { model_name: r.model_name as string } : {})
  };
}

async function fetchAdminLaptopById(client: PoolClient, id: string): Promise<AdminLaptop> {
  const res = await client.query(
    `SELECT l.*,
       vs.variant_count,
       vs.total_stock,
       vs.unverified_count,
       vs.min_price_vnd,
       vs.max_price_vnd,
       im.images
     FROM laptops l
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*)::int AS variant_count,
         COALESCE(SUM(v.stock) FILTER (WHERE v.stock_verified = true), 0)::int AS total_stock,
         COUNT(*) FILTER (WHERE v.stock_verified = false AND (v.source_in_stock IS TRUE OR v.source_in_stock IS NULL))::int AS unverified_count,
         MIN(v.price_vnd)::int AS min_price_vnd,
         MAX(v.price_vnd)::int AS max_price_vnd
       FROM laptop_variants v
       WHERE v.laptop_id = l.id
     ) vs ON true
     LEFT JOIN LATERAL (
       SELECT COALESCE(
         json_agg(json_build_object('image_url', img.image_url, 'caption', img.caption) ORDER BY img.position ASC),
         '[]'::json
       ) AS images
       FROM laptop_images img
       WHERE img.laptop_id = l.id
     ) im ON true
     WHERE l.id = $1`,
    [id]
  );
  return mapLaptopRow(res.rows[0]!);
}

async function fetchAdminVariantById(client: PoolClient, id: string): Promise<AdminVariant> {
  const res = await client.query(
    `SELECT v.*, l.brand, l.model_name
     FROM laptop_variants v
     JOIN laptops l ON l.id = v.laptop_id
     WHERE v.id = $1`,
    [id]
  );
  return mapVariantRow(res.rows[0]!);
}

export async function getAdminCatalogMeta(): Promise<AdminCatalogMeta> {
  const [summaryRes, optionsRes] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM laptops) AS laptops_total,
        (SELECT COUNT(*)::int FROM laptops WHERE is_active = true) AS laptops_active,
        (SELECT COUNT(*)::int FROM laptops WHERE is_active = false) AS laptops_archived,
        COUNT(*)::int AS variants_total,
        COUNT(*) FILTER (WHERE is_active = true)::int AS variants_active,
        COUNT(*) FILTER (WHERE stock_verified = true AND stock > 0)::int AS variants_in_stock,
        COUNT(*) FILTER (WHERE stock_verified = true AND stock BETWEEN 1 AND 2)::int AS variants_low_stock,
        COUNT(*) FILTER (WHERE (stock_verified = true AND stock = 0) OR source_in_stock IS FALSE)::int AS variants_out_of_stock,
        COUNT(*) FILTER (WHERE stock_verified = false AND (source_in_stock IS TRUE OR source_in_stock IS NULL))::int AS variants_unverified
      FROM laptop_variants
    `),
    pool.query(`
      SELECT l.id, l.brand, l.model_name, l.is_active,
             COUNT(v.id)::int AS variant_count
      FROM laptops l
      LEFT JOIN laptop_variants v ON v.laptop_id = l.id
      GROUP BY l.id
      ORDER BY LOWER(l.brand) ASC, LOWER(l.model_name) ASC
    `)
  ]);

  const s = summaryRes.rows[0] ?? {};
  const laptopOptions = optionsRes.rows.map(r => ({
    id: r.id as string,
    brand: r.brand as string,
    model_name: r.model_name as string,
    is_active: Boolean(r.is_active),
    variant_count: Number(r.variant_count) || 0
  }));

  const brands = Array.from(new Set(laptopOptions.map(o => o.brand))).sort((a, b) =>
    a.localeCompare(b)
  );

  return {
    summary: {
      laptops_total: Number(s.laptops_total) || 0,
      laptops_active: Number(s.laptops_active) || 0,
      laptops_archived: Number(s.laptops_archived) || 0,
      variants_total: Number(s.variants_total) || 0,
      variants_active: Number(s.variants_active) || 0,
      variants_in_stock: Number(s.variants_in_stock) || 0,
      variants_low_stock: Number(s.variants_low_stock) || 0,
      variants_out_of_stock: Number(s.variants_out_of_stock) || 0,
      variants_unverified: Number(s.variants_unverified) || 0
    },
    brands,
    laptop_options: laptopOptions
  };
}

export async function listAdminCatalog(
  kind: 'laptops' | 'variants',
  limit: number,
  cursor?: string,
  q?: string,
  extra?: {
    laptop_id?: string;
    stock_filter?: AdminStockFilter;
    is_active?: boolean;
    brand?: string;
    usage_category?: UsageCategory;
    sort?: AdminCatalogSort;
    offset?: number;
  }
): Promise<AdminLaptopPage | AdminVariantPage> {
  const b = decodeKeysetCursor(cursor);
  if (b && extra?.offset !== undefined) {
    throw new AppError(400, 'INVALID_QUERY', 'Không dùng đồng thời cursor và offset.');
  }

  const baseArgs: unknown[] = [];
  let baseWhere = 'WHERE true';

  if (q && q.trim()) {
    baseArgs.push(`%${q.trim().replace(/[\\%_]/g, '\\$&')}%`);
    baseWhere +=
      kind === 'laptops'
        ? ` AND (l.brand ILIKE $${baseArgs.length} ESCAPE '\\' OR l.model_name ILIKE $${baseArgs.length} ESCAPE '\\' OR EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.sku ILIKE $${baseArgs.length} ESCAPE '\\'))`
        : ` AND (v.sku ILIKE $${baseArgs.length} ESCAPE '\\' OR l.brand ILIKE $${baseArgs.length} ESCAPE '\\' OR l.model_name ILIKE $${baseArgs.length} ESCAPE '\\' OR v.cpu ILIKE $${baseArgs.length} ESCAPE '\\' OR v.gpu ILIKE $${baseArgs.length} ESCAPE '\\')`;
  }

  if (extra?.brand && extra.brand.trim()) {
    baseArgs.push(extra.brand.trim());
    baseWhere += ` AND LOWER(l.brand) = LOWER($${baseArgs.length})`;
  }

  if (kind === 'laptops') {
    if (extra?.is_active !== undefined) {
      baseArgs.push(extra.is_active);
      baseWhere += ` AND l.is_active = $${baseArgs.length}`;
    }
    if (extra?.usage_category) {
      baseArgs.push(extra.usage_category);
      baseWhere += ` AND EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.usage_category = $${baseArgs.length})`;
    }
    if (extra?.stock_filter) {
      if (extra.stock_filter === 'in_stock') {
        baseWhere += ` AND EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.stock_verified = true AND vx.stock > 0)`;
      } else if (extra.stock_filter === 'low_stock') {
        baseWhere += ` AND EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.stock_verified = true AND vx.stock BETWEEN 1 AND 2)`;
      } else if (extra.stock_filter === 'out_of_stock') {
        baseWhere += ` AND NOT EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.stock_verified = true AND vx.stock > 0)`;
      } else if (extra.stock_filter === 'unverified') {
        baseWhere += ` AND EXISTS (SELECT 1 FROM laptop_variants vx WHERE vx.laptop_id = l.id AND vx.stock_verified = false AND (vx.source_in_stock IS TRUE OR vx.source_in_stock IS NULL))`;
      }
    }
  } else {
    if (extra?.laptop_id) {
      baseArgs.push(extra.laptop_id);
      baseWhere += ` AND v.laptop_id = $${baseArgs.length}`;
    }
    if (extra?.is_active !== undefined) {
      baseArgs.push(extra.is_active);
      baseWhere += ` AND v.is_active = $${baseArgs.length}`;
    }
    if (extra?.usage_category) {
      baseArgs.push(extra.usage_category);
      baseWhere += ` AND v.usage_category = $${baseArgs.length}`;
    }
    if (extra?.stock_filter) {
      if (extra.stock_filter === 'in_stock') {
        baseWhere += ` AND v.stock_verified = true AND v.stock > 0`;
      } else if (extra.stock_filter === 'low_stock') {
        baseWhere += ` AND v.stock_verified = true AND v.stock BETWEEN 1 AND 2`;
      } else if (extra.stock_filter === 'out_of_stock') {
        baseWhere += ` AND ((v.stock_verified = true AND v.stock = 0) OR v.source_in_stock IS FALSE)`;
      } else if (extra.stock_filter === 'unverified') {
        baseWhere += ` AND v.stock_verified = false AND (v.source_in_stock IS TRUE OR v.source_in_stock IS NULL)`;
      }
    }
  }

  const sortMode: AdminCatalogSort = b ? 'newest' : (extra?.sort ?? 'newest');
  let orderBySql: string;
  if (kind === 'laptops') {
    if (sortMode === 'updated_desc') orderBySql = 'l.updated_at DESC, l.id DESC';
    else if (sortMode === 'price_asc')
      orderBySql = 'COALESCE(vs.min_price_vnd, 2147483647) ASC, l.id ASC';
    else if (sortMode === 'price_desc')
      orderBySql = 'COALESCE(vs.max_price_vnd, 0) DESC, l.id DESC';
    else if (sortMode === 'stock_asc') orderBySql = 'vs.total_stock ASC, l.id ASC';
    else if (sortMode === 'stock_desc') orderBySql = 'vs.total_stock DESC, l.id DESC';
    else if (sortMode === 'name_asc')
      orderBySql = 'LOWER(l.brand) ASC, LOWER(l.model_name) ASC, l.id ASC';
    else orderBySql = 'l.created_at DESC, l.id DESC';
  } else {
    if (sortMode === 'updated_desc') orderBySql = 'v.updated_at DESC, v.id DESC';
    else if (sortMode === 'price_asc') orderBySql = 'v.price_vnd ASC, v.id ASC';
    else if (sortMode === 'price_desc') orderBySql = 'v.price_vnd DESC, v.id DESC';
    else if (sortMode === 'stock_asc') orderBySql = 'v.stock ASC, v.id ASC';
    else if (sortMode === 'stock_desc') orderBySql = 'v.stock DESC, v.id DESC';
    else if (sortMode === 'name_asc')
      orderBySql = 'LOWER(l.brand) ASC, LOWER(l.model_name) ASC, v.sku ASC';
    else orderBySql = 'v.created_at DESC, v.id DESC';
  }

  const itemArgs = [...baseArgs];
  let itemWhere = baseWhere;
  if (b) {
    itemArgs.push(...b);
    itemWhere += ` AND (${kind === 'laptops' ? 'l' : 'v'}.created_at,${kind === 'laptops' ? 'l' : 'v'}.id) < ($${
      itemArgs.length - 1
    }::timestamptz,$${itemArgs.length}::uuid)`;
  }

  const effectiveOffset = b ? 0 : (extra?.offset ?? 0);
  itemArgs.push(limit + 1);
  let tailSql = `LIMIT $${itemArgs.length}`;
  if (!b && effectiveOffset > 0) {
    itemArgs.push(effectiveOffset);
    tailSql += ` OFFSET $${itemArgs.length}`;
  }

  const itemsSql =
    kind === 'laptops'
      ? `SELECT l.*,
           vs.variant_count,
           vs.total_stock,
           vs.unverified_count,
           vs.min_price_vnd,
           vs.max_price_vnd,
           im.images
         FROM laptops l
         LEFT JOIN LATERAL (
           SELECT
             COUNT(*)::int AS variant_count,
             COALESCE(SUM(v.stock) FILTER (WHERE v.stock_verified = true), 0)::int AS total_stock,
             COUNT(*) FILTER (WHERE v.stock_verified = false AND (v.source_in_stock IS TRUE OR v.source_in_stock IS NULL))::int AS unverified_count,
             MIN(v.price_vnd)::int AS min_price_vnd,
             MAX(v.price_vnd)::int AS max_price_vnd
           FROM laptop_variants v
           WHERE v.laptop_id = l.id
         ) vs ON true
         LEFT JOIN LATERAL (
           SELECT COALESCE(
             json_agg(json_build_object('image_url', img.image_url, 'caption', img.caption) ORDER BY img.position ASC),
             '[]'::json
           ) AS images
           FROM laptop_images img
           WHERE img.laptop_id = l.id
         ) im ON true
         ${itemWhere}
         ORDER BY ${orderBySql}
         ${tailSql}`
      : `SELECT v.*, l.brand, l.model_name
         FROM laptop_variants v
         JOIN laptops l ON l.id = v.laptop_id
         ${itemWhere}
         ORDER BY ${orderBySql}
         ${tailSql}`;

  const countSql =
    kind === 'laptops'
      ? `SELECT COUNT(*)::int AS total FROM laptops l ${baseWhere}`
      : `SELECT COUNT(*)::int AS total FROM laptop_variants v JOIN laptops l ON l.id = v.laptop_id ${baseWhere}`;

  const [result, countRes] = await Promise.all([
    pool.query(itemsSql, itemArgs),
    pool.query<{ total: number }>(countSql, baseArgs)
  ]);

  const rows = result.rows.slice(0, limit);
  const hasMore = result.rows.length > limit;
  const last = rows.at(-1);
  const totalCount = Number(countRes.rows[0]?.total ?? 0);
  const nextCursor =
    hasMore && last && sortMode === 'newest' && extra?.offset === undefined
      ? encodeKeysetCursor(last.created_at, last.id)
      : null;
  const nextOffset = !b && hasMore ? effectiveOffset + rows.length : null;

  if (kind === 'laptops') {
    return {
      items: rows.map(mapLaptopRow),
      next_cursor: nextCursor,
      total_count: totalCount,
      next_offset: nextOffset
    };
  }
  return {
    items: rows.map(mapVariantRow),
    next_cursor: nextCursor,
    total_count: totalCount,
    next_offset: nextOffset
  };
}

async function syncLaptopCoverToGallery(
  client: PoolClient,
  laptopId: string,
  newCoverUrl: string | null,
  oldCoverUrl: string | null,
  fallbackCaption: string
): Promise<void> {
  const existingRes = await client.query<{ image_url: string; caption: string }>(
    'SELECT image_url, caption FROM laptop_images WHERE laptop_id = $1 ORDER BY position ASC',
    [laptopId]
  );
  const existing = existingRes.rows;

  if (newCoverUrl) {
    let nextImages: Array<{ image_url: string; caption: string }>;
    if (existing.length === 0) {
      nextImages = [{ image_url: newCoverUrl, caption: fallbackCaption }];
    } else {
      const existingIdx = existing.findIndex(item => item.image_url === newCoverUrl);
      if (existingIdx === 0) {
        return;
      } else if (existingIdx > 0) {
        const promoted = existing[existingIdx]!;
        nextImages = [promoted, ...existing.filter((_, i) => i !== existingIdx)];
      } else {
        // Replace old cover at position 1 while preserving secondary gallery photos 2..N
        nextImages = [
          { image_url: newCoverUrl, caption: existing[0]?.caption || fallbackCaption },
          ...existing.slice(1)
        ];
      }
    }

    await client.query('DELETE FROM laptop_images WHERE laptop_id = $1', [laptopId]);
    for (let i = 0; i < nextImages.length; i++) {
      const img = nextImages[i]!;
      await client.query(
        'INSERT INTO laptop_images(laptop_id, position, image_url, caption) VALUES ($1, $2, $3, $4)',
        [laptopId, i + 1, img.image_url, img.caption]
      );
    }
  } else if (oldCoverUrl && existing.length > 0) {
    const remaining = existing.filter((img, idx) => !(idx === 0 && img.image_url === oldCoverUrl));
    if (remaining.length !== existing.length) {
      await client.query('DELETE FROM laptop_images WHERE laptop_id = $1', [laptopId]);
      for (let i = 0; i < remaining.length; i++) {
        const img = remaining[i]!;
        await client.query(
          'INSERT INTO laptop_images(laptop_id, position, image_url, caption) VALUES ($1, $2, $3, $4)',
          [laptopId, i + 1, img.image_url, img.caption]
        );
      }
    }
  }
}

export async function createCatalog(
  kind: 'laptops' | 'variants',
  rawData: Values,
  adminId: string
) {
  const data = normalizeCatalogData(kind, rawData);
  if (kind === 'variants' && !Object.hasOwn(data, 'stock_verified')) {
    data.stock_verified = true;
  }

  const fields = kind === 'laptops' ? [...laptopFields] : ['laptop_id', 'sku', ...variantFields];
  const supplied = fields.filter(field => Object.hasOwn(data, field));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (kind === 'variants') {
      const parent = await client.query('SELECT id FROM laptops WHERE id = $1', [data.laptop_id]);
      if (!parent.rowCount) {
        throw new AppError(404, 'LAPTOP_NOT_FOUND', 'Không tìm thấy dòng máy cha.');
      }
    }

    const values = supplied.map(field => data[field]);
    const result = await client.query(
      `INSERT INTO ${kind === 'laptops' ? 'laptops' : 'laptop_variants'}(${supplied.join(',')})
       VALUES (${supplied.map((_, index) => `$${index + 1}`).join(',')}) RETURNING id`,
      values
    );
    const createdId = result.rows[0]!.id as string;

    if (kind === 'laptops' && typeof data.image_url === 'string' && data.image_url) {
      await client.query(
        'INSERT INTO laptop_images(laptop_id, position, image_url, caption) VALUES ($1, 1, $2, $3)',
        [createdId, data.image_url, `${data.brand} ${data.model_name} · Ảnh đại diện`]
      );
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, $2, $3, $4, $5)`,
      [
        adminId,
        kind === 'laptops' ? 'LAPTOP_CREATE' : 'VARIANT_CREATE',
        kind === 'laptops' ? 'LAPTOP' : 'VARIANT',
        createdId,
        JSON.stringify(
          kind === 'laptops'
            ? { brand: data.brand, model_name: data.model_name }
            : { sku: data.sku, price_vnd: data.price_vnd, stock: data.stock }
        )
      ]
    );

    const created =
      kind === 'laptops'
        ? await fetchAdminLaptopById(client, createdId)
        : await fetchAdminVariantById(client, createdId);

    await client.query('COMMIT');
    invalidatePublicCatalogFacetsCache();
    return created;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (isPgUniqueViolation(error)) {
      throw conflict(
        'SKU_EXISTS',
        'Mã SKU này đã tồn tại trên hệ thống. Vui lòng nhập mã SKU khác.'
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function patchCatalog(
  kind: 'laptops' | 'variants',
  id: string,
  expected: number,
  rawData: Values,
  adminId: string
) {
  const data = normalizeCatalogData(kind, rawData);
  if (
    kind === 'variants' &&
    Object.hasOwn(data, 'stock') &&
    !Object.hasOwn(data, 'stock_verified')
  ) {
    data.stock_verified = true;
  }

  const allowed = kind === 'laptops' ? [...laptopFields] : ['laptop_id', 'sku', ...variantFields];
  const fields = allowed.filter(field => Object.hasOwn(data, field));
  if (!fields.length) throw new AppError(400, 'INVALID_PATCH', 'Cần ít nhất một trường thay đổi.');

  const table = kind === 'laptops' ? 'laptops' : 'laptop_variants';
  const values: unknown[] = [id, expected, ...fields.map(field => data[field])];
  const updates = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (kind === 'variants' && Object.hasOwn(data, 'laptop_id')) {
      const parent = await client.query('SELECT id FROM laptops WHERE id = $1', [data.laptop_id]);
      if (!parent.rowCount) {
        throw new AppError(404, 'LAPTOP_NOT_FOUND', 'Không tìm thấy dòng máy cha.');
      }
    }

    let previousLaptopRow: { brand: string; model_name: string; image_url: string | null } | null =
      null;
    if (kind === 'laptops' && Object.hasOwn(data, 'image_url')) {
      const prevRes = await client.query<{
        brand: string;
        model_name: string;
        image_url: string | null;
      }>('SELECT brand, model_name, image_url FROM laptops WHERE id = $1 FOR UPDATE', [id]);
      previousLaptopRow = prevRes.rows[0] ?? null;
    }

    const result = await client.query(
      `UPDATE ${table} SET ${updates}, revision = revision + 1, updated_at = now()
       WHERE id = $1 AND revision = $2 RETURNING id`,
      values
    );
    if (!result.rowCount) {
      const exists = await client.query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
      throw exists.rowCount
        ? conflict('REVISION_CONFLICT', 'Dữ liệu đã thay đổi. Hãy tải lại.')
        : notFound();
    }

    if (kind === 'laptops' && Object.hasOwn(data, 'image_url')) {
      const nextBrand =
        (typeof data.brand === 'string' ? data.brand : previousLaptopRow?.brand) ?? '';
      const nextModel =
        (typeof data.model_name === 'string' ? data.model_name : previousLaptopRow?.model_name) ??
        '';
      await syncLaptopCoverToGallery(
        client,
        id,
        typeof data.image_url === 'string' ? data.image_url : null,
        previousLaptopRow?.image_url ?? null,
        `${nextBrand} ${nextModel} · Ảnh đại diện`.trim()
      );
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, $2, $3, $4, $5)`,
      [
        adminId,
        kind === 'laptops' ? 'LAPTOP_PATCH' : 'VARIANT_PATCH',
        kind === 'laptops' ? 'LAPTOP' : 'VARIANT',
        id,
        JSON.stringify({ fields })
      ]
    );

    const updated =
      kind === 'laptops'
        ? await fetchAdminLaptopById(client, id)
        : await fetchAdminVariantById(client, id);

    await client.query('COMMIT');
    invalidatePublicCatalogFacetsCache();
    return updated;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (isPgUniqueViolation(error)) {
      throw conflict(
        'SKU_EXISTS',
        'Mã SKU này đã tồn tại trên hệ thống. Vui lòng nhập mã SKU khác.'
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function bulkPatchVariants(
  variantIds: string[],
  action: AdminBulkVariantAction,
  value: number | undefined,
  adminId: string
): Promise<AdminBulkVariantPatchResult> {
  const uniqueIds = Array.from(new Set(variantIds));
  if (uniqueIds.length === 0 || uniqueIds.length > 100) {
    throw new AppError(400, 'INVALID_BULK_IDS', 'Vui lòng chọn từ 1 đến 100 phiên bản SKU.');
  }

  let setClause = '';
  const extraArgs: unknown[] = [];
  let summaryLabel = '';

  if (action === 'verify_stock') {
    setClause = 'stock_verified = true';
    summaryLabel = 'Đã xác thực tồn kho';
  } else if (action === 'activate') {
    setClause = 'is_active = true';
    summaryLabel = 'Đã mở bán trên Storefront';
  } else if (action === 'deactivate') {
    setClause = 'is_active = false';
    summaryLabel = 'Đã tạm ẩn khỏi Storefront';
  } else if (action === 'set_stock') {
    if (value === undefined || !Number.isInteger(value) || value < 0 || value > 1_000_000) {
      throw new AppError(
        400,
        'INVALID_STOCK_VALUE',
        'Số lượng tồn kho đặt mới phải là số nguyên từ 0 đến 1.000.000.'
      );
    }
    extraArgs.push(value);
    setClause = `stock = $2, stock_verified = true`;
    summaryLabel = `Đã đặt tồn kho = ${value}`;
  } else if (action === 'adjust_stock_delta') {
    if (
      value === undefined ||
      !Number.isInteger(value) ||
      value === 0 ||
      Math.abs(value) > 100_000
    ) {
      throw new AppError(
        400,
        'INVALID_STOCK_DELTA',
        'Mức cộng/trừ tồn kho phải khác 0 và trong khoảng ±100.000.'
      );
    }
    extraArgs.push(value);
    setClause = `stock = GREATEST(0, stock + $2::int), stock_verified = true`;
    summaryLabel = `Đã điều chỉnh tồn kho (${value > 0 ? `+${value}` : value})`;
  } else if (action === 'adjust_price_pct') {
    if (
      value === undefined ||
      !Number.isFinite(value) ||
      value === 0 ||
      value <= -90 ||
      value > 500
    ) {
      throw new AppError(
        400,
        'INVALID_PRICE_PCT',
        'Tỷ lệ điều chỉnh giá (%) phải khác 0 và trong khoảng -89% đến +500%.'
      );
    }
    extraArgs.push(value);
    setClause = `price_vnd = LEAST(1000000000, GREATEST(1000, (ROUND((price_vnd::numeric * (1 + ($2::numeric / 100.0))) / 1000.0) * 1000)::int))`;
    summaryLabel = `Đã điều chỉnh giá (${value > 0 ? `+${value}%` : `${value}%`})`;
  } else if (action === 'adjust_price_delta') {
    if (
      value === undefined ||
      !Number.isInteger(value) ||
      value === 0 ||
      Math.abs(value) > 500_000_000
    ) {
      throw new AppError(
        400,
        'INVALID_PRICE_DELTA',
        'Số tiền cộng/trừ giá phải là số nguyên khác 0 trong khoảng ±500.000.000₫.'
      );
    }
    extraArgs.push(value);
    setClause = `price_vnd = LEAST(1000000000, GREATEST(1000, price_vnd + $2::int))`;
    summaryLabel = `Đã điều chỉnh giá (${value > 0 ? `+${value.toLocaleString('vi-VN')}₫` : `${value.toLocaleString('vi-VN')}₫`})`;
  } else {
    throw new AppError(400, 'INVALID_BULK_ACTION', 'Thao tác hàng loạt không hợp lệ.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query<{ id: string }>(
      'SELECT id FROM laptop_variants WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE',
      [uniqueIds]
    );
    if (!locked.rowCount) {
      throw notFound('Không tìm thấy phiên bản SKU nào khớp danh sách chọn.');
    }
    const lockedIds = locked.rows.map(r => r.id);

    await client.query(
      `UPDATE laptop_variants
       SET ${setClause}, revision = revision + 1, updated_at = now()
       WHERE id = ANY($1::uuid[])`,
      [lockedIds, ...extraArgs]
    );

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'VARIANT_BULK_PATCH', 'VARIANT', NULL, $2)`,
      [
        adminId,
        JSON.stringify({
          action,
          ...(value !== undefined ? { value } : {}),
          updated_count: lockedIds.length,
          variant_ids: lockedIds
        })
      ]
    );

    const updatedRes = await client.query(
      `SELECT v.*, l.brand, l.model_name
       FROM laptop_variants v
       JOIN laptops l ON l.id = v.laptop_id
       WHERE v.id = ANY($1::uuid[])
       ORDER BY v.updated_at DESC, v.id DESC`,
      [lockedIds]
    );

    await client.query('COMMIT');
    invalidatePublicCatalogFacetsCache();

    return {
      updated_count: lockedIds.length,
      items: updatedRes.rows.map(mapVariantRow),
      message: `${summaryLabel} cho ${lockedIds.length} mã SKU.`
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteCatalog(
  kind: 'laptops' | 'variants',
  id: string,
  adminId: string
): Promise<AdminCatalogDeleteResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (kind === 'variants') {
      const variantRes = await client.query(
        'SELECT id, sku FROM laptop_variants WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (!variantRes.rowCount) throw notFound();
      const sku = variantRes.rows[0]!.sku as string;

      const orderCheck = await client.query(
        'SELECT EXISTS (SELECT 1 FROM orders WHERE variant_id = $1) AS has_orders',
        [id]
      );
      const hasOrders = Boolean(orderCheck.rows[0]?.has_orders);

      if (!hasOrders) {
        await client.query('DELETE FROM laptop_variants WHERE id = $1', [id]);
        await client.query(
          `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
           VALUES ('ADMIN', $1, 'VARIANT_DELETE', 'VARIANT', $2, $3)`,
          [adminId, id, JSON.stringify({ sku, mode: 'deleted' })]
        );
        await client.query('COMMIT');
        invalidatePublicCatalogFacetsCache();
        return {
          id,
          mode: 'deleted',
          cancelled_quotes_count: 0,
          message: `Đã xóa vĩnh viễn phiên bản cấu hình ${sku}.`
        };
      }

      const cancelledQuotes = await client.query(
        `UPDATE orders
         SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
         WHERE variant_id = $1 AND status = 'PENDING_CONFIRMATION'
         RETURNING id`,
        [id]
      );
      const cancelledCount = cancelledQuotes.rowCount ?? 0;
      if (cancelledCount > 0) {
        await client.query(
          'UPDATE chat_sessions SET active_preview_id = NULL, updated_at = now() WHERE active_preview_id = ANY($1::uuid[])',
          [cancelledQuotes.rows.map(r => r.id)]
        );
      }

      await client.query(
        `UPDATE laptop_variants
         SET is_active = false, stock = 0, revision = revision + 1, updated_at = now()
         WHERE id = $1`,
        [id]
      );

      await client.query(
        `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
         VALUES ('ADMIN', $1, 'VARIANT_ARCHIVE', 'VARIANT', $2, $3)`,
        [
          adminId,
          id,
          JSON.stringify({ sku, mode: 'archived', cancelled_quotes_count: cancelledCount })
        ]
      );
      await client.query('COMMIT');
      invalidatePublicCatalogFacetsCache();
      return {
        id,
        mode: 'archived',
        cancelled_quotes_count: cancelledCount,
        message: `SKU ${sku} đã có đơn hàng lịch sử nên được chuyển sang Lưu trữ ẩn (ngừng bán, tồn kho = 0).`
      };
    }

    const laptopRes = await client.query(
      'SELECT id, brand, model_name FROM laptops WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!laptopRes.rowCount) throw notFound();
    const laptopTitle = `${laptopRes.rows[0]!.brand as string} ${laptopRes.rows[0]!.model_name as string}`;

    const variantsRes = await client.query(
      'SELECT id FROM laptop_variants WHERE laptop_id = $1 FOR UPDATE',
      [id]
    );
    const variantIds = variantsRes.rows.map(r => r.id as string);

    const hasOrders =
      variantIds.length > 0 &&
      Boolean(
        (
          await client.query(
            'SELECT EXISTS (SELECT 1 FROM orders WHERE variant_id = ANY($1::uuid[])) AS has_orders',
            [variantIds]
          )
        ).rows[0]?.has_orders
      );

    if (!hasOrders) {
      await client.query('DELETE FROM laptop_images WHERE laptop_id = $1', [id]);
      if (variantIds.length > 0) {
        await client.query('DELETE FROM laptop_variants WHERE laptop_id = $1', [id]);
      }
      await client.query('DELETE FROM laptops WHERE id = $1', [id]);
      await client.query(
        `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
         VALUES ('ADMIN', $1, 'LAPTOP_DELETE', 'LAPTOP', $2, $3)`,
        [
          adminId,
          id,
          JSON.stringify({
            title: laptopTitle,
            deleted_variants: variantIds.length,
            mode: 'deleted'
          })
        ]
      );
      await client.query('COMMIT');
      invalidatePublicCatalogFacetsCache();
      return {
        id,
        mode: 'deleted',
        cancelled_quotes_count: 0,
        message: `Đã xóa vĩnh viễn dòng máy ${laptopTitle} cùng ${variantIds.length} SKU.`
      };
    }

    const cancelledQuotes = await client.query(
      `UPDATE orders
       SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
       WHERE variant_id = ANY($1::uuid[]) AND status = 'PENDING_CONFIRMATION'
       RETURNING id`,
      [variantIds]
    );
    const cancelledCount = cancelledQuotes.rowCount ?? 0;
    if (cancelledCount > 0) {
      await client.query(
        'UPDATE chat_sessions SET active_preview_id = NULL, updated_at = now() WHERE active_preview_id = ANY($1::uuid[])',
        [cancelledQuotes.rows.map(r => r.id)]
      );
    }

    await client.query(
      'UPDATE laptops SET is_active = false, revision = revision + 1, updated_at = now() WHERE id = $1',
      [id]
    );
    await client.query(
      `UPDATE laptop_variants
       SET is_active = false, stock = 0, revision = revision + 1, updated_at = now()
       WHERE laptop_id = $1`,
      [id]
    );

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'LAPTOP_ARCHIVE', 'LAPTOP', $2, $3)`,
      [
        adminId,
        id,
        JSON.stringify({
          title: laptopTitle,
          archived_variants: variantIds.length,
          cancelled_quotes_count: cancelledCount,
          mode: 'archived'
        })
      ]
    );
    await client.query('COMMIT');
    invalidatePublicCatalogFacetsCache();
    return {
      id,
      mode: 'archived',
      cancelled_quotes_count: cancelledCount,
      message: `Dòng máy ${laptopTitle} đã có đơn hàng lịch sử nên được chuyển sang Lưu trữ ẩn cùng ${variantIds.length} SKU.`
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function updateLaptopImages(
  laptopId: string,
  images: Array<{ image_url: string; caption?: string }>,
  adminId: string
): Promise<AdminLaptopImagesUpdateResult> {
  const cleaned = images
    .map(img => ({
      image_url: img.image_url.trim(),
      caption: img.caption?.trim() || ''
    }))
    .filter(img => img.image_url.length > 0);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const laptopRes = await client.query(
      'SELECT model_name FROM laptops WHERE id = $1 FOR UPDATE',
      [laptopId]
    );
    if (!laptopRes.rowCount) throw notFound();
    const modelName = laptopRes.rows[0]!.model_name as string;

    await client.query('DELETE FROM laptop_images WHERE laptop_id = $1', [laptopId]);

    const primaryUrl = cleaned[0]?.image_url || null;
    const updatedLaptop = await client.query(
      'UPDATE laptops SET image_url = $1, revision = revision + 1, updated_at = now() WHERE id = $2 RETURNING revision',
      [primaryUrl, laptopId]
    );
    const nextRevision = Number(updatedLaptop.rows[0]!.revision);

    for (let i = 0; i < cleaned.length; i++) {
      const img = cleaned[i]!;
      const caption = img.caption || `${modelName} · Ảnh ${i + 1}/${cleaned.length}`;
      await client.query(
        'INSERT INTO laptop_images(laptop_id, position, image_url, caption) VALUES ($1, $2, $3, $4)',
        [laptopId, i + 1, img.image_url, caption]
      );
    }

    await client.query(
      `INSERT INTO audit_events(actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ('ADMIN', $1, 'LAPTOP_IMAGES_UPDATE', 'LAPTOP', $2, $3)`,
      [adminId, laptopId, JSON.stringify({ count: cleaned.length, primaryUrl })]
    );

    const updatedImages = await client.query(
      'SELECT image_url, caption FROM laptop_images WHERE laptop_id = $1 ORDER BY position ASC',
      [laptopId]
    );

    await client.query('COMMIT');
    invalidatePublicCatalogFacetsCache();
    return {
      items: updatedImages.rows.map(r => ({
        image_url: r.image_url as string,
        caption: r.caption as string
      })),
      image_url: primaryUrl,
      revision: nextRevision
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
