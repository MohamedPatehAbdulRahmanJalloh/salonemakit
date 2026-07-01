
-- 1) Reviews: require purchase before posting
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

CREATE POLICY "Verified buyers can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = reviews.product_id
      AND o.user_id = auth.uid()
      AND o.status <> 'cancelled'
  )
);

-- 2) Revoke EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_order_insert_values(text, integer, integer, integer, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_coupon_for_order(text, integer) FROM anon, authenticated, PUBLIC;
