"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Star, Heart, Filter, X, Grid, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { useToast } from "../context/ToastProvider";
import { useCurrency } from "../context/CurrencyProvider";
import { trpc } from "../app/utils/trpc";
import { getProductImageUrl } from "../app/utils/image";

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
    image: "/product/beautinow-niche-perfume-k1X05CSCybE-unsplash.jpg",
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
    image: "/product/filip-baotic-_3cLB_mvVTw-unsplash.jpg",
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
    image: "/product/kelvin-lutan-5f4yovjJw4c-unsplash.jpg",
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
    image: "/product/laurissi-Bxsl6rpbwfI-unsplash.jpg",
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
    image: "/product/miska-sage-UpoUiGj-qg8-unsplash.jpg",
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
    image: "/product/pavlo-talpa-MfGoZ-QoJFc-unsplash.jpg",
    category: "women",
  },
  {
    id: 7,
    name: "Acqua di Gio",
    brand: "Giorgio Armani",
    price: 75,
    rating: 4.6,
    reviews: 298,
    image: "/product/romy-ameryckx-NLz3Wy8Thac-unsplash.jpg",
    category: "men",
  },
  {
    id: 8,
    name: "Coco Mademoiselle",
    brand: "Chanel",
    price: 145,
    rating: 4.8,
    reviews: 445,
    image: "/product/zulian-firmansyah-rYcbOljwx10-unsplash.jpg",
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
    image: "/product/rashid-dFpeXStwwIM-unsplash.jpg",
    isSale: true,
    isNew: true,
    category: "unisex",
  },
];

interface ProductGridProps {
  showTitle?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
}

