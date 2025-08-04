import { storage } from "./storage";
import { createMicrosoft365Transporter, validateMicrosoft365Config } from './smtp-config';

// Order Approval Status Types
export type OrderApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'awaiting_approval' | 'approved' | 'rejected' | 'payment_pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Email workflow functions for order approval process
export async function sendOrderSubmissionEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
  }
): Promise<void> {
  try {
    const emailValidation = validateMicrosoft365Config();
    
    if (!emailValidation.valid) {
      console.log('Microsoft 365 email not configured');
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #f59e0b; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Submitted for Approval</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Thank you for submitting your order <strong>${orderDetails.orderNumber}</strong>. Your order is now awaiting admin approval.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">Order Status: Awaiting Approval</h3>
            <p style="color: #92400e; margin: 10px 0;">Order Number: <strong>${orderDetails.orderNumber}</strong></p>
            <p style="color: #92400e; margin: 10px 0;">Order Total: <strong>$${orderDetails.total}</strong></p>

          </div>
          
          <div style="background: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h4 style="color: #5b21b6; margin-top: 0;">What happens next?</h4>
            <ul style="color: #5b21b6; margin: 10px 0; padding-left: 20px;">
              <li>Our admin team will review your order within 24 hours</li>
              <li>You'll receive an email notification once approved</li>
              <li>Payment options will be unlocked after approval</li>
              <li>Your order will then be processed and shipped</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Please note that payment methods are currently locked until admin approval. You can track your order status in your account dashboard.
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
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: customerEmail,
      subject: `Order Submitted - Awaiting Approval - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order submission email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order submission email:', error);
  }
}

// Send admin notification when new order needs approval
export async function sendAdminOrderNotification(
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: string;
    shippingAddress: any;
    items: Array<{
      productName: string;
      quantity: number;
      price: string;
    }>;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    const emailValidation = validateMicrosoft365Config();
    
    if (!settings.emailEnabled || !emailValidation.valid || !settings.adminEmail) {
      console.log('Admin notification email disabled:', emailValidation.errors.join(', '));
      return;
    }

    const itemsHtml = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #374151;">${item.productName}</td>
        <td style="padding: 12px; text-align: center; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #374151; font-weight: 600;">$${item.price}</td>
      </tr>
    `).join('');

    const adminEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 New Order Requires Approval</h1>
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

    const transporter = await createMicrosoft365Transporter();
    
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

// Send order approval email to customer
export async function sendOrderApprovalEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
    paymentMethod?: string;
    adminRemarks?: string;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    const emailValidation = validateMicrosoft365Config();
    
    if (!settings.emailEnabled || !emailValidation.valid) {
      console.log('Order approval email disabled:', emailValidation.errors.join(', '));
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #10b981; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Approved!</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Great news! Your order <strong>${orderDetails.orderNumber}</strong> has been approved by our admin team.</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">Next Step: Payment Processing</h3>
            <p style="color: #065f46; margin: 10px 0; font-weight: 600;">Please proceed with payment to complete your order.</p>
            <p style="color: #047857; margin: 10px 0;">Total Amount: <strong>$${orderDetails.total}</strong></p>
            ${orderDetails.paymentMethod ? `<p style="color: #047857; margin: 10px 0;">Payment Method: <strong>${orderDetails.paymentMethod}</strong></p>` : ''}
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

// Send payment confirmation email to customer
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    customerName: string;
    total: string;
    paymentMethod: string;
  }
): Promise<void> {
  try {
    const settings = await storage.getSiteSettings();
    const emailValidation = validateMicrosoft365Config();
    
    if (!settings.emailEnabled || !emailValidation.valid) {
      console.log('Payment confirmation email disabled:', emailValidation.errors.join(', '));
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #2563eb; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Payment Confirmed!</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">Thank you! Your payment for order <strong>${orderDetails.orderNumber}</strong> has been successfully processed.</p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #1d4ed8; margin-top: 0; font-size: 18px;">Order Confirmed</h3>
            <p style="color: #1d4ed8; margin: 10px 0;">Order Number: <strong>${orderDetails.orderNumber}</strong></p>
            <p style="color: #1d4ed8; margin: 10px 0;">Payment Amount: <strong>$${orderDetails.total}</strong></p>
            <p style="color: #1d4ed8; margin: 10px 0;">Payment Method: <strong>${orderDetails.paymentMethod}</strong></p>
            <p style="color: #1d4ed8; margin: 10px 0;">Status: <strong>Being Prepared for Delivery</strong></p>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h4 style="color: #166534; margin-top: 0;">What's Next?</h4>
            <p style="color: #166534; margin: 10px 0;">• Your order is now being prepared for pickup/delivery</p>
            <p style="color: #166534; margin: 10px 0;">• We'll contact you when ready</p>
            <p style="color: #166534; margin: 10px 0;">• Thank you for your business!</p>
          </div>
          
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
      subject: `Payment Confirmed - Order Being Prepared - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Payment confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
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
    const emailValidation = validateMicrosoft365Config();
    
    if (!settings.emailEnabled || !emailValidation.valid) {
      console.log('Order rejection email disabled:', emailValidation.errors.join(', '));
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Not Approved</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${orderDetails.customerName},</p>
          
          <p style="color: #374151; line-height: 1.6;">We regret to inform you that your order <strong>${orderDetails.orderNumber}</strong> has not been approved by our admin team.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">Order Status: Rejected</h3>
            <p style="color: #991b1b; margin: 10px 0;">Order Number: <strong>${orderDetails.orderNumber}</strong></p>
            <p style="color: #991b1b; margin: 10px 0;">Order Value: <strong>$${orderDetails.total}</strong></p>
          </div>
          
          ${orderDetails.adminRemarks ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0;">Reason for Rejection:</h4>
              <p style="color: #6b7280; font-style: italic;">"${orderDetails.adminRemarks}"</p>
            </div>
          ` : ''}
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0c4a6e; margin-top: 0;">What can you do next?</h4>
            <ul style="color: #0c4a6e; margin: 10px 0; padding-left: 20px;">
              <li>Review the reason provided above</li>
              <li>Contact us if you have questions</li>
              <li>Consider placing a new order with the necessary adjustments</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions about this decision or need clarification, please don't hesitate to contact our support team.
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
      subject: `Order Not Approved - ${orderDetails.orderNumber}`,
      html: emailTemplate,
    });

    console.log(`Order rejection email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order rejection email:', error);
  }
}

// Send delivery confirmation email to customer
export async function sendDeliveryConfirmationEmail(
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
    const emailValidation = validateMicrosoft365Config();
    
    if (!settings.emailEnabled || !emailValidation.valid) {
      console.log('Delivery confirmation email disabled:', emailValidation.errors.join(', '));
      return;
    }

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #7c3aed; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Delivered Successfully!</h1>
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

    console.log(`Delivery confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send delivery confirmation email:', error);
  }
}