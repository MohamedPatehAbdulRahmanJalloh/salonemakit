
-- Replace validate_order_totals to also re-validate coupon eligibility using computed subtotal
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
  actual_discount integer;
BEGIN
  -- Compute actual sum of item prices for this order
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  SELECT * INTO order_rec
  FROM public.orders
  WHERE id = NEW.order_id;

  IF order_rec.coupon_code IS NULL THEN
    -- No coupon: subtotal must exactly match computed total
    IF order_rec.subtotal <> computed_subtotal THEN
      RAISE EXCEPTION 'Subtotal % does not match item total %', order_rec.subtotal, computed_subtotal;
    END IF;
  ELSE
    -- With coupon: validate coupon eligibility using COMPUTED subtotal (not user-supplied)
    SELECT * INTO coupon_rec
    FROM public.coupons c
    WHERE c.code = order_rec.coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now());

    IF coupon_rec IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', order_rec.coupon_code;
    END IF;

    -- Check min_order_amount against COMPUTED subtotal
    IF coupon_rec.min_order_amount > computed_subtotal THEN
      RAISE EXCEPTION 'Order total % does not meet coupon minimum %', computed_subtotal, coupon_rec.min_order_amount;
    END IF;

    -- Order subtotal cannot exceed computed (no inflation)
    IF order_rec.subtotal > computed_subtotal THEN
      RAISE EXCEPTION 'Order subtotal % exceeds item total %', order_rec.subtotal, computed_subtotal;
    END IF;

    IF order_rec.subtotal < 0 THEN
      RAISE EXCEPTION 'Order subtotal cannot be negative';
    END IF;

    -- Calculate maximum allowed discount
    max_discount := 0;
    IF COALESCE(coupon_rec.discount_percent, 0) > 0 THEN
      max_discount := (computed_subtotal * coupon_rec.discount_percent) / 100;
    END IF;
    IF COALESCE(coupon_rec.discount_amount, 0) > max_discount THEN
      max_discount := coupon_rec.discount_amount;
    END IF;

    actual_discount := computed_subtotal - order_rec.subtotal;
    IF actual_discount > max_discount THEN
      RAISE EXCEPTION 'Discount % exceeds max allowed %', actual_discount, max_discount;
    END IF;
  END IF;

  -- Verify total = subtotal + delivery_fee
  IF order_rec.total <> (order_rec.subtotal + order_rec.delivery_fee) THEN
    RAISE EXCEPTION 'Total % does not match subtotal % + delivery %', order_rec.total, order_rec.subtotal, order_rec.delivery_fee;
  END IF;

  RETURN NEW;
END;
$function$;
