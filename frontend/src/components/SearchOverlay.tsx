import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { Link } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

const SUGGESTIONS = ['Silk saree', 'Anarkali', 'Party gown', 'Linen dress', 'Lehenga', 'Custom design'];

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { products, collections } = useCatalog();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const q = query.toLowerCase().trim();
  const productResults = q
    ? products.filter((p) =>
        [p.name, p.category, p.collection].some((s) => s.toLowerCase().includes(q))
      )
    : [];
  const collectionResults = q
    ? collections.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    : [];
  const hasResults = productResults.length > 0 || collectionResults.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-2xl mt-24 mx-4 bg-token border border-token shadow-2xl"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-token">
          <Search size={20} className="text-muted" strokeWidth={1.6} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for sarees, dresses, collections…"
            className="flex-1 bg-transparent outline-none font-body text-base text-token placeholder:text-muted"
          />
          <button onClick={onClose} aria-label="Close search" className="h-8 w-8 flex items-center justify-center text-token hover:text-primary">
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {!query && (
            <div>
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 text-sm font-body border border-token text-token hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !hasResults && (
            <p className="font-body text-sm text-muted py-6 text-center">No results for "{query}". Try another search.</p>
          )}

          {hasResults && (
            <div className="space-y-5">
              {collectionResults.length > 0 && (
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-2">Collections</p>
                  <ul className="space-y-1">
                    {collectionResults.map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/collections/${c.slug}`}
                          onClick={onClose}
                          className="flex items-center justify-between p-2 hover:bg-surface transition-colors"
                        >
                          <span className="font-display text-base text-token">{c.name}</span>
                          <span className="font-body text-xs text-muted">{c.itemCount} pieces</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {productResults.length > 0 && (
                <div>
                  <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-2">Products</p>
                  <ul className="space-y-1">
                    {productResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/product/${p.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2 hover:bg-surface transition-colors"
                        >
                          <img src={p.image} alt={p.name} className="h-12 w-12 object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-base text-token truncate">{p.name}</p>
                            <p className="font-body text-xs text-muted">{p.category} · ₹{p.price.toLocaleString('en-IN')}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
