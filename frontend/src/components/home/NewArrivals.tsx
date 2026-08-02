import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import SectionHeading from '@/components/SectionHeading';

export default function NewArrivals() {
  const { getNewArrivals, loading } = useCatalog();
  const arrivals = getNewArrivals();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 bg-token-alt">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Just In"
          title={<>New Arrivals</>}
          description="Fresh from our atelier — the latest additions to the Shreemithra wardrobe."
          align="left"
          action={
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors">
                <ArrowLeft size={16} />
              </button>
              <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          }
        />
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-4 md:px-8 pb-4 snap-x scroll-smooth scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading && arrivals.length === 0 ? (
          <p className="font-body text-sm text-muted px-4 py-8">Loading new arrivals…</p>
        ) : arrivals.length === 0 ? (
          <p className="font-body text-sm text-muted px-4 py-8">No new arrivals yet. Check back soon.</p>
        ) : (
          arrivals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="snap-start shrink-0 w-[260px] md:w-[300px]"
            >
              <Link to={`/product/${p.id}`} className="block bg-surface border border-token overflow-hidden flex flex-col h-full group">
                <div className="relative aspect-[3/4] overflow-hidden bg-token-alt">
                  <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-[10px] uppercase tracking-[0.15em] font-body" style={{ color: 'var(--btn-text)' }}>
                    {p.badge}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">{p.category}</span>
                  <h3 className="font-display text-lg text-token mt-1 leading-snug line-clamp-2">{p.name}</h3>
                  <span className="font-body text-base text-token font-medium mt-2">₹{p.price.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 text-center md:text-left">
        <Link to="/new-arrivals" className="font-body text-sm uppercase tracking-[0.25em] text-token hover:text-primary transition-colors border-b border-token hover:border-primary pb-1 inline-block">
          View All New Arrivals
        </Link>
      </div>
    </section>
  );
}
