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

  const highlight = (text, query) => {
    const f = fmt(text), idx = text.indexOf(query.toLowerCase());
    if (idx === -1) return <span>{f}</span>;
    return <><span>{f.slice(0, idx)}</span><span className="font-bold" style={{ color: 'var(--c-primary)' }}>{f.slice(idx, idx + query.length)}</span><span>{f.slice(idx + query.length)}</span></>;
  };

  const analyze = async () => {
    if (!ingredients.length) return;
    setLoading(true);
    try { setAnalysis(await skincareAPI.analyzeIngredients(ingredients)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="rounded-2xl px-6 py-5" style={{ background: 'var(--c-secondary)' }}>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-white" />
          <h1 className="text-2xl font-bold text-white">Ingredient Checker</h1>
        </div>
        <p className="text-sm text-white/70">Check for ingredient conflicts and get safety guidance for your routine.</p>
      </div>

      {/* ── Input ── */}
      <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
        <h2 className="font-semibold text-main mb-3">Add Ingredients</h2>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input ref={inputRef} type="text" placeholder="Type an ingredient name..."
              value={input} onChange={e => handleInput(e.target.value)}
              onKeyDown={handleKey} onFocus={() => suggestions.length > 0 && setShowSug(true)}
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ border: '1px solid var(--c-tertiary-dark)', '--tw-ring-color': 'var(--c-secondary)' }}
              autoComplete="off" />
            {showSug && (
              <ul ref={sugRef} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-20 overflow-hidden"
                style={{ border: '1px solid var(--c-tertiary-dark)' }}>
                {suggestions.map((s, i) => (
                  <li key={s} onMouseDown={() => add(s)} onMouseEnter={() => setActiveIdx(i)}
                    className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors"
                    style={{ background: i === activeIdx ? 'var(--c-tertiary)' : 'transparent', color: 'var(--c-text)' }}>
                    <span>{highlight(s, input)}</span>
                    {INGREDIENT_INFO[s] && (
                      <span className="text-xs text-muted ml-2 truncate max-w-32 hidden sm:block">
                        {INGREDIENT_INFO[s].split('.')[0]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => input.trim() && add(input)} disabled={!input.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--c-secondary)' }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Common ingredients</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON.map(ing => (
            <button key={ing} onClick={() => add(ing)} disabled={ingredients.includes(ing)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: ingredients.includes(ing) ? 'var(--c-secondary)' : 'var(--c-tertiary)',
                color: ingredients.includes(ing) ? '#fff' : 'var(--c-tertiary-fg)',
              }}>
              {ingredients.includes(ing) ? '✓ ' : ''}{fmt(ing)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Selected ── */}
      {ingredients.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-main">Selected ({ingredients.length})</h2>
            <button onClick={analyze} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--c-secondary)' }}>
              {loading ? <LoadingSpinner size="sm" text="" /> : <Search className="w-4 h-4" />}
              Analyze
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ing => (
              <div key={ing} className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white"
                style={{ background: 'var(--c-secondary)' }}
                onMouseEnter={() => setHoveredIng(ing)} onMouseLeave={() => setHoveredIng(null)}>
                <span>{fmt(ing)}</span>
                <button onClick={() => remove(ing)} className="opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                {hoveredIng === ing && INGREDIENT_INFO[ing] && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-2.5 z-10 shadow-lg pointer-events-none">
                    {INGREDIENT_INFO[ing]}
                    <div className="absolute top-full left-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Hover over an ingredient to see info
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {analysis && (
        <div className="rounded-xl overflow-hidden animate-fade-in" style={{ border: '1px solid var(--c-tertiary-dark)' }}>
          <div className="px-5 py-4 text-white font-semibold"
            style={{ background: analysis.warnings?.length > 0 ? 'var(--c-accent2)' : 'var(--c-accent1)' }}>
            {analysis.warnings?.length > 0
              ? <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{analysis.warnings.length} conflict{analysis.warnings.length > 1 ? 's' : ''} found</div>
              : <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />No conflicts detected</div>
            }
          </div>
          <div className="p-5 space-y-3" style={{ background: 'var(--c-surface)' }}>
            {analysis.warnings?.length > 0 ? (
              analysis.warnings.map((w, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'var(--c-accent2-light)', border: '1px solid var(--c-accent2)' }}>
                  <p className="font-medium text-sm mb-2" style={{ color: 'var(--c-accent2-dark)' }}>{w.message}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {w.ingredients?.map(ing => (
                      <span key={ing} className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: 'var(--c-accent2)' }}>{fmt(ing)}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Your selected ingredients appear to be compatible with each other.</p>
            )}

            <div className="rounded-xl p-4 mt-2" style={{ background: 'var(--c-tertiary)', border: '1px solid var(--c-tertiary-dark)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--c-secondary)' }}>General Tips</p>
              <ul className="text-sm text-muted space-y-1">
                <li>• Always patch test new ingredient combinations</li>
                <li>• Introduce active ingredients gradually</li>
                <li>• Use retinoids at night, vitamin C in the morning</li>
                <li>• Consult a dermatologist for persistent reactions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="rounded-xl p-4" style={{ background: 'var(--c-tertiary)', border: '1px solid var(--c-tertiary-dark)' }}>
        <p className="text-xs text-muted leading-relaxed">
          <strong>Disclaimer:</strong> This tool provides general guidance based on common ingredient interactions. It is not a substitute for professional dermatological advice. Always patch test new products and consult a dermatologist for personalised recommendations.
        </p>
      </div>
    </div>
  );
};

export default IngredientChecker;
