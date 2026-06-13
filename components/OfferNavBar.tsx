"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Tag, Percent, Sparkles } from "lucide-react";

interface Offer {
  id: string;
  text: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const offers: Offer[] = [
  {
    id: "1",
    text: "Free shipping on orders over $50!",
    icon: <Gift className="h-4 w-4" />,
    bgColor: "bg-secondary",
    textColor: "text-primary",
  }
];

export default function OfferNavBar() {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && isVisible) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPaused, isVisible]);

  if (!isVisible) return null;

  const currentOffer = offers[currentOfferIndex];

  return (
    <div
      className={`${currentOffer.bgColor} ${currentOffer.textColor} relative overflow-hidden transition-all duration-300`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-10 space-x-2">
          <div className="flex items-center space-x-2 animate-fade-in">
            {currentOffer.icon}
            <Sparkles className="h-3 w-3" />
            <span className="text-sm font-light">{currentOffer.text}</span>
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Close offer banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
