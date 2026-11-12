import { createBrowserRouter, Link, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { StoreInfo } from '@lapbot/contracts';
import { apiJson } from '../lib/api-client.js';
import { CatalogPage } from '../pages/catalog/CatalogPage.js';
import { ChatProvider, useChat } from '../features/chat/ChatContext.js';
import { AuthProvider, useAuth } from '../features/auth/AuthContext.js';
import { CartProvider, useCart } from '../features/cart/CartContext.js';
import { ChatDrawer } from '../components/chat/ChatDrawer.js';
import { CartDrawer } from '../components/cart/CartDrawer.js';
import {
  RetroLoadingBar,
  RetroSkeleton,
  RetroTopProgress,
  WindowFrame
} from '../components/os/RetroOsPrimitives.js';
import {
  IconFileText,
  IconGrid,
  IconPackage,
  IconShieldCheck,
  IconShoppingCart,
  IconSparkleAi,
  IconTerminalAdmin,
  IconTruckCod,
  IconUsers
} from '../components/icons/RetroIcons.js';
const LOGO_URL = '/logo.png';

// Lazy loaded storefront detail & checkout routes (keeps initial / catalog bundle lean)
const ProductPage = lazy(() =>
  import('../pages/product/ProductPage.js').then(m => ({ default: m.ProductPage }))
);
const CheckoutPage = lazy(() =>
  import('../pages/orders/CheckoutPage.js').then(m => ({ default: m.CheckoutPage }))
);
const OrdersPage = lazy(() =>
  import('../pages/orders/OrdersPage.js').then(m => ({ default: m.OrdersPage }))
);
const OrderDetailPage = lazy(() =>
  import('../pages/orders/OrderDetailPage.js').then(m => ({ default: m.OrderDetailPage }))
);

// Lazy loaded customer auth pages
const AuthPage = lazy(() =>
  import('../pages/auth/AuthPage.js').then(m => ({ default: m.AuthPage }))
);
const AccountPage = lazy(() =>
  import('../pages/auth/AccountPage.js').then(m => ({ default: m.AccountPage }))
);

// Lazy loaded admin console suite
const LoginPage = lazy(() =>
  import('../pages/admin/LoginPage.js').then(m => ({ default: m.LoginPage }))
);
const AdminGuard = lazy(() =>
  import('../pages/admin/AdminLayout.js').then(m => ({ default: m.AdminGuard }))
);
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage.js').then(m => ({ default: m.AdminDashboardPage }))
);
const AdminCatalogPage = lazy(() =>
  import('../pages/admin/AdminCatalogPage.js').then(m => ({ default: m.AdminCatalogPage }))
);
const AdminOrdersPage = lazy(() =>
  import('../pages/admin/AdminOrdersPage.js').then(m => ({ default: m.AdminOrdersPage }))
);
const AdminChatPage = lazy(() =>
  import('../pages/admin/AdminChatPage.js').then(m => ({ default: m.AdminChatPage }))
);
const AdminAiPage = lazy(() =>
  import('../pages/admin/AdminAiPage.js').then(m => ({ default: m.AdminAiPage }))
);
const AdminUsersPage = lazy(() =>
  import('../pages/admin/AdminUsersPage.js').then(m => ({ default: m.AdminUsersPage }))
);
const AdminSettingsPage = lazy(() =>
  import('../pages/admin/AdminSettingsPage.js').then(m => ({ default: m.AdminSettingsPage }))
);
const ApiDocsPage = lazy(() =>
  import('../pages/docs/ApiDocsPage.js').then(m => ({ default: m.ApiDocsPage }))
);

function RouteChunkFallback({ label = 'Đang khởi tạo phân hệ...' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <RetroTopProgress active className="is-fixed-top" label={label} />
      <div style={{ padding: '24px 0' }}>
        <RetroLoadingBar label={label} />
      </div>
    </div>
  );
}

const defer = (node: React.ReactNode) => (
  <Suspense fallback={<RouteChunkFallback />}>{node}</Suspense>
);

const COPILOT_MASCOT_URL = '/assets/retro-os/lapbot-copilot-mascot.jpg';

