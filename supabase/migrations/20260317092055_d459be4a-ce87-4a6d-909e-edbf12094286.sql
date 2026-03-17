-- Reviews hardening: remove broad read policy and keep owner/admin-only table access
DROP POLICY IF EXISTS "Authenticated can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remove public view surface and expose safe review fields via SECURITY DEFINER RPC
DROP VIEW IF EXISTS public.public_reviews;

CREATE OR REPLACE FUNCTION public.get_public_reviews(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  rating integer,
  comment text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.product_id, r.rating, r.comment, r.created_at
  FROM public.reviews r
  WHERE r.product_id = p_product_id
  ORDER BY r.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_public_reviews(uuid) TO anon, authenticated;

-- Coupons hardening: ensure no broad SELECT policy exists and expose only RPC validation path
DROP POLICY IF EXISTS "Only active coupons are publicly viewable" ON public.coupons;
DROP POLICY IF EXISTS "Active coupons viewable by authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Authenticated users can validate a specific coupon" ON public.coupons;

GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon, authenticated;

-- Storage hardening for product-images bucket
DROP POLICY IF EXISTS "Auth upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete product images" ON storage.objects;

CREATE POLICY "Admin/Staff upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  )
);

CREATE POLICY "Admin/Staff delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  )
);

CREATE POLICY "Admin/Staff update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  )
);