
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
  max_discount integer;
  expected_subtotal integer;
BEGIN
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  SELECT * INTO order_rec
  FROM public.orders
  WHERE id = NEW.order_id;

  IF order_rec.coupon_code IS NULL THEN
    expected_subtotal := computed_subtotal;
  ELSE
    SELECT * INTO coupon_rec
    FROM public.coupons c
    WHERE c.code = order_rec.coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now());

    IF coupon_rec IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', order_rec.coupon_code;
    END IF;

    IF coupon_rec.min_order_amount > computed_subtotal THEN
      RAISE EXCEPTION 'Order does not meet coupon minimum of %', coupon_rec.min_order_amount;
    END IF;

    max_discount := 0;
    IF COALESCE(coupon_rec.discount_percent, 0) > 0 THEN
      max_discount := (computed_subtotal * coupon_rec.discount_percent) / 100;
    END IF;
    IF COALESCE(coupon_rec.discount_amount, 0) > max_discount THEN
      max_discount := coupon_rec.discount_amount;
    END IF;

    expected_subtotal := GREATEST(0, computed_subtotal - max_discount);
  END IF;

  -- REJECT if subtotal doesn't match expected
  IF order_rec.subtotal <> expected_subtotal THEN
    RAISE EXCEPTION 'Subtotal mismatch: expected %, got %', expected_subtotal, order_rec.subtotal;
  END IF;

  -- REJECT if total doesn't match
  IF order_rec.total <> (expected_subtotal + order_rec.delivery_fee) THEN
    RAISE EXCEPTION 'Total mismatch: expected %, got %', (expected_subtotal + order_rec.delivery_fee), order_rec.total;
  END IF;

  RETURN NEW;
END;
$function$;
