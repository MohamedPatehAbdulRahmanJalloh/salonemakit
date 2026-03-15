import { useState, useEffect, useCallback } from "react";
import { Product } from "@/data/types";

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {}
  }, []);

  const addViewed = useCallback((productId: string) => {
    setRecentIds((prev) => {
      const updated = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentIds, addViewed };
};
