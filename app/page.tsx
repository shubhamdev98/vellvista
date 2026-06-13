import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import PromoBanner from '@/components/PromoBanner';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import OfferNavBar from '@/components/OfferNavBar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <OfferNavBar />
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <PromoBanner />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}
