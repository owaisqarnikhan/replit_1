import { storage } from './storage';
import { createMicrosoft365Transporter, validateEmailConfig } from './smtp-config';

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
    subtotal: string;
    vatAmount: string;
    vatPercentage: string;
    total: string;
    paymentMethod: string;
    estimatedDeliveryDays: number;
  }
): Promise<void> {
  try {
    // Get site settings for template and admin email
    const settings = await storage.getSiteSettings();
    
    const emailValidation = validateEmailConfig(settings);
    if (!settings.emailEnabled || !emailValidation.valid) {
      console.log('Email notifications disabled:', emailValidation.errors.join(', '));
      console.log('To enable emails: Configure SMTP settings in Admin Dashboard > Settings');
      console.log('Required: Microsoft 365 email and app password');
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

    // Order awaiting approval template
    let emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Received - ${orderDetails.orderNumber}</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Thank you for your order! We have successfully received your order and it includes <strong>10% VAT</strong> as required.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; margin-top: 0; font-size: 18px;">📦 Order Processing Timeline</h3>
            <p style="color: #374151; margin: 10px 0; font-size: 16px; font-weight: 600;">
              ⏱️ We will arrange your product in ${orderDetails.estimatedDeliveryDays} days
            </p>
            <p style="color: #6b7280; margin: 10px 0;">After arrangement, you'll receive an email notification for payment processing to proceed with your order.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">⚠️ Important Note</h3>
            <p style="color: #92400e; margin: 5px 0;">Your order is currently <strong>awaiting admin approval</strong>. You will receive another email once the approval process is complete.</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Summary</h3>
            <table style="width: 100%; margin-bottom: 15px;">
              <tr><td style="color: #6b7280; padding: 5px 0;"><strong>Order Number:</strong></td><td style="text-align: right; padding: 5px 0;">${orderDetails.orderNumber}</td></tr>
              <tr><td style="color: #6b7280; padding: 5px 0;"><strong>Order Date:</strong></td><td style="text-align: right; padding: 5px 0;">${new Date().toLocaleDateString()}</td></tr>
              <tr><td style="color: #6b7280; padding: 5px 0;"><strong>Payment Method:</strong></td><td style="text-align: right; padding: 5px 0;">${orderDetails.paymentMethod}</td></tr>
            </table>
          </div>

          <h3 style="color: #374151;">Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #374151;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; font-size: 16px;">
              <tr><td style="color: #6b7280; padding: 5px 0;">Subtotal:</td><td style="text-align: right; padding: 5px 0;">$${orderDetails.subtotal}</td></tr>
              <tr><td style="color: #6b7280; padding: 5px 0;">VAT (${orderDetails.vatPercentage}%):</td><td style="text-align: right; padding: 5px 0;">$${orderDetails.vatAmount}</td></tr>
              <tr style="border-top: 2px solid #e5e7eb;"><td style="font-weight: bold; color: #374151; padding: 10px 0; font-size: 18px;">Total:</td><td style="text-align: right; font-weight: bold; color: #2563eb; padding: 10px 0; font-size: 18px;">$${orderDetails.total}</td></tr>
            </table>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; font-style: italic;">
            You will receive email notifications for order approval/rejection and payment processing instructions.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0;">Best regards,</p>
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">${settings.siteName || 'InnovanceOrbit'} Team</p>
          </div>
        </div>
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

    // Use Microsoft 365 SMTP for sending emails
    console.log('Sending emails via Microsoft 365 SMTP...');
    const smtpTransporter = await createMicrosoft365Transporter();
    
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
    const emailTransporter = await createMicrosoft365Transporter();
    await emailTransporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}

// Send order approval email to customer
export async function sendOrderApprovalEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
    paymentMethod: string;
    adminRemarks?: string;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    
    if (!settings.emailEnabled || (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD)) {
      console.log('Email notifications disabled');
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Approved!</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Great news! Your order <strong>${orderDetails.orderNumber}</strong> has been approved by our admin team.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">Next Step: Payment Processing</h3>
            <p style="color: #065f46; margin: 10px 0; font-weight: 600;">Please proceed with payment to complete your order.</p>
            <p style="color: #047857; margin: 10px 0;">Total Amount: <strong>$${orderDetails.total}</strong></p>
            <p style="color: #047857; margin: 10px 0;">Payment Method: <strong>${orderDetails.paymentMethod}</strong></p>
          </div>
          
          ${orderDetails.adminRemarks ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">Admin Note:</h4>
              <p style="color: #6b7280; font-style: italic;">"${orderDetails.adminRemarks}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0;">Best regards,</p>
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">${settings.siteName || 'InnovanceOrbit'} Team</p>
          </div>
        </div>
      </div>
    `;

    const transporter = await createMicrosoft365Transporter();
    
    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || 'info@innovanceorbit.com'}>`,
      to: customerEmail,
      subject: `Order Approved - Payment Required - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order approval email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order approval email:', error);
  }
}

// Send order rejection email to customer
export async function sendOrderRejectionEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
    adminRemarks?: string;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    
    if (!settings.emailEnabled || (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD)) {
      console.log('Email notifications disabled');
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">We regret to inform you that your order <strong>${orderDetails.orderNumber}</strong> has been cancelled by our admin team.</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">Order Details</h3>
            <p style="color: #991b1b; margin: 10px 0;">Order Number: <strong>${orderDetails.orderNumber}</strong></p>
            <p style="color: #991b1b; margin: 10px 0;">Order Amount: <strong>$${orderDetails.total}</strong></p>
            <p style="color: #991b1b; margin: 10px 0;">Status: <strong>Cancelled</strong></p>
          </div>
          
          ${orderDetails.adminRemarks ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">Reason for Cancellation:</h4>
              <p style="color: #6b7280; font-style: italic;">"${orderDetails.adminRemarks}"</p>
            </div>
          ` : ''}
          
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions about this cancellation, please contact our customer support team. We apologize for any inconvenience caused.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0;">Best regards,</p>
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">${settings.siteName || 'InnovanceOrbit'} Team</p>
          </div>
        </div>
      </div>
    `;

    const transporter = await createMicrosoft365Transporter();
    
    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || 'info@innovanceorbit.com'}>`,
      to: customerEmail,
      subject: `Order Cancelled - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order rejection email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order rejection email:', error);
  }
}

// Send order completion email to customer
export async function sendOrderCompletionEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
    deliveredAt: string;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    
    if (!settings.emailEnabled || (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD)) {
      console.log('Email notifications disabled');
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Delivered!</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Congratulations! Your order <strong>${orderDetails.orderNumber}</strong> has been successfully delivered and completed.</p>
          
          <div style="background: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px;">Delivery Confirmation</h3>
            <p style="color: #5b21b6; margin: 10px 0;">Order Number: <strong>${orderDetails.orderNumber}</strong></p>
            <p style="color: #5b21b6; margin: 10px 0;">Delivered On: <strong>${orderDetails.deliveredAt}</strong></p>
            <p style="color: #5b21b6; margin: 10px 0;">Order Value: <strong>$${orderDetails.total}</strong></p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h4 style="color: #166534; margin-top: 0;">Thank you for choosing us!</h4>
            <p style="color: #166534; margin: 5px 0;">We hope you're satisfied with your purchase. Your business means the world to us.</p>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions about your delivered order or need support, please don't hesitate to contact us.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #374151; margin: 0;">Best regards,</p>
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">${settings.siteName || 'InnovanceOrbit'} Team</p>
          </div>
        </div>
      </div>
    `;

    const transporter = await createMicrosoft365Transporter();
    
    await transporter.sendMail({
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || 'info@innovanceorbit.com'}>`,
      to: customerEmail,
      subject: `Order Delivered - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order completion email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order completion email:', error);
  }
}
