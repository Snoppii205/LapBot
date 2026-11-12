import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { AddressLabelType, ShippingAddressParts } from '@lapbot/contracts';
import {
  ADDRESS_TYPE_OPTIONS,
  VN_PROVINCES_2026,
  findWardByCode,
  findWardInProvince,
  formatShippingAddress,
  isAddressPartsComplete,
  loadDvhcvnLegacyTree,
  matchVietnameseQuery,
  type VnLegacyProvinceNode
} from '../../lib/vn-locations.js';
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconGraduationCap,
  IconHome,
  IconMapPin,
  IconRefresh,
  IconRotateCcw,
  IconSearch,
  IconX
} from '../icons/RetroIcons.js';

interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  aliases?: string[];
  metaRight?: string;
  unitKind?: 'PHUONG' | 'XA' | 'DAC_KHU';
}

type WardFilterKind = 'ALL' | 'PHUONG' | 'XA' | 'DAC_KHU';

function detectUnitKind(name: string): 'PHUONG' | 'XA' | 'DAC_KHU' {
  if (name.startsWith('Phường ')) return 'PHUONG';
  if (name.startsWith('Đặc khu ')) return 'DAC_KHU';
  return 'XA';
}

function LocationCombobox({
  label,
  labelAction,
  placeholder,
  searchPlaceholder,
  value,
  displayLabel,
  options,
  quickChips,
  disabled = false,
  enableWardFilter = false,
  onChange
}: {
  label: string;
  labelAction?: React.ReactNode;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  displayLabel?: string;
  options: ComboboxOption[];
  quickChips?: Array<{ label: string; value: string }>;
  disabled?: boolean;
  enableWardFilter?: boolean;
  onChange: (nextValue: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [wardFilter, setWardFilter] = useState<WardFilterKind>('ALL');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    setWardFilter('ALL');
  }, [options]);

  const counts = useMemo(() => {
    if (!enableWardFilter) return { phuong: 0, xa: 0, dacKhu: 0 };
    let phuong = 0;
    let xa = 0;
    let dacKhu = 0;
    for (const opt of options) {
      if (opt.unitKind === 'PHUONG') phuong++;
      else if (opt.unitKind === 'DAC_KHU') dacKhu++;
      else xa++;
    }
    return { phuong, xa, dacKhu };
  }, [enableWardFilter, options]);

  const filtered = useMemo(() => {
    return options.filter(opt => {
      if (enableWardFilter && wardFilter !== 'ALL' && opt.unitKind !== wardFilter) {
        return false;
      }
      if (!query.trim()) return true;
      return matchVietnameseQuery(query, opt.label, [
        ...(opt.sublabel ? [opt.sublabel] : []),
        ...(opt.aliases ?? [])
      ]);
    });
  }, [options, query, enableWardFilter, wardFilter]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 20);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const selectValue = (val: string) => {
    onChange(val.trim());
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, Math.max(0, filtered.length - 1)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(0, prev - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        selectValue(filtered[activeIndex].value);
      }
    }
  };

  const shownText = displayLabel ?? value;

  return (
    <div
      ref={rootRef}
      className={`vn-combo-field ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <div className="vn-combo-label-row">
        <span className="vn-combo-label">{label}</span>
        {labelAction}
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        className={`vn-combo-trigger ${value ? 'has-value' : ''}`}
        onClick={() => {
          if (!disabled) setOpen(prev => !prev);
        }}
      >
        <span className="vn-combo-trigger-text">{shownText || placeholder}</span>
        <IconChevronDown size={15} className={`vn-combo-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="vn-combo-popover" role="listbox" id={listId} onKeyDown={handleKeyDown}>
          <div className="vn-combo-search-bar">
            <IconSearch size={14} className="vn-combo-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="vn-combo-search-input"
            />
            {query && (
              <button
                type="button"
                className="os-plain-icon-btn"
                aria-label="Xóa từ khóa"
                onClick={() => setQuery('')}
              >
                <IconX size={13} />
              </button>
            )}
          </div>

          {quickChips && quickChips.length > 0 && !query.trim() && (
            <div className="vn-ward-filter-strip">
              {quickChips.map(chip => (
                <button
                  key={chip.value}
                  type="button"
                  className={`vn-ward-filter-chip ${value === chip.value ? 'active' : ''}`}
                  onClick={() => selectValue(chip.value)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {enableWardFilter && options.length > 0 && (
            <div className="vn-ward-filter-strip">
              <button
                type="button"
                className={`vn-ward-filter-chip ${wardFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => {
                  setWardFilter('ALL');
                  setActiveIndex(0);
                }}
              >
                Tất cả ({options.length})
              </button>
              {counts.phuong > 0 && (
                <button
                  type="button"
                  className={`vn-ward-filter-chip ${wardFilter === 'PHUONG' ? 'active' : ''}`}
                  onClick={() => {
                    setWardFilter('PHUONG');
                    setActiveIndex(0);
                  }}
                >
                  Phường ({counts.phuong})
                </button>
              )}
              {counts.xa > 0 && (
                <button
                  type="button"
                  className={`vn-ward-filter-chip ${wardFilter === 'XA' ? 'active' : ''}`}
                  onClick={() => {
                    setWardFilter('XA');
                    setActiveIndex(0);
                  }}
                >
                  Xã ({counts.xa})
                </button>
              )}
              {counts.dacKhu > 0 && (
                <button
                  type="button"
                  className={`vn-ward-filter-chip ${wardFilter === 'DAC_KHU' ? 'active' : ''}`}
                  onClick={() => {
                    setWardFilter('DAC_KHU');
                    setActiveIndex(0);
                  }}
                >
                  Đặc khu ({counts.dacKhu})
                </button>
              )}
            </div>
          )}

          <div className="vn-combo-options">
            {filtered.map((opt, idx) => {
              const selected = opt.value === value;
              const highlighted = idx === activeIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`vn-combo-option ${selected ? 'selected' : ''} ${
                    highlighted ? 'highlighted' : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => selectValue(opt.value)}
                >
                  <div className="vn-combo-opt-copy">
                    <span className="vn-combo-opt-main">{opt.label}</span>
                    {opt.sublabel && <small className="vn-combo-opt-sub">{opt.sublabel}</small>}
                  </div>
                  {selected ? (
                    <IconCheck size={14} />
                  ) : opt.metaRight ? (
                    <span
                      className={`vn-combo-opt-meta ${opt.unitKind === 'DAC_KHU' ? 'special' : ''}`}
                    >
                      {opt.metaRight}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="vn-combo-empty">
                Không tìm thấy kết quả khớp &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface VietnamAddressComposerProps {
  value: ShippingAddressParts;
  onChange: (nextParts: ShippingAddressParts, formattedAddress: string) => void;
  compact?: boolean;
  required?: boolean;
  errorMessage?: string;
  onClear?: () => void;
}

const COMPACT_TYPE_LABELS: Record<AddressLabelType, string> = {
  HOME: 'Nhà riêng',
  OFFICE: 'Văn phòng',
  CAMPUS: 'Trường / KTX'
};

export function VietnamAddressComposer({
  value,
  onChange,
  compact = false,
  required = false,
  errorMessage,
  onClear
}: VietnamAddressComposerProps) {
  const [converterOpen, setConverterOpen] = useState(false);
  const [legacyTree, setLegacyTree] = useState<VnLegacyProvinceNode[] | null>(null);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [oldProv, setOldProv] = useState('');
  const [oldDist, setOldDist] = useState('');
  const [oldWardVal, setOldWardVal] = useState('');
  const [convertedBanner, setConvertedBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!converterOpen || legacyTree) return;
    let active = true;
    setLegacyLoading(true);
    void loadDvhcvnLegacyTree()
      .then(tree => {
        if (active) setLegacyTree(tree);
      })
      .finally(() => {
        if (active) setLegacyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [converterOpen, legacyTree]);

  const selectedProvince = useMemo(
    () =>
      VN_PROVINCES_2026.find(
        p =>
          (value.province_code && p.provinceCode === value.province_code) ||
          p.name === value.province ||
          p.dvhcvnName === value.province
      ) ?? null,
    [value.province, value.province_code]
  );

  const selectedWardTuple = useMemo(
    () => findWardInProvince(selectedProvince, value.ward_code || value.ward),
    [selectedProvince, value.ward, value.ward_code]
  );

  const quickCityChips = useMemo(
    () =>
      VN_PROVINCES_2026.filter(p => p.featured).map(city => ({
        label: city.shortName,
        value: city.name
      })),
    []
  );

  const provinceOptions = useMemo<ComboboxOption[]>(
    () =>
      VN_PROVINCES_2026.map(p => ({
        value: p.name,
        label: p.name,
        sublabel: p.mergedFrom ? `Gồm: ${p.mergedFrom}` : undefined,
        aliases: p.aliases,
        metaRight: `${p.wards.length} xã/phường`
      })),
    []
  );

  const wardOptions = useMemo<ComboboxOption[]>(() => {
    const list = selectedProvince?.wards ?? [];
    const mapped: ComboboxOption[] = list.map(([wCode, wName]) => {
      const kind = detectUnitKind(wName);
      return {
        value: wName,
        label: wName,
        aliases: [wCode],
        unitKind: kind,
        metaRight: kind === 'DAC_KHU' ? `Đặc khu · ${wCode}` : wCode
      };
    });
    if (value.ward && !list.some(([, wName]) => wName === value.ward)) {
      mapped.unshift({
        value: value.ward,
        label: value.ward,
        unitKind: detectUnitKind(value.ward),
        metaRight: 'Đã lưu'
      });
    }
    return mapped;
  }, [selectedProvince, value.ward]);

  const legacyProvOptions = useMemo<ComboboxOption[]>(() => {
    if (!legacyTree) return [];
    return legacyTree.map(p => ({
      value: p.oldProvince,
      label: p.oldProvince,
      metaRight: `${p.districts.length} Q/H`
    }));
  }, [legacyTree]);

  const activeLegacyProv = useMemo(
    () => legacyTree?.find(p => p.oldProvince === oldProv) ?? null,
    [legacyTree, oldProv]
  );

  const legacyDistOptions = useMemo<ComboboxOption[]>(() => {
    if (!activeLegacyProv) return [];
    return activeLegacyProv.districts.map(d => ({
      value: d.oldDistrict,
      label: d.oldDistrict,
      metaRight: `${d.wards.length} P/X`
    }));
  }, [activeLegacyProv]);

  const activeLegacyDist = useMemo(
    () => activeLegacyProv?.districts.find(d => d.oldDistrict === oldDist) ?? null,
    [activeLegacyProv, oldDist]
  );

  const legacyWardOptions = useMemo<ComboboxOption[]>(() => {
    if (!activeLegacyDist) return [];
    return activeLegacyDist.wards.map(([wOld, newCode]) => {
      const target = findWardByCode(newCode);
      return {
        value: `${wOld}::${newCode}`,
        label: wOld,
        sublabel: target ? `→ ${target.wardName}` : undefined,
        metaRight: newCode
      };
    });
  }, [activeLegacyDist]);

  const emit = (patch: Partial<ShippingAddressParts>) => {
    const next: ShippingAddressParts = {
      province: patch.province !== undefined ? patch.province : value.province,
      ward: patch.ward !== undefined ? patch.ward : value.ward,
      street_detail: patch.street_detail !== undefined ? patch.street_detail : value.street_detail,
      address_type:
        patch.address_type !== undefined ? patch.address_type : (value.address_type ?? 'HOME'),
      ...(patch.province_code !== undefined
        ? patch.province_code
          ? { province_code: patch.province_code }
          : {}
        : value.province_code
          ? { province_code: value.province_code }
          : {}),
      ...(patch.ward_code !== undefined
        ? patch.ward_code
          ? { ward_code: patch.ward_code }
          : {}
        : value.ward_code
          ? { ward_code: value.ward_code }
          : {})
    };
    onChange(next, formatShippingAddress(next));
  };

  const handleProvinceSelect = (provName: string) => {
    const found = VN_PROVINCES_2026.find(p => p.name === provName);
    if (provName === value.province && found?.provinceCode === value.province_code) return;
    setConvertedBanner(null);
    emit({
      province: provName,
      province_code: found?.provinceCode ?? '',
      ward: '',
      ward_code: ''
    });
  };

  const handleWardSelect = (wardName: string) => {
    const foundWard = findWardInProvince(selectedProvince, wardName);
    setConvertedBanner(null);
    emit({
      province: selectedProvince?.name ?? value.province,
      province_code: selectedProvince?.provinceCode ?? value.province_code ?? '',
      ward: foundWard?.wardName ?? wardName,
      ward_code: foundWard?.wardCode ?? ''
    });
  };

  const handleLegacyWardPick = (composite: string) => {
    setOldWardVal(composite);
    const sepIdx = composite.lastIndexOf('::');
    if (sepIdx === -1) return;
    const oldWardLabel = composite.slice(0, sepIdx);
    const newWardCode = composite.slice(sepIdx + 2);
    const resolved = findWardByCode(newWardCode);
    if (!resolved) return;

    emit({
      province: resolved.province.name,
      province_code: resolved.province.provinceCode,
      ward: resolved.wardName,
      ward_code: resolved.wardCode
    });
    setConvertedBanner(
      `${oldWardLabel} (${oldDist}) → ${resolved.wardName}, ${resolved.province.shortName}`
    );
    setConverterOpen(false);
  };

  const formatted = formatShippingAddress(value);
  const complete = isAddressPartsComplete(value);
  const activeType = value.address_type ?? 'HOME';
  const hasAnyValue = Boolean(value.province || value.ward || value.street_detail);

  const missingSteps: string[] = [];
  if (!value.province.trim()) missingSteps.push('Tỉnh/TP');
  if (!value.ward.trim()) missingSteps.push('Phường/Xã');
  if (value.street_detail.trim().length < 3) missingSteps.push('Số nhà & tên đường');

  const renderTypeIcon = (type: AddressLabelType) => {
    if (type === 'OFFICE') return <IconBuilding size={13} />;
    if (type === 'CAMPUS') return <IconGraduationCap size={13} />;
    return <IconHome size={13} />;
  };

  const effectiveProvCode = selectedProvince?.provinceCode ?? value.province_code;
  const effectiveWardCode = selectedWardTuple?.wardCode ?? value.ward_code;

  return (
    <div className={`vn-address-composer ${compact ? 'vn-address-compact' : ''}`}>
      {/* Primary Step: Clean 2-Column 2026 Administrative Dropdowns */}
      <div className="vn-admin-grid">
        <LocationCombobox
          label="Tỉnh / Thành phố *"
          labelAction={
            <button
              type="button"
              aria-expanded={converterOpen}
              className={`vn-quiet-action-link ${converterOpen ? 'active' : ''}`}
              onClick={() => setConverterOpen(prev => !prev)}
            >
              <IconRefresh size={11} />
              <span>{converterOpen ? 'Đóng tra cứu cũ' : 'Tra từ địa chỉ cũ'}</span>
            </button>
          }
          placeholder="Chọn Tỉnh / Thành phố (34 đơn vị)..."
          searchPlaceholder="Tìm tên tỉnh mới hoặc cũ (VD: Bình Dương, Huế)..."
          value={value.province}
          options={provinceOptions}
          quickChips={quickCityChips}
          onChange={handleProvinceSelect}
        />

        <LocationCombobox
          label="Phường / Xã / Đặc khu *"
          labelAction={
            selectedProvince ? (
              <span className="vn-combo-label-hint">{selectedProvince.wards.length} đơn vị</span>
            ) : undefined
          }
          placeholder={
            selectedProvince ? 'Chọn Phường / Xã / Đặc khu...' : 'Chọn Tỉnh / Thành phố trước'
          }
          searchPlaceholder="Tìm tên Phường, Xã, Đặc khu hoặc mã số..."
          value={value.ward}
          options={wardOptions}
          disabled={!value.province}
          enableWardFilter
          onChange={handleWardSelect}
        />
      </div>

      {/* Collapsible Old-to-2026 Helper (only visible when requested) */}
      {converterOpen && (
        <div className="vn-legacy-converter-box">
          <div className="vn-legacy-converter-head">
            <div>
              <strong>Tra cứu từ địa chỉ cũ (trước sáp nhập 01/07/2025)</strong>
              <p>
                Chọn Quận/Huyện và Phường/Xã cũ — hệ thống tự động điền đơn vị mới theo NQ
                202/2025/QH15.
              </p>
            </div>
            <button
              type="button"
              className="os-plain-icon-btn"
              aria-label="Đóng bảng chuyển đổi"
              onClick={() => setConverterOpen(false)}
            >
              <IconX size={14} />
            </button>
          </div>

          {legacyLoading ? (
            <p className="vn-legacy-loading">Đang tải dữ liệu đối chiếu...</p>
          ) : (
            <div className="vn-legacy-grid-3col">
              <LocationCombobox
                label="Tỉnh / Thành cũ"
                placeholder="Chọn Tỉnh/TP cũ..."
                searchPlaceholder="Tìm trong 63 Tỉnh/TP cũ..."
                value={oldProv}
                options={legacyProvOptions}
                onChange={prov => {
                  setOldProv(prov);
                  setOldDist('');
                  setOldWardVal('');
                }}
              />
              <LocationCombobox
                label="Quận / Huyện cũ"
                placeholder={oldProv ? 'Chọn Quận/Huyện...' : 'Chọn Tỉnh trước'}
                searchPlaceholder="Gõ Quận, Huyện, Thị xã cũ..."
                value={oldDist}
                options={legacyDistOptions}
                disabled={!oldProv}
                onChange={dist => {
                  setOldDist(dist);
                  setOldWardVal('');
                }}
              />
              <LocationCombobox
                label="Phường / Xã cũ"
                placeholder={oldDist ? 'Chọn Phường/Xã cũ...' : 'Chọn Quận/Huyện trước'}
                searchPlaceholder="Gõ Phường, Xã, Thị trấn cũ..."
                value={oldWardVal}
                displayLabel={oldWardVal ? oldWardVal.split('::')[0] : ''}
                options={legacyWardOptions}
                disabled={!oldDist}
                onChange={handleLegacyWardPick}
              />
            </div>
          )}
        </div>
      )}

      {convertedBanner && (
        <div className="vn-converted-notice" role="status">
          <IconCheck size={13} />
          <span>
            Đã chuyển sang chuẩn 2026: <strong>{convertedBanner}</strong>
          </span>
        </div>
      )}

      {/* Specific Street / House Number */}
      <div className="vn-street-field">
        <div className="vn-combo-label-row">
          <label htmlFor="vn-street-input" className="vn-combo-label">
            Số nhà, tên đường (Địa chỉ giao hàng) {required ? '*' : ''}
          </label>
        </div>
        <div className="vn-street-input-wrap">
          <IconMapPin size={15} className="vn-street-pin" />
          <input
            id="vn-street-input"
            type="text"
            required={required}
            maxLength={240}
            placeholder={
              activeType === 'OFFICE'
                ? 'Ví dụ: Tầng 12 Tòa nhà Bitexco, Số 2 Hải Triều'
                : activeType === 'CAMPUS'
                  ? 'Ví dụ: KTX Khu B ĐHQG, Khu phố Đông Hòa'
                  : 'Ví dụ: Số 144 Xuân Thủy (hoặc Khu phố / Thôn / Ấp)'
            }
            value={value.street_detail}
            onChange={e => emit({ street_detail: e.target.value })}
          />
        </div>
      </div>

      {/* Subtle Footer Row: Flat Segmented Address Type + Optional Reset */}
      <div className="vn-composer-footer-row">
        <div className="vn-segmented-types" role="radiogroup" aria-label="Loại địa chỉ nhận hàng">
          {ADDRESS_TYPE_OPTIONS.map(opt => {
            const selected = activeType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`vn-seg-type-btn ${selected ? 'active' : ''}`}
                onClick={() => emit({ address_type: opt.value })}
              >
                {renderTypeIcon(opt.value)}
                <span>{COMPACT_TYPE_LABELS[opt.value]}</span>
              </button>
            );
          })}
        </div>

        {hasAnyValue && (
          <button
            type="button"
            className="vn-quiet-reset-btn"
            onClick={() => {
              setConvertedBanner(null);
              setOldProv('');
              setOldDist('');
              setOldWardVal('');
              const cleared: ShippingAddressParts = {
                province: '',
                ward: '',
                street_detail: '',
                address_type: 'HOME'
              };
              onChange(cleared, '');
              onClear?.();
            }}
          >
            <IconRotateCcw size={12} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Calm 1-Line Live Summary (only shown once user starts filling) */}
      {hasAnyValue && (
        <div className={`vn-live-summary ${complete ? 'is-valid' : 'is-pending'}`}>
          <div className="vn-live-summary-main">
            {complete ? <IconCheck size={14} /> : <IconMapPin size={14} />}
            <span>{formatted}</span>
          </div>
          {complete ? (
            <span className="vn-live-summary-code">
              {effectiveProvCode && effectiveWardCode
                ? `Mã ${effectiveProvCode}/${effectiveWardCode}`
                : 'Chuẩn 2026'}
            </span>
          ) : (
            <span className="vn-live-summary-missing">Còn thiếu: {missingSteps.join(', ')}</span>
          )}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="os-field-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
