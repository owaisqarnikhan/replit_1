import nodemailer from 'nodemailer';
import { storage } from './storage';

// Microsoft 365 SMTP Configuration
export async function createMicrosoft365Transporter() {
  const settings = await storage.getSiteSettings();
  
  // Use admin-configured SMTP settings
  const smtpUser = settings.smtpUser || 'itsupport@bayg.bh';
  const smtpPassword = settings.smtpPassword;
  
  if (!smtpPassword) {
    throw new Error('SMTP password not configured. Please set it in Admin Settings or environment variables.');
  }

  // Primary Microsoft 365 configuration
  const primaryConfig = {
    host: settings.smtpHost || 'smtp.office365.com',
    port: settings.smtpPort || 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  };

  // Fallback configuration with alternative host
  const fallbackConfig = {
    host: 'smtp-mail.outlook.com', // Alternative Microsoft 365 host
    port: settings.smtpPort || 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPassword,
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
      
      // Provide specific guidance for common SMTP authentication issues
      if (fallbackError.message.includes('Authentication unsuccessful') || 
          fallbackError.message.includes('SmtpClientAuthentication is disabled')) {
        throw new Error(`SMTP Authentication Disabled: Your Microsoft 365 tenant has SMTP authentication disabled. Please enable it in the Microsoft 365 Admin Center under Security & Compliance > Basic Authentication policies, or contact your IT administrator.`);
      } else if (fallbackError.message.includes('Invalid login')) {
        throw new Error(`Invalid Credentials: Please verify your email address and app password are correct.`);
      } else {
        throw new Error(`SMTP Setup Required: ${fallbackError.message}`);
      }
    }
  }
}

// Test email function
export async function testMicrosoft365Connection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createMicrosoft365Transporter();
    const settings = await storage.getSiteSettings();
    
    const testEmail = {
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
      to: settings.adminEmail || settings.smtpUser || 'info@innovanceorbit.com',
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
  
  if (!settings.smtpFromEmail && !settings.smtpUser) {
    errors.push('SMTP From Email is required');
  }
  
  if (!settings.smtpPassword) {
    errors.push('SMTP Password is required (use App Password for MFA-enabled accounts)');
  }
  
  if (!settings.adminEmail) {
    errors.push('Admin Email is required for notifications');
  }

  return { valid: errors.length === 0, errors };
}