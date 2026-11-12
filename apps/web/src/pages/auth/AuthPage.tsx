import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ShippingAddressParts } from '@lapbot/contracts';
import { useAuth } from '../../features/auth/AuthContext.js';
import { ApiClientError } from '../../lib/api-client.js';
import { formatShippingAddress, isAddressPartsComplete } from '../../lib/vn-locations.js';
import { VietnamAddressComposer } from '../../components/address/VietnamAddressComposer.js';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter.js';
import { RetroTopProgress, WindowFrame } from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconSparkleAi,
  IconSpinner,
  IconTruckCod,
  IconUsers
} from '../../components/icons/RetroIcons.js';

const EMPTY_ADDRESS: ShippingAddressParts = {
  province: '',
  ward: '',
  street_detail: '',
  address_type: 'HOME'
};

function sanitizeReturnUrl(raw: string | null): string {
  if (!raw) return '/catalog';
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/login') &&
    !trimmed.startsWith('/register')
  ) {
    return trimmed;
  }
  return '/catalog';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'LB';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

export function AuthPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, customer } = useAuth();

  const returnUrl = sanitizeReturnUrl(searchParams.get('return_url'));
  const derivedMode: 'login' | 'register' =
    location.pathname === '/register' || searchParams.get('mode') === 'register'
      ? 'register'
      : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(derivedMode);

  useEffect(() => {
    setMode(derivedMode);
  }, [derivedMode]);

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [enableAddressOnSignup, setEnableAddressOnSignup] = useState(false);
  const [addressParts, setAddressParts] = useState<ShippingAddressParts>(EMPTY_ADDRESS);

  // Feedback state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      navigate(returnUrl, { replace: true });
    }
  }, [customer, navigate, returnUrl]);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMsg(null);
    setFieldErrors({});
    const targetPath = nextMode === 'register' ? '/register' : '/login';
    const qs = searchParams.get('return_url') ? `?return_url=${encodeURIComponent(returnUrl)}` : '';
    navigate(`${targetPath}${qs}`, { replace: true });
  };

  const detectedLoginHint = useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    if (trimmed.includes('@')) return 'Email';
    if (/^(\+84|0)[0-9\s.-]{6,}$/.test(trimmed)) return 'SĐT di động';
    return null;
  }, [identifier]);

  const liveCardName =
    mode === 'register'
      ? fullName.trim() || 'Thành viên LapBot mới'
      : identifier.trim() || 'Khách hàng thành viên';

  const liveCardContact =
    mode === 'register'
      ? [regEmail.trim(), regPhone.trim()].filter(Boolean).join(' · ') ||
        'Nhập thông tin bên phải để khởi tạo hồ sơ'
      : 'Đồng bộ lịch sử tư vấn AI & đơn hàng COD';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password: loginPassword });
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setErrorMsg(err instanceof Error ? err.message : 'Đăng nhập không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const localErrors: Record<string, string> = {};

    const cleanName = fullName.replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) {
      localErrors.full_name = 'Họ và tên cần tối thiểu 2 ký tự.';
    }

    const cleanPhone = regPhone.replace(/[\s().-]/g, '').replace(/^\+84/, '0');
    if (cleanPhone && !/^0[35789][0-9]{8}$/.test(cleanPhone)) {
      localErrors.phone = 'Số điện thoại cần đúng 10 chữ số di động Việt Nam (03/05/07/08/09).';
    }

    if (regPassword.length < 8) {
      localErrors.password = 'Mật khẩu cần tối thiểu 8 ký tự.';
    } else if (regPassword !== regConfirmPassword) {
      localErrors.confirm_password = 'Mật khẩu nhập lại không khớp.';
    }

    if (enableAddressOnSignup && !isAddressPartsComplete(addressParts)) {
      localErrors.default_shipping_address =
        'Vui lòng chọn đủ Tỉnh/Thành phố, Phường/Xã/Đặc khu và nhập số nhà/tên đường (hoặc tắt mục địa chỉ để thiết lập sau).';
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setErrorMsg('Vui lòng kiểm tra lại các mục được đánh dấu bên dưới.');
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const formattedAddr = enableAddressOnSignup ? formatShippingAddress(addressParts) : undefined;
      await register({
        full_name: cleanName,
        email: regEmail.trim(),
        phone: cleanPhone || undefined,
        password: regPassword,
        default_shipping_address: formattedAddr,
        shipping_address_meta: enableAddressOnSignup ? addressParts : null
      });
      navigate(returnUrl, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setErrorMsg(err instanceof Error ? err.message : 'Đăng ký tài khoản không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasValidSignupAddr =
    mode === 'register' && enableAddressOnSignup && isAddressPartsComplete(addressParts);

  return (
    <div className="auth-portal-layout">
      {/* Left Column: Calm Editorial Member Card & Benefits */}
      <aside className="auth-aside-col">
        <WindowFrame title="THẺ THÀNH VIÊN LAPBOT" accent="amber">
          <div className="auth-pass-stack">
            <div className="auth-member-id-card">
              <div className="auth-id-card-top">
                <div className="auth-avatar-monogram" aria-hidden="true">
                  {getInitials(liveCardName)}
                </div>
                <div className="auth-id-card-meta">
                  <span className="auth-id-eyebrow">LAPBOT MEMBER PASS</span>
                  <strong className="auth-id-name">{liveCardName}</strong>
                  <span className="auth-id-contact">{liveCardContact}</span>
                </div>
              </div>

              <div className="auth-id-status-row">
                {hasValidSignupAddr ? (
                  <span className="auth-id-chip valid">
                    <IconCheck size={12} />
                    <span>Đã kèm địa chỉ chuẩn 2026</span>
                  </span>
                ) : (
                  <span className="auth-id-chip">
                    <IconTruckCod size={13} />
                    <span>Giao COD đồng kiểm toàn quốc</span>
                  </span>
                )}
              </div>
            </div>

            <div className="auth-benefits-divider" />

            <div className="auth-benefits-list">
              <div className="auth-benefit-item">
                <span className="auth-benefit-icon">
                  <IconSparkleAi size={17} />
                </span>
                <div>
                  <strong>Đồng bộ phiên tư vấn AI & đơn nháp</strong>
                  <p>
                    Giữ nguyên cuộc trò chuyện cấu hình và các đơn hàng bạn vừa xem trước khi đăng
                    nhập.
                  </p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <span className="auth-benefit-icon">
                  <IconMapPin size={17} />
                </span>
                <div>
                  <strong>Sổ địa chỉ hành chính mới 2026</strong>
                  <p>
                    Chuẩn 34 Tỉnh/Thành &amp; 3.321 Phường/Xã/Đặc khu, tự động điền 1 chạm khi đặt
                    máy.
                  </p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <span className="auth-benefit-icon">
                  <IconShieldCheck size={17} />
                </span>
                <div>
                  <strong>Theo dõi đơn &amp; bảo hành đa thiết bị</strong>
                  <p>
                    Kiểm tra tiến độ đóng gói, vận chuyển và lịch sử mua laptop từ mọi trình duyệt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </WindowFrame>
      </aside>

      {/* Right Column: Clean, Breathable Auth Form */}
      <section className="auth-main-col">
        <WindowFrame
          title={mode === 'login' ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'TẠO TÀI KHOẢN MỚI'}
          accent="warm"
          rightSlot={
            <Link to={returnUrl} className="auth-back-link">
              <IconArrowLeft size={13} />
              <span>Quay lại</span>
            </Link>
          }
        >
          {/* Clean Segmented Switcher */}
          <div className="auth-mode-tabs" role="tablist" aria-label="Chế độ tài khoản">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              <span>Tạo tài khoản</span>
            </button>
          </div>

          <RetroTopProgress active={submitting} label="Đang xác thực tài khoản..." />

          {errorMsg && (
            <div role="alert" className="os-alert-banner danger">
              <IconAlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="os-auth-form">
              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="login-identifier">Email hoặc Số điện thoại</label>
                  {detectedLoginHint && <span className="os-field-badge">{detectedLoginHint}</span>}
                </div>
                <div className="os-input-box">
                  <span className="os-input-leading-icon">
                    {identifier.includes('@') ? <IconMail size={16} /> : <IconPhone size={16} />}
                  </span>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="ten@email.com hoặc 0912 345 678"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="login-password">Mật khẩu</label>
                </div>
                <div className="os-input-box">
                  <span className="os-input-leading-icon">
                    <IconLock size={16} />
                  </span>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="os-input-action-btn"
                    aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowLoginPassword(prev => !prev)}
                  >
                    {showLoginPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`primary-button os-auth-submit ${submitting ? 'is-busy' : ''}`.trim()}
              >
                {submitting && <IconSpinner size={16} />}
                <span>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                {!submitting && <IconArrowRight size={16} />}
              </button>

              <p className="auth-switch-prompt">
                Chưa có tài khoản LapBot?{' '}
                <button
                  type="button"
                  className="os-inline-text-btn"
                  onClick={() => switchMode('register')}
                >
                  Tạo tài khoản mới
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="os-auth-form" noValidate>
              <div className="os-field-group">
                <div className="os-field-label-row">
                  <label htmlFor="reg-fullname">Họ và tên *</label>
                </div>
                <div className={`os-input-box ${fieldErrors.full_name ? 'has-error' : ''}`}>
                  <span className="os-input-leading-icon">
                    <IconUsers size={16} />
                  </span>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                {fieldErrors.full_name && (
                  <span className="os-field-error">{fieldErrors.full_name}</span>
                )}
              </div>

              <div className="os-form-row-2col">
                <div className="os-field-group">
                  <div className="os-field-label-row">
                    <label htmlFor="reg-email">Email *</label>
                  </div>
                  <div className={`os-input-box ${fieldErrors.email ? 'has-error' : ''}`}>
                    <span className="os-input-leading-icon">
                      <IconMail size={16} />
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                    />
                  </div>
                  {fieldErrors.email && <span className="os-field-error">{fieldErrors.email}</span>}
                </div>

                <div className="os-field-group">
                  <div className="os-field-label-row">
                    <label htmlFor="reg-phone">Số điện thoại nhận hàng</label>
                  </div>
                  <div className={`os-input-box ${fieldErrors.phone ? 'has-error' : ''}`}>
                    <span className="os-input-leading-icon">
                      <IconPhone size={16} />
                    </span>
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="0912 345 678"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                    />
                  </div>
                  {fieldErrors.phone && <span className="os-field-error">{fieldErrors.phone}</span>}
                </div>
              </div>

              <div className="os-form-row-2col">
                <div className="os-field-group">
                  <div className="os-field-label-row">
                    <label htmlFor="reg-password">Mật khẩu *</label>
                  </div>
                  <div className={`os-input-box ${fieldErrors.password ? 'has-error' : ''}`}>
                    <span className="os-input-leading-icon">
                      <IconLock size={16} />
                    </span>
                    <input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 8 ký tự"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="os-input-action-btn"
                      aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      onClick={() => setShowRegPassword(prev => !prev)}
                    >
                      {showRegPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="os-field-error">{fieldErrors.password}</span>
                  )}
                </div>

                <div className="os-field-group">
                  <div className="os-field-label-row">
                    <label htmlFor="reg-confirm-pw">Nhập lại mật khẩu *</label>
                  </div>
                  <div
                    className={`os-input-box ${fieldErrors.confirm_password ? 'has-error' : ''}`}
                  >
                    <span className="os-input-leading-icon">
                      <IconLock size={16} />
                    </span>
                    <input
                      id="reg-confirm-pw"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Xác nhận mật khẩu"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                    />
                  </div>
                  {fieldErrors.confirm_password && (
                    <span className="os-field-error">{fieldErrors.confirm_password}</span>
                  )}
                </div>
              </div>

              <PasswordStrengthMeter password={regPassword} />

              {/* Clean Optional Shipping Address Switch & Composer */}
              <div
                className={`auth-address-toggle-box ${enableAddressOnSignup ? 'is-expanded' : ''}`}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableAddressOnSignup}
                  className="auth-address-toggle-trigger"
                  onClick={() => {
                    setEnableAddressOnSignup(prev => !prev);
                    setFieldErrors(prev => {
                      const next = { ...prev };
                      delete next.default_shipping_address;
                      return next;
                    });
                  }}
                >
                  <div className="auth-address-toggle-title">
                    <span className="auth-address-pin-badge">
                      <IconMapPin size={15} />
                    </span>
                    <div>
                      <strong>Lưu sẵn địa chỉ nhận hàng mặc định</strong>
                      <p>Tùy chọn · Chuẩn 34 Tỉnh/Thành &amp; Phường/Xã mới 2026</p>
                    </div>
                  </div>
                  <span
                    className={`os-switch-track ${enableAddressOnSignup ? 'on' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="os-switch-thumb" />
                  </span>
                </button>

                {enableAddressOnSignup && (
                  <div className="auth-address-composer-body">
                    <VietnamAddressComposer
                      value={addressParts}
                      onChange={parts => setAddressParts(parts)}
                      required
                      errorMessage={fieldErrors.default_shipping_address}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`primary-button os-auth-submit ${submitting ? 'is-busy' : ''}`.trim()}
              >
                {submitting && <IconSpinner size={16} />}
                <span>{submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản thành viên'}</span>
                {!submitting && <IconArrowRight size={16} />}
              </button>

              <p className="auth-switch-prompt">
                Đã có tài khoản thành viên?{' '}
                <button
                  type="button"
                  className="os-inline-text-btn"
                  onClick={() => switchMode('login')}
                >
                  Đăng nhập ngay
                </button>
              </p>
            </form>
          )}
        </WindowFrame>
      </section>
    </div>
  );
}
