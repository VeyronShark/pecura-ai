import { Link, useLocation } from 'react-router-dom';
import { Home, FlaskConical, Calendar, LayoutDashboard, ShoppingBag, Leaf, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useState } from 'react';

const nav = [
  { name: 'Home',        href: '/',                  icon: Home },
  { name: 'Dashboard',   href: '/dashboard',          icon: LayoutDashboard },
  { name: 'Products',    href: '/products',           icon: ShoppingBag },
  { name: 'Ingredients', href: '/ingredient-checker', icon: FlaskConical },
  { name: 'Routine',     href: '/routine-builder',    icon: Calendar },
];

const NAV_ACCENTS = [
  'var(--c-primary-light)',
  'var(--c-secondary-light)',
  'var(--c-tertiary-light)',
  'var(--c-accent1-light)',
  'var(--c-accent2-light)',
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { skinProfile } = useApp();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Pecura<span style={{ color: 'var(--c-accent1-light)', opacity: 0.9 }}> AI</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Skin profile chip */}
      {skinProfile && (
        <div className="mx-4 mb-5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-white/50 mb-0.5">Your skin type</p>
          <p className="text-sm font-semibold text-white">{skinProfile.skin_type}</p>
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(skinProfile.confidence * 100)}%`, background: 'var(--c-accent1-light)' }} />
          </div>
          <p className="text-xs text-white/40 mt-1">{Math.round(skinProfile.confidence * 100)}% confidence</p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map(({ name, href, icon: Icon }, idx) => {
          const active = location.pathname === href;
          return (
            <Link key={name} to={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                borderLeft: active ? `3px solid ${NAV_ACCENTS[idx]}` : '3px solid transparent',
              }}>
              <Icon className="w-4 h-4 shrink-0" />
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      {!skinProfile && (
        <div className="p-4 mt-auto">
          <Link to="/quiz" onClick={onClose}
            className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--c-secondary)', color: '#fff' }}>
            Take the Quiz
          </Link>
        </div>
      )}

      <div className="p-4 mt-auto">
        <p className="text-xs text-white/25 leading-relaxed">
          Not a substitute for professional dermatological advice.
        </p>
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="app-content flex flex-col">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14"
          style={{ background: 'var(--c-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Pecura AI</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
