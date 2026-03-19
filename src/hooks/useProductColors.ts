import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  color_image: string | null;
  sort_order: number;
}

export const useProductColors = (productId: string) => {
  return useQuery({
    queryKey: ["product-colors", productId],
    queryFn: async (): Promise<ProductColor[]> => {
      const { data, error } = await supabase
        .from("product_colors")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as ProductColor[];
    },
    enabled: !!productId,
  });
};

export const useAllProductColors = () => {
  return useQuery({
    queryKey: ["all-product-colors"],
    queryFn: async (): Promise<ProductColor[]> => {
      const { data, error } = await supabase
        .from("product_colors")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as ProductColor[];
    },
  });
};
