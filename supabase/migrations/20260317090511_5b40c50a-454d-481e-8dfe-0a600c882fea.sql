-- Fix 1: Recreate public_reviews as a SECURITY DEFINER view so it bypasses 
-- the reviews table RLS but only exposes safe columns
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = false)
AS
SELECT id, product_id, user_id, rating, comment, created_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Fix 2: Restrict coupon SELECT to authenticated users only
DROP POLICY IF EXISTS "Only active coupons are publicly viewable" ON public.coupons;

CREATE POLICY "Active coupons viewable by authenticated users"
ON public.coupons
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now()) 
  AND (max_uses IS NULL OR used_count < max_uses)
);