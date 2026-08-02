import { useCatalog } from '@/context/CatalogContext';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';

export default function NewArrivalsPage() {
  const { getNewArrivals, loading } = useCatalog();
  const arrivals = getNewArrivals();
  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Just In"
          title={<>New Arrivals</>}
          description="The latest additions to the Shreemithra wardrobe — fresh from our atelier."
          align="left"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading && arrivals.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">Loading new arrivals…</p>
          ) : arrivals.length === 0 ? (
            <p className="font-body text-sm text-muted col-span-full text-center py-8">No new arrivals yet. Check back soon.</p>
          ) : (
            arrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
