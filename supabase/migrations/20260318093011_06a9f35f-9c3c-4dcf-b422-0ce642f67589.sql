
-- ============================================================
-- 1. ATTACH ALL MISSING TRIGGERS
-- ============================================================

-- Trigger: validate order item prices on insert
DROP TRIGGER IF EXISTS trg_validate_order_item_price ON public.order_items;
CREATE TRIGGER trg_validate_order_item_price
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_item_price();

-- Trigger: validate order totals after order_items insert
DROP TRIGGER IF EXISTS trg_validate_order_totals ON public.order_items;
CREATE TRIGGER trg_validate_order_totals
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_totals();

-- Trigger: validate order on status change
DROP TRIGGER IF EXISTS trg_validate_order_status_change ON public.orders;
CREATE TRIGGER trg_validate_order_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_on_status_change();

-- Trigger: cleanup old login attempts
DROP TRIGGER IF EXISTS trg_cleanup_login_attempts ON public.login_attempts;
CREATE TRIGGER trg_cleanup_login_attempts
  AFTER INSERT ON public.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_login_attempts();

-- Trigger: update updated_at on products
DROP TRIGGER IF EXISTS trg_update_products_updated_at ON public.products;
CREATE TRIGGER trg_update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. ATOMIC COUPON USAGE INCREMENT (with row lock)
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  coupon_row RECORD;
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    -- Lock the coupon row to prevent race conditions
    SELECT * INTO coupon_row
    FROM public.coupons
    WHERE code = NEW.coupon_code
    FOR UPDATE;

    IF coupon_row IS NULL OR NOT coupon_row.is_active THEN
      RAISE EXCEPTION 'Coupon % is invalid or inactive', NEW.coupon_code;
    END IF;

    IF coupon_row.expires_at IS NOT NULL AND coupon_row.expires_at <= now() THEN
      RAISE EXCEPTION 'Coupon % has expired', NEW.coupon_code;
    END IF;

    IF coupon_row.max_uses IS NOT NULL AND coupon_row.used_count >= coupon_row.max_uses THEN
      RAISE EXCEPTION 'Coupon % has reached maximum uses', NEW.coupon_code;
    END IF;

    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$function$;

-- Attach coupon increment trigger
DROP TRIGGER IF EXISTS trg_increment_coupon_usage ON public.orders;
CREATE TRIGGER trg_increment_coupon_usage
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_coupon_usage();
