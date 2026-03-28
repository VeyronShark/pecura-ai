import { Link, useLocation } from 'react-router-dom';
import { Home, FlaskConical, Calendar, LayoutDashboard, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const nav = [
  { name: 'Home',        href: '/',                  icon: Home },
  { name: 'Dashboard',   href: '/dashboard',          icon: LayoutDashboard },
  { name: 'Products',    href: '/products',           icon: ShoppingBag },
  { name: 'Ingredients', href: '/ingredient-checker', icon: FlaskConical },
  { name: 'Routine',     href: '/routine-builder',    icon: Calendar },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const { skinProfile } = useApp();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-tertiary)' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--c-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--c-accent1)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--c-accent1-fg)' }} />
              </div>
              <span className="text-lg font-bold text-white">Pecura <span style={{ color: 'var(--c-accent1)' }}>AI</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {nav.map(({ name, href, icon: Icon }) => {
                const active = location.pathname === href;
                return (
                  <Link key={name} to={href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon className="w-4 h-4" />{name}
                  </Link>
                );
              })}
            </nav>

            {/* CTA */}
            {skinProfile ? (
              <Link to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
                style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--c-primary)', color: '#fff' }}>
                  {skinProfile.skin_type[0]}
                </div>
                {skinProfile.skin_type} skin
              </Link>
            ) : (
              <Link to="/quiz"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}
              >
                Take Quiz
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Mobile nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t"
        style={{ background: 'var(--c-primary)', borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="flex justify-around py-2">
          {nav.map(({ name, href, icon: Icon }) => {
            const active = location.pathname === href;
            return (
              <Link key={name} to={href}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors"
                style={{ color: active ? 'var(--c-accent1)' : 'rgba(255,255,255,0.6)' }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ── */}
      <footer className="hidden md:block py-4 border-t"
        style={{ background: 'var(--c-primary)', borderColor: 'rgba(255,255,255,0.15)' }}>
        <p className="text-center text-xs text-white/60 max-w-4xl mx-auto px-4">
          Pecura AI is not a substitute for professional dermatological advice. Always consult a healthcare provider for serious skin concerns.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
