
-- Add coupon_code column to orders table
ALTER TABLE public.orders ADD COLUMN coupon_code text DEFAULT NULL;

-- Create trigger to increment coupon used_count when order is placed with a coupon
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = NEW.coupon_code AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_coupon_usage ON public.orders;
CREATE TRIGGER trg_increment_coupon_usage
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_coupon_usage();
