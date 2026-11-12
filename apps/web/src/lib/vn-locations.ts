import type { AddressLabelType, ShippingAddressParts } from '@lapbot/contracts';
import {
  VN_PROVINCES_2026,
  type VnProvince2026,
  type VnWardTuple2026
} from './vn-admin-2026.data.js';
import type { VnLegacyProvinceNode } from './vn-dvhcvn-mappings.data.js';

export { VN_PROVINCES_2026, type VnProvince2026, type VnWardTuple2026, type VnLegacyProvinceNode };

export const ADDRESS_TYPE_OPTIONS: Array<{
  value: AddressLabelType;
  label: string;
  hint: string;
}> = [
  { value: 'HOME', label: 'Nhà riêng', hint: 'Giao tất cả các ngày (08:00 – 20:30)' },
  { value: 'OFFICE', label: 'Văn phòng / Công ty', hint: 'Ưu tiên giao giờ hành chính T2 – T6' },
  { value: 'CAMPUS', label: 'Trường ĐH / Ký túc xá', hint: 'Gọi điện hẹn cổng nhận máy đồng kiểm' }
];

// Fast O(1) lookup table by 5-digit official ward_code (dvhcvn / NQ 202/2025/QH15)
const WARD_BY_CODE_INDEX = new Map<
  string,
  { province: VnProvince2026; wardCode: string; wardName: string }
>();

for (const prov of VN_PROVINCES_2026) {
  for (const [wardCode, wardName] of prov.wards) {
    WARD_BY_CODE_INDEX.set(wardCode, { province: prov, wardCode, wardName });
  }
}

export function stripVietnameseAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchVietnameseQuery(
  query: string,
  target: string,
  aliases: string[] = []
): boolean {
  const q = stripVietnameseAccents(query);
  if (!q) return true;
  if (stripVietnameseAccents(target).includes(q)) return true;
  return aliases.some(alias => stripVietnameseAccents(alias).includes(q));
}

export function findWardByCode(
  wardCode: string
): { province: VnProvince2026; wardCode: string; wardName: string } | null {
  const padded = wardCode.trim().padStart(5, '0');
  return WARD_BY_CODE_INDEX.get(padded) ?? null;
}

export function resolveProvince2026(rawNameOrCode: string): VnProvince2026 | null {
  const trimmed = rawNameOrCode.trim();
  if (!trimmed) return null;

  if (/^[0-9]{1,2}$/.test(trimmed)) {
    const code = trimmed.padStart(2, '0');
    const byCode = VN_PROVINCES_2026.find(p => p.provinceCode === code);
    if (byCode) return byCode;
  }

  const fullNorm = stripVietnameseAccents(trimmed);
  const clean = stripVietnameseAccents(trimmed.replace(/^(tinh|thanh pho|tp\.?)\s+/i, '').trim());

  const exact = VN_PROVINCES_2026.find(
    p =>
      stripVietnameseAccents(p.name) === fullNorm ||
      stripVietnameseAccents(p.dvhcvnName) === fullNorm ||
      stripVietnameseAccents(p.shortName) === clean ||
      stripVietnameseAccents(p.dvhcvnName.replace(/^(Tỉnh|Thành phố)\s+/, '')) === clean ||
      p.shortCode.toLowerCase() === fullNorm
  );
  if (exact) return exact;

  return (
    VN_PROVINCES_2026.find(
      p =>
        (p.mergedFrom && stripVietnameseAccents(p.mergedFrom).includes(clean)) ||
        p.aliases.some(a => stripVietnameseAccents(a) === clean)
    ) ?? null
  );
}

export function findWardInProvince(
  prov: VnProvince2026 | null | undefined,
  rawWardNameOrCode: string
): { wardCode: string; wardName: string } | null {
  if (!prov) return null;
  const trimmed = rawWardNameOrCode.trim();
  if (!trimmed) return null;

  if (/^[0-9]{1,5}$/.test(trimmed)) {
    const code = trimmed.padStart(5, '0');
    const byCode = prov.wards.find(([c]) => c === code);
    if (byCode) return { wardCode: byCode[0], wardName: byCode[1] };
  }

  const fullNorm = stripVietnameseAccents(trimmed);
  const strippedPrefix = stripVietnameseAccents(
    trimmed.replace(/^(phuong|xa|thi tran|dac khu)\s+/i, '')
  );

  const exact = prov.wards.find(([, wName]) => stripVietnameseAccents(wName) === fullNorm);
  if (exact) return { wardCode: exact[0], wardName: exact[1] };

  const byCoreName = prov.wards.find(
    ([, wName]) =>
      stripVietnameseAccents(wName.replace(/^(Phường|Xã|Đặc khu)\s+/, '')) === strippedPrefix
  );
  return byCoreName ? { wardCode: byCoreName[0], wardName: byCoreName[1] } : null;
}

