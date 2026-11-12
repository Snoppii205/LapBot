import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AdminProfile } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import { RetroTopProgress, WindowFrame } from '../../components/os/RetroOsPrimitives.js';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconKey,
  IconSpinner,
  IconTerminalAdmin,
  IconUsers
} from '../../components/icons/RetroIcons.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void apiJson<AdminProfile>('/admin/me')
      .then(() => {
        if (active) navigate('/admin', { replace: true });
      })
      .catch(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiJson<AdminProfile>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });
      navigate('/admin', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Đăng nhập thất bại.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="admin-login-wrap"
      style={{ maxWidth: '480px', margin: '36px auto', padding: '0 16px' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <Link
          to="/"
          className="auth-back-link"
          style={{ textDecoration: 'none', color: 'var(--ink-primary)' }}
        >
          <IconArrowLeft size={14} />
          <span>Quay về trang chủ Storefront</span>
        </Link>
      </div>

      <WindowFrame title="ADMIN_AUTH.SYS" subtitle="CỔNG QUẢN TRỊ VẬN HÀNH" accent="amber">
        <RetroTopProgress
          active={checkingSession || busy}
          label="Đang xác thực phiên quản trị..."
        />
        <div className="admin-login-head" style={{ marginBottom: '18px' }}>
          <span className="admin-login-icon">
            <IconTerminalAdmin size={22} />
          </span>
          <div>
            <p className="eyebrow">LAPBOT OPERATIONS CONSOLE</p>
            <h1 style={{ margin: 0, fontSize: '1.35rem' }}>Đăng nhập Quản trị viên</h1>
          </div>
        </div>

        {error && (
          <div role="alert" className="os-alert-banner danger">
            <IconAlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="os-auth-form" onSubmit={submit}>
          <div className="os-field-group">
            <div className="os-field-label-row">
              <label htmlFor="admin-username">Tài khoản vận hành</label>
              <span className="os-field-badge">RBAC</span>
            </div>
            <div className="os-input-box">
              <span className="os-input-leading-icon">
                <IconUsers size={16} />
              </span>
              <input
                id="admin-username"
                autoComplete="username"
                required
                disabled={busy || checkingSession}
                placeholder="VD: admin hoặc tên nhân sự..."
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="os-field-group">
            <div className="os-field-label-row">
              <label htmlFor="admin-password">Mật khẩu xác thực</label>
              <span className="os-field-badge locked">SCRYPT</span>
            </div>
            <div className="os-input-box">
              <span className="os-input-leading-icon">
                <IconKey size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={busy || checkingSession}
                placeholder="Nhập mật khẩu quản trị..."
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="os-input-action-btn"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`retro-btn retro-btn-primary os-auth-submit ${busy || checkingSession ? 'is-busy' : ''}`.trim()}
            disabled={busy || checkingSession}
          >
            {(checkingSession || busy) && <IconSpinner size={15} />}
            <span>
              {checkingSession
                ? 'ĐANG KIỂM TRA PHIÊN...'
                : busy
                  ? 'ĐANG XÁC THỰC...'
                  : 'TRUY CẬP WORKSPACE QUẢN TRỊ'}
            </span>
          </button>
        </form>
      </WindowFrame>
    </section>
  );
}
