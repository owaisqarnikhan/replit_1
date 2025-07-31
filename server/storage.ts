import { 
  users, 
  categories, 
  products, 
  cartItems, 
  wishlistItems,
  orders, 
  orderItems,
  siteSettings,
  sliderImages,
  unitsOfMeasure,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type SiteSettings,
  type InsertSiteSettings,
  type SliderImage,
  type InsertSliderImage,
  type UnitOfMeasure,
  type InsertUnitOfMeasure
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import * as crypto from "crypto";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Units of measure methods
  getUnitsOfMeasure(): Promise<UnitOfMeasure[]>;
  getActiveUnitsOfMeasure(): Promise<UnitOfMeasure[]>;
  getUnitOfMeasureById(id: string): Promise<UnitOfMeasure | undefined>;
  createUnitOfMeasure(unit: InsertUnitOfMeasure): Promise<UnitOfMeasure>;
  updateUnitOfMeasure(id: string, unit: Partial<InsertUnitOfMeasure>): Promise<UnitOfMeasure>;
  deleteUnitOfMeasure(id: string): Promise<void>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Cart methods
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wishlist methods
  getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getUserOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getOrderById(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  getOrdersWithDetails(): Promise<any[]>;
  getOrderWithDetails(id: string): Promise<any>;
  getUserById(id: string): Promise<User | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Site settings methods
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Slider images methods
  getSliderImages(): Promise<SliderImage[]>;
  getActiveSliderImages(): Promise<SliderImage[]>;
  getSliderImageById(id: string): Promise<SliderImage | undefined>;
  createSliderImage(image: InsertSliderImage): Promise<SliderImage>;
  updateSliderImage(id: string, image: Partial<InsertSliderImage>): Promise<SliderImage>;
  deleteSliderImage(id: string): Promise<void>;

  // Database export/import methods
  getUsers(): Promise<User[]>;
  getOrders(): Promise<Order[]>;
  getOrderItems(): Promise<OrderItem[]>;
  getAllCartItems(): Promise<CartItem[]>;
  clearProductsAndCategories(): Promise<void>;
  executeSQLImport(sqlContent: string): Promise<void>;
  
  // Excel import methods
  importCategories(categoriesData: any[]): Promise<void>;
  importProducts(productsData: any[]): Promise<void>;
  importUsers(usersData: any[]): Promise<void>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Units of measure methods
  async getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    return await db.select().from(unitsOfMeasure).orderBy(unitsOfMeasure.name);
  }

  async getActiveUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    return await db.select().from(unitsOfMeasure).where(eq(unitsOfMeasure.isActive, true)).orderBy(unitsOfMeasure.name);
  }

  async getUnitOfMeasureById(id: string): Promise<UnitOfMeasure | undefined> {
    const [unit] = await db.select().from(unitsOfMeasure).where(eq(unitsOfMeasure.id, id));
    return unit || undefined;
  }

  async createUnitOfMeasure(unit: InsertUnitOfMeasure): Promise<UnitOfMeasure> {
    const [newUnit] = await db
      .insert(unitsOfMeasure)
      .values(unit)
      .returning();
    return newUnit;
  }

  async updateUnitOfMeasure(id: string, unit: Partial<InsertUnitOfMeasure>): Promise<UnitOfMeasure> {
    const [updated] = await db
      .update(unitsOfMeasure)
      .set(unit)
      .where(eq(unitsOfMeasure.id, id))
      .returning();
    return updated;
  }

  async deleteUnitOfMeasure(id: string): Promise<void> {
    await db.delete(unitsOfMeasure).where(eq(unitsOfMeasure.id, id));
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(8);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }



  // Additional methods for database export/import
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrderItems(): Promise<OrderItem[]> {
    return await db.select().from(orderItems);
  }

  async getAllCartItems(): Promise<CartItem[]> {
    return await db.select().from(cartItems);
  }

  // Excel import methods
  async importCategories(categoriesData: any[]): Promise<void> {
    if (categoriesData.length === 0) return;
    
    // Clear existing categories
    await db.delete(categories);
    
    // Insert new categories
    for (const category of categoriesData) {
      const insertData: any = {
        name: category.name,
        description: category.description || "",
        imageUrl: category.imageUrl || ""
      };
      
      // Only include ID if it exists and is not empty
      if (category.id && category.id.trim() !== "") {
        insertData.id = category.id;
      }
      
      await db.insert(categories).values(insertData);
    }
  }

  async importProducts(productsData: any[]): Promise<void> {
    if (productsData.length === 0) return;
    
    // Clear existing products
    await db.delete(products);
    
    // Insert new products
    for (const product of productsData) {
      const insertData: any = {
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock || 0,
        sku: product.sku || "",
        unitOfMeasure: product.unitOfMeasure || 'piece',
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
        rating: (product.rating || 0).toString(),
        reviewCount: product.reviewCount || 0,
        productType: product.productType || 'sale',
        rentalPeriod: product.rentalPeriod,
        rentalPrice: product.rentalPrice?.toString()
      };
      
      // Only include ID if it exists and is not empty
      if (product.id && product.id.trim() !== "") {
        insertData.id = product.id;
      }
      
      await db.insert(products).values(insertData);
    }
  }

  async importUsers(usersData: any[]): Promise<void> {
    if (usersData.length === 0) return;
    
    // Note: We don't clear existing users for security reasons
    // Instead, we only update existing users or create new ones
    
    for (const user of usersData) {
      const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      
      if (existingUser.length > 0) {
        // Update existing user (excluding password for security)
        await db.update(users).set({
          username: user.username || user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }).where(eq(users.id, user.id));
      } else {
        // Create new user with default password (they'll need to reset)
        const defaultPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.scryptSync(defaultPassword, defaultPassword, 64).toString('hex');
        
        await db.insert(users).values({
          username: user.username || user.email,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          password: hashedPassword
        });
      }
    }
  }

  async importUnitsOfMeasure(unitsData: any[]): Promise<void> {
    if (unitsData.length === 0) return;
    
    // Clear existing units and insert new ones
    await db.delete(unitsOfMeasure);
    
    for (const unit of unitsData) {
      const insertData: any = {
        name: unit.name,
        abbreviation: unit.abbreviation,
        isActive: unit.isActive !== undefined ? unit.isActive : true
      };
      
      // Only include ID if it exists and is not empty
      if (unit.id && unit.id.trim() !== "") {
        insertData.id = unit.id;
      }
      
      await db.insert(unitsOfMeasure).values(insertData);
    }
  }

  async importOrders(ordersData: any[]): Promise<void> {
    if (ordersData.length === 0) return;
    
    // Clear existing orders and order items
    await db.delete(orderItems);
    await db.delete(orders);
    
    for (const order of ordersData) {
      await db.insert(orders).values({
        userId: order.userId,
        status: order.status,
        total: order.totalAmount.toString(),
        subtotal: order.totalAmount.toString(),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod
      });
    }
  }

  async importOrderItems(orderItemsData: any[]): Promise<void> {
    if (orderItemsData.length === 0) return;
    
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString()
      }).onConflictDoUpdate({
        target: orderItems.id,
        set: {
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString()
        }
      });
    }
  }

  async importSliderImages(sliderData: any[]): Promise<void> {
    if (sliderData.length === 0) return;
    
    // Clear existing slider images
    await db.delete(sliderImages);
    
    for (const slide of sliderData) {
      await db.insert(sliderImages).values({
        title: slide.title,
        imageUrl: slide.imageUrl,
        isActive: slide.isActive,
        sortOrder: slide.displayOrder
      });
    }
  }

  async clearProductsAndCategories(): Promise<void> {
    await db.delete(cartItems);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(categories);
  }

  async executeSQLImport(sqlContent: string): Promise<void> {
    try {
      // Split SQL content into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await db.execute(statement);
        }
      }
    } catch (error) {
      console.error('SQL import execution error:', error);
      throw new Error('Failed to execute SQL import');
    }
  }

  // Cart methods
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [newItem] = await db
        .insert(cartItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning();
    return updated;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Wishlist methods
  async getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]> {
    return await db
      .select({
        id: wishlistItems.id,
        userId: wishlistItems.userId,
        productId: wishlistItems.productId,
        createdAt: wishlistItems.createdAt,
        product: products,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, item.userId), eq(wishlistItems.productId, item.productId)));

    if (existing) {
      return existing; // Return existing item if already in wishlist
    } else {
      // Create new wishlist item
      const [newItem] = await db
        .insert(wishlistItems)
        .values(item)
        .returning();
      return newItem;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return !!existing;
  }

  // Order methods  
  async getOrdersWithDetails(): Promise<any[]> {
    const ordersData = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    return Promise.all(ordersData.map(async (order) => {
      // Get user data separately
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, order.userId));
        
      // Get order items
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          createdAt: orderItems.createdAt,
          product: products,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        user: userData || null,
        items
      };
    }));
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            createdAt: orderItems.createdAt,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getOrderWithDetails(orderId: string): Promise<any> {
    // Get order data
    const [orderData] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!orderData) {
      throw new Error('Order not found');
    }
    
    // Get user data
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, orderData.userId));
      
    // Get order items
    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        createdAt: orderItems.createdAt,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderData.id));

    return {
      ...orderData,
      user: userData || null,
      items
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrderById(id: string): Promise<any> {
    try {
      // Get the basic order first
      const [orderData] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id));
        
      if (!orderData) {
        return null;
      }

      // Get the user separately
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, orderData.userId));

      // Get order items
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          createdAt: orderItems.createdAt,
          product: products,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, orderData.id));

      return {
        ...orderData,
        user: userData || null,
        items
      };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db
      .insert(orderItems)
      .values(item)
      .returning();
    return newItem;
  }



  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Site Settings methods
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "default"));
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db.insert(siteSettings).values({ id: "default" }).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const [updated] = await db
      .update(siteSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(siteSettings.id, "default"))
      .returning();
    return updated;
  }

  // Slider images methods
  async getSliderImages(): Promise<SliderImage[]> {
    return await db.select().from(sliderImages).orderBy(sliderImages.sortOrder, sliderImages.createdAt);
  }

  async getActiveSliderImages(): Promise<SliderImage[]> {
    return await db
      .select()
      .from(sliderImages)
      .where(eq(sliderImages.isActive, true))
      .orderBy(sliderImages.sortOrder, sliderImages.createdAt);
  }

  async getSliderImageById(id: string): Promise<SliderImage | undefined> {
    const [image] = await db.select().from(sliderImages).where(eq(sliderImages.id, id));
    return image || undefined;
  }

  async createSliderImage(image: InsertSliderImage): Promise<SliderImage> {
    const [newImage] = await db
      .insert(sliderImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateSliderImage(id: string, imageData: Partial<InsertSliderImage>): Promise<SliderImage> {
    const [updatedImage] = await db
      .update(sliderImages)
      .set({ ...imageData, updatedAt: new Date() })
      .where(eq(sliderImages.id, id))
      .returning();
    return updatedImage;
  }

  async deleteSliderImage(id: string): Promise<void> {
    await db.delete(sliderImages).where(eq(sliderImages.id, id));
  }
}

export const storage = new DatabaseStorage();
