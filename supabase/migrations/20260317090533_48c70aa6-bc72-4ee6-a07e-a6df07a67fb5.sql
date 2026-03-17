-- Remove the broad policy we just added
DROP POLICY IF EXISTS "Public can read reviews without email" ON public.reviews;

-- Drop user_email column entirely - user_id is sufficient for identity
ALTER TABLE public.reviews DROP COLUMN IF EXISTS user_email;