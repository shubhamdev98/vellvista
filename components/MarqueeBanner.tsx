"use client";

import React from "react";
import { useMarqueeMessages } from "../app/hooks/useApi";

export default function MarqueeBanner() {
  const { data: marqueeData, isLoading } = useMarqueeMessages();

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="w-full bg-surface-alt animate-pulse py-3.5 sm:py-4 h-[44px] sm:h-[48px]" />
      </section>
    );
  }

  if (!marqueeData || marqueeData.length === 0) {
    return null;
  }

  const messages = marqueeData.map((m) => m.text);

  // Repeat the messages to make a long scrolling line
  const repeatedText = [...messages, ...messages].map((msg, index) => (
    <React.Fragment key={index}>
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium text-[#F2E9DF] font-manrope">
        {msg}
      </span>
      <span className="text-[#F2E9DF]/60 mx-6 text-sm">✦</span>
    </React.Fragment>
  ));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <style>{`
        @keyframes marqueeLtr {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0%, 0, 0);
          }
        }
        .custom-marquee-container {
          display: flex;
          width: max-content;
          animation: marqueeLtr 100s linear infinite;
        }
        @media (hover: hover) {
          .custom-marquee-container:hover {
            animation-play-state: paused;
          }
        }
      `}</style>
      <div className="w-full overflow-hidden bg-[#020202] py-3.5 sm:py-4 select-none relative">
        {/* Left and Right white blurry gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="custom-marquee-container flex items-center whitespace-nowrap">
          {/* Copy 1 */}
          <div className="flex items-center shrink-0">
            {repeatedText}
          </div>
          {/* Copy 2 (Identical duplicate for seamless looping) */}
          <div className="flex items-center shrink-0">
            {repeatedText}
          </div>
        </div>
      </div>
    </section>
  );
}
