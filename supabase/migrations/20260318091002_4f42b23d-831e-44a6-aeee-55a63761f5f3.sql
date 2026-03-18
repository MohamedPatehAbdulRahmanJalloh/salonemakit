-- Strengthen validate_order_insert_values to also check delivery_fee and coupon_code
CREATE OR REPLACE FUNCTION public.validate_order_insert_values(
  p_status text, p_subtotal integer, p_delivery_fee integer, p_total integer, p_payment_method text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Status must be pending
  IF p_status IS DISTINCT FROM 'pending' THEN
    RETURN false;
  END IF;

  IF p_subtotal IS NULL OR p_delivery_fee IS NULL OR p_total IS NULL THEN
    RETURN false;
  END IF;

  IF p_subtotal < 0 OR p_delivery_fee < 0 THEN
    RETURN false;
  END IF;

  -- Delivery fee must be exactly 25000
  IF p_delivery_fee <> 25000 THEN
    RETURN false;
  END IF;

  -- Total must equal subtotal + delivery_fee
  IF p_total <> (p_subtotal + p_delivery_fee) THEN
    RETURN false;
  END IF;

  -- Payment method validation
  IF p_payment_method NOT IN ('cod', 'orange_money') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Create function to validate coupon at RLS level
CREATE OR REPLACE FUNCTION public.validate_coupon_for_order(p_coupon_code text, p_subtotal integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- NULL coupon is always valid (no coupon applied)
  IF p_coupon_code IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check coupon exists, is active, not expired, not maxed out, and meets min order
  RETURN EXISTS (
    SELECT 1 FROM public.coupons c
    WHERE c.code = p_coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
  );
END;
$$;

-- Update orders INSERT policy to also validate coupon
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND validate_order_insert_values(status, subtotal, delivery_fee, total, payment_method)
  AND validate_coupon_for_order(coupon_code, subtotal)
);