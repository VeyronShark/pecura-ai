import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Calendar, Heart, ArrowRight, RefreshCw, Info, ChevronRight } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const SKIN_COLORS = {
  Dry:         { bg: 'var(--c-secondary)', icon: '💧' },
  Oily:        { bg: 'var(--c-accent1)',   icon: '✨' },
  Combination: { bg: 'var(--c-primary)',   icon: '⚖️' },
  Sensitive:   { bg: '#c026d3',            icon: '🌸' },
  Normal:      { bg: 'var(--c-accent2)',   icon: '🌟' },
};

const STAT_COLORS = [
  { bg: 'var(--c-primary)',   fg: '#fff' },
  { bg: 'var(--c-secondary)', fg: '#fff' },
  { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
];

const Dashboard = () => {
  const { skinProfile, routine, savedProducts, clearProfile } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [skinInfo, setSkinInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { if (skinProfile) loadData(); else setLoading(false); }, [skinProfile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, info] = await Promise.all([
        skincareAPI.getRecommendationsBySkinType(skinProfile.skin_type, 6),
        Promise.resolve(skincareAPI.getSkinTypeInfo(skinProfile.skin_type)),
      ]);
      setRecommendations(recs.map(p => ({ ...p, skin_types: p.skin_types?.length ? p.skin_types : [skinProfile.skin_type] })));
      setSkinInfo(info);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!skinProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--c-primary)' }}>
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--c-primary)' }}>No skin profile yet</h2>
          <p className="text-muted mb-6">Take our quick quiz to get personalised recommendations.</p>
          <Link to="/quiz" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
            style={{ background: 'var(--c-primary)' }}>
            Take the Quiz <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const skinColor = SKIN_COLORS[skinProfile.skin_type] || SKIN_COLORS.Normal;
  const totalRoutineItems = routine.morning.length + routine.evening.length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero banner ── */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: skinColor.bg }}>
        <div className="absolute right-6 top-4 text-7xl opacity-20 select-none">{skinColor.icon}</div>
        <div className="relative">
          <p className="text-white/70 text-sm font-medium mb-1">Your Skin Profile</p>
          <h1 className="text-3xl font-extrabold mb-1">{skinProfile.skin_type} Skin</h1>
          <p className="text-white/70 text-sm mb-3">
            {Math.round(skinProfile.confidence * 100)}% confidence · {new Date(skinProfile.answeredAt).toLocaleDateString()}
          </p>
          {skinInfo?.description && <p className="text-white/85 text-sm max-w-lg leading-relaxed">{skinInfo.description}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            {skinProfile.concerns?.map(c => (
              <span key={c} className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                style={{ background: 'rgba(255,255,255,0.2)' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Target,   label: 'Skin Type',       value: skinProfile.skin_type },
          { icon: Calendar, label: 'Routine Steps',    value: totalRoutineItems },
          { icon: Heart,    label: 'Saved Products',   value: savedProducts.length },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: STAT_COLORS[i].bg, color: STAT_COLORS[i].fg }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs opacity-70 truncate">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Skin info ── */}
      {skinInfo && (
        <div className="rounded-xl p-5 border-l-4" style={{ background: 'var(--c-surface)', borderLeftColor: 'var(--c-secondary)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4" style={{ color: 'var(--c-secondary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--c-secondary)' }}>About {skinProfile.skin_type} Skin</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Characteristics</p>
              <ul className="space-y-1">
                {skinInfo.characteristics?.map(c => (
                  <li key={c} className="text-sm text-muted flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-secondary)' }} />{c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommended Ingredients</p>
              <ul className="space-y-1">
                {skinInfo.recommendations?.map(r => (
                  <li key={r} className="text-sm text-muted flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-accent1)' }} />{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--c-primary)' }}>
          <div>
            <h2 className="font-semibold text-white">Recommended for You</h2>
            <p className="text-xs text-white/60 mt-0.5">Based on your {skinProfile.skin_type} skin type</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-1.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner text="Finding products for you..." /></div>
          ) : recommendations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(p => <ProductCard key={p.product_id} product={p} showScore onSelect={setSelectedProduct} />)}
            </div>
          ) : (
            <div className="text-center py-10 text-muted">
              <p>No recommendations available.</p>
              <Link to="/products" className="text-sm mt-2 inline-block" style={{ color: 'var(--c-primary)' }}>Browse all products</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Routine preview ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--c-surface)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--c-secondary)' }}>
          <h2 className="font-semibold text-white">Your Routine</h2>
          <Link to="/routine-builder" className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white">
            Manage <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-5">
          {totalRoutineItems === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted mb-3">No products in your routine yet.</p>
              <Link to="/routine-builder" className="text-sm font-medium hover:underline" style={{ color: 'var(--c-secondary)' }}>Build your routine →</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {['morning', 'evening'].map(slot => (
                <div key={slot}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    {slot === 'morning' ? '☀️' : '🌙'} {slot} ({routine[slot].length})
                  </p>
                  <div className="space-y-2">
                    {routine[slot].slice(0, 3).map((p, i) => (
                      <div key={p.product_id} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white shrink-0"
                          style={{ background: slot === 'morning' ? 'var(--c-accent2)' : 'var(--c-secondary)' }}>{i + 1}</span>
                        <span className="text-main truncate">{p.name}</span>
                      </div>
                    ))}
                    {routine[slot].length > 3 && <p className="text-xs text-muted pl-7">+{routine[slot].length - 3} more</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={clearProfile} className="text-xs text-muted hover:text-main flex items-center gap-1 transition-colors">
          <RefreshCw className="w-3 h-3" /> Retake quiz
        </button>
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

const ProductModal = ({ product, onClose }) => {
  const { addToRoutine, routine } = useApp();
  const inMorning = routine.morning.some(p => p.product_id === product.product_id);
  const inEvening = routine.evening.some(p => p.product_id === product.product_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-muted hover:bg-white shadow-sm text-lg">×</button>
        <img src={product.image} alt={product.name} className="w-full h-52 object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'; }} />
        <div className="p-6">
          <p className="text-xs text-muted mb-0.5">{product.brand}</p>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-main">{product.name}</h2>
            <span className="text-2xl font-extrabold shrink-0" style={{ color: 'var(--c-primary)' }}>${product.price}</span>
          </div>
          {product.description && <p className="text-sm text-muted mb-4 leading-relaxed">{product.description}</p>}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Key Ingredients</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {product.ingredients?.slice(0, 12).map(ing => (
                <span key={ing} className="px-2 py-0.5 rounded-full text-xs capitalize"
                  style={{ background: 'var(--c-tertiary)', color: 'var(--c-tertiary-fg)' }}>{ing}</span>
              ))}
            </div>
          </div>
          {product.skin_types?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Best for</p>
              <div className="flex flex-wrap gap-1.5">
                {product.skin_types.map(st => (
                  <span key={st} className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: 'var(--c-secondary)' }}>{st}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => addToRoutine(product, 'morning')} disabled={inMorning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors text-white disabled:opacity-50"
              style={{ background: inMorning ? '#ccc' : 'var(--c-accent2)' }}>
              {inMorning ? '✓ In Morning' : '☀️ Morning'}
            </button>
            <button onClick={() => addToRoutine(product, 'evening')} disabled={inEvening}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors text-white disabled:opacity-50"
              style={{ background: inEvening ? '#ccc' : 'var(--c-secondary)' }}>
              {inEvening ? '✓ In Evening' : '🌙 Evening'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
