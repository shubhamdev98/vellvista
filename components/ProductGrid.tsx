"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Filter, X, Grid, List, ChevronDown, Share2 } from "lucide-react";
import Image from "next/image";
import Breadcrumb from "./Breadcrumb";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { useToast } from "../context/ToastProvider";
import { useCurrency } from "../context/CurrencyProvider";
import { trpc } from "../app/utils/trpc";
import { getProductImageUrl } from "../app/utils/image";
import { ProductCardSkeleton } from "./ui/Skeleton";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
  category?: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Chanel No. 5",
    brand: "Chanel",
    price: 150,
    originalPrice: 180,
    rating: 4.8,
    reviews: 324,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg",
    isSale: true,
    category: "women",
  },
  {
    id: 2,
    name: "Flowerbomb",
    brand: "Viktor & Rolf",
    price: 120,
    rating: 4.6,
    reviews: 256,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544138/vellvista/product/vnqu2pvfpyhqdzl7bevh.jpg",
    isNew: true,
    category: "women",
  },
  {
    id: 3,
    name: "Sauvage",
    brand: "Dior",
    price: 95,
    rating: 4.7,
    reviews: 189,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544160/vellvista/product/wfwrpm4pinxikehslkd7.jpg",
    category: "men",
  },
  {
    id: 4,
    name: "Black Opium",
    brand: "YSL",
    price: 110,
    originalPrice: 140,
    rating: 4.5,
    reviews: 412,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544142/vellvista/product/wjdiftninfppxofwj4gs.jpg",
    isSale: true,
    category: "women",
  },
  {
    id: 5,
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    price: 85,
    rating: 4.4,
    reviews: 167,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544146/vellvista/product/bfu7aebv60l4ont7usbm.jpg",
    isNew: true,
    category: "unisex",
  },
  {
    id: 6,
    name: "La Vie Est Belle",
    brand: "Lancôme",
    price: 130,
    rating: 4.9,
    reviews: 523,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544149/vellvista/product/zzm6qrhh6v4w6qgnowyy.jpg",
    category: "women",
  },
  {
    id: 7,
    name: "Acqua di Gio",
    brand: "Giorgio Armani",
    price: 75,
    rating: 4.6,
    reviews: 298,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544150/vellvista/product/jzjc31b2eq1eklvtgdyy.jpg",
    category: "men",
  },
  {
    id: 8,
    name: "Coco Mademoiselle",
    brand: "Chanel",
    price: 145,
    rating: 4.8,
    reviews: 445,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544152/vellvista/product/jfumqqqjlast4avarssf.jpg",
    category: "women",
  },
  {
    id: 9,
    name: "Mystery Fragrance",
    brand: "Exclusive Collection",
    price: 165,
    originalPrice: 200,
    rating: 4.7,
    reviews: 128,
    image: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781626159/vellvista/product/niztdpwxmhdovzus2yz3.jpg",
    isSale: true,
    isNew: true,
    category: "unisex",
  },
];

interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
  isInWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  addItem: (item: any) => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "warning") => void;
}

