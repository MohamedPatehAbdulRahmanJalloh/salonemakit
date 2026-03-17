-- Allow staff to view all orders
CREATE POLICY "Staff can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- Allow staff to update orders (change status)
CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- Allow staff to insert products
CREATE POLICY "Staff can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- Allow staff to update products
CREATE POLICY "Staff can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- Staff can view all order items
CREATE POLICY "Staff can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'staff'));

-- Staff can manage product images
CREATE POLICY "Staff can manage product images"
ON public.product_images FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'staff'));