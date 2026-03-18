import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  [productId: string]: { avg: number; count: number };
}

export const useProductReviewStats = () => {
  return useQuery({
    queryKey: ["product-review-stats"],
    queryFn: async (): Promise<ReviewStats> => {
      const { data, error } = await supabase.rpc("get_product_review_stats" as any);
      if (error) {
        console.warn("Could not fetch review stats:", error.message);
        return {};
      }
      const stats: ReviewStats = {};
      if (data) {
        for (const r of data as any[]) {
          stats[r.product_id] = { avg: Number(r.avg_rating), count: Number(r.review_count) };
        }
      }
      return stats;
    },
    staleTime: 1000 * 60 * 5,
  });
};
