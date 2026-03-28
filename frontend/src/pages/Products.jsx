import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TYPES = ['Moisturiser', 'Cleanser', 'Serum', 'Toner', 'Exfoliator', 'Oil', 'Mask', 'Eye Care', 'Mist', 'Peel', 'Balm', 'Body Wash'];
const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];

const ProductDetailModal = ({ product, onClose }) => {
  const { addToRoutine, routine } = useApp();
  const inMorning = routine.morning.some(p => p.product_id === product.product_id);
  const inEvening = routine.evening.some(p => p.product_id === product.product_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-500 shadow-sm text-lg">×</button>
        <img src={product.image} alt={product.name} className="w-full h-52 object-cover" />
        <div className="p-6">
          <p className="text-xs text-muted mb-0.5">{product.brand}</p>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-main">{product.name}</h2>
            <span className="text-2xl font-extrabold shrink-0" style={{ color: 'var(--c-primary)' }}>${product.price}</span>
          </div>
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
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: inMorning ? '#ccc' : 'var(--c-accent2)' }}>
              {inMorning ? '✓ In Morning' : '☀️ Morning Routine'}
            </button>
            <button onClick={() => addToRoutine(product, 'evening')} disabled={inEvening}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: inEvening ? '#ccc' : 'var(--c-secondary)' }}>
              {inEvening ? '✓ In Evening' : '🌙 Evening Routine'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { skinProfile } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skinFilter, setSkinFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async (pg, q, type) => {
    setLoading(true);
    try {
      const filters = { page: pg };
      if (q) filters.search = q;
      if (type) filters.type = type;
      const res = await skincareAPI.getProducts(filters);
      const list = Array.isArray(res) ? res : res.products || [];
      setProducts(list);
      setTotal(res.total || list.length);
      setTotalPages(res.total_pages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(page, search, typeFilter); }, [page, search, typeFilter, fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const displayed = skinFilter ? products.filter(p => p.skin_types?.includes(skinFilter)) : products;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: 'var(--c-primary)' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-white/60 mt-0.5">
            {total.toLocaleString()} products
            {typeFilter && <span className="text-white/90"> · {typeFilter}</span>}
            {skinFilter && <span className="text-white/90"> · {skinFilter} skin</span>}
          </p>
        </div>
        {skinProfile && (
          <button
            onClick={() => setSkinFilter(prev => prev === skinProfile.skin_type ? '' : skinProfile.skin_type)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={{
              background: skinFilter === skinProfile.skin_type ? 'var(--c-accent1)' : 'rgba(255,255,255,0.15)',
              color: skinFilter === skinProfile.skin_type ? 'var(--c-accent1-fg)' : '#fff',
            }}>
            <Sparkles className="w-3.5 h-3.5" />
            {skinFilter === skinProfile.skin_type ? 'My skin type' : 'Filter: my skin type'}
          </button>
        )}
      </div>

      {/* ── Search + filters ── */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" placeholder="Search by name, brand, or ingredient..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={{ border: '1px solid var(--c-tertiary-dark)', '--tw-ring-color': 'var(--c-primary)' }} />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: showFilters || typeFilter || skinFilter ? 'var(--c-primary)' : 'var(--c-tertiary)',
              color: showFilters || typeFilter || skinFilter ? '#fff' : 'var(--c-tertiary-fg)',
              border: '1px solid var(--c-tertiary-dark)',
            }}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="pt-3 space-y-3" style={{ borderTop: '1px solid var(--c-tertiary-dark)' }}>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">Product Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(t => (
                  <button key={t} onClick={() => { setTypeFilter(prev => prev === t ? '' : t); setPage(1); }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background: typeFilter === t ? 'var(--c-primary)' : 'var(--c-tertiary)',
                      color: typeFilter === t ? '#fff' : 'var(--c-tertiary-fg)',
                    }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">Skin Type</label>
              <div className="flex flex-wrap gap-1.5">
                {SKIN_TYPES.map(s => (
                  <button key={s} onClick={() => setSkinFilter(prev => prev === s ? '' : s)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      background: skinFilter === s ? 'var(--c-secondary)' : 'var(--c-tertiary)',
                      color: skinFilter === s ? '#fff' : 'var(--c-tertiary-fg)',
                    }}>{s}</button>
                ))}
              </div>
            </div>
            {(searchInput || typeFilter || skinFilter) && (
              <div className="flex justify-end">
                <button onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setSkinFilter(''); setPage(1); }}
                  className="text-xs text-muted flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="min-h-64 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading products..." /></div>
      ) : displayed.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayed.map(p => <ProductCard key={p.product_id} product={p} onSelect={setSelectedProduct} />)}
        </div>
      ) : (
        <div className="rounded-xl py-16 text-center" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
          <Search className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted font-medium">No products found</p>
          <button onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setSkinFilter(''); }}
            className="mt-3 text-sm font-medium" style={{ color: 'var(--c-primary)' }}>Clear filters</button>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl px-5 py-3"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-tertiary-dark)' }}>
          <p className="text-sm text-muted">Page {page} of {totalPages} · {total.toLocaleString()} products</p>
          <div className="flex items-center gap-2">
            <button onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }} disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ border: '1px solid var(--c-tertiary-dark)', color: 'var(--c-tertiary-fg)' }}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: p === page ? 'var(--c-primary)' : 'transparent', color: p === page ? '#fff' : 'var(--c-tertiary-fg)' }}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }} disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ border: '1px solid var(--c-tertiary-dark)', color: 'var(--c-tertiary-fg)' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

export default Products;
