import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types';
import CollectionPattern from './CollectionPattern';

interface Props {
  collection: Collection;
  index: number;
}

export default function CollectionCard({ collection, index }: Props) {
  // Vary card emphasis so they don't all look identical
  const isFeature = index === 0 || index === 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: 'easeOut' }}
      className={`group relative overflow-hidden border border-token bg-surface ${isFeature ? 'md:row-span-1' : ''}`}
    >
      <Link to={`/collections/${collection.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <div className="absolute inset-0 bg-surface" />
          <CollectionPattern pattern={collection.pattern} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-muted">
              {String(index + 1).padStart(2, '0')} / {String(6).padStart(2, '0')}
            </span>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">
              {collection.itemCount} pieces
            </span>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <h3 className="font-display text-2xl md:text-3xl text-token group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
          <p className="font-body text-sm text-muted mt-2 leading-relaxed line-clamp-2">
            {collection.description}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-token group-hover:text-primary transition-colors">
            Explore
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
