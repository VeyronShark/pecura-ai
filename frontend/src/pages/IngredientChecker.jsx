import { useState, useRef, useEffect } from 'react';
import { Plus, X, AlertTriangle, CheckCircle2, FlaskConical, Search, Info } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ALL_INGREDIENTS = [
  'retinol','retinaldehyde','tretinoin','niacinamide','nicotinamide',
  'salicylic acid','hyaluronic acid','sodium hyaluronate',
  'vitamin c','ascorbic acid','l-ascorbic acid','ascorbyl glucoside',
  'glycolic acid','lactic acid','mandelic acid','malic acid',
  'benzoyl peroxide','ceramides','ceramide np','ceramide ap',
  'peptides','copper peptides','matrixyl','alpha arbutin','azelaic acid','kojic acid',
  'aha','bha','pha','centella asiatica','cica','allantoin','panthenol',
  'squalane','glycerin','propanediol','zinc','zinc pca','zinc oxide',
  'vitamin e','tocopherol','ferulic acid','resveratrol','caffeine',
  'tranexamic acid','collagen','elastin','aloe vera','green tea extract',
  'snail mucin','bakuchiol','rosehip oil','jojoba oil','shea butter',
  'titanium dioxide','avobenzone','dimethicone','fragrance','alcohol',
  'parabens','sulfates','sodium lauryl sulfate',
];

const INGREDIENT_INFO = {
  retinol: 'A vitamin A derivative that boosts cell turnover and reduces fine lines. Use at night.',
  niacinamide: 'Vitamin B3 that minimizes pores, controls oil, and brightens skin tone.',
  'salicylic acid': 'A BHA that exfoliates inside pores. Great for acne-prone and oily skin.',
  'hyaluronic acid': 'A humectant that draws moisture into the skin. Suitable for all skin types.',
  'vitamin c': 'An antioxidant that brightens skin and boosts collagen. Use in the morning.',
  ceramides: 'Lipids that strengthen the skin barrier and lock in moisture.',
  'glycolic acid': 'An AHA that exfoliates the skin surface, improving texture and tone.',
  'lactic acid': 'A gentle AHA that exfoliates and hydrates. Good for sensitive skin.',
  'azelaic acid': 'Reduces redness, hyperpigmentation, and acne. Suitable for sensitive skin.',
  'benzoyl peroxide': 'Kills acne-causing bacteria. Can be drying — use sparingly.',
  squalane: "A lightweight emollient that mimics skin's natural oils. Non-comedogenic.",
  glycerin: 'A humectant that draws moisture into the skin. Very well tolerated.',
  panthenol: 'Provitamin B5 that soothes and hydrates. Helps repair the skin barrier.',
  allantoin: 'Soothes and calms irritated skin. Promotes cell regeneration.',
  'centella asiatica': 'Calms inflammation and strengthens the skin barrier.',
  caffeine: 'Reduces puffiness and has antioxidant properties.',
  'ferulic acid': 'An antioxidant that stabilises vitamin C and E, boosting their efficacy.',
  bakuchiol: 'A plant-based retinol alternative. Gentler and suitable for sensitive skin.',
};

const COMMON = [
  'retinol','niacinamide','salicylic acid','hyaluronic acid',
  'vitamin c','glycolic acid','benzoyl peroxide','ceramides',
  'peptides','alpha arbutin','azelaic acid','lactic acid',
  'aha','bha','centella asiatica','allantoin',
];

