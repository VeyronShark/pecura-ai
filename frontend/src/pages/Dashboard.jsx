import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Target, Calendar, Heart, ArrowRight, RefreshCw, Trash2, Info, ChevronRight } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const SKIN_META = {
  Dry:         { color: 'var(--c-tertiary)',   icon: '💧' },
  Oily:        { color: 'var(--c-primary)',    icon: '✨' },
  Combination: { color: 'var(--c-secondary)',  icon: '⚖️' },
  Sensitive:   { color: 'var(--c-accent2)',    icon: '🌸' },
  Normal:      { color: 'var(--c-accent1)',    icon: '🌟' },
};

const Dashboard = () => {
  const { skinProfile, routine, savedProducts, clearProfile } = useApp();
  const navigate = useNavigate();
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-sm w-full">
          <div className="rounded-3xl p-10 text-center relative overflow-hidden noise"
            style={{ background: 'var(--c-primary)' }}>
            <div className="text-6xl mb-5 animate-float">✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">No skin profile yet</h2>
            <p className="mb-7 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Take our quick quiz to get personalised recommendations.</p>
            <Link to="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--c-secondary)' }}>
              Take the Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const meta = SKIN_META[skinProfile.skin_type] || SKIN_META.Normal;
  const totalRoutineItems = routine.morning.length + routine.evening.length;

  return (
    <div className="animate-fade-in space-y-6">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>Your personalised skincare overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/quiz')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>
            <RefreshCw className="w-3 h-3" /> Retake quiz
          </button>
          <button onClick={() => { clearProfile(); navigate('/'); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>
            <Trash2 className="w-3 h-3" /> Delete data
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Skin type hero — 8 cols */}
        <div className="col-span-12 md:col-span-8 rounded-2xl p-7 relative overflow-hidden noise"
          style={{ background: meta.color, minHeight: '180px' }}>
          <div className="absolute right-6 top-4 text-8xl opacity-15 select-none animate-float">{meta.icon}</div>
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Your Skin Profile</p>
            <h2 className="text-4xl font-black text-white mb-1">{skinProfile.skin_type} Skin</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {Math.round(skinProfile.confidence * 100)}% confidence · {new Date(skinProfile.answeredAt).toLocaleDateString()}
            </p>
            {skinInfo?.description && (
              <p className="text-sm max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{skinInfo.description}</p>
            )}
            {skinProfile.concerns?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {skinProfile.concerns.map(c => (
                  <span key={c} className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize text-white"
                    style={{ background: 'rgba(255,255,255,0.18)' }}>{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats — 4 cols */}
        <div className="col-span-12 md:col-span-4 grid grid-rows-3 gap-4">
          {[
            { label: 'Skin Type',     value: skinProfile.skin_type, bg: 'var(--c-primary)',  icon: Target },
            { label: 'Routine Steps', value: totalRoutineItems,     bg: 'var(--c-tertiary)', icon: Calendar },
            { label: 'Saved',         value: savedProducts.length,  bg: 'var(--c-accent2)',  icon: Heart },
          ].map(({ label, value, bg, icon: Icon }) => (
            <div key={label} className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden noise"
              style={{ background: bg }}>
              <Icon className="w-5 h-5 text-white opacity-60 shrink-0" />
              <div>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skin info — 5 cols */}
        {skinInfo && (
          <div className="col-span-12 md:col-span-5 bento p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--c-secondary)' }}>
                <Info className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>About {skinProfile.skin_type} Skin</h3>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--c-muted)' }}>Characteristics</p>
                <div className="space-y-1.5">
                  {skinInfo.characteristics?.map(c => (
                    <div key={c} className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text)' }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--c-secondary)' }} />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--c-muted)' }}>Recommended Ingredients</p>
                <div className="flex flex-wrap gap-1.5">
                  {skinInfo.recommendations?.map(r => (
                    <span key={r} className="pill" style={{ background: 'var(--c-tertiary-light)', color: 'var(--c-tertiary)' }}>{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routine preview — 7 cols */}
        <div className="col-span-12 md:col-span-7 bento overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: 'var(--c-accent1)' }}>
            <h3 className="font-semibold text-white text-sm">Your Routine</h3>
            <Link to="/routine-builder" className="flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5">
            {totalRoutineItems === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--c-border)' }} />
                <p className="text-sm mb-3" style={{ color: 'var(--c-muted)' }}>No products in your routine yet.</p>
                <Link to="/routine-builder" className="text-sm font-semibold hover:underline" style={{ color: 'var(--c-accent1)' }}>
                  Build your routine →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {['morning', 'evening'].map(slot => (
                  <div key={slot}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: slot === 'morning' ? 'var(--c-accent1)' : 'var(--c-primary)' }}>
                      {slot === 'morning' ? '☀️' : '🌙'} {slot} ({routine[slot].length})
                    </p>
                    <div className="space-y-2">
                      {routine[slot].slice(0, 4).map((p, i) => (
                        <div key={p.product_id} className="flex items-center gap-2.5 text-sm">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white shrink-0 font-bold"
                            style={{ background: slot === 'morning' ? 'var(--c-accent1)' : 'var(--c-primary)' }}>{i + 1}</span>
                          <span className="truncate" style={{ color: 'var(--c-text)' }}>{p.name}</span>
                        </div>
                      ))}
                      {routine[slot].length > 4 && (
                        <p className="text-xs pl-7" style={{ color: 'var(--c-muted)' }}>+{routine[slot].length - 4} more</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--c-text)' }}>Recommended for You</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>Based on your {skinProfile.skin_type} skin type</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 rounded-lg transition-all hover:opacity-70"
              style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link to="/products" className="flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: 'var(--c-primary)' }}>
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner text="Finding products for you..." /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(p => <ProductCard key={p.product_id} product={p} showScore onSelect={setSelectedProduct} />)}
          </div>
        )}
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: 'var(--c-surface)' }} onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img src={product.image} alt={product.name} className="w-full h-52 object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'; }} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>×</button>
        </div>
        <div className="p-6">
          <p className="text-xs mb-0.5" style={{ color: 'var(--c-muted)' }}>{product.brand}</p>
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{product.name}</h2>
            <span className="text-xl font-black shrink-0" style={{ color: 'var(--c-primary)' }}>${product.price}</span>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Key Ingredients</p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {product.ingredients?.slice(0, 12).map(ing => (
                <span key={ing} className="pill capitalize" style={{ background: 'var(--c-primary-light)', color: 'var(--c-primary)' }}>{ing}</span>
              ))}
            </div>
          </div>
          {product.skin_types?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Best for</p>
              <div className="flex flex-wrap gap-1.5">
                {product.skin_types.map(st => (
                  <span key={st} className="pill text-white" style={{ background: 'var(--c-secondary)' }}>{st}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-5">
            <button onClick={() => addToRoutine(product, 'morning')} disabled={inMorning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'var(--c-accent1)' }}>
              {inMorning ? '✓ In Morning' : '☀️ Morning'}
            </button>
            <button onClick={() => addToRoutine(product, 'evening')} disabled={inEvening}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'var(--c-primary)' }}>
              {inEvening ? '✓ In Evening' : '🌙 Evening'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
