
-- Add demo product images (extra images for some products)
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop', 1
FROM public.products p WHERE p.name = 'Traditional Agbada Gown' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&h=600&fit=crop', 2
FROM public.products p WHERE p.name = 'Traditional Agbada Gown' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=500&h=600&fit=crop', 3
FROM public.products p WHERE p.name = 'Traditional Agbada Gown' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=600&fit=crop', 1
FROM public.products p WHERE p.name = 'Ankara Maxi Dress' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?w=500&h=600&fit=crop', 2
FROM public.products p WHERE p.name = 'Ankara Maxi Dress' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&h=600&fit=crop', 1
FROM public.products p WHERE p.name = 'African Print Sneakers' LIMIT 1;

INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=600&fit=crop', 2
FROM public.products p WHERE p.name = 'African Print Sneakers' LIMIT 1;