let cachedLegacyTreePromise: Promise<VnLegacyProvinceNode[]> | null = null;

/**
 * Tải lười (lazy-load) bảng ánh xạ 10.039 Phường/Xã cũ -> Mã ĐVHC 2026 mới (thanhtrungit97/dvhcvn).
 */
export function loadDvhcvnLegacyTree(): Promise<VnLegacyProvinceNode[]> {
  if (!cachedLegacyTreePromise) {
    cachedLegacyTreePromise = import('./vn-dvhcvn-mappings.data.js').then(
      mod => mod.VN_LEGACY_WARD_TREE_2026
    );
  }
  return cachedLegacyTreePromise;
}

export function formatShippingAddress(parts: ShippingAddressParts): string {
  const street = parts.street_detail
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
  const ward = parts.ward
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
  const province = parts.province
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
  if (!street && !ward && !province) return '';
  return [street, ward, province].filter(Boolean).join(', ');
}

export function isAddressPartsComplete(parts: ShippingAddressParts | null | undefined): boolean {
  if (!parts) return false;
  return (
    parts.province.trim().length >= 2 &&
    parts.ward.trim().length >= 2 &&
    parts.street_detail.trim().length >= 3
  );
}

/**
 * Khôi phục địa chỉ chuẩn NQ 202/2025/QH15 (Số nhà/Đường, Phường/Xã/Đặc khu, Tỉnh/Thành phố)
 * đồng thời điền mã ĐVHC chuẩn (province_code, ward_code) từ bộ dữ liệu dvhcvn.
 */
export function parseLegacyAddress(
  rawText: string,
  meta?: ShippingAddressParts | null
): ShippingAddressParts {
  if (meta && meta.province && meta.ward && meta.street_detail) {
    if (meta.ward_code) {
      const byWardCode = findWardByCode(meta.ward_code);
      if (byWardCode) {
        return {
          province: byWardCode.province.name,
          province_code: byWardCode.province.provinceCode,
          ward: byWardCode.wardName,
          ward_code: byWardCode.wardCode,
          street_detail: meta.street_detail,
          address_type: meta.address_type ?? 'HOME'
        };
      }
    }
    const resolvedProv = resolveProvince2026(meta.province_code || meta.province);
    const matchedWard = findWardInProvince(resolvedProv, meta.ward);
    return {
      province: resolvedProv?.name ?? meta.province,
      ...(resolvedProv ? { province_code: resolvedProv.provinceCode } : {}),
      ward: matchedWard?.wardName ?? meta.ward,
      ...(matchedWard ? { ward_code: matchedWard.wardCode } : {}),
      street_detail: meta.street_detail,
      address_type: meta.address_type ?? 'HOME'
    };
  }

  const empty: ShippingAddressParts = {
    province: '',
    ward: '',
    street_detail: '',
    address_type: meta?.address_type ?? 'HOME'
  };

  const cleaned = (rawText ?? '').trim();
  if (!cleaned) return empty;

  const segments = cleaned
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (segments.length >= 3) {
    const rawProv = segments[segments.length - 1]!;
    const resolvedProv = resolveProvince2026(rawProv);
    const province = resolvedProv?.name ?? rawProv;

    let candidateWard = segments[segments.length - 2]!;
    let streetSliceEnd = segments.length - 2;

    if (segments.length >= 4 && /^(quận|huyện|thị xã|tp\.?\s|thành phố\s)/i.test(candidateWard)) {
      candidateWard = segments[segments.length - 3]!;
      streetSliceEnd = segments.length - 3;
    }

    const matchedWard = findWardInProvince(resolvedProv, candidateWard);

    return {
      province,
      ...(resolvedProv ? { province_code: resolvedProv.provinceCode } : {}),
      ward: matchedWard?.wardName ?? candidateWard,
      ...(matchedWard ? { ward_code: matchedWard.wardCode } : {}),
      street_detail: segments.slice(0, streetSliceEnd).join(', '),
      address_type: meta?.address_type ?? 'HOME'
    };
  }

  return {
    ...empty,
    street_detail: cleaned
  };
}