export default function ProductGrid({
  showTitle = true,
  breadcrumbItems,
}: ProductGridProps) {
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice, currency } = useCurrency();
  const [clickedProductId, setClickedProductId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isDoubleColumn, setIsDoubleColumn] = useState(true);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<Record<number, { avg: number; count: number }>>({});

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

  // Fetch real review stats for all displayed products
  const displayProducts = dbProducts.length > 0 ? dbProducts : products;

  useEffect(() => {
    const fetchReviewStats = async () => {
      const stats: Record<number, { avg: number; count: number }> = {};
      await Promise.all(
        displayProducts.map(async (product) => {
          try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001';
            const response = await fetch(`${backendUrl}/api/reviews/${product.id}`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                const total = data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
                stats[product.id] = {
                  avg: Math.round((total / data.length) * 10) / 10,
                  count: data.length,
                };
              }
            }
          } catch {
            // silently skip
          }
        })
      );
      setReviewStats(stats);
    };
    if (displayProducts.length > 0) {
      fetchReviewStats();
    }
  }, [displayProducts.length]);

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
  });

  // Apply filters
  const filteredProducts = displayProducts.filter((product) => {
    if (product.price < filters.minPrice) return false;
    if (product.price > filters.maxPrice) return false;
    if (product.rating < filters.minRating) return false;
    if (filters.saleOnly && !product.isSale) return false;
    if (filters.newOnly && !product.isNew) return false;

    // Filter by gender category if either is selected
    if (filters.maleOnly || filters.femaleOnly) {
      const prodCat = (product.category || "").toLowerCase();
      const matchesMale = filters.maleOnly && (prodCat === "men" || prodCat === "unisex");
      const matchesFemale = filters.femaleOnly && (prodCat === "women" || prodCat === "unisex");
      if (!matchesMale && !matchesFemale) {
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
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          i < Math.floor(rating)
            ? "text-warning fill-current"
            : "text-muted"
        }`}
      />
    ));
  };

  return (
    <section id="products" className="py-12 sm:py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-color-1 mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-sm sm:text-lg text-color-1 max-w-2xl mx-auto px-2">
              Discover our handpicked selection of premium fragrances from the
              worlds most prestigious brands.
            </p>
          </div>
        )}

        {breadcrumbItems ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
            <Breadcrumb items={breadcrumbItems} className="mb-0" />
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 border border-dark overflow-hidden md:hidden">
                <button
                  onClick={() => setIsDoubleColumn(false)}
                  className={`p-1.5 sm:p-2 transition-colors ${
                    !isDoubleColumn
                      ? "bg-primary text-inverse"
                      : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                  }`}
                  aria-label="Single column view"
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsDoubleColumn(true)}
                  className={`p-1.5 sm:p-2 transition-colors ${
                    isDoubleColumn
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
                className="flex items-center gap-1 sm:gap-2 border border-primary px-3 sm:px-4 py-1.5 sm:py-2 text-primary hover:bg-primary hover:text-inverse transition-colors text-sm sm:text-base"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mb-4 sm:mb-6 gap-2 sm:gap-3">
            {/* Grid Toggle Buttons for Mobile */}
            <div className="flex items-center gap-1 sm:gap-2 border border-dark overflow-hidden md:hidden">
              <button
                onClick={() => setIsDoubleColumn(false)}
                className={`p-1.5 sm:p-2 transition-colors ${
                  !isDoubleColumn
                    ? "bg-primary text-inverse"
                    : "bg-surface text-primary hover:bg-primary hover:text-inverse"
                }`}
                aria-label="Single column view"
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setIsDoubleColumn(true)}
                className={`p-1.5 sm:p-2 transition-colors ${
                  isDoubleColumn
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
              className="flex items-center gap-1 sm:gap-2 border border-primary px-3 sm:px-4 py-1.5 sm:py-2 text-primary hover:bg-primary hover:text-inverse transition-colors text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filter</span>
            </button>
          </div>
        )}

        {/* Filter Sidebar */}
        {showFilter && (
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-50"
            onClick={() => setShowFilter(false)}
          />
        )}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[25rem] bg-surface z-50 transition-transform duration-300 ease-in-out ${
            showFilter ? "translate-x-0" : "translate-x-full"
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
                    className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-primary"
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
                    className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-primary"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-xs font-light text-secondary mb-1">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRating: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-primary"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
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
          className={`grid gap-3 sm:gap-4 md:gap-6 ${
            isDoubleColumn
              ? "grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product) => {
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block bg-surface overflow-hidden group transition-all duration-300 border border-gray-200"
              >
                {/* Image Section */}
                <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <Image
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge - Top Left */}
                  {(product.isSale || product.isNew) && (
                    <div className="absolute top-2.5 left-0 z-10">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-[10px] sm:text-xs font-bold text-white ${
                          product.isSale
                            ? "bg-green-600"
                            : "bg-blue-600"
                        }`}
                      >
                        {product.isSale ? "Best Seller" : "New"}
                      </span>
                    </div>
                  )}

                  {/* Wishlist Heart - Top Right */}
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
                    className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                      isInWishlist(product.id)
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                    }`}
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart
                      className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-all duration-300 ${
                        isInWishlist(product.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* Rating Badge - Bottom Right of Image (only if real reviews exist) */}
                  {reviewStats[product.id] && (
                    <div className="absolute bottom-2.5 right-2.5 z-10">
                      <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-current" />
                        <span className="text-[11px] sm:text-xs font-bold text-gray-800">
                          {reviewStats[product.id].avg}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-gray-500">
                          ({reviewStats[product.id].count})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-3 sm:p-4">
                  {/* Product Name */}
                  <h3 className="text-sm sm:text-[15px] font-semibold text-primary leading-snug line-clamp-2 mb-0.5">
                    {product.name}
                  </h3>

                  {/* Brand / Category */}
                  <p className="text-xs sm:text-[13px] text-muted mb-2.5 truncate">
                    {product.brand}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">
                          {discountPercent}% off
                        </span>
                      </>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        });
                        setClickedProductId(product.id);
                        setTimeout(() => setClickedProductId(null), 1000);
                      } catch (error: unknown) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : "You cannot add product without login. You need to login first.";
                        showToast(message, "warning");
                      }
                    }}
                    disabled={product.isSale}
                    className={`w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      product.isSale
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : clickedProductId === product.id
                          ? "bg-green-50 border border-green-500 text-green-600"
                          : "bg-primary text-inverse hover:opacity-90"
                    }`}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {clickedProductId === product.id ? "Added!" : "Add to Cart"}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <a
            href="#products"
            className="inline-block border border-primary text-primary px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-light hover:bg-primary hover:text-inverse transition-colors"
          >
            Load more
          </a>
        </div>
      </div>
    </section>
  );
}