import { useState, useEffect, useCallback } from 'react';
import { Search, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const TYPES = ['Moisturiser', 'Cleanser', 'Serum', 'Toner', 'Exfoliator', 'Oil', 'Mask', 'Eye Care', 'Mist', 'Peel', 'Balm', 'Body Wash'];
const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];

const TYPE_COLORS = ['var(--c-primary)', 'var(--c-secondary)', 'var(--c-tertiary)', 'var(--c-accent1)', 'var(--c-accent2)'];

const ProductDetailModal = ({ product, onClose }) => {
  const { addToRoutine, routine } = useApp();
  const inMorning = routine.morning.some(p => p.product_id === product.product_id);
  const inEvening = routine.evening.some(p => p.product_id === product.product_id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: 'var(--c-surface)' }} onClick={e => e.stopPropagation()}>
        <div className="relative">
          <img src={product.image} alt={product.name} className="w-full h-52 object-cover" />
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
          <div className="flex gap-2">
            <button onClick={() => addToRoutine(product, 'morning')} disabled={inMorning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'var(--c-accent1)' }}>
              {inMorning ? '✓ In Morning' : '☀️ Morning Routine'}
            </button>
            <button onClick={() => addToRoutine(product, 'evening')} disabled={inEvening}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'var(--c-primary)' }}>
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
  const hasFilters = typeFilter || skinFilter || search;

  return (
    <div className="animate-fade-in -mx-6 md:-mx-8">

      {/* Page header */}
      <div className="mb-6 px-6 md:px-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--c-text)' }}>Products</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>
          {total.toLocaleString()} products{typeFilter ? ` · ${typeFilter}` : ''}{skinFilter ? ` · ${skinFilter} skin` : ''}
        </p>
      </div>

      <div className="flex">

        {/* ── Sidebar filters ── */}
        <aside className="hidden lg:block w-52 shrink-0 space-y-6 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto pr-5">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--c-muted)' }} />
            <input type="text" placeholder="Search..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }} />
          </div>

          {/* My skin type */}
          {skinProfile && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Quick Filter</p>
              <button
                onClick={() => setSkinFilter(prev => prev === skinProfile.skin_type ? '' : skinProfile.skin_type)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: skinFilter === skinProfile.skin_type ? 'var(--c-primary)' : 'var(--c-primary-light)',
                  color: skinFilter === skinProfile.skin_type ? '#fff' : 'var(--c-primary)',
                }}>
                <Sparkles className="w-3.5 h-3.5" />
                My skin type
              </button>
            </div>
          )}

          {/* Product type */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--c-muted)' }}>Type</p>
            <div className="space-y-0.5">
              {TYPES.map((t, i) => {
                const active = typeFilter === t;
                const col = TYPE_COLORS[i % TYPE_COLORS.length];
                return (
                  <button key={t} onClick={() => { setTypeFilter(prev => prev === t ? '' : t); setPage(1); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2"
                    style={{
                      background: active ? col : 'transparent',
                      color: active ? '#fff' : 'var(--c-muted)',
                      fontWeight: active ? 600 : 400,
                    }}>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin type */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--c-muted)' }}>Skin Type</p>
            <div className="space-y-0.5">
              {SKIN_TYPES.map((s, i) => {
                const active = skinFilter === s;
                const col = TYPE_COLORS[i % TYPE_COLORS.length];
                return (
                  <button key={s} onClick={() => setSkinFilter(prev => prev === s ? '' : s)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2"
                    style={{
                      background: active ? col : 'transparent',
                      color: active ? '#fff' : 'var(--c-muted)',
                      fontWeight: active ? 600 : 400,
                    }}>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {hasFilters && (
            <button onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setSkinFilter(''); setPage(1); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 px-8 py-2">

          {/* Mobile search bar */}
          <div className="lg:hidden mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--c-muted)' }} />
            <input type="text" placeholder="Search products..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-surface)' }} />
          </div>

          {/* Mobile filter pills */}
          <div className="lg:hidden flex flex-wrap gap-1.5 mb-4">
            {TYPES.slice(0, 6).map((t, i) => {
              const active = typeFilter === t;
              const col = TYPE_COLORS[i % TYPE_COLORS.length];
              return (
                <button key={t} onClick={() => { setTypeFilter(prev => prev === t ? '' : t); setPage(1); }}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ background: active ? col : 'var(--c-border)', color: active ? '#fff' : 'var(--c-muted)' }}>
                  {t}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="min-h-64 flex items-center justify-center"><LoadingSpinner size="lg" text="Loading products..." /></div>
          ) : displayed.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map(p => <ProductCard key={p.product_id} product={p} onSelect={setSelectedProduct} />)}
            </div>
          ) : (
            <div className="rounded-2xl py-16 text-center" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--c-border)' }} />
              <p className="font-medium" style={{ color: 'var(--c-muted)' }}>No products found</p>
              <button onClick={() => { setSearchInput(''); setSearch(''); setTypeFilter(''); setSkinFilter(''); }}
                className="mt-3 text-sm font-semibold hover:underline" style={{ color: 'var(--c-primary)' }}>Clear filters</button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all"
                  style={{ border: '1px solid var(--c-border)', color: 'var(--c-muted)' }}>
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                      className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                      style={{ background: p === page ? 'var(--c-primary)' : 'transparent', color: p === page ? '#fff' : 'var(--c-muted)' }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }} disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-all"
                  style={{ border: '1px solid var(--c-border)', color: 'var(--c-muted)' }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

export default Products;
