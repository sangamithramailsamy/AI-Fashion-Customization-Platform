import { useCatalog } from '@/context/CatalogContext';
import CollectionCard from '@/components/CollectionCard';
import SectionHeading from '@/components/SectionHeading';

export default function CollectionsPage() {
  const { collections, loading } = useCatalog();
  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Collections"
          title={<>Our Collections</>}
          description="Six distinct worlds of fashion — explore the one that speaks to you."
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
      </div>
    </div>
  );
}
