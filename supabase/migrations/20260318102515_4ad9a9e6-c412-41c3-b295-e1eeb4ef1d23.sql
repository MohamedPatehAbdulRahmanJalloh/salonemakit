CREATE OR REPLACE FUNCTION public.validate_order_insert_values(
  p_status text,
  p_subtotal integer,
  p_delivery_fee integer,
  p_total integer,
  p_payment_method text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_status IS DISTINCT FROM 'pending' THEN RETURN false; END IF;
  IF p_subtotal IS NULL OR p_delivery_fee IS NULL OR p_total IS NULL THEN RETURN false; END IF;
  IF p_delivery_fee <> 30 THEN RETURN false; END IF;
  IF p_subtotal <> 0 THEN RETURN false; END IF;
  IF p_total <> p_delivery_fee THEN RETURN false; END IF;
  IF p_payment_method NOT IN ('cod', 'orange_money') THEN RETURN false; END IF;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_coupon_for_order(p_coupon_code text, p_subtotal integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_coupon_code IS NULL THEN
    RETURN true;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.coupons c
    WHERE c.code = p_coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
  ) THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.orders
    WHERE user_id = auth.uid()
      AND coupon_code = p_coupon_code
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO authenticated;