function ProductCard({
  product,
  formatPrice,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  addItem,
  showToast,
}: ProductCardProps) {
  const [clicked, setClicked] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClicked(true);
    const timer = setTimeout(() => setClicked(false), 1000);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    } catch (error: unknown) {
      clearTimeout(timer);
      setClicked(false);
      const message =
        error instanceof Error
          ? error.message
          : "You cannot add product without login. You need to login first.";
      showToast(message, "warning");
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="block group w-full cursor-pointer bg-transparent border-0 outline-none select-none"
    >
      {/* Image Section - Tall 3:4 Aspect Ratio */}
      <div className="relative aspect-[3/4] bg-background-muted overflow-hidden w-full transition-shadow duration-300">
        <Image
          src={getProductImageUrl(product.image)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button
            onClick={handleAddToCart}
            className={`bg-primary text-inverse text-[10px] font-bold uppercase tracking-widest py-2.5 px-5 shadow-md transition-all active:scale-95 duration-150 cursor-pointer ${
              clicked ? "bg-emerald-600" : ""
            }`}
          >
            {clicked ? "Added!" : "Add to Cart"}
          </button>
        </div>

        {/* Share Button - visible on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const productUrl = `${window.location.origin}/products/${product.id}`;
            navigator.clipboard.writeText(productUrl)
              .then(() => showToast("Product link copied to clipboard!", "success"))
              .catch(() => showToast("Failed to copy link.", "error"));
          }}
          className="absolute top-3 right-[3.25rem] z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary cursor-pointer"
          aria-label={`Share ${product.name}`}
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Wishlist Heart - visible on hover or if in wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isInWishlist(product.id)) {
              removeFromWishlist(product.id);
            } else {
              addToWishlist(product.id);
            }
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer ${
            isInWishlist(product.id) ? "text-red-500 opacity-100" : "text-secondary hover:text-red-500"
          }`}
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
        </button>

        {/* Badge - Top Left Minimal Box (matches screenshot) */}
        {(product.isSale || product.isNew) && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-primary text-inverse font-label-caps text-[9px] px-2.5 py-1 tracking-widest font-semibold font-inter">
              {product.isSale ? "SALE" : "NEW"}
            </span>
          </div>
        )}
      </div>

      {/* Info Section (matches screenshot typography and stacking) */}
      <div className="pt-3 pb-1 flex flex-col font-inter text-left">
        {/* Brand / Category */}
        <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase font-semibold">
          {product.category || product.brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-medium text-primary mt-1 leading-snug line-clamp-1 group-hover:text-secondary transition-colors duration-300 font-manrope">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-semibold text-secondary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-xs text-secondary/60 line-through font-light">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-semibold text-error">
                {discountPercent}% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

interface ProductGridProps {
  showTitle?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
  limit?: number; // Limit number of products displayed (used on landing page)
}

export default function ProductGrid({
  showTitle = true,
  breadcrumbItems,
  limit,
}: ProductGridProps) {
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice, currency } = useCurrency();
  const [showFilter, setShowFilter] = useState(false);
  const [isDoubleColumn, setIsDoubleColumn] = useState(true);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const data = await trpc.getProducts({ limit: 50 });
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: parseFloat(p.price),
            originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
            rating: parseFloat(p.rating || "5"),
            reviews: p.reviews || 0,
            image: p.image,
            isNew: p.isNew || false,
            isSale: p.isSale || false,
            category: p.category || "unisex",
          }));
          setDbProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load products from database, falling back to static products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDbProducts();
  }, []);

  const displayProducts = dbProducts.length > 0 ? dbProducts : products;
  // Apply limit if provided (e.g., landing page shows only 4 items)
  const limitedProducts = typeof limit === 'number' ? displayProducts.slice(0, limit) : displayProducts;

  // displayProducts is computed above before the review stats fetch

  // Filter state
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200,
    minRating: 0,
    saleOnly: false,
    newOnly: false,
    maleOnly: false,
    femaleOnly: false,
    unisexOnly: false,
  });

  const filteredProducts = (typeof limit === 'number' ? limitedProducts : displayProducts).filter((product) => {
    if (product.price < filters.minPrice) return false;
    if (product.price > filters.maxPrice) return false;
    if (product.rating < filters.minRating) return false;
    if (filters.saleOnly && !product.isSale) return false;
    if (filters.newOnly && !product.isNew) return false;

    // Filter by gender category if any gender filter is selected
    if (filters.maleOnly || filters.femaleOnly || filters.unisexOnly) {
      const prodCat = (product.category || "").toLowerCase();
      const matchesMale = filters.maleOnly && prodCat === "men";
      const matchesFemale = filters.femaleOnly && prodCat === "women";
      const matchesUnisex = filters.unisexOnly && prodCat === "unisex";
      if (!matchesMale && !matchesFemale && !matchesUnisex) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 200,
      minRating: 0,
      saleOnly: false,
      newOnly: false,
      maleOnly: false,
      femaleOnly: false,
      unisexOnly: false,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(rating)
            ? "text-warning fill-current"
            : "text-muted"
          }`}
      />
    ));
  };

  return (
    <section id="products" className="py-12 sm:py-16 scroll-mt-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className={`flex justify-between items-end mb-8 font-inter ${
            limit ? "" : "border-b border-border-light pb-4"
          }`}>
            <div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold font-manrope text-primary uppercase tracking-wider">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="font-label-caps text-xs text-primary font-semibold tracking-widest border-b-2 border-primary pb-1 hover:opacity-75 transition-opacity"
            >
              View All
            </Link>
          </div>
        )}

        {breadcrumbItems ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
            <Breadcrumb items={breadcrumbItems} className="mb-0" />
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 border border-dark overflow-hidden md:hidden">
                <button
                  onClick={() => setIsDoubleColumn(false)}
                  className={`p-1.5 sm:p-2 transition-colors ${!isDoubleColumn
                      ? "bg-primary text-inverse"
                      : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                    }`}
                  aria-label="Single column view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsDoubleColumn(true)}
                  className={`p-1.5 sm:p-2 transition-colors ${isDoubleColumn
                      ? "bg-primary text-inverse"
                      : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                    }`}
                  aria-label="Double column view"
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-1 sm:gap-2 border border-primary px-3 sm:px-4 py-1.5 sm:py-2 text-primary hover:bg-primary hover:text-inverse transition-colors text-sm sm:text-base cursor-pointer"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        ) : (
          !limit && (
            <div className="flex justify-end mb-4 sm:mb-6 gap-2 sm:gap-3">
              {/* Grid Toggle Buttons for Mobile */}
              <div className="flex items-center gap-1 sm:gap-2 border border-dark overflow-hidden md:hidden">
                <button
                  onClick={() => setIsDoubleColumn(false)}
                  className={`p-1.5 sm:p-2 transition-colors ${!isDoubleColumn
                      ? "bg-primary text-inverse"
                      : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                    }`}
                  aria-label="Single column view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsDoubleColumn(true)}
                  className={`p-1.5 sm:p-2 transition-colors ${isDoubleColumn
                      ? "bg-primary text-inverse"
                      : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                    }`}
                  aria-label="Double column view"
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-1 sm:gap-2 border border-primary px-3 sm:px-4 py-1.5 sm:py-2 text-primary hover:bg-primary hover:text-inverse transition-colors text-sm sm:text-base cursor-pointer"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Filter</span>
              </button>
            </div>
          )
        )}

        {/* Filter Sidebar */}
        {showFilter && (
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-50"
            onClick={() => setShowFilter(false)}
          />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[25rem] bg-surface z-50 transition-transform duration-300 ease-in-out ${showFilter ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-default">
              <h2 className="text-2xl font-semibold text-primary">Filters</h2>
              <button
                onClick={() => setShowFilter(false)}
                className="text-muted hover:text-primary transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs font-light text-secondary mb-1">
                  Price Range ({currency.symbol})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:border-primary bg-surface text-primary"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:border-primary bg-surface text-primary"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-xs font-light text-secondary mb-1">
                  Minimum Rating
                </label>
                <div className="relative">
                  <select
                    value={filters.minRating}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minRating: Number(e.target.value),
                      })
                    }
                    className="w-full pl-3 pr-10 py-2.5 text-sm border border-default focus:outline-none focus:border-primary bg-surface text-primary cursor-pointer appearance-none"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-xs font-light text-secondary mb-1">
                  Gender
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.maleOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, maleOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary border-primary"
                    />
                    <span className="text-sm text-secondary hover:text-primary transition-colors">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.femaleOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, femaleOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary border-primary"
                    />
                    <span className="text-sm text-secondary hover:text-primary transition-colors">Female</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.unisexOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, unisexOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary border-primary"
                    />
                    <span className="text-sm text-secondary hover:text-primary transition-colors">Unisex</span>
                  </label>
                </div>
              </div>

              {/* Offers */}
              <div className="mb-6">
                <label className="block text-xs font-light text-secondary mb-1">
                  Offers
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.saleOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, saleOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary border-primary"
                    />
                    <span className="text-sm text-secondary hover:text-primary transition-colors">Sale Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.newOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, newOnly: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary border-primary"
                    />
                    <span className="text-sm text-secondary hover:text-primary transition-colors">New Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-default bg-surface">
              <button
                onClick={clearFilters}
                className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-light tracking-wide"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        {/* Product Grid */}
        <div
          className={`grid gap-3 sm:gap-4 md:gap-6 ${isDoubleColumn
              ? "grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
            }`}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                isInWishlist={isInWishlist}
                addToWishlist={addToWishlist}
                removeFromWishlist={removeFromWishlist}
                addItem={addItem}
                showToast={showToast}
              />
            ))
          )}
        </div>

      </div>
    </section>
  );
}