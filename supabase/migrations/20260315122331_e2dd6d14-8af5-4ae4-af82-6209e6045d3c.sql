
INSERT INTO public.products (name, category, price, original_price, image, badge, description, in_stock, sizes) VALUES
-- Men
('Traditional Agbada Gown', 'men', 450000, 550000, 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=500&h=600&fit=crop', 'HOT', 'Luxurious embroidered agbada gown perfect for ceremonies and special occasions', true, ARRAY['M', 'L', 'XL', 'XXL']),
('Dashiki Print Shirt', 'men', 120000, 150000, 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&h=600&fit=crop', 'NEW', 'Vibrant African dashiki print casual shirt', true, ARRAY['S', 'M', 'L', 'XL']),
('Country Cloth Kaftan', 'men', 280000, NULL, 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=500&h=600&fit=crop', NULL, 'Authentic Sierra Leone country cloth kaftan', true, ARRAY['M', 'L', 'XL']),
('African Print Trouser Set', 'men', 195000, 250000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop', '-22%', 'Matching African print shirt and trouser set', true, ARRAY['S', 'M', 'L', 'XL']),

-- Women
('Ankara Maxi Dress', 'women', 180000, 220000, 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=500&h=600&fit=crop', 'HOT', 'Stunning ankara print floor-length maxi dress', true, ARRAY['S', 'M', 'L', 'XL']),
('Krio Lappa Set', 'women', 350000, NULL, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=600&fit=crop', 'NEW', 'Traditional Krio lappa wrapper with matching top and headtie', true, ARRAY['M', 'L', 'XL']),
('African Print Jumpsuit', 'women', 165000, 200000, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop', NULL, 'Modern African print jumpsuit for casual and semi-formal wear', true, ARRAY['S', 'M', 'L']),
('Headwrap Gele Collection', 'women', 45000, 60000, 'https://images.unsplash.com/photo-1583316174775-bd6dc0e9f298?w=500&h=600&fit=crop', '-25%', 'Premium quality headwrap gele in assorted colors', true, NULL),

-- Shoes
('African Print Sneakers', 'shoes', 135000, 180000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop', 'HOT', 'Unique African print canvas sneakers', true, ARRAY['40', '41', '42', '43', '44', '45']),
('Leather Sandals', 'shoes', 85000, NULL, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&h=600&fit=crop', NULL, 'Handcrafted leather sandals with beaded detail', true, ARRAY['39', '40', '41', '42', '43']),
('Formal Oxford Shoes', 'shoes', 220000, 280000, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&h=600&fit=crop', 'NEW', 'Premium leather oxford shoes for formal occasions', true, ARRAY['40', '41', '42', '43', '44']),
('Ankara Slip-On Flats', 'shoes', 65000, 80000, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=600&fit=crop', NULL, 'Comfortable ankara print slip-on flats for women', true, ARRAY['36', '37', '38', '39', '40']),

-- Bags
('African Print Tote Bag', 'bags', 95000, 120000, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop', 'HOT', 'Spacious tote bag with vibrant African print design', true, NULL),
('Leather Crossbody Bag', 'bags', 145000, NULL, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=600&fit=crop', 'NEW', 'Genuine leather crossbody bag with adjustable strap', true, NULL),
('Beaded Clutch Purse', 'bags', 75000, 95000, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&h=600&fit=crop', NULL, 'Hand-beaded evening clutch purse', true, NULL),
('Woven Basket Bag', 'bags', 55000, 70000, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=600&fit=crop', '-21%', 'Handwoven basket bag perfect for casual outings', true, NULL),

-- Perfumes & Beauty
('Shea Butter Body Cream', 'perfumes', 35000, 45000, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=600&fit=crop', 'HOT', 'Pure organic shea butter body cream from Sierra Leone', true, NULL),
('African Black Soap Set', 'perfumes', 25000, NULL, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=600&fit=crop', 'NEW', 'Traditional African black soap gift set', true, NULL),
('Oud Perfume Oil', 'perfumes', 85000, 110000, 'https://images.unsplash.com/photo-1541643600914-78b084753601?w=500&h=600&fit=crop', NULL, 'Premium Arabian oud perfume oil long-lasting fragrance', true, NULL),
('Coconut Hair Oil', 'perfumes', 18000, 25000, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&h=600&fit=crop', '-28%', 'Natural coconut hair oil for growth and shine', true, NULL),

-- Accessories
('Gold Plated Necklace Set', 'accessories', 125000, 160000, 'https://images.unsplash.com/photo-1515562141589-67f0d569b3e2?w=500&h=600&fit=crop', 'HOT', 'Elegant gold plated necklace and earring set', true, NULL),
('African Beaded Bracelet', 'accessories', 28000, NULL, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=600&fit=crop', 'NEW', 'Handmade colorful African beaded bracelet', true, NULL),
('Waist Beads Set', 'accessories', 15000, 20000, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=600&fit=crop', NULL, 'Traditional African waist beads in assorted colors', true, NULL),
('Sunglasses Collection', 'accessories', 45000, 65000, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=600&fit=crop', '-31%', 'Trendy UV protection sunglasses', true, NULL);
