"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { trpc } from "../app/utils/trpc";

export type CurrencyCode = "USD" | "INR" | "TRY" | "MXN" | "AED" | "GBP" | "CAD" | "EUR" | "AUD" | "SGD" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  rate: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", name: "US Dollar", country: "USA", countryCode: "us", flag: "🇺🇸", rate: 1.0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India", countryCode: "in", flag: "🇮🇳", rate: 83.5 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", country: "Turkey", countryCode: "tr", flag: "🇹🇷", rate: 32.5 },
  { code: "MXN", symbol: "$", name: "Mexican Peso", country: "Mexico", countryCode: "mx", flag: "🇲🇽", rate: 17.2 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "Dubai", countryCode: "ae", flag: "🇦🇪", rate: 3.67 },
];

type CurrencyContextType = {
  currency: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
  availableCurrencies: CurrencyConfig[];
  setCountryCode: (countryCode: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("us");
  const [activeCountries, setActiveCountries] = useState<{ id: number; name: string; code: string; isActive: boolean }[]>([]);

  // Fetch active countries from the database on mount
  useEffect(() => {
    const fetchActiveCountries = async () => {
      try {
        const data = await trpc.getCountries({ onlyActive: true });
        setActiveCountries(data);
      } catch (err) {
        console.error("Error fetching active countries for currency provider:", err);
      }
    };
    fetchActiveCountries();
  }, []);

  // Map of country ISO code to its default currency configuration details
  const countryToCurrencyMap = useMemo(() => {
    const mapping: Record<string, Omit<CurrencyConfig, "country" | "countryCode">> = {
      US: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1.0 },
      IN: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rate: 83.5 },
      TR: { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷", rate: 32.5 },
      MX: { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽", rate: 17.2 },
      AE: { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", rate: 3.67 },
      GB: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rate: 0.79 },
      CA: { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.37 },
      DE: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.92 },
      FR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.92 },
      AU: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", rate: 1.51 },
      SG: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", rate: 1.35 },
      JP: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 156.0 },
    };
    return mapping;
  }, []);

  // Dynamically build available currencies list based on active countries in the database
  const availableCurrencies = useMemo(() => {
    if (activeCountries.length === 0) {
      // Return hardcoded default currencies if list hasn't loaded yet
      return CURRENCIES;
    }

    const list: CurrencyConfig[] = [];
    activeCountries.forEach((c) => {
      const codeUpper = c.code.toUpperCase();
      const config = countryToCurrencyMap[codeUpper];
      if (config) {
        list.push({
          ...config,
          country: c.name,
          countryCode: c.code.toLowerCase(),
        });
      } else {
        // Fallback default for any new country added by admin
        list.push({
          code: "USD",
          symbol: "$",
          name: "US Dollar",
          country: c.name,
          countryCode: c.code.toLowerCase(),
          flag: "🌐",
          rate: 1.0,
        });
      }
    });

    return list;
  }, [activeCountries, countryToCurrencyMap]);

  // Load saved country/currency from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCountry = localStorage.getItem("selectedCountryCode");
      if (savedCountry) {
        setSelectedCountryCode(savedCountry.toLowerCase());
      } else {
        // Fallback for older sessions: check selectedCurrency
        const savedCurrency = localStorage.getItem("selectedCurrency");
        if (savedCurrency) {
          const matched = availableCurrencies.find(c => c.code === savedCurrency);
          if (matched) {
            setSelectedCountryCode(matched.countryCode.toLowerCase());
          }
        }
      }
    }
  }, [availableCurrencies]);

  const currency = useMemo(() => {
    const found = availableCurrencies.find((c) => c.countryCode.toLowerCase() === selectedCountryCode.toLowerCase());
    if (found) return found;
    // Fallback if current saved currency is not enabled/active
    return availableCurrencies[0] || CURRENCIES[0];
  }, [availableCurrencies, selectedCountryCode]);

  const setCountryCode = useCallback((countryCode: string) => {
    const codeLower = countryCode.toLowerCase();
    setSelectedCountryCode(codeLower);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCountryCode", codeLower);
      // Also update selectedCurrency for backward compatibility
      const matched = availableCurrencies.find(c => c.countryCode.toLowerCase() === codeLower);
      if (matched) {
        localStorage.setItem("selectedCurrency", matched.code);
      }
    }
  }, [availableCurrencies]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    // Keep setCurrency for backward compatibility in case other parts of the app use it
    const matched = availableCurrencies.find(c => c.code === code);
    if (matched) {
      setCountryCode(matched.countryCode);
    }
  }, [availableCurrencies, setCountryCode]);

  const convertPrice = useCallback((priceInUSD: number): number => {
    return priceInUSD * currency.rate;
  }, [currency.rate]);

  const formatPrice = useCallback((priceInUSD: number): string => {
    const converted = convertPrice(priceInUSD);
    if (currency.code === "USD") {
      return `$${converted.toFixed(2)}`;
    }
    if (currency.code === "EUR") {
      return `€${converted.toFixed(2)}`;
    }
    if (currency.code === "GBP") {
      return `£${converted.toFixed(2)}`;
    }
    if (currency.code === "CAD") {
      return `C$${converted.toFixed(2)}`;
    }
    if (currency.code === "AUD") {
      return `A$${converted.toFixed(2)}`;
    }
    if (currency.code === "SGD") {
      return `S$${converted.toFixed(2)}`;
    }
    if (currency.code === "JPY") {
      return `¥${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (currency.code === "MXN") {
      return `MX$${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${currency.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }, [currency.code, currency.symbol, convertPrice]);

  const value = useMemo(
    () => ({ currency, setCurrency, formatPrice, convertPrice, availableCurrencies, setCountryCode }),
    [currency, setCurrency, formatPrice, convertPrice, availableCurrencies, setCountryCode]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}


