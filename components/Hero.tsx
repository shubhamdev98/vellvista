"use client";

import Link from 'next/link';
import { useHeroSettings } from '../app/hooks/useApi';
import { getProductImageUrl } from '../app/utils/image';

export default function Hero() {
  const { data: settings } = useHeroSettings();

  const title = settings?.title || "The Art of Fragrance";
  const subtitle = settings?.subtitle || "summer collection 26";
  const mobileVideo = settings?.mobileVideo ? getProductImageUrl(settings.mobileVideo) : "/mobile.mp4";
  const desktopVideo = settings?.desktopVideo ? getProductImageUrl(settings.desktopVideo) : "/desk.mp4";

  return (
    <div
      id="home"
      className="relative h-[90vh] md:h-[88vh] text-inverse"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          key={`${mobileVideo}-${desktopVideo}`} // Force reload video when urls change
          autoPlay 
          preload="auto"
          className="object-cover w-full h-full"
          muted
          loop
          playsInline
        >
          <source src={mobileVideo} type="video/mp4" media="(max-width: 767px)" />
          <source src={desktopVideo} type="video/mp4" media="(min-width: 768px)" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-xs sm:text-sm tracking-[0.2em] uppercase text-gray-300 font-light mb-2.5 sm:mb-3 mt-4">
              {subtitle}
            </h4>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-tight text-inverse">
              {title}
            </h1>
            <Link href="/products" className="inline-block mt-6 bg-white text-primary font-medium py-3 px-6 transition-colors duration-300">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}