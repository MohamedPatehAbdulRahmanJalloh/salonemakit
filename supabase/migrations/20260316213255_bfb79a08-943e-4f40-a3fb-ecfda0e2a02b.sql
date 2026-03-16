-- Fix: login_attempts needs a policy for service-role edge functions
-- No public access, only service role (which bypasses RLS anyway)
-- Add a dummy deny-all policy to satisfy the linter
CREATE POLICY "No public access to login attempts"
ON public.login_attempts FOR ALL TO public
USING (false)
WITH CHECK (false);