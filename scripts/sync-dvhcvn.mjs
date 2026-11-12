#!/usr/bin/env node
/**
 * Đồng bộ dữ liệu Đơn Vị Hành Chính Việt Nam 2026 (2 cấp: 34 Tỉnh/TP & 3.321 Phường/Xã/Đặc khu)
 * Nguồn chuẩn: https://github.com/thanhtrungit97/dvhcvn (Nghị quyết số 202/2025/QH15 của Quốc hội)
 *
 * Cách chạy lại khi cần cập nhật:
 *   node scripts/sync-dvhcvn.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const webLibDir = path.join(repoRoot, 'apps', 'web', 'src', 'lib');

const DVHCVN_JSON_URL =
  'https://raw.githubusercontent.com/thanhtrungit97/dvhcvn/main/json/data.json';
const DVHCVN_MAPPING_SQL_URL =
  'https://raw.githubusercontent.com/thanhtrungit97/dvhcvn/main/mapping_old_data/ward_mappings.sql';

const FEATURED_ORDER = ['79', '01', '48', '31', '92', '46'];

const SHORT_NAME_OVERRIDES = {
  79: 'TP. Hồ Chí Minh',
  '01': 'Hà Nội',
  48: 'Đà Nẵng',
  31: 'Hải Phòng',
  92: 'Cần Thơ',
  46: 'TP. Huế'
};

const EXTRA_ALIASES = {
  79: ['hcm', 'tphcm', 'sai gon', 'sg', 'thu dau mot', 'di an', 'thuan an', 'vung tau', 'con dao'],
  '01': ['hn', 'thu do', 'ha tay'],
  48: ['dn', 'tam ky', 'hoi an', 'hoang sa'],
  31: ['hp', 'hai duong', 'cat hai', 'bach long vi'],
  92: ['ct', 'soc trang', 'hau giang', 'vi thanh'],
  46: ['hue', 'thua thien hue'],
  22: ['ha long', 'cam pha', 'uong bi', 'mong cai', 'van don', 'co to'],
  56: ['nha trang', 'cam ranh', 'phan rang', 'truong sa'],
  68: ['da lat', 'bao loc', 'phan thiet', 'gia nghia', 'phu quy'],
  91: ['rach gia', 'long xuyen', 'ha tien', 'chau doc', 'phu quoc'],
  75: ['bien hoa', 'long khanh', 'dong xoai']
};

function nfc(str) {
  return String(str ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanOldProvShort(name) {
  const s = nfc(name);
  if (s === 'Thành phố Hồ Chí Minh') return 'TP.HCM';
  return s.replace(/^(Tỉnh|Thành phố)\s+/i, '');
}

async function loadText(url, localCachePath) {
  if (localCachePath && fs.existsSync(localCachePath)) {
    return fs.readFileSync(localCachePath, 'utf8');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

const localDataCache = process.env.DVHCVN_LOCAL_JSON || '';
const localSqlCache = process.env.DVHCVN_LOCAL_SQL || '';

const rawJsonText = await loadText(DVHCVN_JSON_URL, localDataCache);
const rawSqlText = await loadText(DVHCVN_MAPPING_SQL_URL, localSqlCache);

const rawProvinces = JSON.parse(rawJsonText);

// Parse ward_mappings.sql (all 10,039 records)
const insertLines = rawSqlText.split('\n').filter(l => l.startsWith('INSERT INTO'));
const tokenRe = /NULL|'(?:\\'|[^'])*'/g;
const unq = tok => (tok === 'NULL' ? null : nfc(tok.slice(1, -1).replace(/\\'/g, "'")));

const mappingRows = [];
for (const line of insertLines) {
  const idx = line.indexOf('VALUES');
  if (idx === -1) continue;
  const toks = line.slice(idx).match(tokenRe);
  if (!toks || toks.length < 7) continue;
  mappingRows.push({
    oldWardCode: unq(toks[0]),
    oldWard: unq(toks[1]),
    oldDistrict: unq(toks[2]),
    oldProvince: unq(toks[3]),
    newWardCode: unq(toks[4]) ? unq(toks[4]).padStart(5, '0') : null,
    newWard: unq(toks[5]),
    newProvince: unq(toks[6])
  });
}

// Add synthetic district-level entries for the 5 island special zones that had no old commune tier
const ISLAND_FALLBACKS = [
  {
    oldProvince: 'Thành phố Hải Phòng',
    oldDistrict: 'Huyện Bạch Long Vĩ',
    oldWard: 'Huyện đảo Bạch Long Vĩ (không chia phường/xã)',
    newWardCode: '11948'
  },
  {
    oldProvince: 'Tỉnh Bà Rịa - Vũng Tàu',
    oldDistrict: 'Huyện Côn Đảo',
    oldWard: 'Huyện đảo Côn Đảo (không chia phường/xã)',
    newWardCode: '26732'
  },
  {
    oldProvince: 'Tỉnh Quảng Trị',
    oldDistrict: 'Huyện Cồn Cỏ',
    oldWard: 'Huyện đảo Cồn Cỏ (không chia phường/xã)',
    newWardCode: '19742'
  },
  {
    oldProvince: 'Thành phố Đà Nẵng',
    oldDistrict: 'Huyện Hoàng Sa',
    oldWard: 'Huyện đảo Hoàng Sa (không chia phường/xã)',
    newWardCode: '20333'
  },
  {
    oldProvince: 'Tỉnh Quảng Ngãi',
    oldDistrict: 'Huyện Lý Sơn',
    oldWard: 'Huyện đảo Lý Sơn (không chia phường/xã)',
    newWardCode: '21548'
  }
];

// Map newWardCode -> newProvinceCode from data.json
const wardCodeToProvCode = new Map();
for (const p of rawProvinces) {
  const pCode = nfc(p.province_code).padStart(2, '0');
  for (const w of p.wards) {
    wardCodeToProvCode.set(nfc(w.ward_code).padStart(5, '0'), pCode);
  }
}

// Compute merged old provinces per new provinceCode directly from ward_mappings.sql
const mergedOldProvsByNewCode = new Map();
for (const row of [...mappingRows, ...ISLAND_FALLBACKS]) {
  if (!row.oldProvince || !row.newWardCode) continue;
  const pCode = wardCodeToProvCode.get(row.newWardCode);
  if (!pCode) continue;
  if (!mergedOldProvsByNewCode.has(pCode)) {
    mergedOldProvsByNewCode.set(pCode, new Set());
  }
  mergedOldProvsByNewCode.get(pCode).add(cleanOldProvShort(row.oldProvince));
}

const viCollator = new Intl.Collator('vi', { sensitivity: 'base', numeric: true });

const provincesOut = rawProvinces.map(p => {
  const provinceCode = nfc(p.province_code).padStart(2, '0');
  const dvhcvnName = nfc(p.name);
  const placeType = nfc(p.place_type);
  const shortCode = nfc(p.code);
  const canonicalName =
    placeType === 'Tỉnh' && !dvhcvnName.startsWith('Tỉnh ') ? `Tỉnh ${dvhcvnName}` : dvhcvnName;
  const shortName =
    SHORT_NAME_OVERRIDES[provinceCode] ?? dvhcvnName.replace(/^(Thành phố|Tỉnh)\s+/i, '');
  const featured = FEATURED_ORDER.includes(provinceCode);

  const mergedSet = mergedOldProvsByNewCode.get(provinceCode) ?? new Set();
  const mergedArr = [...mergedSet].sort((a, b) => {
    const aSelf =
      a.toLowerCase() === shortName.toLowerCase() || (provinceCode === '79' && a === 'TP.HCM');
    const bSelf =
      b.toLowerCase() === shortName.toLowerCase() || (provinceCode === '79' && b === 'TP.HCM');
    if (aSelf && !bSelf) return -1;
    if (!aSelf && bSelf) return 1;
    return viCollator.compare(a, b);
  });
  const mergedFrom = mergedArr.length > 1 ? mergedArr.join(' · ') : undefined;

  const aliasSet = new Set([
    provinceCode,
    shortCode.toLowerCase(),
    dvhcvnName,
    shortName,
    ...mergedArr,
    ...(EXTRA_ALIASES[provinceCode] ?? [])
  ]);

  const wards = p.wards
    .map(w => [nfc(w.ward_code).padStart(5, '0'), nfc(w.name)])
    .sort((a, b) => viCollator.compare(a[1], b[1]));

  return {
    provinceCode,
    shortCode,
    placeType,
    name: canonicalName,
    dvhcvnName,
    shortName,
    ...(featured ? { featured: true } : {}),
    ...(mergedFrom ? { mergedFrom } : {}),
    aliases: [...aliasSet],
    wards
  };
});

provincesOut.sort((a, b) => {
  const ia = FEATURED_ORDER.indexOf(a.provinceCode);
  const ib = FEATURED_ORDER.indexOf(b.provinceCode);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return viCollator.compare(a.shortName, b.shortName);
});

const adminTsContent = `// Auto-generated from thanhtrungit97/dvhcvn (Nghị quyết số 202/2025/QH15 của Quốc hội)
// 34 Tỉnh/Thành phố trực thuộc Trung ương & 3.321 Phường / Xã / Đặc khu (chuẩn hóa Unicode NFC)
// Do not edit manually — regenerate via: node scripts/sync-dvhcvn.mjs

export type VnWardTuple2026 = readonly [wardCode: string, name: string];

export interface VnProvince2026 {
  provinceCode: string;
  shortCode: string;
  placeType: 'Thành phố Trung Ương' | 'Tỉnh';
  name: string;
  dvhcvnName: string;
  shortName: string;
  featured?: boolean;
  mergedFrom?: string;
  aliases: string[];
  wards: VnWardTuple2026[];
}

export const VN_PROVINCES_2026: VnProvince2026[] = ${JSON.stringify(provincesOut, null, 2)};
`;

fs.writeFileSync(path.join(webLibDir, 'vn-admin-2026.data.ts'), adminTsContent, 'utf8');

// Build lazy-loaded legacy 63-province -> district -> ward -> newWardCode mapping tree
const treeMap = new Map();
for (const row of [...mappingRows, ...ISLAND_FALLBACKS]) {
  if (!row.oldProvince || !row.oldDistrict || !row.oldWard || !row.newWardCode) continue;
  if (!wardCodeToProvCode.has(row.newWardCode)) continue;
  if (!treeMap.has(row.oldProvince)) {
    treeMap.set(row.oldProvince, new Map());
  }
  const distMap = treeMap.get(row.oldProvince);
  if (!distMap.has(row.oldDistrict)) {
    distMap.set(row.oldDistrict, []);
  }
  distMap.get(row.oldDistrict).push([row.oldWard, row.newWardCode]);
}

const legacyTree = [...treeMap.entries()]
  .sort((a, b) => viCollator.compare(cleanOldProvShort(a[0]), cleanOldProvShort(b[0])))
  .map(([oldProvince, distMap]) => ({
    oldProvince,
    districts: [...distMap.entries()]
      .sort((a, b) => viCollator.compare(a[0], b[0]))
      .map(([oldDistrict, wardPairs]) => {
        // Deduplicate identical oldWard names in same district if any
        const seen = new Set();
        const deduped = [];
        for (const pair of wardPairs.sort((x, y) => viCollator.compare(x[0], y[0]))) {
          const key = `${pair[0]}|${pair[1]}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(pair);
          }
        }
        return {
          oldDistrict,
          wards: deduped
        };
      })
  }));

const mappingsTsContent = `// Auto-generated from thanhtrungit97/dvhcvn (mapping_old_data/ward_mappings.sql)
// Bảng ánh xạ đầy đủ 63 Tỉnh/TP cũ -> Quận/Huyện cũ -> Phường/Xã cũ sang Mã Phường/Xã/Đặc khu mới 2026
// Lazy-loaded on demand via dynamic import() so initial bundle stays minimal.

export interface VnLegacyDistrictNode {
  oldDistrict: string;
  wards: Array<readonly [oldWard: string, newWardCode: string]>;
}

export interface VnLegacyProvinceNode {
  oldProvince: string;
  districts: VnLegacyDistrictNode[];
}

export const VN_LEGACY_WARD_TREE_2026: VnLegacyProvinceNode[] = ${JSON.stringify(legacyTree)};
`;

fs.writeFileSync(path.join(webLibDir, 'vn-dvhcvn-mappings.data.ts'), mappingsTsContent, 'utf8');

const totalWards = provincesOut.reduce((sum, p) => sum + p.wards.length, 0);
const totalMappedPairs = legacyTree.reduce(
  (sum, p) => sum + p.districts.reduce((s2, d) => s2 + d.wards.length, 0),
  0
);
console.log(
  `Synced dvhcvn successfully: ${provincesOut.length} provinces, ${totalWards} wards, ${legacyTree.length} legacy provinces, ${totalMappedPairs} legacy ward mappings.`
);