function StoreFooter() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  useEffect(() => {
    void apiJson<StoreInfo>('/store-info')
      .then(setStore)
      .catch(() => {});
  }, []);

  return (
    <footer className="os-footer">
      <div className="os-footer-top">
        <div className="os-footer-brand">
          <span className="os-status-led active" aria-hidden="true" />
          <strong>{store?.store_name ?? 'LapBot Official Store'}</strong>
          <span className="os-footer-tag">LAPBOT.OS v2.6</span>
        </div>
        <div className="os-footer-badges">
          <Link className="os-mini-pill" to="/docs" style={{ textDecoration: 'none' }}>
            <IconFileText size={14} />
            <span>API Docs (OpenAPI)</span>
          </Link>
          <span className="os-mini-pill">
            <IconShieldCheck size={14} />
            <span>Bảo hành chính hãng</span>
          </span>
          <span className="os-mini-pill">
            <IconTruckCod size={14} />
            <span>Giao COD đồng kiểm</span>
          </span>
        </div>
      </div>

      <div className="os-footer-meta">
        <p>Giờ hỗ trợ: {store?.support_hours ?? '08:00 – 22:00 mỗi ngày'}</p>
        <p>
          {store?.price_tax_note ?? 'Giá niêm yết minh bạch, kiểm tra máy trước khi thanh toán.'}
        </p>
        {store?.contact_channels?.length ? (
          <p>Kênh hỗ trợ: {store.contact_channels.join(' · ')}</p>
        ) : null}
      </div>
    </footer>
  );
}

function Shell() {
  const chat = useChat();
  const cart = useCart();
  const { customer, loading: authLoading } = useAuth();
  const location = useLocation();
  const isCatalog =
    location.pathname === '/' ||
    location.pathname === '/catalog' ||
    location.pathname.startsWith('/products');
  const isOrders =
    location.pathname.startsWith('/orders') || location.pathname.startsWith('/checkout');
  const isAccount =
    location.pathname === '/account' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <div
      className={`app-wrapper ${chat.open ? 'split-chat-active' : ''} ${
        chat.open && chat.drawerExpanded ? 'split-chat-expanded' : ''
      }`}
    >
      <main className="shell">
        <header className="os-menubar">
          <Link className="brand" to="/">
            <span className="brand-logo-frame">
              <img src={LOGO_URL} alt="LapBot" className="brand-logo" width="32" height="32" />
            </span>
            <span className="brand-text-group">
              <span className="brand-title">LAPBOT.OS</span>
              <span className="brand-sub">CHAT-TO-ORDER LAPTOP</span>
            </span>
            <span className="brand-live-pill" aria-hidden="true">
              <span className="os-status-led active" />
              ONLINE
            </span>
          </Link>

          <nav aria-label="Điều hướng chính">
            <Link className={`nav-item ${isCatalog ? 'nav-item-active' : ''}`} to="/">
              <IconGrid size={15} />
              <span>Catalog</span>
            </Link>
            <Link className={`nav-item ${isOrders ? 'nav-item-active' : ''}`} to="/orders">
              <IconPackage size={15} />
              <span>Đơn của tôi</span>
            </Link>

            <button
              type="button"
              aria-label="Giỏ hàng"
              className={`nav-item nav-cart-btn ${cart.open ? 'nav-item-active' : ''}`}
              onClick={() => (cart.open ? cart.closeCart() : cart.openCart())}
            >
              <IconShoppingCart size={15} />
              <span>Giỏ hàng</span>
              {cart.count > 0 && <span className="nav-cart-badge">{cart.count}</span>}
            </button>

            {/* Customer Member / Login Link */}
            {authLoading ? (
              <span className="nav-item" aria-hidden="true" style={{ pointerEvents: 'none' }}>
                <RetroSkeleton variant="pill" width={88} height={16} />
              </span>
            ) : customer ? (
              <Link
                className={`nav-item ${location.pathname === '/account' ? 'nav-item-active' : ''}`}
                to="/account"
              >
                <IconUsers size={15} />
                <span>{customer.full_name.split(' ').slice(-1)[0]} (Tài khoản)</span>
              </Link>
            ) : (
              <Link className={`nav-item ${isAccount ? 'nav-item-active' : ''}`} to="/login">
                <IconUsers size={15} />
                <span>Đăng nhập</span>
              </Link>
            )}

            <button
              type="button"
              aria-label="Chat"
              className={`nav-chat-btn ${chat.open ? 'active' : ''}`}
              onClick={() => {
                if (chat.open) {
                  chat.closeChat();
                } else {
                  cart.closeCart();
                  chat.openChat();
                }
              }}
            >
              <IconSparkleAi size={15} />
              <span>{chat.open ? 'Đang mở Chat' : 'Tư vấn AI'}</span>
            </button>

            <Link
              className={`nav-item ${
                location.pathname === '/docs' || location.pathname === '/api-docs'
                  ? 'nav-item-active'
                  : ''
              }`}
              to="/docs"
            >
              <IconFileText size={15} />
              <span>API Docs</span>
            </Link>

            <Link className="nav-item" to="/admin">
              <IconTerminalAdmin size={15} />
              <span>Admin</span>
            </Link>
          </nav>
        </header>

        <div className="main-content-area">
          <Outlet />
        </div>

        <StoreFooter />
      </main>

      <CartDrawer />
      <ChatDrawer />
      {chat.open && <div className="chat-backdrop" onClick={chat.closeChat} aria-hidden="true" />}

      {!chat.open && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => chat.openChat()}
          aria-label="Mở tư vấn LapBot"
          title="Tư vấn & Mua nhanh qua LapBot AI"
        >
          <img src={COPILOT_MASCOT_URL} alt="" className="chat-fab-avatar" width="34" height="34" />
          <span className="chat-fab-copy">
            <strong>Tư vấn AI</strong>
            <small>Chốt đơn 1 chạm</small>
          </span>
        </button>
      )}
    </div>
  );
}

