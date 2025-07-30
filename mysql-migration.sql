-- MySQL Schema for InnovanceOrbit E-commerce Platform
-- This converts the PostgreSQL schema to MySQL compatible format

SET foreign_key_checks = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS `wishlist_items`;
DROP TABLE IF EXISTS `slider_images`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- Users table
CREATE TABLE `users` (
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
CREATE TABLE `categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `image_url` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE `products` (
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
CREATE TABLE `cart_items` (
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
CREATE TABLE `wishlist_items` (
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
CREATE TABLE `orders` (
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
CREATE TABLE `order_items` (
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
CREATE TABLE `site_settings` (
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
CREATE TABLE `slider_images` (
  `id` VARCHAR(36) NOT NULL,
  `image_url` TEXT NOT NULL,
  `title` TEXT,
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;