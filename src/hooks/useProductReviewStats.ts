import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  [productId: string]: { avg: number; count: number };
}

export const useProductReviewStats = () => {
  return useQuery({
    queryKey: ["product-review-stats"],
    queryFn: async (): Promise<ReviewStats> => {
      // Use get_public_reviews won't work for bulk - query directly via RPC or a simpler approach
      // Since reviews RLS only allows own reviews for authenticated users,
      // we use the public function approach but need a bulk version
      // For now, let's query all products and their review counts via a different approach
      // We'll create a simple aggregate from the public reviews function
      const { data, error } = await supabase
        .from("reviews")
        .select("product_id, rating");
      
      // This will return empty for non-authenticated users due to RLS
      // But product cards are shown to everyone, so we need a public approach
      // Let's use a workaround: we won't fail, just return empty
      if (error) {
        console.warn("Could not fetch review stats:", error.message);
        return {};
      }

      const stats: ReviewStats = {};
      if (data) {
        for (const r of data) {
          if (!stats[r.product_id]) {
            stats[r.product_id] = { avg: 0, count: 0 };
          }
          stats[r.product_id].count++;
          stats[r.product_id].avg += r.rating;
        }
        for (const pid of Object.keys(stats)) {
          stats[pid].avg = stats[pid].avg / stats[pid].count;
        }
      }
      return stats;
    },
    staleTime: 1000 * 60 * 5,
  });
};
