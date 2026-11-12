import { useEffect, useState } from 'react';
import {
  adminAuditActions,
  adminAuditEntityTypes,
  type AdminAuditEvent,
  type AdminProfile,
  type AdminStoreSettings
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { downloadCsv } from '../../lib/csv.js';
import {
  AdminTableRowsSkeleton,
  RetroSkeleton,
  RetroTopProgress
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconDownload,
  IconRotateCcw,
  IconSearch,
  IconSettings,
  IconSpinner
} from '../../components/icons/RetroIcons.js';

const auditEntityLabels: Record<string, string> = {
  LAPTOP: 'LAPTOP (Dòng máy)',
  VARIANT: 'VARIANT (SKU cấu hình)',
  CHAT_SESSION: 'CHAT_SESSION (Phiên tư vấn)',
  ORDER: 'ORDER (Đơn hàng)',
  CUSTOMER: 'CUSTOMER (Khách hàng)',
  STAFF: 'STAFF (Nhân sự)',
  STORE_SETTINGS: 'STORE_SETTINGS (Cài đặt cửa hàng)',
  AI_CONFIG: 'AI_CONFIG (Cấu hình AI)'
};

export function AdminSettingsPage() {
  const [tab, setTab] = useState<'settings' | 'audit'>('settings');
  const [me, setMe] = useState<AdminProfile | null>(null);

  // Store Settings State
  const [settings, setSettings] = useState<AdminStoreSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [priceTaxNote, setPriceTaxNote] = useState('');
  const [shippingScope, setShippingScope] = useState('');
  const [warrantyPolicy, setWarrantyPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [supportHours, setSupportHours] = useState('');
  const [contactChannels, setContactChannels] = useState<string[]>([]);
  const [newChannel, setNewChannel] = useState('');
  const [policyLinks, setPolicyLinks] = useState<string[]>([]);
  const [newPolicyLink, setNewPolicyLink] = useState('');

  // Audit Logs State
  const [audits, setAudits] = useState<AdminAuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAction, setAuditAction] = useState('');
  const [auditEntityType, setAuditEntityType] = useState('');
  const [auditQ, setAuditQ] = useState('');
  const [auditFrom, setAuditFrom] = useState('');
  const [auditTo, setAuditTo] = useState('');
  const [auditCursor, setAuditCursor] = useState('');
  const [auditCursorStack, setAuditCursorStack] = useState<string[]>([]);
  const [auditNextCursor, setAuditNextCursor] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AdminAuditEvent | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    void apiJson<AdminProfile>('/admin/me')
      .then(setMe)
      .catch(() => {});
  }, []);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiJson<AdminStoreSettings>('/admin/settings');
      setSettings(data);
      setStoreName(data.store_name);
      setShippingFee(data.shipping_fee_vnd);
      setPriceTaxNote(data.price_tax_note);
      setShippingScope(data.shipping_scope);
      setWarrantyPolicy(data.warranty_policy);
      setReturnPolicy(data.return_policy);
      setSupportHours(data.support_hours);
      setContactChannels(data.contact_channels || []);
      setPolicyLinks(data.policy_links || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không tải được cài đặt cửa hàng.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchAudits = async (
    overrideCursor?: string,
    overrides?: { action?: string; entityType?: string; q?: string; from?: string; to?: string }
  ) => {
    setAuditLoading(true);
    setErrorMsg(null);
    const activeCursor = overrideCursor !== undefined ? overrideCursor : auditCursor;
    const act = overrides?.action !== undefined ? overrides.action : auditAction;
    const ent = overrides?.entityType !== undefined ? overrides.entityType : auditEntityType;
    const keyword = overrides?.q !== undefined ? overrides.q : auditQ;
    const fromDate = overrides?.from !== undefined ? overrides.from : auditFrom;
    const toDate = overrides?.to !== undefined ? overrides.to : auditTo;
    try {
      const q = new URLSearchParams();
      if (act) q.set('action', act);
      if (ent) q.set('entity_type', ent);
      if (keyword.trim()) q.set('q', keyword.trim());
      if (fromDate) q.set('from', fromDate);
      if (toDate) q.set('to', toDate);
      if (activeCursor) q.set('cursor', activeCursor);
      const res = await apiJson<{ items: AdminAuditEvent[]; next_cursor: string | null }>(
        `/admin/audit?${q}`
      );
      setAudits(res.items);
      setAuditNextCursor(res.next_cursor);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Không tải được nhật ký kiểm toán.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'settings') {
      void fetchSettings();
    } else {
      void fetchAudits();
    }
  }, [tab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await apiJson<AdminStoreSettings>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          store_name: storeName,
          shipping_fee_vnd: Number(shippingFee),
          price_tax_note: priceTaxNote,
          shipping_scope: shippingScope,
          warranty_policy: warrantyPolicy,
          return_policy: returnPolicy,
          support_hours: supportHours,
          contact_channels: contactChannels,
          policy_links: policyLinks
        })
      });
      setSettings(updated);
      setSuccessMsg('Đã lưu thiết lập cửa hàng thành công!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu cài đặt.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddChannel = () => {
    if (!newChannel.trim()) return;
    setContactChannels([...contactChannels, newChannel.trim()]);
    setNewChannel('');
  };

  const handleRemoveChannel = (index: number) => {
    setContactChannels(contactChannels.filter((_, i) => i !== index));
  };

  const handleAddPolicyLink = () => {
    if (!newPolicyLink.trim()) return;
    setPolicyLinks([...policyLinks, newPolicyLink.trim()]);
    setNewPolicyLink('');
  };

  const handleRemovePolicyLink = (index: number) => {
    setPolicyLinks(policyLinks.filter((_, i) => i !== index));
  };

  const handleExportAuditCsv = () => {
    if (audits.length === 0) return;
    downloadCsv(
      `lapbot-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'ID sự kiện',
        'Thời gian',
        'Hành động',
        'Thực thể',
        'Mã thực thể',
        'Người thực hiện',
        'Loại actor',
        'Metadata JSON'
      ],
      audits.map(a => [
        a.id,
        a.created_at,
        a.action,
        a.entity_type,
        a.entity_id ?? '',
        a.actor_name ?? '',
        a.actor_type,
        JSON.stringify(a.metadata ?? {})
      ])
    );
  };

  const canMutateSettings = me?.role === 'SUPER_ADMIN';
  const hasAuditFilters = Boolean(auditAction || auditEntityType || auditQ || auditFrom || auditTo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
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
            <IconSettings size={22} />
            <span>THIẾT LẬP CỬA HÀNG & NHẬT KÝ BẢO MẬT (AUDIT LOGS)</span>
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Cấu hình chính sách bảo hành, biểu phí giao hàng COD và tra cứu nhật ký kiểm toán mọi
            hành động quản trị.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`retro-btn ${tab === 'settings' ? 'retro-btn-primary' : ''}`}
            onClick={() => setTab('settings')}
          >
            CÀI ĐẶT CỬA HÀNG
          </button>
          <button
            type="button"
            className={`retro-btn ${tab === 'audit' ? 'retro-btn-primary' : ''}`}
            onClick={() => setTab('audit')}
          >
            NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            background: '#fdf2f2',
            border: '1px solid #e74c3c',
            color: '#c0392b',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Lỗi: </strong> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: '#eafaf1',
            border: '1px solid #2ecc71',
            color: '#27ae60',
            padding: '10px 14px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <strong>Thành công: </strong> {successMsg}
        </div>
      )}

      {/* TAB 1: STORE SETTINGS */}
      {tab === 'settings' && (
        <div className="retro-window" style={{ position: 'relative' }}>
          <RetroTopProgress
            active={(settingsLoading && Boolean(settings)) || settingsSaving}
            label="Đang xử lý thiết lập cửa hàng"
          />
          <div className="retro-window-header" style={{ flexWrap: 'wrap' }}>
            <span>THÔNG TIN THƯƠNG HIỆU, BIỂU PHÍ COD & CHÍNH SÁCH BẢO HÀNH</span>
            {settings && (
              <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 400 }}>
                Cập nhật lần cuối: {new Date(settings.updated_at).toLocaleString('vi-VN')}
              </span>
            )}
          </div>

          {settingsLoading && !settings ? (
            <div
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}
              role="status"
              aria-busy="true"
            >
              <div className="admin-grid-2col">
                <RetroSkeleton height={60} radius={4} />
                <RetroSkeleton height={60} radius={4} />
              </div>
              <div className="admin-grid-2col">
                <RetroSkeleton height={60} radius={4} />
                <RetroSkeleton height={60} radius={4} />
              </div>
              <RetroSkeleton height={60} radius={4} />
              <RetroSkeleton height={96} radius={4} />
              <RetroSkeleton height={96} radius={4} />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} style={{ padding: '24px' }}>
              <fieldset
                className="admin-rbac-fieldset"
                disabled={!canMutateSettings}
                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
              >
                <div className="admin-grid-2col">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Tên hiển thị cửa hàng (Store Name):
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={e => setStoreName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Phí giao hàng & đồng kiểm COD (VND):
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={shippingFee}
                      onChange={e => setShippingFee(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Điền 0 nếu miễn phí vận chuyển toàn quốc.
                    </span>
                  </div>
                </div>

                <div className="admin-grid-2col">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Giờ làm việc & Hỗ trợ khách hàng:
                    </label>
                    <input
                      type="text"
                      value={supportHours}
                      onChange={e => setSupportHours(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Phạm vi giao hàng:
                    </label>
                    <input
                      type="text"
                      value={shippingScope}
                      onChange={e => setShippingScope(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--ink-border)',
                        borderRadius: '3px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Ghi chú giá & Thuế niêm yết:
                  </label>
                  <input
                    type="text"
                    value={priceTaxNote}
                    onChange={e => setPriceTaxNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Quy định chính sách bảo hành (hiển thị cho khách và AI tư vấn):
                  </label>
                  <textarea
                    rows={4}
                    value={warrantyPolicy}
                    onChange={e => setWarrantyPolicy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      marginBottom: '4px'
                    }}
                  >
                    Chính sách đổi trả & đồng kiểm hàng:
                  </label>
                  <textarea
                    rows={4}
                    value={returnPolicy}
                    onChange={e => setReturnPolicy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--ink-border)',
                      borderRadius: '3px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div className="admin-grid-2col">
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Kênh liên hệ hỗ trợ:
                    </label>
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}
                    >
                      {contactChannels.map((ch, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--ink-border)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{ch}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChannel(idx)}
                            aria-label="Xóa kênh liên hệ"
                            className="retro-icon-btn"
                            style={{ color: '#c0392b', padding: '2px' }}
                          >
                            <IconClose size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Hotline: 1900 xxxx, Zalo: 0912..."
                        value={newChannel}
                        onChange={e => setNewChannel(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddChannel();
                          }
                        }}
                        style={{
                          flex: '1 1 180px',
                          padding: '7px 10px',
                          border: '1px solid var(--ink-border)',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddChannel}
                        className="retro-btn retro-btn-sm"
                      >
                        + Thêm kênh
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginBottom: '4px'
                      }}
                    >
                      Liên kết trang chính sách tham khảo (Policy Links):
                    </label>
                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}
                    >
                      {policyLinks.map((lnk, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--ink-border)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{lnk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePolicyLink(idx)}
                            aria-label="Xóa liên kết chính sách"
                            className="retro-icon-btn"
                            style={{ color: '#c0392b', padding: '2px' }}
                          >
                            <IconClose size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="/policy/warranty hoặc URL hướng dẫn..."
                        value={newPolicyLink}
                        onChange={e => setNewPolicyLink(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPolicyLink();
                          }
                        }}
                        style={{
                          flex: '1 1 180px',
                          padding: '7px 10px',
                          border: '1px solid var(--ink-border)',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddPolicyLink}
                        className="retro-btn retro-btn-sm"
                      >
                        + Thêm liên kết
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  {canMutateSettings ? (
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className={`retro-btn retro-btn-primary ${settingsSaving ? 'is-busy' : ''}`}
                      style={{ padding: '10px 24px' }}
                    >
                      {settingsSaving && <IconSpinner size={15} />}
                      <span>
                        {settingsSaving ? 'ĐANG LƯU THIẾT LẬP...' : 'LƯU CÀI ĐẶT CỬA HÀNG'}
                      </span>
                    </button>
                  ) : (
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--ink-secondary)',
                        fontStyle: 'italic',
                        padding: '8px 14px',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--ink-border)',
                        borderRadius: '3px'
                      }}
                    >
                      * Chế độ xem: Chỉ tài khoản <strong>SUPER_ADMIN</strong> mới có quyền lưu thay
                      đổi cấu hình.
                    </div>
                  )}
                </div>
              </fieldset>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Audit Filters Bar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--ink-border)',
              borderRadius: '4px',
              padding: '12px 16px'
            }}
          >
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSearch size={16} />
              <input
                placeholder="Tìm kiếm nội dung nhật ký kiểm toán..."
                value={auditQ}
                onChange={e => setAuditQ(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setAuditCursor('');
                    setAuditCursorStack([]);
                    void fetchAudits('');
                  }
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span>Hành động:</span>
              <select
                value={auditAction}
                onChange={e => setAuditAction(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              >
                <option value="">Tất cả hành động</option>
                {adminAuditActions.map(act => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span>Thực thể:</span>
              <select
                value={auditEntityType}
                onChange={e => setAuditEntityType(e.target.value)}
                style={{
                  padding: '6px 10px',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              >
                <option value="">Tất cả thực thể</option>
                {adminAuditEntityTypes.map(ent => (
                  <option key={ent} value={ent}>
                    {auditEntityLabels[ent] ?? ent}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span>Từ:</span>
              <input
                type="date"
                aria-label="Từ ngày"
                value={auditFrom}
                onChange={e => setAuditFrom(e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              />
              <span>Đến:</span>
              <input
                type="date"
                aria-label="Đến ngày"
                value={auditTo}
                onChange={e => setAuditTo(e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1px solid var(--ink-border)',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              />
            </div>

            <button
              type="button"
              disabled={auditLoading}
              onClick={() => {
                setAuditCursor('');
                setAuditCursorStack([]);
                void fetchAudits('');
              }}
              className={`retro-btn retro-btn-primary ${auditLoading ? 'is-busy' : ''}`}
              style={{ fontSize: '12px' }}
            >
              {auditLoading && <IconSpinner size={13} />}
              <span>LỌC NHẬT KÝ</span>
            </button>

            {hasAuditFilters && (
              <button
                type="button"
                onClick={() => {
                  setAuditAction('');
                  setAuditEntityType('');
                  setAuditQ('');
                  setAuditFrom('');
                  setAuditTo('');
                  setAuditCursor('');
                  setAuditCursorStack([]);
                  void fetchAudits('', { action: '', entityType: '', q: '', from: '', to: '' });
                }}
                className="retro-btn"
                style={{ fontSize: '12px' }}
              >
                <IconRotateCcw size={13} />
                <span>Đặt lại</span>
              </button>
            )}

            <button
              type="button"
              disabled={audits.length === 0}
              onClick={handleExportAuditCsv}
              className="retro-btn"
              style={{ fontSize: '12px' }}
            >
              <IconDownload size={14} />
              <span>XUẤT CSV NHẬT KÝ</span>
            </button>
          </div>

          {/* Audit Table */}
          <div className="admin-table-wrap" style={{ position: 'relative' }}>
            <RetroTopProgress
              active={auditLoading && audits.length > 0}
              label="Đang tải nhật ký kiểm toán"
            />
            <table
              className={`admin-table ${auditLoading && audits.length > 0 ? 'is-refreshing-pane' : ''}`}
            >
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Hành động (Action)</th>
                  <th>Thực thể (Entity)</th>
                  <th>Người thực hiện (Actor)</th>
                  <th>Chi tiết metadata</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading && audits.length === 0 ? (
                  <AdminTableRowsSkeleton columns={5} rows={6} />
                ) : audits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                    >
                      Không có nhật ký nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  audits.map(a => (
                    <tr key={a.id}>
                      <td
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {new Date(a.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--accent-primary)'
                          }}
                        >
                          {a.action}
                        </span>
                      </td>
                      <td>
                        <span>{a.entity_type}</span>{' '}
                        {a.entity_id && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: 'var(--text-muted)'
                            }}
                          >
                            ({a.entity_id.slice(0, 8)}...)
                          </span>
                        )}
                      </td>
                      <td>
                        <strong>{a.actor_name || a.actor_type}</strong>
                        {a.actor_id && (
                          <div
                            style={{
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            {a.actor_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedAudit(a)}
                          className="retro-btn retro-btn-sm"
                        >
                          Xem chi tiết JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {(auditCursorStack.length > 0 || auditNextCursor) && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderTop: '1px solid var(--ink-border)'
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Trang {auditCursorStack.length + 1}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={auditCursorStack.length === 0 || auditLoading}
                    onClick={() => {
                      const prev = auditCursorStack[auditCursorStack.length - 1] ?? '';
                      setAuditCursorStack(s => s.slice(0, -1));
                      setAuditCursor(prev);
                      void fetchAudits(prev);
                    }}
                    className="retro-btn retro-btn-sm"
                  >
                    <IconChevronLeft size={14} />
                    <span>Trước</span>
                  </button>
                  <button
                    type="button"
                    disabled={!auditNextCursor || auditLoading}
                    onClick={() => {
                      if (!auditNextCursor) return;
                      setAuditCursorStack(s => [...s, auditCursor]);
                      setAuditCursor(auditNextCursor);
                      void fetchAudits(auditNextCursor);
                    }}
                    className="retro-btn retro-btn-sm"
                  >
                    <span>Tiếp</span>
                    <IconChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedAudit(null)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '600px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>CHI TIẾT KIỂM TOÁN // {selectedAudit.action}</span>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                aria-label="Đóng"
                className="retro-icon-btn on-dark"
              >
                <IconClose size={14} />
              </button>
            </div>

            <div
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div
                style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
              >
                <div>
                  Mã sự kiện: <code>{selectedAudit.id}</code>
                </div>
                <div>Thời gian: {new Date(selectedAudit.created_at).toLocaleString('vi-VN')}</div>
                <div>
                  Thực hiện bởi:{' '}
                  <strong>{selectedAudit.actor_name || selectedAudit.actor_type}</strong> (
                  {selectedAudit.actor_id})
                </div>
                <div>
                  Thực thể tác động: <strong>{selectedAudit.entity_type}</strong> (
                  {selectedAudit.entity_id})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  DỮ LIỆU METADATA:
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: '12px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--ink-border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {JSON.stringify(selectedAudit.metadata, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="button" onClick={() => setSelectedAudit(null)} className="retro-btn">
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
