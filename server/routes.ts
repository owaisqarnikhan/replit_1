import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertSiteSettingsSchema, insertUserSchema, insertSliderImageSchema, insertUnitOfMeasureSchema } from "@shared/schema";
import { sendOrderConfirmationEmail } from "./email";
import { testSMTP } from "./test-smtp";
import { sendOrderSubmittedNotification, sendOrderApprovedNotification, sendOrderRejectedNotification } from "./sendgrid";
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
      // Clean numeric fields to handle empty strings
      const cleanedBody = {
        ...req.body,
        price: req.body.price === "" ? "0" : req.body.price,
        rentalPrice: req.body.rentalPrice === "" ? undefined : req.body.rentalPrice,
      };
      
      const productData = insertProductSchema.parse(cleanedBody);
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
      // Clean numeric fields to handle empty strings
      const cleanedBody = {
        ...req.body,
        price: req.body.price === "" ? "0" : req.body.price,
        rentalPrice: req.body.rentalPrice === "" ? undefined : req.body.rentalPrice,
      };
      
      const product = await storage.updateProduct(req.params.id, cleanedBody);
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

      // Calculate totals with 10% VAT
      const subtotal = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );
      const vatPercentage = 10.00;
      const tax = subtotal * (vatPercentage / 100); // 10% VAT
      const shipping = 0; // Free shipping
      const total = subtotal + tax + shipping;

      // Create order with approval workflow - always starts as pending approval
      const order = await storage.createOrder({
        userId: req.user!.id,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        vatPercentage: vatPercentage.toFixed(2),
        paymentMethod,
        paymentIntentId,
        shippingAddress,
        status: "pending", // Order status starts as pending
        adminApprovalStatus: "pending", // Always requires admin approval
        estimatedDeliveryDays: 2, // Default 2-day arrangement period
      });

      // Create order items and update stock
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
        

      }

      // Clear cart
      await storage.clearCart(req.user!.id);

      // Send admin notification email about new order
      try {
        const { sendAdminOrderNotification } = await import("./admin-notification");
        const user = req.user!;
        const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        
        await sendAdminOrderNotification({
          orderNumber: order.id.slice(0, 8),
          customerName: customerName,
          customerEmail: user.email,
          total: order.total,
          items: cartItems.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: (parseFloat(item.product.price) * item.quantity).toFixed(2)
          })),
          shippingAddress: shippingAddress
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail the order creation if email fails
      }

      // Send order submission notification with approval workflow
      try {
        const customerName = `${req.user!.firstName || ''} ${req.user!.lastName || ''}`.trim() || req.user!.username;
        
        await sendOrderSubmittedNotification(
          req.user!.email,
          customerName,
          order.id,
          order.total
        );
      } catch (emailError) {
        console.error('Failed to send order submission notification:', emailError);
      }

      res.status(201).json({ 
        order, 
        message: "Order submitted for admin approval. Admin has been notified and you will receive an email once approved." 
      });
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

  // Admin order approval routes
  app.put("/api/admin/orders/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { adminRemarks } = req.body;
      const orderId = req.params.id;
      
      // Update order approval status
      await storage.updateOrder(orderId, {
        adminApprovalStatus: "approved",
        adminApprovedBy: req.user!.id,
        adminApprovedAt: new Date(),
        adminRemarks: adminRemarks || null,
        status: "payment_pending" // Move to payment pending after approval
      });

      // Get order details for email notification
      const order = await storage.getOrderById(orderId);
      const user = await storage.getUser(order!.userId);

      if (user && order) {
        const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        
        // Send approval notification using Microsoft 365
        const { sendOrderApprovalEmail } = await import("./email");
        await sendOrderApprovalEmail(user.email, {
          orderNumber: order.id.slice(0, 8),
          customerName: customerName,
          total: order.total,
          paymentMethod: order.paymentMethod || "Benefit Pay",
          adminRemarks: adminRemarks
        });
      }

      res.json({ message: "Order approved successfully", orderId });
    } catch (error: any) {
      console.error('Error approving order:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/orders/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { adminRemarks } = req.body;
      const orderId = req.params.id;
      
      // Update order approval status to rejected
      await storage.updateOrder(orderId, {
        adminApprovalStatus: "rejected",
        adminApprovedBy: req.user!.id,
        adminApprovedAt: new Date(),
        adminRemarks: adminRemarks || null,
        status: "cancelled" // Mark order as cancelled when rejected
      });

      // Get order details for email notification
      const order = await storage.getOrderById(orderId);
      const user = await storage.getUser(order!.userId);

      if (user && order) {
        const customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        
        // Send rejection notification using Microsoft 365
        const { sendOrderRejectionEmail } = await import("./email");
        await sendOrderRejectionEmail(user.email, {
          orderNumber: order.id.slice(0, 8),
          customerName: customerName,
          total: order.total,
          adminRemarks: adminRemarks
        });
      }

      res.json({ message: "Order rejected successfully", orderId });
    } catch (error: any) {
      console.error('Error rejecting order:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/orders/:id/complete", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const orderId = req.params.id;
      const deliveredAt = new Date();
      
      // Update order status to delivered
      await storage.updateOrder(orderId, {
        status: "delivered",
        deliveredAt
      });

      // Get order details for email
      const orderWithDetails = await storage.getOrderWithDetails(orderId);
      const user = await storage.getUserById(orderWithDetails.userId);

      if (user && orderWithDetails) {
        // Send completion email to customer
        const { sendOrderCompletionEmail } = await import("./email");
        await sendOrderCompletionEmail(user.email, {
          orderNumber: orderWithDetails.id,
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          total: orderWithDetails.total,
          deliveredAt: deliveredAt.toLocaleDateString()
        });
      }

      res.json({ success: true, message: "Order marked as delivered" });
    } catch (error: any) {
      console.error('Order completion error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // SMTP test route
  app.post("/api/admin/test-smtp", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const result = await testSMTP();
      res.json(result);
    } catch (error: any) {
      console.error('SMTP test error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "SMTP test failed" 
      });
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

  // Units of measure routes
  app.get("/api/units-of-measure", async (req, res) => {
    try {
      const units = await storage.getActiveUnitsOfMeasure();
      res.json(units);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/units-of-measure", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const units = await storage.getUnitsOfMeasure();
      res.json(units);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/units-of-measure", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const unitData = insertUnitOfMeasureSchema.parse(req.body);
      const unit = await storage.createUnitOfMeasure(unitData);
      res.status(201).json(unit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/units-of-measure/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const unit = await storage.updateUnitOfMeasure(req.params.id, req.body);
      res.json(unit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/units-of-measure/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      await storage.deleteUnitOfMeasure(req.params.id);
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

  // Admin orders management
  app.get("/api/admin/orders", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const orders = await storage.getOrdersWithDetails();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      
      const stats = {
        revenue: totalRevenue.toFixed(2),
        orders: orders.length,
        products: products.length,
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

  // Excel import/export routes
  app.get("/api/admin/export/excel/bulk", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const { exportDataToExcel } = await import('./excelUtils');
      const excelBuffer = await exportDataToExcel();
      
      const filename = `data-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(excelBuffer);
    } catch (error) {
      console.error('Excel export error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to export Excel file" 
      });
    }
  });

  // Individual sheet export routes
  app.get("/api/admin/export/excel/:sheetType", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    const { sheetType } = req.params;
    
    try {
      let excelBuffer: Buffer;
      let filename: string;
      
      switch (sheetType) {
        case 'products':
          const { exportProductsToExcel } = await import('./excelUtils');
          excelBuffer = await exportProductsToExcel();
          filename = `products-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'categories':
          const { exportCategoriesToExcel } = await import('./excelUtils');
          excelBuffer = await exportCategoriesToExcel();
          filename = `categories-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'users':
          const { exportUsersToExcel } = await import('./excelUtils');
          excelBuffer = await exportUsersToExcel();
          filename = `users-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'orders':
          const { exportOrdersToExcel } = await import('./excelUtils');
          excelBuffer = await exportOrdersToExcel();
          filename = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'order-items':
          const { exportOrderItemsToExcel } = await import('./excelUtils');
          excelBuffer = await exportOrderItemsToExcel();
          filename = `order-items-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'units':
          const { exportUnitsToExcel } = await import('./excelUtils');
          excelBuffer = await exportUnitsToExcel();
          filename = `units-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'site-settings':
          const { exportSiteSettingsToExcel } = await import('./excelUtils');
          excelBuffer = await exportSiteSettingsToExcel();
          filename = `site-settings-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case 'slider-images':
          const { exportSliderImagesToExcel } = await import('./excelUtils');
          excelBuffer = await exportSliderImagesToExcel();
          filename = `slider-images-export-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: "Invalid sheet type" 
          });
      }
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(excelBuffer);
    } catch (error) {
      console.error('Excel export error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to export Excel file" 
      });
    }
  });

  // Configure multer for Excel import
  const excelUpload = multer({ 
    storage: storage_config,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for Excel files
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      const allowedExtensions = ['.xlsx', '.xls'];
      
      if (allowedMimeTypes.includes(file.mimetype) || 
          allowedExtensions.includes(path.extname(file.originalname).toLowerCase())) {
        return cb(null, true);
      } else {
        cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
      }
    }
  });

  app.post("/api/admin/import/excel", excelUpload.single('excel'), async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No Excel file uploaded" 
      });
    }

    try {
      const { parseExcelFile } = await import('./excelUtils');
      const fileBuffer = await fs.promises.readFile(req.file.path);
      const parsedData = parseExcelFile(fileBuffer);
      
      // Import data in order: foundational data first, then dependent data
      let importCounts = {
        categories: 0,
        products: 0,
        users: 0,
        orders: 0,
        orderItems: 0,
        unitsOfMeasure: 0,
        sliderImages: 0,
        siteSettings: 0
      };

      if (parsedData.categories.length > 0) {
        await storage.importCategories(parsedData.categories);
        importCounts.categories = parsedData.categories.length;
      }
      
      if (parsedData.unitsOfMeasure.length > 0) {
        await storage.importUnitsOfMeasure(parsedData.unitsOfMeasure);
        importCounts.unitsOfMeasure = parsedData.unitsOfMeasure.length;
      }
      
      if (parsedData.products.length > 0) {
        await storage.importProducts(parsedData.products);
        importCounts.products = parsedData.products.length;
      }
      
      if (parsedData.users.length > 0) {
        await storage.importUsers(parsedData.users);
        importCounts.users = parsedData.users.length;
      }

      if (parsedData.orders.length > 0) {
        await storage.importOrders(parsedData.orders);
        importCounts.orders = parsedData.orders.length;
      }

      if (parsedData.orderItems.length > 0) {
        await storage.importOrderItems(parsedData.orderItems);
        importCounts.orderItems = parsedData.orderItems.length;
      }

      if (parsedData.sliderImages.length > 0) {
        await storage.importSliderImages(parsedData.sliderImages);
        importCounts.sliderImages = parsedData.sliderImages.length;
      }

      if (parsedData.siteSettings.length > 0) {
        await storage.importSiteSettings(parsedData.siteSettings);
        importCounts.siteSettings = parsedData.siteSettings.length;
      }
      
      // Clean up uploaded file
      await fs.promises.unlink(req.file.path);
      
      const totalImported = Object.values(importCounts).reduce((sum, count) => sum + count, 0);
      
      res.json({ 
        success: true, 
        message: `Successfully imported ${totalImported} total records: ${importCounts.categories} categories, ${importCounts.products} products, ${importCounts.users} users, ${importCounts.orders} orders, ${importCounts.orderItems} order items, ${importCounts.unitsOfMeasure} units of measure, ${importCounts.sliderImages} slider images, and ${importCounts.siteSettings} site settings`,
        imported: importCounts
      });
    } catch (error) {
      console.error('Excel import error:', error);
      
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
        message: error instanceof Error ? error.message : "Failed to import Excel file" 
      });
    }
  });

  // Individual sheet import routes  
  app.post("/api/admin/import/excel/:sheetType", excelUpload.single('excel'), async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No Excel file uploaded" 
      });
    }

    const { sheetType } = req.params;

    try {
      const { parseExcelFile } = await import('./excelUtils');
      const fileBuffer = await fs.promises.readFile(req.file.path);
      const parsedData = parseExcelFile(fileBuffer);
      
      let importCount = 0;
      let successMessage = "";

      switch (sheetType) {
        case 'products':
          if (parsedData.products.length > 0) {
            await storage.importProducts(parsedData.products);
            importCount = parsedData.products.length;
            successMessage = `Successfully imported ${importCount} products`;
          }
          break;
        case 'categories':
          if (parsedData.categories.length > 0) {
            await storage.importCategories(parsedData.categories);
            importCount = parsedData.categories.length;
            successMessage = `Successfully imported ${importCount} categories`;
          }
          break;
        case 'users':
          if (parsedData.users.length > 0) {
            await storage.importUsers(parsedData.users);
            importCount = parsedData.users.length;
            successMessage = `Successfully imported ${importCount} users`;
          }
          break;
        case 'orders':
          if (parsedData.orders.length > 0) {
            await storage.importOrders(parsedData.orders);
            importCount = parsedData.orders.length;
            successMessage = `Successfully imported ${importCount} orders`;
          }
          break;
        case 'order-items':
          if (parsedData.orderItems.length > 0) {
            await storage.importOrderItems(parsedData.orderItems);
            importCount = parsedData.orderItems.length;
            successMessage = `Successfully imported ${importCount} order items`;
          }
          break;
        case 'units':
          if (parsedData.unitsOfMeasure.length > 0) {
            await storage.importUnitsOfMeasure(parsedData.unitsOfMeasure);
            importCount = parsedData.unitsOfMeasure.length;
            successMessage = `Successfully imported ${importCount} units of measure`;
          }
          break;
        case 'site-settings':
          if (parsedData.siteSettings.length > 0) {
            await storage.importSiteSettings(parsedData.siteSettings);
            importCount = parsedData.siteSettings.length;
            successMessage = `Successfully imported ${importCount} site settings`;
          }
          break;
        case 'slider-images':
          if (parsedData.sliderImages.length > 0) {
            await storage.importSliderImages(parsedData.sliderImages);
            importCount = parsedData.sliderImages.length;
            successMessage = `Successfully imported ${importCount} slider images`;
          }
          break;
        default:
          await fs.promises.unlink(req.file.path);
          return res.status(400).json({ 
            success: false, 
            message: "Invalid sheet type" 
          });
      }
      
      // Clean up uploaded file
      await fs.promises.unlink(req.file.path);
      
      res.json({ 
        success: true, 
        message: successMessage,
        imported: importCount
      });
    } catch (error) {
      console.error(`Excel import error (${sheetType}):`, error);
      
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
        message: error instanceof Error ? error.message : `Failed to import ${sheetType} Excel file` 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
