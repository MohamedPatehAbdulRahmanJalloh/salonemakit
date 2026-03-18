-- Fix 1: Add min_order_amount check to coupon validation
CREATE OR REPLACE FUNCTION public.validate_coupon_for_order(p_coupon_code text, p_subtotal integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_coupon_code IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.coupons c
    WHERE c.code = p_coupon_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
      AND c.min_order_amount <= p_subtotal
  );
END;
$$;

-- Fix 2: Update validate_order_totals trigger to also verify subtotal matches item prices
CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS trigger
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
  expected_subtotal integer;
BEGIN
  -- Compute sum of item prices
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  SELECT subtotal, total, delivery_fee, coupon_code
  INTO order_subtotal, order_total, order_delivery_fee, order_coupon_code
  FROM public.orders
  WHERE id = NEW.order_id;

  -- No coupon: subtotal must exactly match computed total
  IF order_coupon_code IS NULL THEN
    IF order_subtotal <> computed_subtotal THEN
      RAISE EXCEPTION 'Subtotal % does not match item total %', order_subtotal, computed_subtotal;
    END IF;
    -- Verify total = subtotal + delivery_fee
    IF order_total <> (order_subtotal + order_delivery_fee) THEN
      RAISE EXCEPTION 'Total % does not match subtotal % + delivery %', order_total, order_subtotal, order_delivery_fee;
    END IF;
    RETURN NEW;
  END IF;

  -- With coupon: subtotal must be <= computed total
  IF order_subtotal > computed_subtotal THEN
    RAISE EXCEPTION 'Order subtotal % exceeds item total %', order_subtotal, computed_subtotal;
  END IF;

  IF order_subtotal < 0 THEN
    RAISE EXCEPTION 'Order subtotal cannot be negative';
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

  -- Verify total = subtotal + delivery_fee
  IF order_total <> (order_subtotal + order_delivery_fee) THEN
    RAISE EXCEPTION 'Total % does not match subtotal % + delivery %', order_total, order_subtotal, order_delivery_fee;
  END IF;

  RETURN NEW;
END;
$$;