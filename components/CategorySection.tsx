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

  if (isLoading || !categories || categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-12 md:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mb-8 md:mb-12 font-inter">
          <p className="font-label-caps text-xs text-secondary tracking-widest mb-2 font-semibold">
            CURATED FOR YOU
          </p>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-bold font-manrope text-primary leading-tight">
            Seasonal Perspective
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item.categorySlug)}
              className={`${item.gridSpan || "col-span-1"} group relative overflow-hidden bg-surface-alt ${item.height || "h-[192px]"} text-left w-full cursor-pointer focus:outline-none`}
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <Image
                  src={getProductImageUrl(item.image)}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              {/* Soft dark overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors duration-300" />
              <div className="absolute bottom-6 left-6 font-inter z-10">
                {item.subtitle && (
                  <p className="font-label-caps text-[10px] text-white/90 tracking-wider mb-1 font-semibold">
                    {item.subtitle}
                  </p>
                )}
                <h3 className="font-headline-md text-xl md:text-2xl text-white font-semibold font-manrope">
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