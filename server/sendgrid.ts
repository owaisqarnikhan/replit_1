import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Order approval notification emails
export async function sendOrderSubmittedNotification(
  userEmail: string,
  userName: string,
  orderId: string,
  orderTotal: string
): Promise<boolean> {
  const subject = 'Order Request Submitted - Awaiting Admin Approval';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Order Request Submitted</h2>
      <p>Dear ${userName},</p>
      <p>Your order request has been successfully submitted and is awaiting admin approval.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${orderTotal}</p>
        <p><strong>Status:</strong> Pending Admin Approval</p>
      </div>

      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>Important:</strong> Your order is currently locked for payment until admin approval. Once approved, you will receive an email notification and can proceed with payment.</p>
      </div>

      <p>We will review your order request and notify you via email once it has been approved or if we need additional information.</p>
      
      <p>Thank you for your business!</p>
      <p>Best regards,<br>InnovanceOrbit Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@innovanceorbit.com',
    subject,
    html,
    text: `Your order request (${orderId}) has been submitted and is awaiting admin approval. Total: $${orderTotal}. You will receive an email notification once approved.`
  });
}

export async function sendOrderApprovedNotification(
  userEmail: string,
  userName: string,
  orderId: string,
  orderTotal: string,
  adminRemarks?: string
): Promise<boolean> {
  const subject = 'Order Approved - Proceed with Payment';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Order Approved!</h2>
      <p>Dear ${userName},</p>
      <p>Great news! Your order has been approved by our admin team.</p>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
        <h3 style="margin-top: 0; color: #059669;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${orderTotal}</p>
        <p><strong>Status:</strong> Approved - Payment Pending</p>
        ${adminRemarks ? `<p><strong>Admin Notes:</strong> ${adminRemarks}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL ?? 'http://localhost:5000'}/orders/${orderId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Proceed with Payment
        </a>
      </div>

      <p>You can now log in to your account and complete the payment for your order.</p>
      
      <p>Thank you for your business!</p>
      <p>Best regards,<br>InnovanceOrbit Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@innovanceorbit.com',
    subject,
    html,
    text: `Your order (${orderId}) has been approved! Total: $${orderTotal}. You can now proceed with payment. ${adminRemarks ? `Admin notes: ${adminRemarks}` : ''}`
  });
}

export async function sendOrderRejectedNotification(
  userEmail: string,
  userName: string,
  orderId: string,
  orderTotal: string,
  adminRemarks?: string
): Promise<boolean> {
  const subject = 'Order Request Rejected';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Order Request Rejected</h2>
      <p>Dear ${userName},</p>
      <p>We regret to inform you that your order request has been rejected.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #dc2626;">Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${orderTotal}</p>
        <p><strong>Status:</strong> Rejected</p>
        ${adminRemarks ? `<p><strong>Reason:</strong> ${adminRemarks}</p>` : ''}
      </div>

      <p>If you have questions about this rejection or would like to discuss alternative options, please contact our support team.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL ?? 'http://localhost:5000'}/products" 
           style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Continue Shopping
        </a>
      </div>

      <p>Thank you for your understanding.</p>
      <p>Best regards,<br>InnovanceOrbit Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@innovanceorbit.com',
    subject,
    html,
    text: `Your order request (${orderId}) has been rejected. Total: $${orderTotal}. ${adminRemarks ? `Reason: ${adminRemarks}` : ''}`
  });
}