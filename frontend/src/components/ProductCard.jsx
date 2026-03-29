import { Star, Heart, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const TYPE_BG = {
  Cleanser:    'var(--c-tertiary)',
  Moisturiser: 'var(--c-primary)',
  Moisturizer: 'var(--c-primary)',
  Serum:       'var(--c-secondary)',
  Treatment:   'var(--c-accent2)',
  Exfoliator:  'var(--c-accent1)',
  Exfoliant:   'var(--c-accent1)',
  Sunscreen:   'var(--c-tertiary)',
  Toner:       'var(--c-secondary)',
  Oil:         'var(--c-accent1)',
  Mask:        'var(--c-accent2)',
  'Eye Care':  'var(--c-primary)',
  Mist:        'var(--c-tertiary)',
  Peel:        'var(--c-accent2)',
  Balm:        'var(--c-accent1)',
  'Body Wash': 'var(--c-secondary)',
};

const ProductCard = ({ product, showScore = false, onSelect }) => {
  const { toggleSaved, isSaved, addToRoutine, routine } = useApp();
  const [addedSlot, setAddedSlot] = useState(null);
  const saved = isSaved(product.product_id);
  const inMorning = routine.morning.some(p => p.product_id === product.product_id);
  const inEvening = routine.evening.some(p => p.product_id === product.product_id);

  const handleAdd = (slot) => {
    addToRoutine(product, slot);
    setAddedSlot(slot);
    setTimeout(() => setAddedSlot(null), 2000);
  };

  const typeBg = TYPE_BG[product.type] || 'var(--c-primary)';

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>

      {/* Image */}
      <div className="relative overflow-hidden h-44" style={{ background: 'var(--c-border)' }}>
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'; }} />

        {/* Save */}
        <button onClick={() => toggleSaved(product)}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-md transition-all hover:scale-110"
          style={{ background: saved ? 'var(--c-accent2)' : 'rgba(255,255,255,0.9)' }}>
          <Heart className="w-3.5 h-3.5" style={{ color: saved ? '#fff' : 'var(--c-muted)', fill: saved ? '#fff' : 'none' }} />
        </button>

        {/* Match score */}
        {showScore && product.score != null && (
          <div className="absolute top-2.5 left-2.5 pill text-white"
            style={{ background: 'var(--c-primary)' }}>
            {Math.round(product.score * 100)}% match
          </div>
        )}

        {/* Type strip */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: typeBg }}>
          {product.type}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs truncate mb-0.5" style={{ color: 'var(--c-muted)' }}>{product.brand}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 cursor-pointer mb-2 hover:underline"
          style={{ color: 'var(--c-text)' }} onClick={() => onSelect?.(product)}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3"
                style={{
                  fill: i < Math.floor(product.rating) ? 'var(--c-accent1)' : 'transparent',
                  color: i < Math.floor(product.rating) ? 'var(--c-accent1)' : 'var(--c-border)',
                }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--c-muted)' }}>{product.rating}</span>
        </div>

        {/* Skin type tags — small, not loud */}
        {product.skin_types?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.skin_types.map(st => (
              <span key={st} className="pill" style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>{st}</span>
            ))}
          </div>
        )}

        {showScore && product.matching_ingredients?.length > 0 && (
          <p className="text-xs mb-2 italic line-clamp-1" style={{ color: 'var(--c-muted)' }}>
            Shared: {product.matching_ingredients.slice(0, 2).join(', ')}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5" style={{ borderTop: '1px solid var(--c-border)' }}>
          <span className="text-base font-black" style={{ color: 'var(--c-text)' }}>${product.price}</span>
          <div className="relative group/add">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: typeBg }}>
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
            <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/add:flex flex-col gap-0.5 rounded-xl shadow-xl p-1.5 z-10 min-w-36"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <button onClick={() => handleAdd('morning')} disabled={inMorning}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                style={{ color: 'var(--c-accent1)', background: inMorning ? 'transparent' : 'var(--c-accent1-light)' }}>
                {inMorning ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {inMorning ? 'In morning' : '☀️ Morning'}
              </button>
              <button onClick={() => handleAdd('evening')} disabled={inEvening}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                style={{ color: 'var(--c-primary)', background: inEvening ? 'transparent' : 'var(--c-primary-light)' }}>
                {inEvening ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {inEvening ? 'In evening' : '🌙 Evening'}
              </button>
            </div>
          </div>
        </div>

        {addedSlot && (
          <p className="text-xs text-center mt-1.5 animate-fade-in font-semibold" style={{ color: 'var(--c-primary)' }}>
            Added to {addedSlot} ✓
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
