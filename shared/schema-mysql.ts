import { 
  mysqlTable, 
  varchar, 
  text, 
  boolean, 
  int, 
  timestamp,
  mysqlEnum,
  json,
  unique
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  salt: text("salt").notNull(),
  firstName: text("first_name").default(""),
  lastName: text("last_name").default(""),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: varchar("price", { length: 20 }).notNull(), // Store as string for precision

  sku: text("sku").default(""),
  categoryId: varchar("category_id", { length: 36 }),
  imageUrl: text("image_url").default(""),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  rating: varchar("rating", { length: 10 }).default("0"),
  reviewCount: int("review_count").default(0),
  productType: mysqlEnum("product_type", ["purchase", "rental"]).default("purchase"),
  rentalPeriod: text("rental_period"),
  rentalPrice: varchar("rental_price", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items table
export const cartItems = mysqlTable("cart_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserProduct: unique().on(table.userId, table.productId),
}));

// Wishlist items table
export const wishlistItems = mysqlTable("wishlist_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserProductWishlist: unique().on(table.userId, table.productId),
}));

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  total: varchar("total", { length: 20 }).notNull(),
  vatAmount: varchar("vat_amount", { length: 20 }).default("0"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  paymentMethod: text("payment_method").default(""),
  paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  shippingAddress: json("shipping_address"),
  billingAddress: json("billing_address"),
  orderNotes: text("order_notes").default(""),
  adminNotes: text("admin_notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Order items table
export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull(),
  productId: varchar("product_id", { length: 36 }).notNull(),
  quantity: int("quantity").notNull(),
  price: varchar("price", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings table
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 36 }).primaryKey().default("default"),
  siteName: text("site_name").default(""),
  headerLogo: text("header_logo"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#64748b"),
  accentColor: text("accent_color").default("#0ea5e9"),
  headerTextColor: text("header_text_color").default("#374151"),
  tabTextColor: text("tab_text_color").default("#2563eb"),
  loginTitle: text("login_title").default(""),
  loginLogo: text("login_logo"),
  footerDescription: text("footer_description").default(""),
  footerCopyright: text("footer_copyright").default(""),
  quickLinksTitle: text("quick_links_title").default("Quick Links"),
  quickLinksText: json("quick_links_text"),
  servicesTitle: text("services_title").default("Our Services"),
  servicesLinks: json("services_links"),
  socialFacebook: text("social_facebook").default(""),
  socialTwitter: text("social_twitter").default(""),
  socialInstagram: text("social_instagram").default(""),
  socialLinkedin: text("social_linkedin").default(""),
  footerBackgroundUrl: text("footer_background_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Slider images table
export const sliderImages = mysqlTable("slider_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title").default(""),
  description: text("description").default(""),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
export type SliderImage = typeof sliderImages.$inferSelect;
export type InsertSliderImage = typeof sliderImages.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertWishlistItemSchema = createInsertSchema(wishlistItems);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertSiteSettingsSchema = createInsertSchema(siteSettings);
export const insertSliderImageSchema = createInsertSchema(sliderImages);