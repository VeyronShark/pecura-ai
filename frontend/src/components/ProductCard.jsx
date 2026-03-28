import { Star, Heart, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const TYPE_COLORS = {
  Cleanser:    { bg: 'var(--c-secondary)', fg: '#fff' },
  Moisturiser: { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  Moisturizer: { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  Serum:       { bg: 'var(--c-primary)',   fg: '#fff' },
  Treatment:   { bg: '#c026d3',            fg: '#fff' },
  Exfoliator:  { bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
  Exfoliant:   { bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
  Sunscreen:   { bg: '#ca8a04',            fg: '#fff' },
  Toner:       { bg: 'var(--c-secondary)', fg: '#fff' },
  Oil:         { bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
  Mask:        { bg: '#c026d3',            fg: '#fff' },
  'Eye Care':  { bg: 'var(--c-secondary)', fg: '#fff' },
  Mist:        { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  Peel:        { bg: 'var(--c-primary)',   fg: '#fff' },
  Balm:        { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  'Body Wash': { bg: 'var(--c-secondary)', fg: '#fff' },
  'Bath Salts':{ bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
  'Bath Oil':  { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
};

const SKIN_COLORS = {
  Dry:         { bg: 'var(--c-secondary)', fg: '#fff' },
  Oily:        { bg: 'var(--c-accent1)',   fg: 'var(--c-accent1-fg)' },
  Combination: { bg: 'var(--c-primary)',   fg: '#fff' },
  Sensitive:   { bg: '#c026d3',            fg: '#fff' },
  Normal:      { bg: 'var(--c-accent2)',   fg: 'var(--c-accent2-fg)' },
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

  const typeStyle = TYPE_COLORS[product.type] || { bg: 'var(--c-tertiary)', fg: 'var(--c-tertiary-fg)' };

  return (
    <div className="rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-lg"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
      <div className="relative overflow-hidden">
        <img src={product.image} alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'; }} />
        <button onClick={() => toggleSaved(product)}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        {showScore && product.score != null && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'var(--c-primary)' }}>
            {Math.round(product.score * 100)}% match
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1 text-xs font-semibold"
          style={{ background: typeStyle.bg, color: typeStyle.fg }}>
          {product.type}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted truncate mb-0.5">{product.brand}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 cursor-pointer hover:underline mb-2"
          style={{ color: 'var(--c-primary)' }} onClick={() => onSelect?.(product)}>
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-muted">{product.rating} ({product.reviews_count?.toLocaleString()})</span>
        </div>

        {product.skin_types?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.skin_types.map(st => {
              const sc = SKIN_COLORS[st] || { bg: 'var(--c-tertiary)', fg: 'var(--c-tertiary-fg)' };
              return (
                <span key={st} className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ background: sc.bg, color: sc.fg }}>{st}</span>
              );
            })}
          </div>
        )}

        {showScore && product.matching_ingredients?.length > 0 && (
          <p className="text-xs text-muted mb-2 italic line-clamp-1">
            Shared: {product.matching_ingredients.slice(0, 2).join(', ')}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-base font-extrabold" style={{ color: 'var(--c-primary)' }}>${product.price}</span>
          <div className="relative group/add">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'var(--c-primary)' }}>
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/add:flex flex-col gap-1 bg-white border rounded-lg shadow-lg p-1 z-10 min-w-36"
              style={{ borderColor: 'var(--c-tertiary-dark)' }}>
              <button onClick={() => handleAdd('morning')} disabled={inMorning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-40"
                style={{ color: inMorning ? '#999' : 'var(--c-accent2-dark)' }}>
                {inMorning ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {inMorning ? 'In morning' : '☀️ Morning'}
              </button>
              <button onClick={() => handleAdd('evening')} disabled={inEvening}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-40"
                style={{ color: inEvening ? '#999' : 'var(--c-secondary)' }}>
                {inEvening ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {inEvening ? 'In evening' : '🌙 Evening'}
              </button>
            </div>
          </div>
        </div>

        {addedSlot && (
          <p className="text-xs text-center mt-1 animate-fade-in" style={{ color: 'var(--c-accent1)' }}>
            Added to {addedSlot} routine!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
