
CREATE TABLE public.product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text NOT NULL DEFAULT '#000000',
  color_image text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product colors viewable by everyone" ON public.product_colors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage product colors" ON public.product_colors FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Staff can manage product colors" ON public.product_colors FOR ALL TO authenticated USING (has_role(auth.uid(), 'staff'::app_role)) WITH CHECK (has_role(auth.uid(), 'staff'::app_role));
