"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useHomepageCategories } from "../app/hooks/useApi";
import { getProductImageUrl } from "../app/utils/image";

export default function CategorySection() {
  const router = useRouter();
  const { data: categories, isLoading } = useHomepageCategories();

  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug.startsWith("http") || categorySlug.startsWith("/")) {
      router.push(categorySlug);
    } else {
      router.push(`/products?category=${categorySlug}`);
    }
  };

  if (isLoading) {
    return (
      <section id="categories" className="py-8 md:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Heading Skeleton */}
          <div className="mb-6 md:mb-8 font-inter animate-pulse">
            <div className="h-3 bg-surface-alt w-24 mb-2" />
            <div className="h-9 bg-surface-alt w-64" />
          </div>

          {/* Horizontal Row Skeleton */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[240px] sm:w-[280px] md:w-[320px] h-[320px] sm:h-[360px] bg-surface-alt animate-pulse shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-8 md:py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mb-6 md:mb-8 font-inter">
          <p className="font-label-caps text-xs text-secondary tracking-widest mb-2 font-semibold">
            CURATED FOR YOU
          </p>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-bold font-manrope text-primary leading-tight">
            Seasonal Perspective
          </h2>
        </div>

        {/* Horizontal Scrollable Row with Rounded Images */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4 pt-1 snap-x snap-mandatory">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item.categorySlug)}
              className="group relative w-[240px] sm:w-[280px] md:w-[320px] h-[320px] sm:h-[360px] md:h-[400px] shrink-0 overflow-hidden bg-surface-alt text-left cursor-pointer focus:outline-none transition-all duration-500 snap-start"
            >
              {/* Rounded Image Container */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <Image
                  src={getProductImageUrl(item.image)}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 280px, 320px"
                  className="object-cover object-center"
                />
              </div>

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-300" />

              {/* Text overlay */}
              <div className="absolute bottom-5 left-5 right-5 md:bottom-6 md:left-6 md:right-6 font-inter z-10">
                {item.subtitle && (
                  <p className="font-label-caps text-[10px] md:text-xs text-white/90 tracking-wider mb-1 font-semibold uppercase">
                    {item.subtitle}
                  </p>
                )}
                <h3 className="font-headline-md text-xl sm:text-2xl text-white font-bold font-manrope leading-snug">
                  {item.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}