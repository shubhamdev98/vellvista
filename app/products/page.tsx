import ProductGrid from "../../components/ProductGrid";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductsBanner from "../../components/ProductsBanner";
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProductsBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ProductGrid
          showTitle={false}
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Products" },
          ]}
        />
      </div>
      <Footer />
    </div>
  );
}
