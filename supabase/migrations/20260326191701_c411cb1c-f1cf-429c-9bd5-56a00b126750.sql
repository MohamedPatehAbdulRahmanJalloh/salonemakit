
-- Remove the old direct INSERT policies on orders and order_items
-- since all order creation now goes through create_order_secure (SECURITY DEFINER)

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;

-- The SECURITY DEFINER function runs as the function owner (bypasses RLS),
-- so no INSERT policy is needed for normal order creation.
-- This closes the subtotal manipulation attack vector entirely.
