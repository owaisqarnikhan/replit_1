import nodemailer from 'nodemailer';
import { storage } from './storage';

// Microsoft 365 SMTP Configuration
export async function createMicrosoft365Transporter() {
  const settings = await storage.getSiteSettings();
  
  // Primary Microsoft 365 configuration
  const primaryConfig = {
    service: 'outlook', // Use service instead of host/port for better compatibility
    auth: {
      user: settings.smtpFromEmail || process.env.MICROSOFT365_EMAIL_USER,
      pass: settings.smtpPassword || process.env.MICROSOFT365_EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  };

  // Fallback configuration with explicit settings
  const fallbackConfig = {
    host: 'smtp-mail.outlook.com', // Alternative host
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: settings.smtpFromEmail || process.env.MICROSOFT365_EMAIL_USER,
      pass: settings.smtpPassword || process.env.MICROSOFT365_EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    requireTLS: true,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  };

  try {
    // Try primary configuration first
    const transporter = nodemailer.createTransport(primaryConfig);
    await transporter.verify();
    console.log('Microsoft 365 SMTP connected successfully (service mode)');
    return transporter;
  } catch (error) {
    console.log('Primary config failed, trying fallback configuration...');
    try {
      const fallbackTransporter = nodemailer.createTransport(fallbackConfig);
      await fallbackTransporter.verify();
      console.log('Microsoft 365 SMTP connected successfully (fallback mode)');
      return fallbackTransporter;
    } catch (fallbackError: any) {
      console.error('Microsoft 365 SMTP Configuration Error:', fallbackError.message);
      throw new Error(`SMTP Setup Required: ${fallbackError.message}`);
    }
  }
}

// Test email function
export async function testMicrosoft365Connection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createMicrosoft365Transporter();
    const settings = await storage.getSiteSettings();
    
    const testEmail = {
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail}>`,
      to: settings.adminEmail || settings.smtpFromEmail || 'test@innovanceorbit.com',
      subject: 'SMTP Test - InnovanceOrbit',
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">SMTP Test Successful!</h2>
          <p>Your Microsoft 365 SMTP configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    return { success: true, message: 'Test email sent successfully' };
  } catch (error: any) {
    return { 
      success: false, 
      message: `SMTP Test Failed: ${error.message}` 
    };
  }
}

// Email validation helper
export function validateEmailConfig(settings: any): { valid: boolean; errors: string[] } {
  const errors = [];
  
  if (!settings.smtpFromEmail && !process.env.MICROSOFT365_EMAIL_USER) {
    errors.push('SMTP From Email is required');
  }
  
  if (!settings.smtpPassword && !process.env.MICROSOFT365_EMAIL_PASSWORD) {
    errors.push('SMTP Password is required (use App Password, not regular password)');
  }
  
  if (!settings.adminEmail) {
    errors.push('Admin Email is required for notifications');
  }

  return { valid: errors.length === 0, errors };
}