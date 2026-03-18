-- Create a security definer function to validate order item price at RLS level
CREATE OR REPLACE FUNCTION public.validate_order_item_price_rls(p_product_id uuid, p_product_price integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products
    WHERE id = p_product_id AND price = p_product_price
  );
$$;

-- Drop existing INSERT policy on order_items
DROP POLICY IF EXISTS "Authenticated users can create order items" ON public.order_items;

-- Re-create with price validation
CREATE POLICY "Authenticated users can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
      AND orders.status = 'pending'
  )
  AND public.validate_order_item_price_rls(product_id, product_price)
);