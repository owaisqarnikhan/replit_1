import nodemailer from 'nodemailer';
import { storage } from './storage';

// Multi-provider SMTP Configuration
export async function createSMTPTransporter() {
  const settings = await storage.getSiteSettings();
  
  const smtpUser = settings.smtpUser;
  const smtpPassword = settings.smtpPassword;
  const provider = settings.smtpProvider || 'microsoft365';
  
  if (!smtpPassword || !smtpUser) {
    throw new Error('SMTP username and password must be configured.');
  }

  console.log(`Creating ${provider.toUpperCase()} SMTP transporter...`);

  // Base configuration
  const baseConfig = {
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  };

  // Provider-specific configurations
  let config;
  
  if (provider === 'microsoft365') {
    config = {
      ...baseConfig,
      host: settings.smtpHost || 'smtp.office365.com',
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    };
  } else if (provider === 'gmail') {
    config = {
      ...baseConfig,
      host: settings.smtpHost || 'smtp.gmail.com',
      tls: {
        rejectUnauthorized: false
      }
    };
  } else {
    // Custom SMTP
    config = {
      ...baseConfig,
      tls: {
        rejectUnauthorized: false
      }
    };
  }

  try {
    const transporter = nodemailer.createTransporter(config);
    await transporter.verify();
    console.log(`${provider.toUpperCase()} SMTP connected successfully`);
    return transporter;
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} SMTP Configuration Error:`, error.message);
    
    // Provider-specific error handling
    if (provider === 'microsoft365' && 
        (error.message.includes('Authentication unsuccessful') || 
         error.message.includes('SmtpClientAuthentication is disabled'))) {
      throw new Error(`SMTP Authentication Disabled: Your Microsoft 365 tenant has SMTP authentication disabled. Please enable it in the Microsoft 365 Admin Center under Security & Compliance > Basic Authentication policies, or contact your IT administrator.`);
    } else if (provider === 'gmail' && error.message.includes('Invalid login')) {
      throw new Error(`Gmail Authentication Failed: Please ensure you're using an App Password (not your regular password) and that 2-factor authentication is enabled on your Google account.`);
    } else if (error.message.includes('Invalid login')) {
      throw new Error(`Invalid Credentials: Please verify your email address and password are correct for ${provider}.`);
    } else {
      throw new Error(`SMTP Setup Failed for ${provider}: ${error.message}`);
    }
  }
}

// Legacy function for backward compatibility
export async function createMicrosoft365Transporter() {
  return createSMTPTransporter();
}

// Test email function with multi-provider support
export async function testMicrosoft365Connection(): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = await createSMTPTransporter();
    const settings = await storage.getSiteSettings();
    const provider = settings.smtpProvider || 'microsoft365';
    
    const testEmail = {
      from: `"${settings.smtpFromName || 'InnovanceOrbit'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
      to: settings.adminEmail || settings.smtpUser || 'info@innovanceorbit.com',
      subject: `SMTP Test - ${provider.toUpperCase()} - InnovanceOrbit`,
      text: `This is a test email to verify ${provider.toUpperCase()} SMTP configuration.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">SMTP Test Successful!</h2>
          <p>Your <strong>${provider.toUpperCase()}</strong> SMTP configuration is working correctly.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>Provider:</strong> ${provider.toUpperCase()}</li>
              <li><strong>Host:</strong> ${settings.smtpHost}</li>
              <li><strong>Port:</strong> ${settings.smtpPort}</li>
              <li><strong>From Email:</strong> ${settings.smtpFromEmail || settings.smtpUser}</li>
            </ul>
          </div>
          
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>Your email system is ready to send notifications!</p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    return { 
      success: true, 
      message: `Test email sent successfully using ${provider.toUpperCase()} SMTP!` 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: `SMTP Test Failed: ${error.message}` 
    };
  }
}

// Email validation helper with multi-provider support
export function validateEmailConfig(settings: any): { valid: boolean; errors: string[] } {
  const errors = [];
  const provider = settings.smtpProvider || 'microsoft365';
  
  if (!settings.smtpFromEmail && !settings.smtpUser) {
    errors.push('SMTP From Email is required');
  }
  
  if (!settings.smtpPassword) {
    if (provider === 'gmail') {
      errors.push('Gmail App Password is required (not your regular password)');
    } else if (provider === 'microsoft365') {
      errors.push('Microsoft 365 App Password is required (for MFA-enabled accounts)');
    } else {
      errors.push('SMTP Password is required');
    }
  }
  
  if (!settings.adminEmail) {
    errors.push('Admin Email is required for notifications');
  }

  if (provider === 'custom' && (!settings.smtpHost || !settings.smtpPort)) {
    errors.push('Custom SMTP requires Host and Port configuration');
  }

  return { valid: errors.length === 0, errors };
}