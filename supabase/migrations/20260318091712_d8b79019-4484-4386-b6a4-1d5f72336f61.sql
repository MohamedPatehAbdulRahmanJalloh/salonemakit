-- Validate order totals match items when order leaves pending status
CREATE OR REPLACE FUNCTION public.validate_order_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_subtotal integer;
  max_discount integer;
  coupon_discount_percent integer;
  coupon_discount_amount integer;
BEGIN
  -- Only validate when status changes from pending
  IF OLD.status = 'pending' AND NEW.status <> 'pending' THEN
    SELECT COALESCE(SUM(product_price * quantity), 0)
    INTO computed_subtotal
    FROM public.order_items WHERE order_id = NEW.id;

    IF NEW.coupon_code IS NULL THEN
      IF NEW.subtotal <> computed_subtotal THEN
        RAISE EXCEPTION 'Subtotal % does not match items %', NEW.subtotal, computed_subtotal;
      END IF;
    ELSE
      SELECT c.discount_percent, c.discount_amount
      INTO coupon_discount_percent, coupon_discount_amount
      FROM public.coupons c WHERE c.code = NEW.coupon_code;

      max_discount := 0;
      IF COALESCE(coupon_discount_percent, 0) > 0 THEN
        max_discount := (computed_subtotal * coupon_discount_percent) / 100;
      END IF;
      IF COALESCE(coupon_discount_amount, 0) > max_discount THEN
        max_discount := coupon_discount_amount;
      END IF;

      IF (computed_subtotal - NEW.subtotal) > max_discount THEN
        RAISE EXCEPTION 'Discount exceeds allowed amount';
      END IF;
    END IF;

    IF NEW.total <> (NEW.subtotal + NEW.delivery_fee) THEN
      RAISE EXCEPTION 'Total mismatch';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_order_status_change
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_on_status_change();