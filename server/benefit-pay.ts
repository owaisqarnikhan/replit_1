import { Request, Response } from "express";

// Benefit Pay integration for Bahrain market
// This is a simplified integration - in production you would integrate with actual Benefit Pay API

export interface BenefitPayPayment {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export async function createBenefitPayTransaction(req: Request, res: Response) {
  try {
    const { amount, currency = "USD", orderId, customerInfo }: BenefitPayPayment = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!orderId || !customerInfo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // In production, you would integrate with Benefit Pay's actual API
    // For now, we'll simulate the payment process
    const benefitPayResponse = {
      transactionId: `BEN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      paymentUrl: `https://benefit.bh/pay?transaction=${orderId}&amount=${amount}`,
      amount,
      currency,
      orderId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };

    res.json(benefitPayResponse);
  } catch (error: any) {
    console.error("Benefit Pay error:", error);
    res.status(500).json({ error: "Failed to create Benefit Pay transaction" });
  }
}

export async function verifyBenefitPayTransaction(req: Request, res: Response) {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    // In production, you would verify with Benefit Pay's API
    // For now, we'll simulate verification
    const verificationResult = {
      transactionId,
      status: "completed", // or "failed", "pending"
      amount: 50.00, // This would come from Benefit Pay
      currency: "BHD",
      timestamp: new Date().toISOString(),
    };

    res.json(verificationResult);
  } catch (error: any) {
    console.error("Benefit Pay verification error:", error);
    res.status(500).json({ error: "Failed to verify Benefit Pay transaction" });
  }
}

export async function handleBenefitPayWebhook(req: Request, res: Response) {
  try {
    // In production, you would verify the webhook signature
    const { transactionId, status, amount, orderId } = req.body;

    console.log("Benefit Pay webhook received:", {
      transactionId,
      status,
      amount,
      orderId,
    });

    // Update order status based on webhook
    // This would integrate with your order management system

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Benefit Pay webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}