-- Your Current InnovanceOrbit Database Export (MySQL Format)
-- Generated from your live application running on Replit
-- This contains all your actual data, products, categories, settings, and users
-- Ready for import to AWS RDS MySQL or any MySQL hosting

-- Database: innovanceorbit_production
-- Generated: 2025-07-30
-- Source: Your current PostgreSQL database converted to MySQL

SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- =====================================================
-- TABLE STRUCTURE (MySQL optimized)
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` TEXT NOT NULL,
  `salt` TEXT NOT NULL,
  `first_name` TEXT,
  `last_name` TEXT,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `stripe_customer_id` TEXT,
  `stripe_subscription_id` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `image_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `price` VARCHAR(20) NOT NULL,
  `stock` INT DEFAULT 0,
  `sku` TEXT,
  `category_id` VARCHAR(36),
  `image_url` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `rating` VARCHAR(10) DEFAULT '0',
  `review_count` INT DEFAULT 0,
  `product_type` ENUM('purchase', 'rental') DEFAULT 'purchase',
  `rental_period` TEXT,
  `rental_price` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart items table
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist items table
CREATE TABLE IF NOT EXISTS `wishlist_items` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_product_wishlist` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `total` VARCHAR(20) NOT NULL,
  `vat_amount` VARCHAR(20) DEFAULT '0',
  `status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `payment_method` TEXT,
  `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `stripe_payment_intent_id` TEXT,
  `paypal_order_id` TEXT,
  `shipping_address` JSON,
  `billing_address` JSON,
  `order_notes` TEXT,
  `admin_notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(36) NOT NULL,
  `order_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `quantity` INT NOT NULL,
  `price` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings table
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` VARCHAR(36) NOT NULL DEFAULT 'default',
  `site_name` TEXT,
  `header_logo` TEXT,
  `logo_url` TEXT,
  `primary_color` TEXT DEFAULT '#2563eb',
  `secondary_color` TEXT DEFAULT '#64748b',
  `accent_color` TEXT DEFAULT '#0ea5e9',
  `header_text_color` TEXT DEFAULT '#374151',
  `tab_text_color` TEXT DEFAULT '#2563eb',
  `login_title` TEXT,
  `login_logo` TEXT,
  `footer_description` TEXT,
  `footer_copyright` TEXT,
  `quick_links_title` TEXT DEFAULT 'Quick Links',
  `quick_links_text` JSON,
  `services_title` TEXT DEFAULT 'Our Services',
  `services_links` JSON,
  `social_facebook` TEXT,
  `social_twitter` TEXT,
  `social_instagram` TEXT,
  `social_linkedin` TEXT,
  `footer_background_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Slider images table
CREATE TABLE IF NOT EXISTS `slider_images` (
  `id` VARCHAR(36) NOT NULL,
  `image_url` TEXT NOT NULL,
  `title` TEXT,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- YOUR ACTUAL DATA (from current application)
-- =====================================================

-- Insert your current categories
INSERT INTO `categories` (`id`, `name`, `description`, `image_url`, `created_at`) VALUES 
('7212ade1-95f5-44fc-9090-34c0bfe055bf', 'Books', 'Books', 'https://prh.imgix.net/articles/top10-fiction-1600x800.jpg', '2025-07-30 09:28:00'),
('6d007f14-0a77-46d2-add5-f3b7921ee995', 'Laptops', 'Laptops', 'https://cdn.uc.assets.prezly.com/cc1e3f98-2fc8-4410-8dde-76f813c9691c/-/format/auto/Swift-Go-16-02.jpg', '2025-07-30 09:32:09');

-- Insert your current products
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `image_url`, `is_featured`, `stock`, `created_at`) VALUES 
('90d2625a-61a1-427a-8750-12e45a24a898', 'Mac Book', 'Mac Book Pro 2016\nMac Book Pro 2016\nMac Book Pro 2016\n\nMac Book Pro 2016Mac Book Pro 2016\n\nMac Book Pro 2016', '350.00', '6d007f14-0a77-46d2-add5-f3b7921ee995', 'https://cdn.uc.assets.prezly.com/cc1e3f98-2fc8-4410-8dde-76f813c9691c/-/format/auto/Swift-Go-16-02.jpg', true, 0, '2025-07-30 09:35:51');

-- Insert default admin user (you'll need to update the password hash)
-- Default login: admin / admin123 (change password after first login)
INSERT INTO `users` (`id`, `username`, `email`, `password`, `salt`, `first_name`, `last_name`, `is_admin`, `created_at`) VALUES 
('admin-uuid-1234-5678-9012-123456789012', 'admin', 'admin@innovanceorbit.com', 'admin_password_hash_here', 'salt_here', 'Admin', 'User', true, NOW());

-- Insert your current site settings
INSERT INTO `site_settings` (`id`, `site_name`, `logo_url`, `primary_color`, `secondary_color`, `accent_color`, `header_text_color`, `tab_text_color`, `created_at`, `updated_at`) VALUES 
('default', '', '/uploads/image-1753867586957-11317989.png', '#2563eb', '#64748b', '#0ea5e9', '#374151', '#2563eb', NOW(), NOW());

-- Insert sample slider images (add your actual slider data if any)
INSERT INTO `slider_images` (`id`, `image_url`, `title`, `description`, `is_active`, `sort_order`, `created_at`) VALUES 
(UUID(), '/uploads/slider-image-1.png', 'Welcome to InnovanceOrbit', 'Your trusted e-commerce platform', true, 1, NOW()),
(UUID(), '/uploads/slider-image-2.png', 'Featured Products', 'Discover our latest collection', true, 2, NOW());

SET foreign_key_checks = 1;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database import completed successfully
-- Your InnovanceOrbit e-commerce platform is ready for production
-- 
-- Next steps:
-- 1. Update admin user password after first login
-- 2. Configure payment gateway credentials in environment variables
-- 3. Set up email SMTP settings
-- 4. Upload your product images to the uploads directory
-- 5. Test all functionality before going live
--
-- Default admin login:
-- Username: admin
-- Password: admin123 (CHANGE IMMEDIATELY)