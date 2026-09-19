"use client";

import { useState, useEffect } from 'react';
import { useHeroSettings } from '../app/hooks/useApi';
import { getProductImageUrl } from '../app/utils/image';

export default function Hero() {
  const { data: settings } = useHeroSettings();
  const [containerScale, setContainerScale] = useState(1);
  const [videoScale, setVideoScale] = useState(1.25);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Progress ratio between 0 and 1 over 600px of scrolling
          const progress = Math.min(1, Math.max(0, scrollY / 600));
          
          // Outer container zooms out (from 1 down to 0.92) creating outer margin spacing on scroll
          setContainerScale(1 - progress * 0.08);
          // Inner video also zooms out (from 1.25 down to 1.0)
          setVideoScale(1.25 - progress * 0.25);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const title = settings?.title || "The Art of Fragrance";
  const subtitle = settings?.subtitle || "summer collection 26";
  const mobileVideo = settings?.mobileVideo ? getProductImageUrl(settings.mobileVideo) : "/mobile.mp4";
  const desktopVideo = settings?.desktopVideo ? getProductImageUrl(settings.desktopVideo) : "/desk.mp4";

  return (
    <div id="home" className="w-full bg-white pt-0 pb-1 overflow-hidden">
      <div
        className="relative h-[90vh] md:h-[88vh] text-inverse overflow-hidden transition-transform duration-100 ease-out will-change-transform mx-auto"
        style={{
          transform: `scale(${containerScale})`,
        }}
      >
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            key={`${mobileVideo}-${desktopVideo}`} // Force reload video when urls change
            autoPlay 
            preload="auto"
            className="object-cover w-full h-full transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `scale(${videoScale})` }}
            muted
            loop
            playsInline
          >
            <source src={mobileVideo} type="video/mp4" media="(max-width: 767px)" />
            <source src={desktopVideo} type="video/mp4" media="(min-width: 768px)" />
          </video>
        </div>
      </div>
    </div>
  );
}

