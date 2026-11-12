import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { AdminProfile } from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';
import {
  AdminKpiGridSkeleton,
  RetroLoadingBar,
  RetroTopProgress,
  WindowFrame
} from '../../components/os/RetroOsPrimitives.js';
import {
  IconBotCpu,
  IconChartBar,
  IconClose,
  IconExternalLink,
  IconGrid,
  IconLock,
  IconLogOut,
  IconMessageSquare,
  IconPackage,
  IconSettings,
  IconSpinner,
  IconUsers
} from '../../components/icons/RetroIcons.js';

export function AdminGuard() {
  const [admin, setAdmin] = useState<AdminProfile | null | undefined>();

  useEffect(() => {
    let active = true;
    void apiJson<AdminProfile>('/admin/me')
      .then(value => {
        if (active) setAdmin(value);
      })
      .catch(() => {
        if (active) setAdmin(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (admin === undefined) {
    return (
      <div style={{ maxWidth: '520px', margin: '64px auto', padding: '0 16px' }}>
        <RetroTopProgress
          active
          className="is-fixed-top"
          label="Đang kiểm tra phiên quản trị viên..."
        />
        <WindowFrame title="SYSTEM_AUTH.SYS" subtitle="KIỂM TRA PHIÊN VẬN HÀNH" accent="amber">
          <RetroLoadingBar label="Đang xác thực quyền truy cập Workspace Quản trị..." />
        </WindowFrame>
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <AdminShell admin={admin}>
      <Outlet />
    </AdminShell>
  );
}

function AdminShell({ admin, children }: { admin: AdminProfile; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Live sidebar counts
  const [waitingChatCount, setWaitingChatCount] = useState<number>(0);
  const [pendingOrderCount, setPendingOrderCount] = useState<number>(0);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBadges = async () => {
    try {
      const [chatRes, orderRes] = await Promise.all([
        apiJson<{ items: unknown[]; counts_by_mode?: { waiting: number } }>(
          '/admin/chat/sessions?mode=WAITING&limit=1'
        ).catch(() => ({ items: [], counts_by_mode: { waiting: 0 } })),
        apiJson<{ counts_by_status?: Record<string, number> }>('/admin/orders?limit=1').catch(
          (): { counts_by_status: Record<string, number> } => ({ counts_by_status: {} })
        )
      ]);
      setWaitingChatCount(chatRes.counts_by_mode?.waiting ?? chatRes.items.length);
      const counts = (orderRes.counts_by_status || {}) as Record<string, number>;
      setPendingOrderCount(counts['CONFIRMED_COD'] || 0);
    } catch {
      // ignore badge fetch errors
    }
  };

  useEffect(() => {
    void fetchBadges();
    const timer = setInterval(fetchBadges, 20000);
    return () => clearInterval(timer);
  }, []);

  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await apiJson('/admin/logout', { method: 'POST', body: '{}' }).catch(() => {});
    navigate('/admin/login', { replace: true });
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 10) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 10 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }
    setPwSaving(true);
    try {
      await apiJson('/admin/me/password', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 1400);
    } catch (err: unknown) {
      setPwMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Đổi mật khẩu thất bại.'
      });
    } finally {
      setPwSaving(false);
    }
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: <IconChartBar size={16} />,
      active: location.pathname === '/admin' || location.pathname === '/admin/dashboard'
    },
    {
      to: '/admin/catalog',
      label: 'Kho & Danh mục',
      icon: <IconGrid size={16} />,
      active: location.pathname.startsWith('/admin/catalog')
    },
    {
      to: '/admin/orders',
      label: 'Quản lý đơn hàng',
      icon: <IconPackage size={16} />,
      badge: pendingOrderCount > 0 ? pendingOrderCount : undefined,
      active: location.pathname.startsWith('/admin/orders')
    },
    {
      to: '/admin/chat',
      label: 'CSKH Trực tiếp (HITL)',
      icon: <IconMessageSquare size={16} />,
      badge: waitingChatCount > 0 ? waitingChatCount : undefined,
      active: location.pathname.startsWith('/admin/chat')
    },
    {
      to: '/admin/ai',
      label: 'Trí tuệ AI & Model',
      icon: <IconBotCpu size={16} />,
      active: location.pathname.startsWith('/admin/ai')
    },
    {
      to: '/admin/users',
      label: 'Khách hàng & Staff',
      icon: <IconUsers size={16} />,
      active: location.pathname.startsWith('/admin/users')
    },
    {
      to: '/admin/settings',
      label: 'Cài đặt & Kiểm toán',
      icon: <IconSettings size={16} />,
      active: location.pathname.startsWith('/admin/settings')
    }
  ];

  return (
    <div className="admin-workspace">
      {/* Top Status Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <span className="admin-topbar-led" aria-hidden="true" />
          <span className="admin-topbar-title">LAPBOT.ADMIN_OS // WORKSPACE v2.7</span>
        </div>

        <div className="admin-topbar-actions">
          <Link to="/" target="_blank" rel="noreferrer" className="admin-topbar-store-link">
            <IconExternalLink size={12} />
            <span>Storefront</span>
          </Link>

          {/* Operator Pill */}
          <div className="admin-topbar-operator">
            <span className="admin-topbar-operator-name">
              {admin.display_name || admin.username}
            </span>
            <span
              className={`admin-topbar-role ${admin.role === 'SUPER_ADMIN' ? 'is-super' : 'is-staff'}`}
            >
              {admin.role}
            </span>
          </div>

          <button
            type="button"
            className="retro-icon-btn on-dark admin-topbar-btn"
            onClick={() => {
              setShowPasswordModal(true);
              setPwMsg(null);
            }}
            title="Đổi mật khẩu tài khoản"
            aria-label="Đổi mật khẩu tài khoản"
          >
            <IconLock size={14} />
            <span>Mật khẩu</span>
          </button>

          <button
            type="button"
            disabled={signingOut}
            className="retro-icon-btn on-dark admin-topbar-btn is-logout"
            onClick={() => void signOut()}
            title="Đăng xuất khỏi phiên quản trị"
          >
            {signingOut ? <IconSpinner size={14} /> : <IconLogOut size={14} />}
            <span>{signingOut ? 'Đang thoát...' : 'Thoát'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Sidebar + Dynamic Content */}
      <div className="admin-body-layout">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav" aria-label="Điều hướng phân hệ quản trị">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-sidebar-link ${item.active ? 'active' : ''}`}
              >
                <div className="admin-sidebar-item-inner">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="admin-badge-count">{item.badge}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div>Hệ điều hành: LAPBOT_OS</div>
            <div>Bảo mật: RBAC + Scrypt</div>
          </div>
        </aside>

        <main className="admin-content">
          <Suspense
            fallback={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <RetroTopProgress active label="Đang tải phân hệ quản trị..." />
                <AdminKpiGridSkeleton count={4} />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>

      {/* Operator Password Change Modal */}
      {showPasswordModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowPasswordModal(false)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: '480px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="retro-window-header">
              <span>ĐỔI MẬT KHẨU TÀI KHOẢN ({admin.username})</span>
              <button
                type="button"
                className="retro-icon-btn on-dark"
                onClick={() => setShowPasswordModal(false)}
                aria-label="Đóng"
              >
                <IconClose size={15} />
              </button>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="admin-modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              {pwMsg && (
                <div
                  role="alert"
                  className={`os-alert-banner ${pwMsg.type === 'success' ? 'success' : 'danger'}`}
                  style={{ marginBottom: 0 }}
                >
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="pw-old"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '5px'
                  }}
                >
                  Mật khẩu hiện tại:
                </label>
                <input
                  id="pw-old"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="pw-new"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '5px'
                  }}
                >
                  Mật khẩu mới (tối thiểu 10 ký tự):
                </label>
                <input
                  id="pw-new"
                  type="password"
                  required
                  minLength={10}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="pw-confirm"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '5px'
                  }}
                >
                  Xác nhận lại mật khẩu mới:
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  required
                  minLength={10}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1.5px solid var(--ink-border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="retro-btn"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className={`retro-btn retro-btn-primary ${pwSaving ? 'is-busy' : ''}`.trim()}
                >
                  {pwSaving && <IconSpinner size={14} />}
                  <span>{pwSaving ? 'ĐANG LƯU...' : 'LƯU MẬT KHẨU MỚI'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
