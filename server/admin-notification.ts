import { storage } from "./storage";
import nodemailer from "nodemailer";

async function createTransporter() {
  const settings = await storage.getSiteSettings();
  
  // Use Microsoft 365 SMTP settings
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: settings.smtpFromEmail || process.env.MICROSOFT365_EMAIL_USER,
      pass: settings.smtpPassword || process.env.MICROSOFT365_EMAIL_PASSWORD
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
}


// Send admin notification when new order is submitted for approval
export async function sendAdminOrderNotification(
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: string;
    }>;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      phone: string;
    };
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    
    if (!settings.emailEnabled || (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD)) {
      console.log('Email notifications disabled - no Microsoft 365 password configured');
      console.log('To enable admin notifications: Configure SMTP settings in Admin Dashboard > Settings');
      return;
    }

    if (!settings.adminEmail) {
      console.log('Admin email not configured');
      return;
    }

    const itemsHtml = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; color: #374151;">${item.productName}</td>
        <td style="padding: 12px 0; color: #374151; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; color: #374151; text-align: right;">$${item.price}</td>
      </tr>
    `).join('');

    const adminEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔔 New Order Awaiting Approval</h1>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">Action Required</h3>
            <p style="color: #92400e; margin: 10px 0; font-weight: 600;">A new customer order is waiting for your approval.</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Details</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
              <p style="margin: 5px 0; color: #374151;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Customer:</strong> ${orderDetails.customerName}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${orderDetails.customerEmail}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Total Amount:</strong> <span style="color: #059669; font-weight: 600;">$${orderDetails.total}</span></p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Ordered Items</h3>
            <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #e5e7eb;">
                  <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Shipping Address</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">
                ${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}<br>
                ${orderDetails.shippingAddress.address}<br>
                ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}<br>
                Phone: ${orderDetails.shippingAddress.phone}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 25px; background: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">
            <h4 style="color: #0c4a6e; margin-top: 0;">Review and Approve Order</h4>
            <p style="color: #0c4a6e; margin: 15px 0;">Please log in to your admin panel to review and approve this order.</p>
            <p style="color: #64748b; font-size: 14px; margin: 10px 0;">Once approved, the customer will receive an email notification and can proceed with payment.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0;">Best regards,</p>
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">${settings.siteName || 'InnovanceOrbit'} System</p>
          </div>
        </div>
      </div>
    `;

    const transporter = await createTransporter();
    
    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || 'info@innovanceorbit.com'}>`,
      to: settings.adminEmail,
      subject: `🔔 New Order Approval Required - ${orderDetails.orderNumber}`,
      html: adminEmailTemplate,
    });

    console.log(`Admin notification sent for order ${orderDetails.orderNumber}`);
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}