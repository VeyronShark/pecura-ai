import { useState } from 'react';
import { Sun, Moon, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, GripVertical } from 'lucide-react';
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

const SLOT = {
  morning: { bg: 'var(--c-accent1)', icon: Sun,  label: 'Morning' },
  evening: { bg: 'var(--c-primary)', icon: Moon, label: 'Evening' },
};

const RoutineSlot = ({ slot, routine, onRemove, onReorder, onAddClick }) => {
  const { bg, icon: Icon, label } = SLOT[slot];
  const items = routine[slot];

  return (
    <div className="flex-1 min-w-0">
      {/* Slot header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: bg }}>
            <Icon className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
          </div>
          <div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--c-text)' }}>{label} Routine</h2>
            <p className="text-xs" style={{ color: 'var(--c-muted)' }}>{items.length} step{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => onAddClick(slot)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: bg }}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Steps */}
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-12 text-center"
          style={{ borderColor: 'var(--c-border)' }}>
          <Icon className="w-8 h-8 mb-2" style={{ color: 'var(--c-border)' }} />
          <p className="text-sm mb-2" style={{ color: 'var(--c-muted)' }}>No products yet</p>
          <button onClick={() => onAddClick(slot)} className="text-xs font-semibold hover:underline"
            style={{ color: bg }}>Add your first product →</button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((product, idx) => (
            <div key={product.product_id}
              className="flex items-center gap-3 p-3 rounded-xl group transition-all hover:shadow-sm"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              {/* Step number + reorder */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 w-6">
                <button onClick={() => onReorder(slot, idx, idx - 1)} disabled={idx === 0}
                  className="disabled:opacity-20 transition-opacity" style={{ color: 'var(--c-muted)' }}>
                  <ArrowUp className="w-3 h-3" />
                </button>
                <span className="text-xs font-black" style={{ color: bg }}>{idx + 1}</span>
                <button onClick={() => onReorder(slot, idx, idx + 1)} disabled={idx === items.length - 1}
                  className="disabled:opacity-20 transition-opacity" style={{ color: 'var(--c-muted)' }}>
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <img src={product.image} alt={product.name} className="w-11 h-11 object-cover rounded-lg shrink-0"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop'; }} />

              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: 'var(--c-muted)' }}>{product.brand}</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>{product.name}</p>
                <span className="pill text-white mt-0.5" style={{ background: bg, fontSize: '0.6rem' }}>{product.type}</span>
              </div>

              <button onClick={() => onRemove(product.product_id, slot)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                style={{ color: 'var(--c-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {items.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Tips</p>
          <ul className="space-y-1.5">
            {TIPS[slot].slice(0, 2).map((tip, i) => (
              <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--c-muted)' }}>
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: bg }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
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
    <div className="animate-fade-in space-y-6">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Routine Builder</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>Organise your skincare into morning and evening steps.</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shrink-0"
          style={{ background: saved ? 'var(--c-tertiary)' : 'var(--c-primary)', color: '#fff' }}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Routine'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Morning', value: routine.morning.length, bg: 'var(--c-accent1)' },
          { label: 'Evening', value: routine.evening.length, bg: 'var(--c-primary)' },
          { label: 'Total',   value: total,                  bg: 'var(--c-secondary)' },
        ].map(({ label, value, bg }) => (
          <div key={label} className="rounded-xl px-4 py-3 flex items-center gap-3 relative overflow-hidden noise"
            style={{ background: bg }}>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-white/60 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Step order guide */}
      <div className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--c-tertiary)' }} />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--c-muted)' }}>Order:</span>
          {STEP_ORDER.map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>{step}</span>
              {i < STEP_ORDER.length - 1 && <span className="text-xs" style={{ color: 'var(--c-border)' }}>›</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Side-by-side routine slots */}
      <div className="flex gap-8 items-start">
        <RoutineSlot slot="morning" routine={routine} onRemove={removeFromRoutine} onReorder={reorderRoutine} onAddClick={handleAddClick} />
        <div className="w-px self-stretch" style={{ background: 'var(--c-border)' }} />
        <RoutineSlot slot="evening" routine={routine} onRemove={removeFromRoutine} onReorder={reorderRoutine} onAddClick={handleAddClick} />
      </div>

      {/* Product selector modal */}
      {addingTo && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 backdrop-blur-sm">
          <div className="w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            style={{ background: 'var(--c-surface)' }}>
            {/* Modal header */}
            <div className="p-4 flex items-center justify-between text-white"
              style={{ background: SLOT[addingTo].bg }}>
              <div className="flex items-center gap-2">
                {addingTo === 'morning' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <h2 className="font-semibold text-sm">Add to {addingTo === 'morning' ? 'Morning' : 'Evening'} Routine</h2>
              </div>
              <button onClick={() => { setAddingTo(null); setSearch(''); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}>×</button>
            </div>
            {/* Search */}
            <div className="p-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <input type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }} />
            </div>
            {/* List */}
            <div className="overflow-y-auto flex-1 p-4">
              {loadingProducts ? (
                <div className="py-12 flex justify-center"><LoadingSpinner text="Loading products..." /></div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {filtered.map(p => {
                    const inSlot = routine[addingTo]?.some(r => r.product_id === p.product_id);
                    return (
                      <div key={p.product_id}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                        style={{
                          border: `1.5px solid ${inSlot ? SLOT[addingTo].bg : 'var(--c-border)'}`,
                          background: 'var(--c-surface)',
                        }}
                        onClick={() => addToRoutine(p, addingTo)}>
                        <img src={p.image} alt={p.name} className="w-11 h-11 object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ color: 'var(--c-muted)' }}>{p.brand}</p>
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>{p.name}</p>
                          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{p.type} · ${p.price}</span>
                        </div>
                        {inSlot
                          ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: SLOT[addingTo].bg }} />
                          : <Plus className="w-4 h-4 shrink-0" style={{ color: 'var(--c-muted)' }} />
                        }
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4" style={{ borderTop: '1px solid var(--c-border)' }}>
              <button onClick={() => { setAddingTo(null); setSearch(''); }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: SLOT[addingTo].bg }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBuilder;
