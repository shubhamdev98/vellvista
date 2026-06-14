import ProductGrid from "../../components/ProductGrid";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductsBanner from "../../components/ProductsBanner";
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProductsBanner />
      <ProductGrid
        showTitle={false}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Products" },
        ]}
      />
      <Footer />
    </div>
  );
}
