import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export const useReviews = (productId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_reviews")
        .select("id, product_id, rating, comment, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
  });

  // Fetch user's own review from the reviews table (RLS scoped)
  const { data: userReview = null } = useQuery({
    queryKey: ["user-review", productId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("id, product_id, user_id, rating, comment, created_at")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!productId && !!user,
  });

  const averageRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const addReview = useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("reviews").insert({
        product_id: input.productId,
        user_id: user.id,
        rating: input.rating,
        comment: input.comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });

  return {
    reviews,
    isLoading,
    averageRating,
    reviewCount: reviews.length,
    userReview,
    addReview,
    deleteReview,
  };
};
