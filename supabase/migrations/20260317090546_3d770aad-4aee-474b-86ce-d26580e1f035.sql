-- Need a SELECT policy so the security invoker view can read reviews
-- Since user_email column is dropped, this is safe
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (true);