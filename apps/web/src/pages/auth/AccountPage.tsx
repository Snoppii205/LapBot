import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { OrderView, ShippingAddressParts } from '@lapbot/contracts';
import { useAuth } from '../../features/auth/AuthContext.js';
import { useChat } from '../../features/chat/ChatContext.js';
import { ApiClientError, apiJson } from '../../lib/api-client.js';
import { dateTime, money } from '../../lib/format.js';
import {
  ADDRESS_TYPE_OPTIONS,
  formatShippingAddress,
  isAddressPartsComplete,
  parseLegacyAddress
} from '../../lib/vn-locations.js';
import { VietnamAddressComposer } from '../../components/address/VietnamAddressComposer.js';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter.js';
import {
  OrderReceiptSkeletonList,
  RetroLoadingBar,
  RetroTopProgress,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconCheckCircle,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconLock,
  IconLogOut,
  IconMail,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconSparkleAi,
  IconSpinner,
  IconUsers
} from '../../components/icons/RetroIcons.js';

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED_COD: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao thành công',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn báo giá'
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'LB';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

export function AccountPage() {
  const { customer, loading, updateProfile, changePassword, logout } = useAuth();
  const chat = useChat();
  const navigate = useNavigate();

  // Profile & structured address state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressParts, setAddressParts] = useState<ShippingAddressParts>({
    province: '',
    ward: '',
    street_detail: '',
    address_type: 'HOME'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recent orders & UI helpers
  const [recentOrders, setRecentOrders] = useState<OrderView[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    if (customer) {
      setFullName(customer.full_name);
      setPhone(customer.phone || '');
      setAddressParts(
        parseLegacyAddress(customer.default_shipping_address, customer.shipping_address_meta)
      );
    }
  }, [customer]);

  useEffect(() => {
    if (!customer) return;
    let active = true;
    setOrdersLoading(true);
    void apiJson<{ items: OrderView[]; next_cursor: string | null }>('/orders?limit=3')
      .then(res => {
        if (active) setRecentOrders(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [customer]);

  if (loading) {
    return <RetroLoadingBar label="Đang tải hồ sơ khách hàng thành viên..." />;
  }

  if (!customer) {
    return (
      <div className="account-guest-gate">
        <WindowFrame title="MEMBER_ACCESS // CHƯA ĐĂNG NHẬP" accent="amber">
          <div className="account-guest-gate-body">
            <span className="account-gate-icon">
              <IconUsers size={28} />
            </span>
            <h1>Đăng nhập để truy cập Sổ địa chỉ &amp; Hồ sơ thành viên</h1>
            <p>
              Quản lý sổ địa chỉ chuẩn hành chính 2026 (34 Tỉnh/TP · Phường/Xã/Đặc khu), đồng bộ các
              cuộc trò chuyện tư vấn AI và tra cứu lịch sử mua máy trên mọi thiết bị.
            </p>
            <div className="account-gate-actions">
              <Link to="/login?return_url=%2Faccount" className="primary-button">
                <span>Đăng nhập tài khoản</span>
                <IconArrowRight size={15} />
              </Link>
              <Link to="/register?return_url=%2Faccount" className="secondary-keycap-link">
                <span>Tạo tài khoản mới</span>
              </Link>
            </div>
          </div>
        </WindowFrame>
      </div>
    );
  }

  const copyCustomerId = () => {
    void navigator.clipboard?.writeText(customer.customer_id);
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 1800);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const localErrs: Record<string, string> = {};

    const cleanName = fullName.replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) {
      localErrs.full_name = 'Họ và tên cần từ 2 đến 100 ký tự.';
    }

    const cleanPhone = phone.replace(/[\s().-]/g, '').replace(/^\+84/, '0');
    if (cleanPhone && !/^0[35789][0-9]{8}$/.test(cleanPhone)) {
      localErrs.phone = 'Số điện thoại cần đúng 10 chữ số di động Việt Nam (03/05/07/08/09).';
    }

    const hasAnyAddressInput = Boolean(
      addressParts.province.trim() || addressParts.ward.trim() || addressParts.street_detail.trim()
    );

    if (hasAnyAddressInput && !isAddressPartsComplete(addressParts)) {
      localErrs.default_shipping_address =
        'Địa chỉ chưa hoàn chỉnh: vui lòng chọn đủ Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà/tên đường (hoặc bấm Đặt lại để xóa trống).';
    }

    if (Object.keys(localErrs).length > 0) {
      setProfileFieldErrors(localErrs);
      setProfileMsg({
        type: 'error',
        text: 'Vui lòng hoàn thiện các thông tin được đánh dấu màu đỏ trước khi lưu.'
      });
      return;
    }

    setProfileFieldErrors({});
    setProfileSaving(true);
    try {
      await updateProfile({
        full_name: cleanName,
        phone: cleanPhone || null,
        default_shipping_address: hasAnyAddressInput ? formatShippingAddress(addressParts) : '',
        shipping_address_meta: hasAnyAddressInput ? addressParts : null
      });
      setProfileMsg({
        type: 'success',
        text: 'Đã lưu hồ sơ và sổ địa chỉ nhận hàng mặc định thành công!'
      });
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.fieldErrors) {
        setProfileFieldErrors(err.fieldErrors);
      }
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Cập nhật hồ sơ thất bại.'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới cần tối thiểu 8 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp với mật khẩu mới.' });
      return;
    }

    setPwSaving(true);
    try {
      await changePassword({
        current_password: oldPassword,
        new_password: newPassword
      });
      setPwMsg({
        type: 'success',
        text: 'Đổi mật khẩu thành công! Các phiên đăng nhập cũ trên thiết bị khác đã được thu hồi.'
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.'
      });
    } finally {
      setPwSaving(false);
    }
  };

  const [loggingOut, setLoggingOut] = useState(false);

  const executeLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const savedTypeLabel = customer.shipping_address_meta?.address_type
    ? ADDRESS_TYPE_OPTIONS.find(o => o.value === customer.shipping_address_meta?.address_type)
        ?.label
    : null;

  return (
    <div className="account-console-stack">
      {/* Top Member Identity Console Banner */}
      <WindowFrame
        title="HỒ SƠ THÀNH VIÊN"
        accent="amber"
        rightSlot={
          <span className="os-header-badge">
            Tham gia {new Date(customer.created_at).toLocaleDateString('vi-VN')}
          </span>
        }
      >
        <div className="account-hero-bar">
          <div className="account-hero-identity">
            <div className="auth-avatar-monogram large" aria-hidden="true">
              {getInitials(customer.full_name)}
            </div>
            <div className="account-hero-text">
              <h1>{customer.full_name}</h1>
              <div className="account-hero-pills">
                <span className="account-meta-pill">
                  <IconMail size={13} />
                  <span>{customer.email}</span>
                </span>
                <span className="account-meta-pill">
                  <IconPhone size={13} />
                  <span>{customer.phone || 'Chưa lưu SĐT'}</span>
                </span>
                <button
                  type="button"
                  className="account-meta-pill copyable"
                  onClick={copyCustomerId}
                  title="Sao chép mã khách hàng"
                >
                  <IconCopy size={12} />
                  <span>ID: {customer.customer_id.slice(0, 8).toUpperCase()}</span>
                  {copiedId && <strong className="copied-tag">ĐÃ CHÉP</strong>}
                </button>
              </div>
            </div>
          </div>

          <div className="account-hero-actions">
            <Link to="/orders" className="secondary-keycap-link">
              <IconPackage size={15} />
              <span>Đơn hàng của tôi</span>
            </Link>
            <button type="button" onClick={() => chat.openChat()}>
              <IconSparkleAi size={15} />
              <span>Tư vấn AI</span>
            </button>
            {!confirmingLogout ? (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => setConfirmingLogout(true)}
              >
                <IconLogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <div className="account-logout-confirm">
                <span>Thoát phiên?</span>
                <button
                  type="button"
                  disabled={loggingOut}
                  className={`btn-danger-outline compact btn-with-icon ${loggingOut ? 'is-busy' : ''}`.trim()}
                  onClick={() => void executeLogout()}
                >
                  {loggingOut && <IconSpinner size={12} />}
                  <span>{loggingOut ? 'Đang thoát...' : 'Xác nhận'}</span>
                </button>
                <button
                  type="button"
                  disabled={loggingOut}
                  className="compact"
                  onClick={() => setConfirmingLogout(false)}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </WindowFrame>

      {/* Main 2-Column Workspace */}
      <div className="account-grid-2col">
        {/* Left Column: Personal Info & Vietnam 2026 Shipping Address */}
        <WindowFrame
          title="THÔNG TIN & SỔ ĐỊA CHỈ"
          accent="warm"
          rightSlot={
            customer.default_shipping_address ? (
              <span className="os-header-badge">
                {savedTypeLabel ? `Đã lưu · ${savedTypeLabel}` : 'Đã lưu địa chỉ'}
              </span>
            ) : undefined
          }
        >
          <form onSubmit={handleProfileSubmit} className="os-auth-form" noValidate>
            {profileMsg && (
              <div
                role="alert"
                className={`os-alert-banner ${profileMsg.type === 'success' ? 'success' : 'danger'}`}
              >
                {profileMsg.type === 'success' ? (
                  <IconCheckCircle size={17} />
                ) : (
                  <IconAlertTriangle size={17} />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="account-section-heading">
              <IconEdit size={15} />
              <span>Thông tin người nhận mặc định</span>
            </div>

            <div className="os-form-row-2col">
              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="acc-fullname">Họ và tên người nhận *</label>
                </div>
                <div className={`os-input-box ${profileFieldErrors.full_name ? 'has-error' : ''}`}>
                  <span className="os-input-leading-icon">
                    <IconUsers size={16} />
                  </span>
                  <input
                    id="acc-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                {profileFieldErrors.full_name && (
                  <span className="os-field-error">{profileFieldErrors.full_name}</span>
                )}
              </div>

              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="acc-phone">SĐT liên hệ giao COD</label>
                </div>
                <div className={`os-input-box ${profileFieldErrors.phone ? 'has-error' : ''}`}>
                  <span className="os-input-leading-icon">
                    <IconPhone size={16} />
                  </span>
                  <input
                    id="acc-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                {profileFieldErrors.phone && (
                  <span className="os-field-error">{profileFieldErrors.phone}</span>
                )}
              </div>
            </div>

            <div className="os-field-group">
              <div className="os-field-label-row">
                <label htmlFor="acc-email">Email định danh tài khoản</label>
                <span className="os-field-badge locked">Cố định</span>
              </div>
              <div className="os-input-box is-readonly">
                <span className="os-input-leading-icon">
                  <IconMail size={16} />
                </span>
                <input id="acc-email" type="email" disabled value={customer.email} />
              </div>
            </div>

            <div className="account-section-heading">
              <IconMapPin size={15} />
              <span>Địa chỉ giao hàng mặc định (chuẩn 2026)</span>
            </div>

            <VietnamAddressComposer
              value={addressParts}
              onChange={parts => {
                setAddressParts(parts);
                if (profileFieldErrors.default_shipping_address) {
                  setProfileFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.default_shipping_address;
                    return next;
                  });
                }
              }}
              errorMessage={profileFieldErrors.default_shipping_address}
            />

            <RetroTopProgress active={profileSaving} label="Đang lưu hồ sơ nhận hàng..." />
            <button
              type="submit"
              disabled={profileSaving}
              className={`primary-button os-auth-submit ${profileSaving ? 'is-busy' : ''}`.trim()}
            >
              {profileSaving ? <IconSpinner size={16} /> : <IconCheck size={16} />}
              <span>
                {profileSaving ? 'Đang lưu thông tin...' : 'Lưu hồ sơ & địa chỉ nhận hàng'}
              </span>
            </button>
          </form>
        </WindowFrame>

        {/* Right Column: Password Security + Recent Orders */}
        <div className="account-side-stack">
          <WindowFrame title="ĐỔI MẬT KHẨU" accent="warm">
            <form onSubmit={handlePasswordSubmit} className="os-auth-form">
              {pwMsg && (
                <div
                  role="alert"
                  className={`os-alert-banner ${pwMsg.type === 'success' ? 'success' : 'danger'}`}
                >
                  {pwMsg.type === 'success' ? (
                    <IconCheckCircle size={17} />
                  ) : (
                    <IconAlertTriangle size={17} />
                  )}
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="pw-current">Mật khẩu hiện tại *</label>
                </div>
                <div className="os-input-box">
                  <span className="os-input-leading-icon">
                    <IconLock size={16} />
                  </span>
                  <input
                    id="pw-current"
                    type={showPasswords ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu đang dùng"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="os-input-action-btn"
                    aria-label={showPasswords ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPasswords(prev => !prev)}
                  >
                    {showPasswords ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="pw-new">Mật khẩu mới *</label>
                </div>
                <div className="os-input-box">
                  <span className="os-input-leading-icon">
                    <IconLock size={16} />
                  </span>
                  <input
                    id="pw-new"
                    type={showPasswords ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <PasswordStrengthMeter password={newPassword} />

              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="pw-confirm">Nhập lại mật khẩu mới *</label>
                </div>
                <div className="os-input-box">
                  <span className="os-input-leading-icon">
                    <IconLock size={16} />
                  </span>
                  <input
                    id="pw-confirm"
                    type={showPasswords ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwSaving}
                className={`os-auth-submit ${pwSaving ? 'is-busy' : ''}`.trim()}
              >
                {pwSaving ? <IconSpinner size={15} /> : <IconLock size={15} />}
                <span>{pwSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </form>
          </WindowFrame>

          <WindowFrame
            title="ĐƠN HÀNG GẦN ĐÂY"
            accent="mint"
            rightSlot={
              <Link to="/orders" className="auth-back-link">
                <span>Xem tất cả</span>
                <IconArrowRight size={13} />
              </Link>
            }
          >
            {ordersLoading ? (
              <OrderReceiptSkeletonList count={2} compact />
            ) : recentOrders.length === 0 ? (
              <div className="account-orders-empty">
                <p>Bạn chưa có đơn hàng nào được ghi nhận trong tài khoản.</p>
                <Link to="/catalog" className="secondary-keycap-link">
                  <span>Khám phá Catalog Laptop</span>
                  <IconArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="account-recent-orders">
                {recentOrders.map(ord => (
                  <Link
                    key={ord.order_id}
                    to={`/orders/${ord.order_id}`}
                    className="account-order-mini-card"
                  >
                    <div className="account-order-mini-top">
                      <code>{ord.order_code}</code>
                      <span className={`account-order-chip ${ord.status.toLowerCase()}`}>
                        {ORDER_STATUS_LABELS[ord.status] ?? ord.status}
                      </span>
                    </div>
                    <strong className="account-order-model">
                      {ord.product_snapshot.brand} {ord.product_snapshot.model_name}
                    </strong>
                    <div className="account-order-mini-foot">
                      <span className="price">{money(ord.total_vnd)}</span>
                      <span className="account-order-time">
                        {dateTime(ord.confirmed_at || ord.quote_expires_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </WindowFrame>
        </div>
      </div>
    </div>
  );
}
