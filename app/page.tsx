import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import MarqueeBanner from '@/components/MarqueeBanner';
import PromoBanner from '@/components/PromoBanner';
import ProductGrid from '@/components/ProductGrid';
import FaqSection from '@/components/FaqSection';
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
        <MarqueeBanner />
        <PromoBanner />
        <ProductGrid limit={4} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