const ABBR = new Set(['aha','bha','pha','spf']);
const fmt = str => str.split(' ').map(w => ABBR.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const IngredientChecker = () => {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSug, setShowSug] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredIng, setHoveredIng] = useState(null);
  const inputRef = useRef(null);
  const sugRef = useRef(null);

  useEffect(() => {
    const h = e => { if (!inputRef.current?.contains(e.target) && !sugRef.current?.contains(e.target)) setShowSug(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleInput = val => {
    setInput(val); setActiveIdx(-1);
    if (val.trim().length < 2) { setSuggestions([]); setShowSug(false); return; }
    const q = val.toLowerCase();
    const m = ALL_INGREDIENTS.filter(i => i.includes(q) && !ingredients.includes(i)).slice(0, 8);
    setSuggestions(m); setShowSug(m.length > 0);
  };

  const add = val => {
    const v = val.trim().toLowerCase();
    if (v && !ingredients.includes(v)) setIngredients(p => [...p, v]);
    setInput(''); setSuggestions([]); setShowSug(false); setActiveIdx(-1); setAnalysis(null);
    inputRef.current?.focus();
  };

  const remove = v => { setIngredients(p => p.filter(i => i !== v)); setAnalysis(null); };

  const handleKey = e => {
    if (!showSug) { if (e.key === 'Enter' && input.trim()) add(input); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); activeIdx >= 0 ? add(suggestions[activeIdx]) : input.trim() && add(input); }
    else if (e.key === 'Escape') setShowSug(false);
  };

  const analyze = async () => {
    if (!ingredients.length) return;
    setLoading(true);
    try { setAnalysis(await skincareAPI.analyzeIngredients(ingredients)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Ingredient Checker</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>Check for conflicts and get safety guidance for your routine.</p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* ── Left: input panel ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Search input */}
          <div className="bento p-5">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--c-text)' }}>Add Ingredients</h2>
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <input ref={inputRef} type="text" placeholder="Type an ingredient name..."
                  value={input} onChange={e => handleInput(e.target.value)}
                  onKeyDown={handleKey} onFocus={() => suggestions.length > 0 && setShowSug(true)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }}
                  autoComplete="off" />
                {showSug && (
                  <ul ref={sugRef} className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-20 overflow-hidden"
                    style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                    {suggestions.map((s, i) => (
                      <li key={s} onMouseDown={() => add(s)} onMouseEnter={() => setActiveIdx(i)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors"
                        style={{ background: i === activeIdx ? 'var(--c-primary-light)' : 'transparent', color: 'var(--c-text)' }}>
                        <span className="font-medium">{fmt(s)}</span>
                        {INGREDIENT_INFO[s] && (
                          <span className="text-xs ml-2 truncate max-w-36 hidden sm:block" style={{ color: 'var(--c-muted)' }}>
                            {INGREDIENT_INFO[s].split('.')[0]}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => input.trim() && add(input)} disabled={!input.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all hover:opacity-90"
                style={{ background: 'var(--c-tertiary)' }}>
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--c-muted)' }}>Common</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON.map(ing => {
                const added = ingredients.includes(ing);
                return (
                  <button key={ing} onClick={() => add(ing)} disabled={added}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: added ? 'var(--c-tertiary)' : 'var(--c-tertiary-light)',
                      color: added ? '#fff' : 'var(--c-tertiary)',
                    }}>
                    {added ? '✓ ' : ''}{fmt(ing)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected ingredients */}
          {ingredients.length > 0 && (
            <div className="bento p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>
                  Selected <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: 'var(--c-tertiary)' }}>{ingredients.length}</span>
                </h2>
                <button onClick={analyze} disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: 'var(--c-primary)' }}>
                  {loading ? <LoadingSpinner size="sm" text="" /> : <Search className="w-3.5 h-3.5" />}
                  Analyze
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <div key={ing} className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: 'var(--c-primary)' }}
                    onMouseEnter={() => setHoveredIng(ing)} onMouseLeave={() => setHoveredIng(null)}>
                    <span>{fmt(ing)}</span>
                    <button onClick={() => remove(ing)} className="opacity-60 hover:opacity-100 ml-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {hoveredIng === ing && INGREDIENT_INFO[ing] && (
                      <div className="absolute bottom-full left-0 mb-2 w-60 text-white text-xs rounded-xl p-3 z-10 shadow-xl pointer-events-none"
                        style={{ background: 'var(--c-text)' }}>
                        {INGREDIENT_INFO[ing]}
                        <div className="absolute top-full left-4 border-l-4 border-r-4 border-t-4 border-transparent"
                          style={{ borderTopColor: 'var(--c-text)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3 flex items-center gap-1" style={{ color: 'var(--c-muted)' }}>
                <Info className="w-3 h-3" /> Hover an ingredient to see info
              </p>
            </div>
          )}
        </div>

        {/* ── Right: results + info panel ── */}
        <div className="w-80 shrink-0 space-y-4 hidden lg:block">

          {/* Results */}
          {analysis ? (
            <div className="bento overflow-hidden animate-fade-in">
              <div className="px-5 py-4 flex items-center gap-2 text-white font-semibold text-sm"
                style={{ background: analysis.warnings?.length > 0 ? 'var(--c-accent2)' : 'var(--c-tertiary)' }}>
                {analysis.warnings?.length > 0
                  ? <><AlertTriangle className="w-4 h-4" />{analysis.warnings.length} conflict{analysis.warnings.length > 1 ? 's' : ''}</>
                  : <><CheckCircle2 className="w-4 h-4" />All clear</>
                }
              </div>
              <div className="p-5 space-y-3">
                {analysis.warnings?.length > 0 ? (
                  analysis.warnings.map((w, i) => (
                    <div key={i} className="rounded-xl p-3.5" style={{ background: 'var(--c-accent2-light)', border: '1px solid var(--c-accent2)33' }}>
                      <p className="font-semibold text-xs mb-2" style={{ color: 'var(--c-accent2)' }}>{w.message}</p>
                      <div className="flex flex-wrap gap-1">
                        {w.ingredients?.map(ing => (
                          <span key={ing} className="pill text-white" style={{ background: 'var(--c-accent2)' }}>{fmt(ing)}</span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Your selected ingredients appear compatible.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bento p-5 text-center">
              <FlaskConical className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--c-border)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--c-muted)' }}>Add ingredients and click Analyze</p>
            </div>
          )}

          {/* How it works */}
          <div className="bento p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--c-muted)' }}>How it works</p>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--c-muted)' }}>
              {[
                ['🔍', 'Search & select', 'Type any ingredient name to search the database, or pick from the common shortcuts.'],
                ['⚗️', 'Conflict detection', 'The checker runs your list against a set of known incompatible pairs — e.g. retinol + AHAs, vitamin C + niacinamide at high concentrations.'],
                ['💡', 'Ingredient info', 'Hover any selected ingredient to see what it does and which skin types it suits.'],
                ['✅', 'Safe to use', 'If no conflicts are found, your combination is generally considered routine-safe.'],
              ].map(([icon, title, desc]) => (
                <li key={title} className="flex gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="font-semibold text-xs mb-0.5" style={{ color: 'var(--c-text)' }}>{title}</p>
                    <p className="text-xs leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="bento p-5">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--c-muted)' }}>Tips</p>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--c-muted)' }}>
              {[
                'Always patch test new combinations',
                'Introduce actives gradually',
                'Retinoids at night, vitamin C in the morning',
                'Consult a dermatologist for reactions',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--c-tertiary)' }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl p-4" style={{ background: 'var(--c-tertiary-light)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              General guidance only. Not a substitute for professional dermatological advice.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile results */}
      {analysis && (
        <div className="lg:hidden mt-5 bento overflow-hidden animate-fade-in">
          <div className="px-5 py-4 flex items-center gap-2 text-white font-semibold text-sm"
            style={{ background: analysis.warnings?.length > 0 ? 'var(--c-accent2)' : 'var(--c-tertiary)' }}>
            {analysis.warnings?.length > 0
              ? <><AlertTriangle className="w-4 h-4" />{analysis.warnings.length} conflict{analysis.warnings.length > 1 ? 's' : ''}</>
              : <><CheckCircle2 className="w-4 h-4" />All clear</>
            }
          </div>
          <div className="p-5">
            {analysis.warnings?.length > 0 ? (
              analysis.warnings.map((w, i) => (
                <div key={i} className="rounded-xl p-3.5 mb-2" style={{ background: 'var(--c-accent2-light)' }}>
                  <p className="font-semibold text-xs mb-1" style={{ color: 'var(--c-accent2)' }}>{w.message}</p>
                  <div className="flex flex-wrap gap-1">
                    {w.ingredients?.map(ing => (
                      <span key={ing} className="pill text-white" style={{ background: 'var(--c-accent2)' }}>{fmt(ing)}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Your selected ingredients appear compatible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientChecker;
