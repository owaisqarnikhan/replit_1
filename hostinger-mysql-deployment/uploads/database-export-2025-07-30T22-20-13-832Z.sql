-- Database Export Generated on 2025-07-30T22:20:13.832Z
-- InnovanceOrbit E-commerce Platform Database Backup
-- Version: 1.0.0

-- Categories
DELETE FROM categories;
INSERT INTO categories (id, name, description, image_url, created_at) VALUES ('7212ade1-95f5-44fc-9090-34c0bfe055bf', 'Books', 'Books', 'https://prh.imgix.net/articles/top10-fiction-1600x800.jpg', 'Wed Jul 30 2025 09:28:00 GMT+0000 (Coordinated Universal Time)');
INSERT INTO categories (id, name, description, image_url, created_at) VALUES ('6d007f14-0a77-46d2-add5-f3b7921ee995', 'Laptops', 'Laptops', 'https://cdn.uc.assets.prezly.com/cc1e3f98-2fc8-4410-8dde-76f813c9691c/-/format/auto/Swift-Go-16-02.jpg', 'Wed Jul 30 2025 09:32:09 GMT+0000 (Coordinated Universal Time)');

-- Products
DELETE FROM products;
INSERT INTO products (id, name, description, price, category_id, image_url, is_featured, stock_quantity, created_at) VALUES ('90d2625a-61a1-427a-8750-12e45a24a898', 'Mac Book', 'Mac Book Pro 2016Mac Book Pro 2016
Mac Book Pro 2016

Mac Book Pro 2016Mac Book Pro 2016

Mac Book Pro 2016', '350.00', '6d007f14-0a77-46d2-add5-f3b7921ee995', 'https://cdn.uc.assets.prezly.com/cc1e3f98-2fc8-4410-8dde-76f813c9691c/-/format/auto/Swift-Go-16-02.jpg', true, 0, 'Wed Jul 30 2025 09:35:51 GMT+0000 (Coordinated Universal Time)');

-- Site Settings
UPDATE site_settings SET site_name = '', header_text = '', footer_description = '', contact_email = '', contact_phone = '', contact_address = '', logo_url = '/uploads/image-1753867586957-11317989.png' WHERE id = 'default';

-- Export completed successfully
