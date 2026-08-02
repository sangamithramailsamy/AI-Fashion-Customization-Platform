import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Wand2 } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import SectionHeading from '@/components/SectionHeading';

export default function BoutiqueCreations() {
  const { getBoutiqueCreations, loading } = useCatalog();
  const creations = getBoutiqueCreations();
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Atelier"
          title={<>Crafted by Shreemithra</>}
          description="One-of-a-kind boutique pieces, made in-house and fully customizable to your vision."
          align="center"
        />

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {loading && creations.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">Loading boutique creations…</p>
          ) : creations.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">No boutique creations available right now.</p>
          ) : (
            creations.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-surface border border-token overflow-hidden"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-token-alt">
                  <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-primary text-[10px] uppercase tracking-[0.15em] font-body" style={{ color: 'var(--btn-text)' }}>
                    {p.badge}
                  </span>
                </div>
                <div className="p-5">
                  <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">{p.category}</span>
                  <h3 className="font-display text-xl md:text-2xl text-token mt-1.5 leading-snug">{p.name}</h3>
                  <p className="font-body text-sm text-muted mt-2">From ₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <Link to="/custom-designs" className="btn-outline py-2.5 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center justify-center gap-2">
                      <Eye size={14} /> View Design
                    </Link>
                    <Link to="/custom-designs" className="btn-primary py-2.5 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center justify-center gap-2">
                      <Wand2 size={14} /> Customize This Design
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
