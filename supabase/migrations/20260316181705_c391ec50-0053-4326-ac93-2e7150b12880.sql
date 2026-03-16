
-- 1. Fix order_items: drop overly permissive policies, add proper ones
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items are viewable" ON public.order_items;

-- Only authenticated users can insert order items
CREATE POLICY "Authenticated users can create order items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Users can view their own order items, admins can view all
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Add user_roles RLS policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add push_tokens UPDATE policy
CREATE POLICY "Users can update own push tokens"
ON public.push_tokens FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
