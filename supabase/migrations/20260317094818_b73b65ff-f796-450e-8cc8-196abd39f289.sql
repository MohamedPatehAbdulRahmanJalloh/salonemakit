-- Trigger to validate order_items price matches products table
CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price integer;
  actual_name text;
BEGIN
  SELECT price, name INTO actual_price, actual_name
  FROM public.products
  WHERE id = NEW.product_id;

  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF NEW.product_price <> actual_price THEN
    RAISE EXCEPTION 'Price mismatch: expected %, got %', actual_price, NEW.product_price;
  END IF;

  IF NEW.product_name <> actual_name THEN
    NEW.product_name := actual_name;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_item_price ON public.order_items;
CREATE TRIGGER trg_validate_order_item_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_item_price();

-- Trigger to validate order subtotal matches sum of items after all items inserted
-- We validate on the order_items side: after insert, check the order totals
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
BEGIN
  SELECT COALESCE(SUM(product_price * quantity), 0)
  INTO computed_subtotal
  FROM public.order_items
  WHERE order_id = NEW.order_id;

  SELECT subtotal, total, delivery_fee
  INTO order_subtotal, order_total, order_delivery_fee
  FROM public.orders
  WHERE id = NEW.order_id;

  -- Allow subtotal <= computed (coupon discounts reduce subtotal)
  -- But subtotal must not exceed actual item total
  IF order_subtotal > computed_subtotal THEN
    RAISE EXCEPTION 'Order subtotal % exceeds item total %', order_subtotal, computed_subtotal;
  END IF;

  IF order_subtotal < 0 THEN
    RAISE EXCEPTION 'Order subtotal cannot be negative';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_totals ON public.order_items;
CREATE TRIGGER trg_validate_order_totals
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_totals();