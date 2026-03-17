-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view reviews for products" ON public.reviews;

-- Users can only SELECT their own reviews (for edit/delete)
CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anon/public to read public_reviews view
GRANT SELECT ON public.public_reviews TO anon, authenticated;