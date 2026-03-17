-- Drop the old permissive policy that was re-added or still exists
DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

-- Only allow users to see their own reviews (for edit/delete purposes)
CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can see all reviews
CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));