function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <Shell />
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function Missing() {
  return (
    <WindowFrame title="SYSTEM_ERROR // 404" accent="amber">
      <div className="missing-page-box">
        <h1>Không tìm thấy trang yêu cầu</h1>
        <p>Đường dẫn không tồn tại hoặc cấu hình sản phẩm đã được cập nhật.</p>
        <Link to="/" className="primary-button">
          Về trang chủ Catalog
        </Link>
      </div>
    </WindowFrame>
  );
}

export const router = createBrowserRouter([
  // Storefront Application Routes (Customer context, Chatbot drawer, Store menubar & footer)
  {
    element: <Layout />,
    children: [
      { path: '/', element: <CatalogPage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/products/:variant_id', element: defer(<ProductPage />) },
      { path: '/checkout', element: defer(<CheckoutPage />) },
      { path: '/checkout/:variant_id', element: defer(<CheckoutPage />) },
      { path: '/orders', element: defer(<OrdersPage />) },
      { path: '/orders/:order_id', element: defer(<OrderDetailPage />) },
      { path: '/login', element: defer(<AuthPage />) },
      { path: '/register', element: defer(<AuthPage />) },
      { path: '/account', element: defer(<AccountPage />) },
      { path: '/docs', element: defer(<ApiDocsPage />) },
      { path: '/api-docs', element: defer(<ApiDocsPage />) },
      { path: '*', element: <Missing /> }
    ]
  },

  // Dedicated Admin Login Page
  {
    path: '/admin/login',
    element: defer(<LoginPage />)
  },

  // Full-Screen Dedicated Admin OS Console (7 Complete Operations Modules)
  {
    path: '/admin',
    element: defer(<AdminGuard />),
    children: [
      { index: true, element: defer(<AdminDashboardPage />) },
      { path: 'dashboard', element: defer(<AdminDashboardPage />) },
      { path: 'catalog', element: defer(<AdminCatalogPage />) },
      { path: 'orders', element: defer(<AdminOrdersPage />) },
      { path: 'chat', element: defer(<AdminChatPage />) },
      { path: 'ai', element: defer(<AdminAiPage />) },
      { path: 'users', element: defer(<AdminUsersPage />) },
      { path: 'settings', element: defer(<AdminSettingsPage />) }
    ]
  }
]);
