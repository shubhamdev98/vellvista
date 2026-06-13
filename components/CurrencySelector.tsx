"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, type CurrencyCode } from "../context/CurrencyProvider";

function FlagImage({ countryCode, size = 20 }: { countryCode: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      alt={countryCode.toUpperCase()}
      width={size}
      height={Math.round(size * 0.75)}
      className="inline-block object-cover"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

export default function CurrencySelector() {
  const { currency, setCountryCode, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-primary hover:text-secondary transition-colors border border-default hover:border-dark"
        aria-label="Select currency"
        id="currency-selector"
      >
        <FlagImage countryCode={currency.countryCode} size={20} />
        <span className="font-light text-xs uppercase">{currency.countryCode}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-surface border border-default shadow-lg z-50 min-w-[80px]">
          {availableCurrencies.map((c) => (
            <button
              key={`${c.countryCode}-${c.code}`}
              onClick={() => {
                setCountryCode(c.countryCode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-surface-alt ${
                currency.countryCode === c.countryCode
                  ? "bg-surface-alt text-primary font-light"
                  : "text-secondary"
              }`}
            >
              <FlagImage countryCode={c.countryCode} size={20} />
              <span className="font-light text-xs uppercase">{c.countryCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
