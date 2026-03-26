-- 1. Attach stock decrement trigger to order_items
CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock_on_order();

-- 2. Allow users to cancel their own pending orders
CREATE POLICY "Users can cancel own pending orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- 3. Update create_order_secure to support region-aware pricing (price_aed)
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_name text,
  p_phone text,
  p_district text,
  p_address text,
  p_payment_method text,
  p_delivery_fee integer,
  p_coupon_code text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_region text DEFAULT 'sl'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid := gen_random_uuid();
  v_user_id uuid;
  v_computed_subtotal integer := 0;
  v_item jsonb;
  v_product record;
  v_item_price integer;
  v_max_discount integer := 0;
  v_coupon_rec RECORD;
  v_normalized_code text;
  v_final_subtotal integer;
  v_total integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_payment_method NOT IN ('cod', 'orange_money') THEN
    RAISE EXCEPTION 'Invalid payment method: %', p_payment_method;
  END IF;

  IF p_delivery_fee NOT IN (30, 65000) THEN
    RAISE EXCEPTION 'Invalid delivery fee: %', p_delivery_fee;
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must have at least one item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    IF v_product IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;

    IF p_region = 'dubai' AND v_product.price_aed IS NOT NULL AND v_product.price_aed > 0 THEN
      v_item_price := v_product.price_aed;
    ELSE
      v_item_price := v_product.price;
    END IF;

    v_computed_subtotal := v_computed_subtotal + (v_item_price * COALESCE((v_item->>'quantity')::integer, 1));
  END LOOP;

  v_final_subtotal := v_computed_subtotal;

  IF p_coupon_code IS NOT NULL AND btrim(p_coupon_code) <> '' THEN
    v_normalized_code := upper(btrim(p_coupon_code));

    SELECT c.* INTO v_coupon_rec
    FROM public.coupons c
    WHERE c.code = v_normalized_code
      AND c.is_active = true
      AND (c.expires_at IS NULL OR c.expires_at > now())
      AND (c.max_uses IS NULL OR c.used_count < c.max_uses);

    IF v_coupon_rec IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired coupon: %', p_coupon_code;
    END IF;

    IF v_computed_subtotal < v_coupon_rec.min_order_amount THEN
      RAISE EXCEPTION 'Order does not meet minimum amount for coupon';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.user_id = v_user_id
        AND upper(coalesce(o.coupon_code, '')) = v_normalized_code
    ) THEN
      RAISE EXCEPTION 'Coupon already used';
    END IF;

    IF COALESCE(v_coupon_rec.discount_percent, 0) > 0 THEN
      v_max_discount := (v_computed_subtotal * v_coupon_rec.discount_percent) / 100;
    END IF;
    IF COALESCE(v_coupon_rec.discount_amount, 0) > v_max_discount THEN
      v_max_discount := v_coupon_rec.discount_amount;
    END IF;

    v_final_subtotal := GREATEST(0, v_computed_subtotal - v_max_discount);

    UPDATE public.coupons SET used_count = used_count + 1 WHERE code = v_normalized_code;
  END IF;

  v_total := v_final_subtotal + p_delivery_fee;

  INSERT INTO public.orders (id, customer_name, phone, district, address, payment_method, subtotal, delivery_fee, total, user_id, coupon_code, status)
  VALUES (v_order_id, p_customer_name, p_phone, p_district, p_address, p_payment_method, v_final_subtotal, p_delivery_fee, v_total, v_user_id, NULLIF(btrim(p_coupon_code), ''), 'pending');

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::uuid;

    IF p_region = 'dubai' AND v_product.price_aed IS NOT NULL AND v_product.price_aed > 0 THEN
      v_item_price := v_product.price_aed;
    ELSE
      v_item_price := v_product.price;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_price, quantity, selected_size)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_product.name,
      v_item_price,
      COALESCE((v_item->>'quantity')::integer, 1),
      NULLIF(v_item->>'selected_size', '')
    );
  END LOOP;

  RETURN v_order_id;
END;
$function$;
