import { access, readFile, readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const preferredDataRoot = fileURLToPath(new URL('../../../../data/vz-catalog/', import.meta.url));
const legacyDataRoot = fileURLToPath(new URL('../../../../VZ_Data/', import.meta.url));
const validCapacity = new Set([4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128]);

type SourceImage = { file?: unknown; is_main?: unknown; download_ok?: unknown };
type SourceProduct = {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  currency?: unknown;
  in_stock?: unknown;
  categories?: unknown;
  description?: unknown;
  images?: unknown;
};

export type CatalogCandidate = {
  sourceId: number;
  sku: string;
  brand: string;
  modelName: string;
  description: string;
  imageUrl: string;
  cpu: string;
  gpu: string;
  ramGb: number;
  ssdGb: number;
  screen: string;
  color: string;
  usageCategory: string;
  priceVnd: number;
  sourceInStock: boolean | null;
  images: { imageUrl: string; caption: string }[];
};

export type SkippedProduct = { id: number | null; name: string; reason: string };

export async function resolveVzDataRoot(): Promise<string> {
  try {
    await access(preferredDataRoot);
    return preferredDataRoot;
  } catch {
    return legacyDataRoot;
  }
}

function distinctCapacities(text: string, kind: 'ram' | 'ssd'): number[] {
  const values: number[] = [];
  const expressions =
    kind === 'ram'
      ? [/(?:RAM|bộ nhớ)\s*[:\-]?\s*(\d{1,3})\s*GB/gi]
      : [
          /(?:SSD|ổ cứng)\s*[:\-]?\s*(\d{2,4})\s*GB/gi,
          /(\d{2,4})\s*GB\s*SSD/gi,
          /(?:SSD|ổ cứng)\s*[:\-]?\s*(\d(?:[.,]\d)?)\s*TB/gi,
          /(\d(?:[.,]\d)?)\s*TB\s*SSD/gi
        ];
  for (const [index, expression] of expressions.entries()) {
    for (const match of text.matchAll(expression)) {
      const raw = Number(match[1]?.replace(',', '.'));
      const value = kind === 'ssd' && index >= 2 ? Math.round(raw * 1024) : raw;
      if (Number.isInteger(value) && value > 0) values.push(value);
    }
  }
  return [...new Set(values)];
}

function brandOf(name: string): string {
  if (/^(macbook|apple)\b/i.test(name)) return 'Apple';
  if (/^(thinkpad|legion)\b/i.test(name)) return 'Lenovo';
  if (/^surface\b/i.test(name)) return 'Microsoft';
  const first = name.split(/\s+/)[0] ?? '';
  const brandMap: Record<string, string> = {
    asus: 'Asus',
    acer: 'Acer',
    dell: 'Dell',
    hp: 'HP',
    msi: 'MSI',
    lenovo: 'Lenovo',
    lg: 'LG',
    gigabyte: 'Gigabyte'
  };
  return brandMap[first.toLowerCase()] ?? first;
}

function usageOf(name: string, categories: string[], ramGb?: number, cpu?: string): string {
  const value = `${name} ${categories.join(' ')}`.toLowerCase();
  if (/gaming|rog|nitro|victus|predator|legion|loq|tuf|omen/.test(value)) return 'gaming';
  if (/đồ họa|graphic|workstation|precision|quadro|zbook/.test(value)) return 'graphic_creator';
  if (/lập trình|developer|code|programming/.test(value)) return 'programming';
  if (
    /macbook\s*air|xps|dragonfly|zenbook|gram|surface\s*laptop/.test(value) &&
    (!ramGb || ramGb <= 16)
  ) {
    return 'business_ultrabook';
  }
  if (
    ramGb &&
    ramGb >= 16 &&
    /i7|i9|ryzen\s*[79]|ultra\s*[79]|m[1-4]\s*(?:pro|max)|hx|h\b|xeon/i.test(
      `${cpu ?? ''} ${value}`
    )
  ) {
    return 'programming';
  }
  if (/thinkpad|elitebook|latitude|expertbook|business|envy/.test(value))
    return 'business_ultrabook';
  return 'office_study';
}

function firstMatch(text: string, pattern: RegExp): string {
  return text.match(pattern)?.[0]?.trim() ?? 'Chưa xác minh';
}

async function candidateOf(
  dataRoot: string,
  raw: SourceProduct,
  part: number
): Promise<{ candidate?: CatalogCandidate; skipped?: SkippedProduct }> {
  const id = Number.isSafeInteger(raw.id) && Number(raw.id) > 0 ? Number(raw.id) : null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const skip = (reason: string) => ({ skipped: { id, name, reason } });

  if (id === null || !name || name.length > 160) return skip('id_or_name_invalid');
  if (
    raw.currency !== 'VND' ||
    !Number.isInteger(raw.price) ||
    Number(raw.price) < 1 ||
    Number(raw.price) > 1_000_000_000
  ) {
    return skip('price_missing_or_invalid');
  }

  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const text = `${name}\n${description}`;
  const ram = distinctCapacities(text, 'ram');
  const ssd = distinctCapacities(text, 'ssd');
  if (ram.length !== 1 || !validCapacity.has(ram[0]!)) {
    return skip(ram.length > 1 ? 'ram_ambiguous' : 'ram_missing_or_invalid');
  }
  if (ssd.length !== 1 || ssd[0]! < 64 || ssd[0]! > 8192) {
    return skip(ssd.length > 1 ? 'ssd_ambiguous' : 'ssd_missing_or_invalid');
  }

  const images = Array.isArray(raw.images) ? (raw.images as SourceImage[]) : [];
  const main = images.find(
    image => image.is_main === true && image.download_ok === true && typeof image.file === 'string'
  );
  const imageFile = typeof main?.file === 'string' ? main.file : '';
  const imageName = basename(imageFile);
  if (
    !/^images\/[a-z0-9][a-z0-9._-]*\.(?:jpg|jpeg|png|webp)$/i.test(imageFile) ||
    imageName.includes('..')
  ) {
    return skip('main_image_missing');
  }

  try {
    await access(join(dataRoot, `vzstore-laptops-part${part}`, imageFile));
  } catch {
    return skip('main_image_missing');
  }

  const orderedImages = [main, ...images.filter(image => image !== main)];
  const availableImages: string[] = [];
  const seenImages = new Set<string>();

  for (const image of orderedImages) {
    if (
      image?.download_ok !== true ||
      typeof image.file !== 'string' ||
      !/^images\/[a-z0-9][a-z0-9._-]*\.(?:jpg|jpeg|png|webp)$/i.test(image.file)
    ) {
      continue;
    }
    const filename = basename(image.file);
    if (filename.includes('..') || seenImages.has(filename)) continue;
    try {
      await access(join(dataRoot, `vzstore-laptops-part${part}`, image.file));
    } catch {
      continue;
    }
    seenImages.add(filename);
    availableImages.push(`/api/v1/catalog/images/${part}/${filename}`);
  }

  const gallery = availableImages.map((url, index) => ({
    imageUrl: url,
    caption: `${name} · Ảnh ${index + 1}/${availableImages.length}`
  }));
  const categories = Array.isArray(raw.categories)
    ? raw.categories.filter((value): value is string => typeof value === 'string')
    : [];
  const lead = text.slice(0, 1400);
  const cpu = firstMatch(
    lead,
    /(?:Intel\s+)?Core\s+(?:Ultra\s+)?(?:i[3579]|[3579])(?:[- ]?\d{3,5}[A-Z]{0,3})?|(?:Intel\s+)?Xeon\s+[A-Z0-9-]+|(?:AMD\s+)?Ryzen\s+[3579](?:[- ]?\d{3,5}[A-Z]{0,3})?|(?:Apple\s+)?M[1-4](?:\s+(?:Pro|Max|Ultra))?|Snapdragon\s+X\s*(?:Elite|Plus)?|(?:Intel\s+)?(?:Pentium|Celeron)\s*[A-Z0-9-]*/i
  );
  const matchedGpu = firstMatch(
    lead,
    /(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*(?:A?\d{3,4})(?:\s*(?:Ti|Ada|Super))?|(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*\d{3,4}(?:\s*Ti)?|(?:NVIDIA\s+)?Quadro\s+[A-Z0-9]+|(?:NVIDIA\s+)?T(?:500|550|600|1000|1200|2000)|Radeon\s+(?:RX\s*)?[A-Z0-9M]+|Intel\s+Arc(?:\s+[A-Z0-9]+)?|Iris\s+(?:Xe|Plus)|Intel\s+UHD(?:\s+Graphics)?/i
  );
  const gpu =
    matchedGpu !== 'Chưa xác minh'
      ? matchedGpu
      : /\bM[1-4](?:\s+(?:Pro|Max|Ultra))?\b/i.test(cpu)
        ? `${cpu} GPU tích hợp`
        : matchedGpu;
  const screen = firstMatch(lead, /\b1[0-9](?:[.,]\d)?\s*(?:inch|inches|″|”|")/i);

  return {
    candidate: {
      sourceId: id,
      sku: `VZ-PRODUCT-${id}`,
      brand: brandOf(name),
      modelName: name,
      description,
      imageUrl: `/api/v1/catalog/images/${part}/${imageName}`,
      cpu,
      gpu,
      ramGb: ram[0]!,
      ssdGb: ssd[0]!,
      screen,
      color: 'Chưa xác minh',
      usageCategory: usageOf(name, categories, ram[0]!, cpu),
      priceVnd: Number(raw.price),
      sourceInStock: typeof raw.in_stock === 'boolean' ? raw.in_stock : null,
      images: gallery
    }
  };
}

export async function loadVzCatalog(): Promise<{
  candidates: CatalogCandidate[];
  skipped: SkippedProduct[];
  total: number;
  parts: number[];
}> {
  const dataRoot = await resolveVzDataRoot();
  const folders = (await readdir(dataRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && /^vzstore-laptops-part[1-9]\d*$/.test(entry.name))
    .map(entry => Number(entry.name.slice('vzstore-laptops-part'.length)))
    .sort((a, b) => a - b);

  if (!folders.length)
    throw new Error('Catalog data folder (data/vz-catalog) has no product parts');

  const candidates: CatalogCandidate[] = [];
  const skipped: SkippedProduct[] = [];
  const seen = new Set<number>();
  const loadedParts: number[] = [];
  let total = 0;

  for (const part of folders) {
    try {
      const source = JSON.parse(
        await readFile(join(dataRoot, `vzstore-laptops-part${part}`, 'products.json'), 'utf8')
      ) as unknown;
      if (!Array.isArray(source)) {
        console.warn(
          `[vz-source] Skipping unhydrated catalog part ${part}: Invalid products.json in part ${part}`
        );
        continue;
      }

      for (const raw of source as SourceProduct[]) {
        total++;
        if (Number.isSafeInteger(raw.id) && seen.has(Number(raw.id))) {
          skipped.push({
            id: Number(raw.id),
            name: String(raw.name ?? ''),
            reason: 'duplicate_source_id'
          });
          continue;
        }
        if (Number.isSafeInteger(raw.id)) seen.add(Number(raw.id));
        const result = await candidateOf(dataRoot, raw, part);
        if (result.candidate) candidates.push(result.candidate);
        if (result.skipped) skipped.push(result.skipped);
      }
      loadedParts.push(part);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[vz-source] Skipping unhydrated catalog part ${part}: ${message}`);
    }
  }

  if (loadedParts.length === 0) {
    throw new Error('Catalog data folder (data/vz-catalog) has no readable product parts');
  }

  return { candidates, skipped, total, parts: loadedParts };
}
