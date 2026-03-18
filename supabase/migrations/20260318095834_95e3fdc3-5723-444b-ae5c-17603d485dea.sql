
-- Add per-user coupon reuse check to validate_coupon_for_order
CREATE OR REPLACE FUNCTION public.validate_coupon_for_order(p_coupon_code text, p_subtotal integer)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF p_coupon_code IS NULL THEN
    RETURN true;
  END IF;

  -- Check coupon is valid
  IF NOT EXISTS (
    SELECT 1 FROM public.coupons c
    WHERE c.code = p_coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
      AND c.min_order_amount <= p_subtotal
  ) THEN
    RETURN false;
  END IF;

  -- Block per-user reuse: same user cannot use the same coupon twice
  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE user_id = auth.uid()
      AND coupon_code = p_coupon_code
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;
