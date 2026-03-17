-- Create a view that hides user_email for public access
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT id, product_id, user_id, rating, comment, created_at
FROM public.reviews;

-- Drop the old public policy
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;

-- Add a new public policy that only allows viewing through authenticated or owner context
CREATE POLICY "Reviews viewable by authenticated users"
ON public.reviews FOR SELECT TO authenticated
USING (true);

-- Allow anonymous users to see reviews but without email (via the view)
GRANT SELECT ON public.public_reviews TO anon;