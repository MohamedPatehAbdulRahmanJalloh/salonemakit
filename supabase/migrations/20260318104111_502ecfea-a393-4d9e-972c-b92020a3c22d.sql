-- Rebuild core order/coupon security validation to resolve scanner findings

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
  IF p_subtotal < 0 THEN RETURN false; END IF;
  IF p_delivery_fee <> 30 THEN RETURN false; END IF;
  IF p_total <> (p_subtotal + p_delivery_fee) THEN RETURN false; END IF;
  IF p_payment_method NOT IN ('cod', 'orange_money') THEN RETURN false; END IF;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_coupon_for_order(
  p_coupon_code text,
  p_subtotal integer
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  normalized_code text;
  coupon_rec RECORD;
BEGIN
  IF p_coupon_code IS NULL OR btrim(p_coupon_code) = '' THEN
    RETURN true;
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  normalized_code := upper(btrim(p_coupon_code));

  SELECT c.*
  INTO coupon_rec
  FROM public.coupons c
  WHERE c.code = normalized_code
    AND c.is_active = true
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
  LIMIT 1;

  IF coupon_rec IS NULL THEN
    RETURN false;
  END IF;

  IF p_subtotal IS NULL OR p_subtotal < coupon_rec.min_order_amount THEN
    RETURN false;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.user_id = auth.uid()
      AND upper(coalesce(o.coupon_code, '')) = normalized_code
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid;
  computed_subtotal integer;
  order_rec RECORD;
  coupon_rec RECORD;
  max_discount integer := 0;
  expected_subtotal integer;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'Order id is required for total validation';
  END IF;

  -- Lock parent order row while we recompute authoritative totals
  SELECT * INTO order_rec
  FROM public.orders
  WHERE id = v_order_id
  FOR UPDATE;

  IF order_rec IS NULL THEN
    RAISE EXCEPTION 'Order % not found', v_order_id;
  END IF;

  -- Compute subtotal from authoritative order_items rows
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = v_order_id;

  expected_subtotal := computed_subtotal;

  -- If a coupon exists, compute server-side discount cap and apply it only if minimum is met
  IF order_rec.coupon_code IS NOT NULL AND btrim(order_rec.coupon_code) <> '' THEN
    SELECT c.* INTO coupon_rec
    FROM public.coupons c
    WHERE c.code = upper(order_rec.coupon_code)
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
    LIMIT 1;

    IF coupon_rec IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', order_rec.coupon_code;
    END IF;

    IF coupon_rec.min_order_amount <= computed_subtotal THEN
      IF COALESCE(coupon_rec.discount_percent, 0) > 0 THEN
        max_discount := (computed_subtotal * coupon_rec.discount_percent) / 100;
      END IF;

      IF COALESCE(coupon_rec.discount_amount, 0) > max_discount THEN
        max_discount := coupon_rec.discount_amount;
      END IF;

      expected_subtotal := GREATEST(0, computed_subtotal - max_discount);
    END IF;
  END IF;

  -- Persist authoritative totals back to parent order
  UPDATE public.orders
  SET
    subtotal = expected_subtotal,
    total = expected_subtotal + order_rec.delivery_fee
  WHERE id = v_order_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_validate_order_totals_on_items_insert ON public.order_items;
DROP TRIGGER IF EXISTS trg_validate_order_totals_on_items_update ON public.order_items;

CREATE TRIGGER trg_validate_order_totals_on_items_insert
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_totals();

CREATE TRIGGER trg_validate_order_totals_on_items_update
AFTER UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_totals();