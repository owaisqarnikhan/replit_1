import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'info@innovanceorbit.com',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderId: string
): Promise<void> {
  const mailOptions = {
    from: 'info@innovanceorbit.com',
    to: customerEmail,
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Order Confirmation</h1>
        <p>Thank you for your order! Your order #${orderId} has been received and is being processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Status:</strong> Processing</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>We'll send you another email with tracking information once your order ships.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            If you have any questions about your order, please contact us at info@innovanceorbit.com
          </p>
          <p style="color: #666; font-size: 14px;">
            Thank you for shopping with InnovanceOrbit!
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendNewOrderNotification(orderId: string): Promise<void> {
  const mailOptions = {
    from: 'info@innovanceorbit.com',
    to: 'info@innovanceorbit.com',
    subject: `New Order Received - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">New Order Notification</h1>
        <p>A new order has been placed on your store.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Information</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> Processing</p>
        </div>

        <p>Please log in to your admin dashboard to view the full order details and process the order.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
