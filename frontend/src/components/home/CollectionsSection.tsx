import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import CollectionCard from '@/components/CollectionCard';
import SectionHeading from '@/components/SectionHeading';

export default function CollectionsSection() {
  const { collections, loading } = useCatalog();
  return (
    <section className="py-16 md:py-24 bg-token-alt">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Curated Edits"
          title={<>Explore Our Collections</>}
          description="Six distinct worlds of fashion, each with its own character — yet unmistakably Shreemithra."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {loading && collections.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">Loading collections…</p>
          ) : collections.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">No collections available right now.</p>
          ) : (
            collections.map((c, i) => (
              <CollectionCard key={c.id} collection={c} index={i} />
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-10"
        >
          <Link to="/collections" className="font-body text-sm uppercase tracking-[0.25em] text-token hover:text-primary transition-colors border-b border-token hover:border-primary pb-1 inline-block">
            View All Collections
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
