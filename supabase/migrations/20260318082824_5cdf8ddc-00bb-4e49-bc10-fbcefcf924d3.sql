CREATE OR REPLACE FUNCTION public.get_product_review_stats()
RETURNS TABLE(product_id uuid, avg_rating numeric, review_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.product_id,
    ROUND(AVG(r.rating)::numeric, 1) as avg_rating,
    COUNT(*) as review_count
  FROM public.reviews r
  GROUP BY r.product_id;
$$;