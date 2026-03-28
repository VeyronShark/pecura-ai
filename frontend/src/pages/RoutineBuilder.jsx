import { useState } from 'react';
import { Sun, Moon, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TIPS = {
  morning: [
    'Start with a gentle cleanser to remove overnight buildup.',
    'Apply serums from thinnest to thickest consistency.',
    'Always finish with SPF — even on cloudy days.',
    'Wait 1–2 minutes between layers for better absorption.',
  ],
  evening: [
    'Double cleanse if you wear makeup or sunscreen.',
    'This is the best time for actives like retinol or AHAs.',
    'Apply a richer moisturizer than your daytime one.',
    'Eye cream goes on before moisturizer.',
  ],
};

const STEP_ORDER = ['Cleanser', 'Exfoliant', 'Serum', 'Treatment', 'Moisturizer', 'Sunscreen'];

const SLOT_STYLE = {
  morning: { header: 'var(--c-accent2)', icon: Sun,  label: 'Morning Routine' },
  evening: { header: 'var(--c-secondary)', icon: Moon, label: 'Evening Routine' },
};

const RoutineSlot = ({ slot, routine, onRemove, onReorder, onAddClick }) => {
  const { header, icon: Icon, label } = SLOT_STYLE[slot];
  const items = routine[slot];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
      <div className="px-5 py-4 flex items-center justify-between text-white" style={{ background: header }}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-semibold">{label}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.2)' }}>
            {items.length} step{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={() => onAddClick(slot)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--c-tertiary)' }}>
              <Icon className="w-7 h-7 text-muted" />
            </div>
            <p className="text-sm text-muted mb-3">No products yet</p>
            <button onClick={() => onAddClick(slot)} className="text-sm font-medium hover:underline"
              style={{ color: header }}>Browse products to add →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((product, idx) => (
              <div key={product.product_id} className="flex items-center gap-3 p-3 rounded-xl group"
                style={{ background: 'var(--c-tertiary)', border: '1px solid var(--c-tertiary-dark)' }}>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => onReorder(slot, idx, idx - 1)} disabled={idx === 0}
                    className="text-muted hover:text-main disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <span className="text-xs text-muted text-center font-medium">{idx + 1}</span>
                  <button onClick={() => onReorder(slot, idx, idx + 1)} disabled={idx === items.length - 1}
                    className="text-muted hover:text-main disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
                </div>
                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted truncate">{product.brand}</p>
                  <p className="text-sm font-semibold text-main truncate">{product.name}</p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-xs mt-0.5 text-white"
                    style={{ background: header }}>{product.type}</span>
                </div>
                <button onClick={() => onRemove(product.product_id, slot)}
                  className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--c-tertiary-dark)' }}>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Tips</p>
            <ul className="space-y-1">
              {TIPS[slot].slice(0, 2).map((tip, i) => (
                <li key={i} className="text-xs text-muted flex items-start gap-1.5">
                  <span className="mt-0.5" style={{ color: header }}>•</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const RoutineBuilder = () => {
  const { routine, addToRoutine, removeFromRoutine, reorderRoutine } = useApp();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [addingTo, setAddingTo] = useState(null);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAddClick = slot => {
    setAddingTo(slot);
    if (!products.length) {
      setLoadingProducts(true);
      skincareAPI.getProducts().then(res => { setProducts(Array.isArray(res) ? res : res.products || []); setLoadingProducts(false); });
    }
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()))
    : products;

  const total = routine.morning.length + routine.evening.length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
        style={{ background: 'var(--c-primary)' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Routine Builder</h1>
          <p className="text-sm text-white/60 mt-0.5">Organise your skincare into morning and evening steps.</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: saved ? 'var(--c-accent1)' : 'rgba(255,255,255,0.2)', color: '#fff' }}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Routine'}
        </button>
      </div>

      {/* ── Step order guide ── */}
      <div className="rounded-xl p-4" style={{ background: 'var(--c-secondary)', border: 'none' }}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-white mb-2">Recommended application order</p>
            <div className="flex flex-wrap gap-1.5">
              {STEP_ORDER.map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>{step}</span>
                  {i < STEP_ORDER.length - 1 && <span className="text-white/40 text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Morning Steps', value: routine.morning.length, bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
          { label: 'Evening Steps', value: routine.evening.length, bg: 'var(--c-secondary)', fg: '#fff' },
          { label: 'Total',         value: total,                  bg: 'var(--c-primary)',   fg: '#fff' },
        ].map(({ label, value, bg, fg }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: bg, color: fg }}>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Slots ── */}
      <div className="grid md:grid-cols-2 gap-5">
        <RoutineSlot slot="morning" routine={routine} onRemove={removeFromRoutine} onReorder={reorderRoutine} onAddClick={handleAddClick} />
        <RoutineSlot slot="evening" routine={routine} onRemove={removeFromRoutine} onReorder={reorderRoutine} onAddClick={handleAddClick} />
      </div>

      {/* ── Tips panel ── */}
      <div className="rounded-xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
        <h2 className="font-semibold text-main mb-4">Routine Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {['morning', 'evening'].map(slot => (
            <div key={slot}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: SLOT_STYLE[slot].header }}>
                {slot === 'morning' ? '☀️' : '🌙'} {slot}
              </p>
              <ul className="space-y-1.5">
                {TIPS[slot].map((t, i) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-2">
                    <span className="mt-1" style={{ color: SLOT_STYLE[slot].header }}>•</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product selector modal ── */}
      {addingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 flex items-center justify-between"
              style={{ background: SLOT_STYLE[addingTo].header, borderRadius: '1rem 1rem 0 0' }}>
              <div className="flex items-center gap-2 text-white">
                {addingTo === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <h2 className="font-semibold">Add to {addingTo === 'morning' ? 'Morning' : 'Evening'} Routine</h2>
              </div>
              <button onClick={() => { setAddingTo(null); setSearch(''); }}
                className="text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'rgba(255,255,255,0.15)' }}>×</button>
            </div>
            <div className="p-4" style={{ borderBottom: '1px solid var(--c-tertiary-dark)' }}>
              <input type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ border: '1px solid var(--c-tertiary-dark)' }} />
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {loadingProducts ? (
                <div className="py-12 flex justify-center"><LoadingSpinner text="Loading products..." /></div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filtered.map(p => {
                    const inSlot = routine[addingTo]?.some(r => r.product_id === p.product_id);
                    return (
                      <div key={p.product_id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          border: `1px solid ${inSlot ? SLOT_STYLE[addingTo].header : 'var(--c-tertiary-dark)'}`,
                          background: inSlot ? 'var(--c-tertiary)' : 'var(--c-surface)',
                        }}
                        onClick={() => addToRoutine(p, addingTo)}>
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted truncate">{p.brand}</p>
                          <p className="text-sm font-semibold text-main truncate">{p.name}</p>
                          <span className="text-xs text-muted">{p.type} · ${p.price}</span>
                        </div>
                        {inSlot
                          ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: SLOT_STYLE[addingTo].header }} />
                          : <Plus className="w-5 h-5 text-muted shrink-0" />
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4" style={{ borderTop: '1px solid var(--c-tertiary-dark)' }}>
              <button onClick={() => { setAddingTo(null); setSearch(''); }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: SLOT_STYLE[addingTo].header }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBuilder;
