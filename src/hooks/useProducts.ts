import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/types";

export const useProducts = (category?: string, showAll = false) => {
  return useQuery({
    queryKey: ["products", category, showAll],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!showAll) {
        query = query.eq("in_stock", true);
      }
      if (category && category !== "all") {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
