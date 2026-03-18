CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  computed_subtotal integer;
  order_rec RECORD;
  coupon_rec RECORD;
  max_discount integer := 0;
  expected_subtotal integer;
BEGIN
  -- Lock parent order row while we recompute authoritative totals
  SELECT * INTO order_rec
  FROM public.orders
  WHERE id = NEW.order_id
  FOR UPDATE;

  IF order_rec IS NULL THEN
    RAISE EXCEPTION 'Order % not found', NEW.order_id;
  END IF;

  -- Compute subtotal from authoritative order_items rows
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  expected_subtotal := computed_subtotal;

  -- If a coupon exists, compute server-side discount cap and apply it
  IF order_rec.coupon_code IS NOT NULL THEN
    SELECT * INTO coupon_rec
    FROM public.coupons c
    WHERE c.code = order_rec.coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses);

    IF coupon_rec IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', order_rec.coupon_code;
    END IF;

    -- Apply coupon only when minimum order amount is met using computed subtotal
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
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$function$;