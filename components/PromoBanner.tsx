"use client";

import Image from "next/image";
import { usePromoBanner } from "../app/hooks/useApi";

export default function PromoBanner() {
  const { data: banner, isLoading } = usePromoBanner();

  if (isLoading || !banner || !banner.isActive) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-[18.75rem] md:h-[25rem] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
            priority
            sizes="100vw"
          />
          {/* Diagonal light accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top-right accent line */}
          <div className="absolute top-10 right-10 w-24 h-px bg-gradient-to-l from-accent/40 to-transparent"></div>
          {/* Bottom-left accent line */}
          <div className="absolute bottom-10 left-10 w-24 h-px bg-gradient-to-r from-accent/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                {banner.title}
              </span>
            </h2>

            {/* Description */}
            {banner.description && (
              <p className="text-base md:text-lg text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">
                {banner.description}
              </p>
            )}
          </div>
        </div>


      </div>
    </section>
  );
}