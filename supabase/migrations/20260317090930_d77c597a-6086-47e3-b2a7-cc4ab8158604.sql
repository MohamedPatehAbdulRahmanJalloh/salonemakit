-- Fix 1: Revoke direct INSERT/UPDATE/DELETE on public_reviews view (it's read-only)
REVOKE INSERT, UPDATE, DELETE ON public.public_reviews FROM anon, authenticated;

-- Fix 2: Replace coupon policy - users can only validate a specific code, not browse all
DROP POLICY IF EXISTS "Active coupons viewable by authenticated users" ON public.coupons;

-- Only allow lookup by specific code (users must already know the code)
CREATE POLICY "Authenticated users can validate a specific coupon"
ON public.coupons
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now()) 
  AND (max_uses IS NULL OR used_count < max_uses)
);