import nodemailer from 'nodemailer';
import { storage } from './storage';

// Create transporter function for Microsoft 365 SMTP
async function createTransporter() {
  const settings = await storage.getSiteSettings();
  
  return nodemailer.createTransport({
    host: settings.smtpHost || 'smtp.office365.com',
    port: settings.smtpPort || 587,
    secure: false, // STARTTLS
    auth: {
      user: settings.smtpUser || settings.smtpFromEmail,
      pass: settings.smtpPassword || process.env.MICROSOFT365_EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: string;
    }>;
    total: string;
    paymentMethod: string;
  }
): Promise<void> {
  try {
    // Get site settings for template and admin email
    const settings = await storage.getSiteSettings();
    
    // Skip if email is not enabled or no password configured
    if (!settings.emailEnabled || (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD)) {
      console.log('Email notifications disabled - no Microsoft 365 password configured');
      return;
    }
    
    // Prepare template variables
    const itemsHtml = orderDetails.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
        </tr>
      `)
      .join('');

    // Use custom template or default
    let emailTemplate = settings.orderConfirmationTemplate || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmation - {{orderNumber}}</h2>
        <p>Dear {{customerName}},</p>
        <p>Thank you for your order! We've received your order and it's being processed.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details:</h3>
          <p><strong>Order Number:</strong> {{orderNumber}}</p>
          <p><strong>Order Date:</strong> {{orderDate}}</p>
          <p><strong>Total Amount:</strong> {{totalAmount}}</p>
          <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        </div>
        <h3>Items Ordered:</h3>
        {{orderItems}}
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>{{siteName}} Team</p>
      </div>
    `;

    // Replace template variables
    const orderItemsTable = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    `;

    const html = emailTemplate
      .replace(/{{orderNumber}}/g, orderDetails.orderNumber)
      .replace(/{{customerName}}/g, orderDetails.customerName)
      .replace(/{{orderDate}}/g, new Date().toLocaleDateString())
      .replace(/{{totalAmount}}/g, `$${orderDetails.total}`)
      .replace(/{{paymentMethod}}/g, orderDetails.paymentMethod)
      .replace(/{{orderItems}}/g, orderItemsTable)
      .replace(/{{siteName}}/g, settings.siteName);

    const fromEmail = settings.smtpFromEmail || settings.contactEmail || 'noreply@innovanceorbit.com';
    const fromName = settings.smtpFromName || settings.siteName || 'InnovanceOrbit';

    // Use Hostinger SMTP for sending emails
    console.log('Sending emails via Microsoft 365 SMTP...');
    const smtpTransporter = await createTransporter();
    
    // Send to customer
    await smtpTransporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html: html
    });

    // Send notification to admin
    if (settings.adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Order Received - ${orderDetails.orderNumber}</h2>
          <p>A new order has been placed on ${settings.siteName}.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
            <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.total}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <h3>Items Ordered:</h3>
          ${orderItemsTable}

          <p>Please process this order in the admin dashboard.</p>
        </div>
      `;

      await smtpTransporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: settings.adminEmail,
        subject: `New Order Alert - ${orderDetails.orderNumber}`,
        html: adminHtml
      });
    }

    console.log('Order confirmation emails sent successfully');
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw error to prevent order creation failure
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}
