import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  categoryId: varchar("category_id").references(() => categories.id),
  stock: integer("stock").default(0),
  sku: text("sku").unique(),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  productType: text("product_type").notNull().default("sale"), // sale, rental
  rentalPeriod: text("rental_period"), // daily, weekly, monthly (for rental products)
  rentalPrice: decimal("rental_price", { precision: 10, scale: 2 }), // price per rental period
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0.00"),
  paymentMethod: text("payment_method"), // stripe, paypal, benefit_pay, cash_on_delivery, knet, benefit_debit
  paymentIntentId: text("payment_intent_id"),
  shippingAddress: json("shipping_address"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("InnovanceOrbit"),
  headerLogo: text("header_logo"),
  footerLogo: text("footer_logo"),
  primaryColor: text("primary_color").default("#2563eb"),
  secondaryColor: text("secondary_color").default("#64748b"),
  accentColor: text("accent_color").default("#0ea5e9"),
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#1e293b"),
  footerDescription: text("footer_description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  supportEmail: text("support_email"),
  businessHours: text("business_hours"),
  socialFacebook: text("social_facebook"),
  socialTwitter: text("social_twitter"),
  socialInstagram: text("social_instagram"),
  socialLinkedin: text("social_linkedin"),
  copyrightText: text("copyright_text"),
  additionalFooterText: text("additional_footer_text"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
