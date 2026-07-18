"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useBrandSettings } from "../app/hooks/useApi";

interface BrandContextType {
  brandName: string;
  brandLogo: string;
  isLoading: boolean;
  refetch: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useBrandSettings();
  const [brandName, setBrandName] = useState("VellVista");
  const [brandLogo, setBrandLogo] = useState(
    "https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png"
  );

  useEffect(() => {
    if (data) {
      setBrandName(data.brandName || "VellVista");
      setBrandLogo(data.brandLogo || "https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png");
    }
  }, [data]);

  return (
    <BrandContext.Provider value={{ brandName, brandLogo, isLoading, refetch }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
