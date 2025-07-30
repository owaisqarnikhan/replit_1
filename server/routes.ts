import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertSiteSettingsSchema, insertUserSchema, insertSliderImageSchema } from "@shared/schema";
import { sendOrderConfirmationEmail } from "./email";
import { exportDatabase, saveExportToFile, importDatabase, validateImportFile } from "./database-utils";
// import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { createBenefitPayTransaction, verifyBenefitPayTransaction, handleBenefitPayWebhook } from "./benefit-pay";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Image upload endpoint
  app.post("/api/upload-image", upload.single('image'), (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl, message: "Image uploaded successfully" });
  });

  // PayPal routes (temporarily disabled)
  // app.get("/api/paypal/setup", async (req, res) => {
  //   await loadPaypalDefault(req, res);
  // });

  // app.post("/api/paypal/order", async (req, res) => {
  //   await createPaypalOrder(req, res);
  // });

  // app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
  //   await capturePaypalOrder(req, res);
  // });

  // Stripe payment route (optional)
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe not configured" });
    }
    
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Benefit Pay routes for Bahrain market
  app.post("/api/benefit-pay/create", async (req, res) => {
    await createBenefitPayTransaction(req, res);
  });

  app.get("/api/benefit-pay/verify/:transactionId", async (req, res) => {
    await verifyBenefitPayTransaction(req, res);
  });

  app.post("/api/benefit-pay/webhook", async (req, res) => {
    await handleBenefitPayWebhook(req, res);
  });

  // Cash on Delivery route
  app.post("/api/cash-on-delivery", async (req, res) => {
    try {
      const { orderId, amount, shippingAddress } = req.body;
      
      if (!orderId || !amount || !shippingAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // For cash on delivery, we just need to create the order with pending payment
      const codOrder = {
        orderId,
        status: "pending_payment",
        paymentMethod: "cash_on_delivery",
        amount,
        shippingAddress,
        createdAt: new Date().toISOString(),
      };

      res.json({
        success: true,
        order: codOrder,
        message: "Cash on delivery order created successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to process cash on delivery" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      await storage.deleteProduct(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(
        req.user!.id,
        req.params.productId,
        quantity
      );
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await storage.removeFromCart(req.user!.id, req.params.productId);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      if (req.user!.isAdmin) {
        const orders = await storage.getOrders();
        res.json(orders);
      } else {
        const orders = await storage.getUserOrders(req.user!.id);
        res.json(orders);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user can access this order
      if (!req.user!.isAdmin && order.userId !== req.user!.id) {
        return res.sendStatus(403);
      }

      res.json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { shippingAddress, paymentMethod, paymentIntentId } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.user!.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );
      const tax = subtotal * 0.075; // 7.5% tax
      const shipping = 0; // Free shipping
      const total = subtotal + tax + shipping;

      // Create order
      const order = await storage.createOrder({
        userId: req.user!.id,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        paymentMethod,
        paymentIntentId,
        shippingAddress,
        status: "processing",
      });

      // Create order items and update stock
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        
        // Decrease stock quantity
        const product = await storage.getProductById(cartItem.productId);
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - cartItem.quantity);
          await storage.updateProduct(cartItem.productId, { stock: newStock });
        }
      }

      // Clear cart
      await storage.clearCart(req.user!.id);

      // Send confirmation email with order details
      try {
        const customerName = `${req.user!.firstName || ''} ${req.user!.lastName || ''}`.trim() || req.user!.username;
        const orderItems = cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }));

        await sendOrderConfirmationEmail(req.user!.email, {
          orderNumber: order.id,
          customerName,
          items: orderItems,
          total: order.total,
          paymentMethod: order.paymentMethod || 'Unknown'
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Site settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const updated = await storage.updateSiteSettings(settingsData);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      await storage.deleteCategory(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password if provided
      if (userData.password) {
        const { hashPassword } = await import("./auth");
        userData.password = await hashPassword(userData.password);
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Hash password if provided
      if (userData.password && userData.password.trim() !== "") {
        const { hashPassword } = await import("./auth");
        userData.password = await hashPassword(userData.password);
      } else if (userData.password === "") {
        // Remove password from update if empty string
        delete userData.password;
      }
      
      const user = await storage.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      await storage.deleteUser(req.params.id);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const [orders, products, users] = await Promise.all([
        storage.getOrdersWithDetails(),
        storage.getProducts(),
        storage.getAllUsers()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
      
      const stats = {
        revenue: totalRevenue.toFixed(2),
        orders: orders.length,
        products: products.length,
        totalStock: totalStock,
        users: users.length,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Slider images routes
  app.get("/api/slider-images", async (req, res) => {
    try {
      const images = await storage.getSliderImages();
      res.json(images);
    } catch (error: any) {
      console.error("Error getting slider images:", error);
      res.status(500).json({ message: "Failed to get slider images" });
    }
  });

  app.get("/api/slider-images/active", async (req, res) => {
    try {
      const images = await storage.getActiveSliderImages();
      res.json(images);
    } catch (error: any) {
      console.error("Error getting active slider images:", error);
      res.status(500).json({ message: "Failed to get active slider images" });
    }
  });

  app.post("/api/slider-images", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const validation = insertSliderImageSchema.parse(req.body);
      const image = await storage.createSliderImage(validation);
      res.json(image);
    } catch (error: any) {
      console.error("Error creating slider image:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/slider-images/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      const image = await storage.updateSliderImage(id, req.body);
      res.json(image);
    } catch (error: any) {
      console.error("Error updating slider image:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/slider-images/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      await storage.deleteSliderImage(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting slider image:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Database export/import routes
  app.get("/api/admin/database/export", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const exportData = await exportDatabase();
      const filename = await saveExportToFile(exportData);
      
      res.json({ 
        success: true, 
        filename,
        downloadUrl: `/uploads/${filename}`,
        message: "Database exported successfully" 
      });
    } catch (error) {
      console.error('Database export error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to export database" 
      });
    }
  });

  // Configure multer for database import
  const importUpload = multer({ 
    storage: storage_config,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for database files
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/sql' || path.extname(file.originalname).toLowerCase() === '.sql') {
        return cb(null, true);
      } else {
        cb(new Error('Only SQL files are allowed for database import'));
      }
    }
  });

  app.post("/api/admin/database/import", importUpload.single('database'), async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No database file uploaded" 
      });
    }

    try {
      const sqlContent = await validateImportFile(req.file.path);
      await importDatabase(sqlContent);
      
      // Clean up uploaded file
      await fs.promises.unlink(req.file.path);
      
      res.json({ 
        success: true, 
        message: "Database imported successfully" 
      });
    } catch (error) {
      console.error('Database import error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup upload file:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to import database" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
