import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Region = "sl" | "dubai";

interface RegionConfig {
  region: Region;
  currencyCode: string;
  currencySymbol: string;
  deliveryFee: number;
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

const SLL_TO_AED_RATE = 6500;

const UAE_CONFIG: RegionConfig = {
  region: "dubai",
  currencyCode: "AED",
  currencySymbol: "AED",
  deliveryFee: 10 * 6500,
  districts: [
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
    "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
    "Al Ain", "Dubai Marina", "Downtown Dubai", "Deira", "Bur Dubai",
    "Jumeirah", "Al Barsha", "Business Bay", "JBR",
    "Dubai Silicon Oasis", "International City", "Al Nahda",
  ],
  phonePattern: /^(\+?971|0)?[0-9]{8,9}$/,
  phoneHint: "+971 5X...",
  paymentMethods: ["cod"],
};

interface RegionContextValue {
  region: Region;
  setRegion: (r: Region) => void;
  config: RegionConfig;
  formatPrice: (priceSLL: number) => string;
  convertPrice: (priceSLL: number) => number;
  getProductDisplayPrice: (product: { price: number; price_aed?: number | null }) => string;
  getProductRawPrice: (product: { price: number; price_aed?: number | null }) => number;
  updateProfileRegion: (r: Region) => Promise<void>;
  /** Whether the region is locked for this user (UAE non-admin) */
  isRegionLocked: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
};

const UAE_COUNTRY_CODES = ["AE"];

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();

  const [region, setRegionState] = useState<Region>(() => {
    return (localStorage.getItem("region") as Region) || "sl";
  });
  const [isIpLocked, setIsIpLocked] = useState(() => {
    return localStorage.getItem("region_locked") === "true";
  });

  // Admins are never locked, even from UAE
  const effectivelyLocked = isIpLocked && !isAdmin;

  const setRegion = (r: Region) => {
    if (effectivelyLocked && r !== "dubai") return;
    setRegionState(r);
    localStorage.setItem("region", r);
  };

  // Auto-detect region via IP on first visit
  useEffect(() => {
    const detected = localStorage.getItem("region_detected");
    if (detected) return;

    const detectRegion = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (!response.ok) return;
        const data = await response.json();
        const countryCode = data?.country_code?.toUpperCase();

        localStorage.setItem("region_detected", "true");

        if (countryCode && UAE_COUNTRY_CODES.includes(countryCode)) {
          setRegionState("dubai");
          localStorage.setItem("region", "dubai");
          setIsIpLocked(true);
          localStorage.setItem("region_locked", "true");
        } else {
          if (!localStorage.getItem("region")) {
            setRegionState("sl");
            localStorage.setItem("region", "sl");
          }
          setIsIpLocked(false);
          localStorage.setItem("region_locked", "false");
        }
      } catch {
        localStorage.setItem("region_detected", "true");
      }
    };

    detectRegion();
  }, []);

  // Sync region from user profile on login
  useEffect(() => {
    if (!user) return;

    const syncProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("region")
        .eq("id", user.id)
        .single();
      if (data?.region && (data.region === "sl" || data.region === "dubai")) {
        // Only apply profile region if not locked (or if admin)
        if (!isIpLocked || isAdmin) {
          setRegionState(data.region as Region);
          localStorage.setItem("region", data.region);
        }
      }
    };

    syncProfile();
  }, [user?.id, isAdmin, isIpLocked]);

  const updateProfileRegion = async (r: Region) => {
    if (effectivelyLocked) return;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await supabase.from("profiles").update({ region: r }).eq("id", currentUser.id);
    }
    setRegionState(r);
    localStorage.setItem("region", r);
  };

  const config = region === "dubai" ? UAE_CONFIG : SL_CONFIG;

  const convertPrice = (priceSLL: number): number => {
    if (region === "sl") return priceSLL;
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
      return product.price_aed * SLL_TO_AED_RATE;
    }
    return product.price;
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, config, formatPrice, convertPrice, getProductDisplayPrice, getProductRawPrice, updateProfileRegion, isRegionLocked: effectivelyLocked }}>
      {children}
    </RegionContext.Provider>
  );
};
