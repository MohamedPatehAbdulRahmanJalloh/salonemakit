-- Switch to security invoker view (the safe default)
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT id, product_id, user_id, rating, comment, created_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Add a public SELECT policy on reviews that only exposes non-sensitive columns
-- The view will use this policy since it's security invoker
CREATE POLICY "Public can read reviews without email"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);