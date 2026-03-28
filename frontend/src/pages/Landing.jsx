import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Layers, FlaskConical, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const features = [
  { icon: Sparkles, title: 'Personalized Picks',     desc: 'AI matches products to your exact skin type and concerns.',      bg: 'var(--c-primary)',   fg: '#fff' },
  { icon: Shield,   title: 'Ingredient Safety',       desc: 'Catch harmful combinations before they irritate your skin.',     bg: 'var(--c-secondary)', fg: '#fff' },
  { icon: Layers,   title: 'Routine Builder',         desc: 'Step-by-step morning and evening routines, perfectly ordered.',  bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  { icon: FlaskConical, title: 'Ingredient Insights', desc: 'Know exactly what\'s in your products and how they interact.',   bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
];

const steps = [
  { num: '01', title: 'Take the Quiz',          desc: 'Answer 5 quick questions about your skin.',                color: 'var(--c-primary)' },
  { num: '02', title: 'Get Your Skin Profile',  desc: 'AI classifies your skin type with a confidence score.',    color: 'var(--c-secondary)' },
  { num: '03', title: 'See Recommendations',    desc: 'Browse products matched specifically to your profile.',    color: 'var(--c-accent1)' },
  { num: '04', title: 'Build Your Routine',     desc: 'Organise products into morning and evening steps.',        color: 'var(--c-accent2)' },
];

const Landing = () => {
  const { skinProfile } = useApp();

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-tertiary)' }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b" style={{ background: 'var(--c-primary)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--c-accent1)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--c-accent1-fg)' }} />
            </div>
            <span className="text-lg font-bold text-white">Pecura <span style={{ color: 'var(--c-accent1)' }}>AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/products" className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors">Products</Link>
            {skinProfile ? (
              <Link to="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}>
                My Dashboard
              </Link>
            ) : (
              <Link to="/quiz" className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}>
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="py-24 px-4" style={{ background: 'var(--c-primary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Skincare
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Your skin deserves<br />
            <span style={{ color: 'var(--c-accent1)' }}>smarter care</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pecura AI analyses your skin type and recommends products that actually work — no guesswork, no wasted money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}>
              Take the Skin Quiz <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all">
              Browse Products
            </Link>
          </div>
          <p className="text-sm text-white/50 mt-4">Free · No account required · Takes 2 minutes</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4" style={{ background: 'var(--c-tertiary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--c-primary)' }}>Everything for better skin</h2>
            <p className="text-muted max-w-xl mx-auto">From skin analysis to routine building, Pecura AI covers the full journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, bg, fg }) => (
              <div key={title} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: bg, color: fg }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4" style={{ background: 'var(--c-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
            <p className="text-white/70">Four simple steps to your perfect routine.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc, color }) => (
              <div key={num} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-4xl font-black mb-3" style={{ color }}>{num}</div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4" style={{ background: 'var(--c-accent1)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--c-accent1-fg)' }}>Ready to find your perfect routine?</h2>
          <p className="mb-8 text-lg opacity-80" style={{ color: 'var(--c-accent1-fg)' }}>Take our 2-minute skin quiz and get personalised recommendations instantly.</p>
          <Link to="/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{ background: 'var(--c-primary)', color: '#fff' }}>
            Get Started <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 px-4 border-t" style={{ background: 'var(--c-primary)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-white/50">Pecura AI is not a substitute for professional dermatological advice. Always consult a healthcare provider for serious skin concerns.</p>
          <p className="text-xs text-white/30 mt-1">© 2025 Pecura AI · Capstone Project</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
