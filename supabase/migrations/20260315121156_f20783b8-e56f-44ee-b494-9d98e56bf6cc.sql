
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS original_price integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS badge text DEFAULT NULL;

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images viewable by everyone" ON public.product_images
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage product images" ON public.product_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
