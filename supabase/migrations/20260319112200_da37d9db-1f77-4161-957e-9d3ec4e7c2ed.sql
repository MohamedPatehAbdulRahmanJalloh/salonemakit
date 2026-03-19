
-- Add independent AED pricing column
ALTER TABLE public.products ADD COLUMN price_aed integer NULL;

-- Update order validation to accept both SL (30) and UAE (65000) delivery fees
CREATE OR REPLACE FUNCTION public.validate_order_insert_values(p_status text, p_subtotal integer, p_delivery_fee integer, p_total integer, p_payment_method text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_status IS DISTINCT FROM 'pending' THEN RETURN false; END IF;
  IF p_subtotal IS NULL OR p_delivery_fee IS NULL OR p_total IS NULL THEN RETURN false; END IF;
  IF p_subtotal < 0 THEN RETURN false; END IF;
  -- Accept SL delivery fee (30) or UAE delivery fee (65000)
  IF p_delivery_fee NOT IN (30, 65000) THEN RETURN false; END IF;
  IF p_total <> (p_subtotal + p_delivery_fee) THEN RETURN false; END IF;
  IF p_payment_method NOT IN ('cod', 'orange_money') THEN RETURN false; END IF;
  RETURN true;
END;
$function$;
