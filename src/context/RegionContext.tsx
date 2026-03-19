import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Region = "sl" | "dubai";

interface RegionConfig {
  region: Region;
  currencyCode: string;
  currencySymbol: string;
  deliveryFee: number; // in smallest unit
  districts: string[];
  phonePattern: RegExp;
  phoneHint: string;
  paymentMethods: string[];
}

const SL_CONFIG: RegionConfig = {
  region: "sl",
  currencyCode: "SLL",
  currencySymbol: "NLe",
  deliveryFee: 30,
  districts: [
    "Western Area Urban (Freetown)", "Western Area Rural", "Bo", "Bonthe",
    "Moyamba", "Pujehun", "Kenema", "Kailahun", "Kono", "Bombali",
    "Kambia", "Koinadugu", "Port Loko", "Tonkolili", "Falaba", "Karene",
  ],
  phonePattern: /^(\+?232|0)?[2-9]\d{7}$/,
  phoneHint: "+23276...",
  paymentMethods: ["cod", "orange_money"],
};

// 1 AED ≈ 6,500 SLL (NLe 6.5) — stored as 6500 in smallest unit
const SLL_TO_AED_RATE = 6500;

const UAE_CONFIG: RegionConfig = {
  region: "dubai",
  currencyCode: "AED",
  currencySymbol: "AED",
  deliveryFee: 10 * 6500, // 10 AED stored in SLL equivalent for conversion
  districts: [
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
    "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
    "Al Ain", "Dubai Marina", "Downtown Dubai", "Deira", "Bur Dubai",
    "Jumeirah", "Al Barsha", "Business Bay", "JBR",
    "Dubai Silicon Oasis", "International City", "Al Nahda",
  ],
  phonePattern: /^(\+?971|0)?[0-9]{8,9}$/,
  phoneHint: "+971 5X...",
  paymentMethods: ["cod"], // will add Stripe later
};

interface RegionContextValue {
  region: Region;
  setRegion: (r: Region) => void;
  config: RegionConfig;
  formatPrice: (priceSLL: number) => string;
  convertPrice: (priceSLL: number) => number;
  getProductDisplayPrice: (product: { price: number; price_aed?: number | null }) => string;
  getProductRawPrice: (product: { price: number; price_aed?: number | null }) => number;
  /** Update region in profile (persists to DB) */
  updateProfileRegion: (r: Region) => Promise<void>;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
};

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [region, setRegionState] = useState<Region>(() => {
    return (localStorage.getItem("region") as Region) || "sl";
  });

  const setRegion = (r: Region) => {
    setRegionState(r);
    localStorage.setItem("region", r);
  };

  const config = region === "dubai" ? UAE_CONFIG : SL_CONFIG;

  const convertPrice = (priceSLL: number): number => {
    if (region === "sl") return priceSLL;
    // Convert from SLL smallest unit to AED
    // priceSLL is in SLL (e.g. 65000 = NLe 65)
    // AED = priceSLL / SLL_TO_AED_RATE → 65000/6500 = 10 AED
    return Math.round(priceSLL / SLL_TO_AED_RATE * 100) / 100;
  };

  const formatPrice = (priceSLL: number): string => {
    if (region === "sl") {
      const amount = priceSLL / 1000;
      return `NLe ${amount.toLocaleString("en-SL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    const aed = convertPrice(priceSLL);
    return `AED ${aed.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatAed = (priceAed: number): string => {
    return `AED ${priceAed.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const getProductDisplayPrice = (product: { price: number; price_aed?: number | null }): string => {
    if (region === "dubai" && product.price_aed != null) {
      return formatAed(product.price_aed);
    }
    return formatPrice(product.price);
  };

  const getProductRawPrice = (product: { price: number; price_aed?: number | null }): number => {
    if (region === "dubai" && product.price_aed != null) {
      // Convert AED back to SLL equivalent for order processing
      return product.price_aed * SLL_TO_AED_RATE;
    }
    return product.price;
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, config, formatPrice, convertPrice, getProductDisplayPrice, getProductRawPrice }}>
      {children}
    </RegionContext.Provider>
  );
};
