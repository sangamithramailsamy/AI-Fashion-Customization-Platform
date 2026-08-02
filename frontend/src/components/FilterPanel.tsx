import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import {
  ALL_CATEGORIES,
  ALL_COLLECTIONS,
  ALL_COLORS,
  ALL_SIZES,
  type Filters,
} from '@/hooks/useShopFilters';

interface Props {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleArray: <K extends 'categories' | 'collections' | 'sizes' | 'colors'>(
    key: K,
    value: string
  ) => void;
  reset: () => void;
}

const PRICE_STEPS = [2000, 5000, 10000, 20000, 30000];

export default function FilterPanel({ filters, setFilters, toggleArray, reset }: Props) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-token">Filters</h3>
        <button onClick={reset} className="font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors">
          Reset
        </button>
      </div>

      {/* Category */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Category</legend>
        <div className="space-y-2">
          {ALL_CATEGORIES.map((c) => {
            const checked = filters.categories.includes(c);
            return (
              <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArray('categories', c)}
                  className="sr-only peer"
                />
                <span
                  className="h-4 w-4 border border-token flex items-center justify-center transition-colors peer-checked:bg-primary peer-checked:border-primary"
                  style={checked ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                >
                  {checked && <span className="h-1.5 w-1.5 bg-token" style={{ background: 'var(--btn-text)' }} />}
                </span>
                <span className="font-body text-sm text-token group-hover:text-primary transition-colors">{c}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Collection */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Collection</legend>
        <div className="space-y-2">
          {ALL_COLLECTIONS.map((c) => {
            const checked = filters.collections.includes(c.slug);
            return (
              <label key={c.slug} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArray('collections', c.slug)}
                  className="sr-only peer"
                />
                <span
                  className="h-4 w-4 border border-token flex items-center justify-center transition-colors"
                  style={checked ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                >
                  {checked && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
                </span>
                <span className="font-body text-sm text-token group-hover:text-primary transition-colors">{c.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">
          Price — up to ₹{filters.priceMax.toLocaleString('en-IN')}
        </legend>
        <input
          type="range"
          min={2000}
          max={30000}
          step={1000}
          value={filters.priceMax}
          onChange={(e) => setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))}
          className="w-full accent-[var(--primary)]"
          style={{ accentColor: 'var(--primary)' }}
        />
        <div className="flex justify-between mt-1.5">
          {PRICE_STEPS.map((s) => (
            <span key={s} className="font-body text-[10px] text-muted">₹{s / 1000}k</span>
          ))}
        </div>
      </fieldset>

      {/* Size */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Size</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => {
            const checked = filters.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleArray('sizes', s)}
                className={`px-3 py-1.5 text-xs font-body border transition-colors ${
                  checked ? 'border-primary text-primary' : 'border-token text-token hover:border-primary'
                }`}
                style={checked ? { background: 'var(--surface)', borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Color */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Color</legend>
        <div className="flex flex-wrap gap-2.5">
          {ALL_COLORS.map((c) => {
            const checked = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleArray('colors', c.name)}
                title={c.name}
                aria-label={c.name}
                className={`h-7 w-7 rounded-full border-2 transition-all ${checked ? 'scale-110' : 'hover:scale-105'}`}
                style={{
                  backgroundColor: c.hex,
                  borderColor: checked ? 'var(--primary)' : 'var(--border)',
                }}
              />
            );
          })}
        </div>
      </fieldset>

      {/* Availability */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Availability</legend>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
            className="sr-only peer"
          />
          <span
            className="h-4 w-4 border border-token flex items-center justify-center"
            style={filters.inStockOnly ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
          >
            {filters.inStockOnly && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
          </span>
          <span className="font-body text-sm text-token group-hover:text-primary transition-colors">In stock only</span>
        </label>
      </fieldset>

      {/* Rating */}
      <fieldset>
        <legend className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setFilters((f) => ({ ...f, minRating: r }))}
              className={`px-3 py-1.5 text-xs font-body border inline-flex items-center gap-1 transition-colors ${
                filters.minRating === r ? 'border-primary text-primary' : 'border-token text-token hover:border-primary'
              }`}
              style={filters.minRating === r ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
            >
              {r === 0 ? 'Any' : (<><Star size={11} className="fill-current" /> {r}+</>)}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Small motion wrapper for filter changes */
export function FilteredGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
