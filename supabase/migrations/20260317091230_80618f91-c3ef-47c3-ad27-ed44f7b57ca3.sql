-- 1. Remove anon access from reviews table directly
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;

-- Only authenticated users can read reviews (for their own or via view)
CREATE POLICY "Authenticated can read reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- 2. Recreate public_reviews view WITHOUT user_id for public consumption
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT id, product_id, rating, comment, created_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- 3. Replace coupon SELECT policy with a security definer validation function
DROP POLICY IF EXISTS "Authenticated users can validate a specific coupon" ON public.coupons;

-- No direct SELECT for regular users
-- Create a function to validate a specific code
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text)
RETURNS TABLE(
  id uuid,
  code text,
  discount_percent integer,
  discount_amount integer,
  min_order_amount integer,
  expires_at timestamptz,
  max_uses integer,
  used_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.code, c.discount_percent, c.discount_amount, 
         c.min_order_amount, c.expires_at, c.max_uses, c.used_count
  FROM public.coupons c
  WHERE c.code = upper(p_code)
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
  LIMIT 1;
$$;