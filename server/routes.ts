import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema } from "@shared/schema";
import { sendOrderConfirmationEmail } from "./email";
// import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { createBenefitPayTransaction, verifyBenefitPayTransaction, handleBenefitPayWebhook } from "./benefit-pay";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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

      // Create order items
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

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(req.user!.email, order.id);
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

  // Statistics for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const [orders, products, users] = await Promise.all([
        storage.getOrders(),
        storage.getProducts(),
        // You'd implement getUserCount method
        // storage.getUserCount()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      
      const stats = {
        revenue: totalRevenue.toFixed(2),
        orders: orders.length,
        products: products.length,
        users: 0, // Placeholder
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
