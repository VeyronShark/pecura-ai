import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Layers, FlaskConical, ChevronRight, Leaf, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const Landing = () => {
  const { skinProfile } = useApp();

  return (
    <div style={{ color: 'var(--c-text)' }}>

      {/* ── NAV — light surface, not dark ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{
          background: 'rgba(253,252,251,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--c-border)',
        }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--c-primary)' }}>
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>Pecura AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/products" className="hidden sm:block text-sm transition-colors"
            style={{ color: 'var(--c-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
            Products
          </Link>
          <Link to="/ingredient-checker" className="hidden sm:block text-sm transition-colors"
            style={{ color: 'var(--c-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
            Ingredients
          </Link>
          {skinProfile ? (
            <Link to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--c-primary)' }}>
              Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link to="/quiz"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--c-primary)' }}>
              Start Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO — light primary background, not dark ── */}
      <section style={{ background: 'var(--c-primary-light)', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-16 items-center w-full">

          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-8"
              style={{ background: 'var(--c-primary)', color: '#fff' }}>
              <Sparkles className="w-3 h-3" /> AI-Powered Skincare
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
              style={{ color: 'var(--c-text)' }}>
              Skincare that<br />
              <span style={{ color: 'var(--c-primary)' }}>actually</span><br />
              works.
            </h1>
            <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              Pecura AI reads your skin, matches products, and builds a routine that fits — not a generic one-size-fits-all plan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/quiz"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'var(--c-primary)' }}>
                Take the Skin Quiz <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--c-surface)', color: 'var(--c-text)', border: '1.5px solid var(--c-border)' }}>
                Browse Products
              </Link>
            </div>
            <p className="text-xs mt-5" style={{ color: 'var(--c-muted)' }}>Free · No account · 2 minutes</p>
          </div>

          {/* Right: stat cards using light variants */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { label: 'Products catalogued', value: '500+', bg: 'var(--c-surface)',           border: 'var(--c-border)',           text: 'var(--c-text)',      sub: 'var(--c-muted)' },
              { label: 'Skin types covered',  value: '5',    bg: 'var(--c-secondary-light)',   border: 'var(--c-secondary-light)',  text: 'var(--c-secondary)', sub: 'var(--c-secondary)' },
              { label: 'Ingredients tracked', value: '60+',  bg: 'var(--c-tertiary-light)',    border: 'var(--c-tertiary-light)',   text: 'var(--c-tertiary)',  sub: 'var(--c-tertiary)' },
              { label: 'Quiz time',           value: '2 min',bg: 'var(--c-accent1-light)',     border: 'var(--c-accent1-light)',    text: 'var(--c-accent1)',   sub: 'var(--c-accent1)' },
            ].map(({ label, value, bg, border, text, sub }) => (
              <div key={label} className="rounded-2xl p-6 flex flex-col justify-between"
                style={{ background: bg, border: `1.5px solid ${border}`, minHeight: '130px' }}>
                <p className="text-xs font-semibold" style={{ color: sub, opacity: 0.7 }}>{label}</p>
                <p className="text-4xl font-black mt-2" style={{ color: text }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — white bg, alternating layout ── */}
      <section style={{ background: 'var(--c-surface)' }}>
        {[
          {
            icon: Sparkles,
            tag: 'Personalisation',
            title: 'Products matched to your skin, not a stranger\'s.',
            desc: 'Our AI analyses your answers and cross-references thousands of products to surface the ones that actually suit your skin type and concerns.',
            color: 'var(--c-primary)',
            lightBg: 'var(--c-primary-light)',
            flip: false,
          },
          {
            icon: Shield,
            tag: 'Safety',
            title: 'Know what you\'re putting on your face.',
            desc: 'Paste in any ingredient list and instantly see conflicts, irritants, and what each ingredient actually does.',
            color: 'var(--c-secondary)',
            lightBg: 'var(--c-secondary-light)',
            flip: true,
          },
          {
            icon: Layers,
            tag: 'Routine',
            title: 'Morning and evening, perfectly ordered.',
            desc: 'Build a step-by-step routine with the right application order. Drag, drop, and adjust until it fits your life.',
            color: 'var(--c-tertiary)',
            lightBg: 'var(--c-tertiary-light)',
            flip: false,
          },
        ].map(({ icon: Icon, tag, title, desc, color, lightBg, flip }) => (
          <div key={tag} className={`flex flex-col ${flip ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            style={{ borderBottom: '1px solid var(--c-border)' }}>
            {/* Colour block — light variant, not full saturation */}
            <div className="md:w-2/5 relative flex items-center justify-center p-16"
              style={{ background: lightBg, minHeight: '300px' }}>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: color }}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute bottom-6 left-8">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: color, color: '#fff' }}>{tag}</span>
              </div>
            </div>
            {/* Text block */}
            <div className="md:w-3/5 flex items-center p-10 md:p-16">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-snug" style={{ color: 'var(--c-text)' }}>{title}</h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--c-muted)' }}>{desc}</p>
                <Link to="/quiz" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                  style={{ color }}>
                  Get started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS — accent1 light bg, numbered steps ── */}
      <section className="py-24 px-6 md:px-12" style={{ background: 'var(--c-accent1-light)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--c-accent1)' }}>Process</p>
          <h2 className="text-3xl md:text-4xl font-black mb-16" style={{ color: 'var(--c-text)' }}>Four steps to better skin.</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Take the Quiz',  desc: 'Answer 5 honest questions about your skin.',                color: 'var(--c-primary)',   bg: 'var(--c-primary-light)' },
              { num: '02', title: 'Get Profiled',   desc: 'AI classifies your skin type with a confidence score.',     color: 'var(--c-secondary)', bg: 'var(--c-secondary-light)' },
              { num: '03', title: 'See Matches',    desc: 'Browse products ranked for your exact profile.',            color: 'var(--c-tertiary)',  bg: 'var(--c-tertiary-light)' },
              { num: '04', title: 'Build Routine',  desc: 'Organise into morning and evening steps.',                  color: 'var(--c-accent2)',   bg: 'var(--c-accent2-light)' },
            ].map(({ num, title, desc, color, bg }) => (
              <div key={num} className="rounded-2xl p-6" style={{ background: bg }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white font-black text-sm"
                  style={{ background: color }}>
                  {num}
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--c-text)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — full primary colour, but not black ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-12 noise"
        style={{ background: 'var(--c-primary)', minHeight: '340px', display: 'flex', alignItems: 'center' }}>
        {/* Subtle light bleed */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.06), transparent)' }} />
        <div className="max-w-3xl relative">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            Ready to meet<br />your skin?
          </h2>
          <p className="text-lg mb-8 max-w-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Take the 2-minute quiz and get a personalised routine instantly. No account needed.
          </p>
          <Link to="/quiz"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'var(--c-secondary)', color: '#fff' }}>
            Start the Quiz <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER — light surface ── */}
      <footer className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--c-surface)', borderTop: '1px solid var(--c-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--c-primary)' }}>
            <Leaf className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--c-muted)' }}>Pecura AI</span>
        </div>
        <p className="text-xs text-center max-w-md" style={{ color: 'var(--c-muted)' }}>
          Not a substitute for professional dermatological advice. Consult a healthcare provider for serious skin concerns.
        </p>
        <p className="text-xs" style={{ color: 'var(--c-border)' }}>© 2025 Capstone Project</p>
      </footer>
    </div>
  );
};

export default Landing;
