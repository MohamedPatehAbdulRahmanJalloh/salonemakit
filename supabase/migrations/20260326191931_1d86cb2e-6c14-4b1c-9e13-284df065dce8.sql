
-- Fix 1: Remove the coupon increment trigger since create_order_secure already increments.
-- This prevents double-counting coupon usage.
DROP TRIGGER IF EXISTS trg_increment_coupon_usage ON public.orders;

-- Fix 2: Remove validate_order_totals triggers on order_items.
-- The create_order_secure RPC inserts items before the order row exists,
-- so these triggers would fail trying to SELECT the parent order.
-- The RPC already computes authoritative totals server-side.
DROP TRIGGER IF EXISTS trg_validate_order_totals ON public.order_items;
DROP TRIGGER IF EXISTS trg_validate_order_totals_on_items_insert ON public.order_items;
DROP TRIGGER IF EXISTS trg_validate_order_totals_on_items_update ON public.order_items;

-- Fix 3: Remove validate_order_item_price trigger on order_items.
-- The create_order_secure RPC already looks up prices from products table
-- and sets them correctly. The trigger would be redundant.
DROP TRIGGER IF EXISTS trg_validate_order_item_price ON public.order_items;

-- Fix 4: Also remove the duplicate update_products_updated_at trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
