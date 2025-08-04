import { storage } from './storage';
import { createMicrosoft365Transporter, validateMicrosoft365Config } from './smtp-config';

// Main email sending function - now uses Microsoft 365 exclusively
export async function sendEmail(to: string, subject: string, htmlContent: string, textContent?: string) {
  try {
    const emailValidation = validateMicrosoft365Config();
    if (!emailValidation.valid) {
      console.log('Email system not configured properly');
      return;
    }
    
    const transporter = await createMicrosoft365Transporter();
    
    const mailOptions = {
      from: '"BAYG System" <itsupport@bayg.bh>',
      to,
      subject: `${subject} - BAYG`,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}:`, result.messageId);
    
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    // Don't throw error, just log it to prevent breaking the application
  }
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
    subtotal: string;
    vatAmount: string;
    vatPercentage: string;
    total: string;
    paymentMethod: string;
    estimatedDeliveryDays: number;
  }
): Promise<void> {
  try {
    const transporter = await createMicrosoft365Transporter();
    
    // Prepare items HTML
    const itemsHtml = orderDetails.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
        </tr>
      `)
      .join('');

    const emailTemplate = `
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
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">BAYG Team</p>
          </div>
        </div>
      </div>
    `;

    // Send to customer
    await transporter.sendMail({
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderNumber}`,
      html: emailTemplate
    });

    // Send notification to admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">New Order Received - ${orderDetails.orderNumber}</h2>
        <p>A new order has been placed on BAYG.</p>
        
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

        <p>Please process this order in the admin dashboard.</p>
      </div>
    `;

    await transporter.sendMail({
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: 'itsupport@bayg.bh',
      subject: `New Order Alert - ${orderDetails.orderNumber}`,
      html: adminHtml
    });

    console.log('Order confirmation emails sent successfully');
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw error to prevent order creation failure
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const emailTransporter = await createMicrosoft365Transporter();
    console.log('Microsoft 365 email connection test passed');
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
    const transporter = await createMicrosoft365Transporter();

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
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">BAYG Team</p>
          </div>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: '"BAYG System" <itsupport@bayg.bh>',
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
    const transporter = await createMicrosoft365Transporter();

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
            <p style="color: #2563eb; font-weight: 600; margin: 5px 0;">BAYG Team</p>
          </div>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: customerEmail,
      subject: `Order Cancelled - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order rejection email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order rejection email:', error);
  }
}