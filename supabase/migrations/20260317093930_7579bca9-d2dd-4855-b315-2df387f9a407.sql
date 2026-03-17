-- Validate order inserts to prevent manipulated status and totals
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
SET search_path = public
AS $$
BEGIN
  IF p_status IS DISTINCT FROM 'pending' THEN
    RETURN false;
  END IF;

  IF p_subtotal IS NULL OR p_delivery_fee IS NULL OR p_total IS NULL THEN
    RETURN false;
  END IF;

  IF p_subtotal < 0 OR p_delivery_fee < 0 THEN
    RETURN false;
  END IF;

  IF p_total <> (p_subtotal + p_delivery_fee) THEN
    RETURN false;
  END IF;

  IF p_payment_method NOT IN ('cod', 'orange_money') THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_order_insert_values(text, integer, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_order_insert_values(text, integer, integer, integer, text) TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.validate_order_insert_values(status, subtotal, delivery_fee, total, payment_method)
);

DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;
CREATE POLICY "Authenticated users can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
      AND orders.status = 'pending'
  )
);