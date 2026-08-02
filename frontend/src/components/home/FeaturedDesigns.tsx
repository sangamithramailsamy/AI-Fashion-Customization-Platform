import { Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { ArrowRight } from 'lucide-react';

export default function FeaturedDesigns() {
  const { getFeatured, loading } = useCatalog();
  const featured = getFeatured();
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Featured"
          title={<>Featured Designs</>}
          description="A hand-picked selection from our most-loved pieces this season."
          align="left"
          action={
            <Link to="/shop" className="font-body text-sm uppercase tracking-[0.2em] text-token hover:text-primary transition-colors inline-flex items-center gap-2 border-b border-token hover:border-primary pb-1">
              View All <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading && featured.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">Loading featured designs…</p>
          ) : featured.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">No featured designs available right now.</p>
          ) : (
            featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
