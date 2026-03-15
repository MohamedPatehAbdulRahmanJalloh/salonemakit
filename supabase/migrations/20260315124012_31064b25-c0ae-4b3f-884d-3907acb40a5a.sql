
-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read product images
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Auth upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
CREATE POLICY "Auth delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- Add stock_quantity column to products for inventory tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;
