
-- Update validate_order_totals to verify coupon discount server-side
CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_subtotal integer;
  order_subtotal integer;
  order_total integer;
  order_delivery_fee integer;
  order_coupon_code text;
  coupon_discount_percent integer;
  coupon_discount_amount integer;
  max_discount integer;
BEGIN
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  SELECT subtotal, total, delivery_fee, coupon_code
  INTO order_subtotal, order_total, order_delivery_fee, order_coupon_code
  FROM public.orders
  WHERE id = NEW.order_id;

  -- If subtotal equals computed total, no coupon discount — always valid
  IF order_subtotal = computed_subtotal THEN
    RETURN NEW;
  END IF;

  -- If subtotal < computed, a coupon must be applied
  IF order_subtotal < computed_subtotal THEN
    IF order_coupon_code IS NULL THEN
      RAISE EXCEPTION 'Subtotal % is less than item total % but no coupon applied', order_subtotal, computed_subtotal;
    END IF;

    -- Validate the coupon exists and is active
    SELECT c.discount_percent, c.discount_amount
    INTO coupon_discount_percent, coupon_discount_amount
    FROM public.coupons c
    WHERE c.code = order_coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count <= c.max_uses);

    IF coupon_discount_percent IS NULL AND coupon_discount_amount IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', order_coupon_code;
    END IF;

    -- Calculate maximum allowed discount
    max_discount := 0;
    IF coupon_discount_percent > 0 THEN
      max_discount := (computed_subtotal * coupon_discount_percent) / 100;
    END IF;
    IF coupon_discount_amount > 0 AND coupon_discount_amount > max_discount THEN
      max_discount := coupon_discount_amount;
    END IF;

    -- Verify actual discount doesn't exceed allowed
    IF (computed_subtotal - order_subtotal) > max_discount THEN
      RAISE EXCEPTION 'Discount % exceeds max allowed %', (computed_subtotal - order_subtotal), max_discount;
    END IF;
  END IF;

  IF order_subtotal > computed_subtotal THEN
    RAISE EXCEPTION 'Order subtotal % exceeds item total %', order_subtotal, computed_subtotal;
  END IF;

  IF order_subtotal < 0 THEN
    RAISE EXCEPTION 'Order subtotal cannot be negative';
  END IF;

  RETURN NEW;
END;
$$;
