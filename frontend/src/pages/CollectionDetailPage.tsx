import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import CollectionPattern from '@/components/CollectionPattern';
import ProductCard from '@/components/ProductCard';

export default function CollectionDetailPage() {
  const { slug = '' } = useParams();
  const { getCollectionBySlug, getProductsByCollection, loading } = useCatalog();
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return (
      <div className="pt-36 pb-20 text-center">
        <p className="font-display text-3xl text-token">Collection not found</p>
        <Link to="/collections" className="btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={15} /> All Collections
        </Link>
      </div>
    );
  }

  const products = collection ? getProductsByCollection(collection.slug) : [];

  return (
    <div className="pt-24 md:pt-28 pb-20">
      {/* Banner preserving the collection's visual identity */}
      <div className="relative overflow-hidden border-b border-token bg-surface">
        <div className="absolute inset-0 opacity-70">
          <CollectionPattern pattern={collection.pattern} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-token leading-tight"
          >
            {collection.name}
          </motion.h1>
          {collection.longDescription && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-body text-base md:text-lg text-muted mt-5 max-w-2xl leading-relaxed"
            >
              {collection.longDescription}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-body text-xs uppercase tracking-[0.2em] text-muted mt-6"
          >
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <Link to="/collections" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft size={14} /> All Collections
        </Link>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-surface border border-token">
            <p className="font-display text-2xl text-token">New pieces coming soon</p>
            <p className="font-body text-sm text-muted mt-2">We're adding to this collection. Please check back shortly.</p>
            <Link to="/shop" className="btn-primary mt-6 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
