import Hero from '@/components/home/Hero';
import CollectionsSection from '@/components/home/CollectionsSection';
import FeaturedDesigns from '@/components/home/FeaturedDesigns';
import NewArrivals from '@/components/home/NewArrivals';
import BoutiqueCreations from '@/components/home/BoutiqueCreations';
import AITeaser from '@/components/home/AITeaser';
import CustomerJourney from '@/components/home/CustomerJourney';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionsSection />
      <FeaturedDesigns />
      <NewArrivals />
      <BoutiqueCreations />
      <AITeaser />
      <CustomerJourney />
    </>
  );
}
