import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import FilterPanel, { FilteredGrid } from '@/components/FilterPanel';
import { useShopFilters, countActiveFilters, type SortKey } from '@/hooks/useShopFilters';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopPage() {
  const { filters, setFilters, sort, setSort, filtered, toggleArray, reset } = useShopFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Shop"
          title={<>All Products</>}
          description="Ready-made dresses and boutique creations — filter, sort and find the piece that's yours."
          align="left"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-6 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 border border-token text-token hover:border-primary hover:text-primary transition-colors text-sm font-body"
            >
              <SlidersHorizontal size={15} /> Filters
              {activeCount > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                  {activeCount}
                </span>
              )}
            </button>
            <span className="font-body text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search shop"
                className="pl-9 pr-3 py-2.5 w-44 md:w-56 bg-token-alt border border-token text-token font-body text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-token text-token hover:border-primary hover:text-primary transition-colors text-sm font-body"
              >
                Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                <ChevronDown size={14} className={sortOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-1 z-20 w-52 bg-surface border border-token shadow-xl"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <li key={o.value}>
                        <button
                          onClick={() => { setSort(o.value); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${
                            sort === o.value ? 'text-primary' : 'text-token hover:text-primary'
                          }`}
                        >
                          {o.label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative sm:hidden mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search shop"
            className="pl-9 pr-3 py-2.5 w-full bg-token-alt border border-token text-token font-body text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start bg-surface border border-token p-6">
            <FilterPanel filters={filters} setFilters={setFilters} toggleArray={toggleArray} reset={reset} />
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-surface border border-token">
                <p className="font-display text-2xl text-token">No products match your filters</p>
                <p className="font-body text-sm text-muted mt-2">Try widening your selection or resetting filters.</p>
                <button onClick={reset} className="btn-primary mt-6 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-body">
                  Reset Filters
                </button>
              </div>
            ) : (
              <FilteredGrid>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </FilteredGrid>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-token border-l border-token flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-token">
                <h3 className="font-display text-xl text-token">Filters</h3>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel filters={filters} setFilters={setFilters} toggleArray={toggleArray} reset={reset} />
              </div>
              <div className="p-5 border-t border-token">
                <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full py-3 text-sm uppercase tracking-[0.2em] font-body">
                  Show {filtered.length} products
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
