
CREATE OR REPLACE FUNCTION public.validate_order_insert_values(p_status text, p_subtotal integer, p_delivery_fee integer, p_total integer, p_payment_method text)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF p_status IS DISTINCT FROM 'pending' THEN RETURN false; END IF;
  IF p_subtotal IS NULL OR p_delivery_fee IS NULL OR p_total IS NULL THEN RETURN false; END IF;
  IF p_subtotal <= 0 THEN RETURN false; END IF;
  IF p_delivery_fee <> 30 THEN RETURN false; END IF;
  IF p_total <> (p_subtotal + p_delivery_fee) THEN RETURN false; END IF;
  IF p_payment_method NOT IN ('cod', 'orange_money') THEN RETURN false; END IF;
  RETURN true;
END;
$function$;

ALTER TABLE public.orders ALTER COLUMN delivery_fee SET DEFAULT 30;
