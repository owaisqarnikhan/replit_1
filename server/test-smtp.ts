import nodemailer from 'nodemailer';
import { storage } from './storage';

export async function testSMTP() {
  try {
    // Get current SMTP settings from database
    const settings = await storage.getSiteSettings();
    
    if (!settings.emailEnabled) {
      throw new Error('Email is disabled in settings');
    }

    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      throw new Error('SMTP configuration is incomplete');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const testEmail = {
      from: `"${settings.smtpFromName}" <${settings.smtpFromEmail}>`,
      to: settings.adminEmail || settings.smtpUser,
      subject: 'SMTP Test - InnovanceOrbit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SMTP Test Successful!</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>SMTP Configuration Details:</h3>
            <ul>
              <li><strong>Host:</strong> ${settings.smtpHost}</li>
              <li><strong>Port:</strong> ${settings.smtpPort}</li>
              <li><strong>From Email:</strong> ${settings.smtpFromEmail}</li>
              <li><strong>From Name:</strong> ${settings.smtpFromName}</li>
            </ul>
          </div>
          
          <p>Your email system is now ready to send order confirmations and notifications.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            This test was sent from ${settings.siteName || 'InnovanceOrbit'}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `
SMTP Test Successful!

This is a test email to verify that your SMTP configuration is working correctly.

SMTP Configuration Details:
- Host: ${settings.smtpHost}
- Port: ${settings.smtpPort}
- From Email: ${settings.smtpFromEmail}
- From Name: ${settings.smtpFromName}

Your email system is now ready to send order confirmations and notifications.

This test was sent from ${settings.siteName || 'InnovanceOrbit'}
Time: ${new Date().toLocaleString()}
      `
    };

    const result = await transporter.sendMail(testEmail);
    
    return {
      success: true,
      message: 'Test email sent successfully!',
      messageId: result.messageId,
      recipient: testEmail.to
    };

  } catch (error) {
    console.error('SMTP Test Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error
    };
  }
}