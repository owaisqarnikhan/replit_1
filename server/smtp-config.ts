import nodemailer from 'nodemailer';
import { storage } from './storage';

// Microsoft 365 SMTP Configuration
export async function createSMTPTransporter() {
  const settings = await storage.getSiteSettings();
  
  const smtpUser = settings.smtpUser;
  const smtpPassword = settings.smtpPassword;
  const provider = 'microsoft365'; // Force Microsoft 365 only
  
  if (!smtpPassword || !smtpUser) {
    throw new Error('SMTP username and password must be configured.');
  }

  console.log(`Creating ${provider.toUpperCase()} SMTP transporter...`);

  // Base configuration
  const baseConfig: any = {
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: false, // STARTTLS
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  };

  // Microsoft 365 SMTP configuration only
  const config = {
    ...baseConfig,
    host: settings.smtpHost || 'smtp.office365.com',
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  };

  try {
    const transporter = nodemailer.createTransport(config);
    await transporter.verify();
    console.log(`${provider.toUpperCase()} SMTP connected successfully`);
    return transporter;
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} SMTP Configuration Error:`, error.message);
    
    // Microsoft 365 specific error handling
    if (error.message.includes('Authentication unsuccessful') || 
        error.message.includes('SmtpClientAuthentication is disabled')) {
      throw new Error(`SMTP Authentication Disabled: Your organization (bayg.bh) has disabled SMTP authentication for security. Please contact your IT administrator to enable SMTP authentication in Microsoft 365 Admin Center under Security & Compliance > Basic Authentication policies.`);
    } else if (error.message.includes('Invalid login')) {
      throw new Error(`Invalid Credentials: Please verify your Microsoft 365 email address and password are correct.`);
    } else {
      throw new Error(`Microsoft 365 SMTP Setup Failed: ${error.message}`);
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
    const provider = 'microsoft365'; // Force Microsoft 365 only
    
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
    console.error('SMTP Test Error:', error);
    
    // Microsoft 365 specific error handling
    if (error.message.includes('SmtpClientAuthentication is disabled')) {
      return {
        success: false,
        message: `Microsoft 365 SMTP Authentication Disabled: Your organization has disabled SMTP authentication. Contact your IT administrator to enable it, or use an App Password instead. Visit https://aka.ms/smtp_auth_disabled for more information.`
      };
    }
    
    if (error.message.includes('Invalid login') || error.code === 'EAUTH') {
      return {
        success: false,
        message: `Microsoft 365 Authentication Failed: Please check your email address and password. For accounts with MFA enabled, use an App Password instead of your regular password.`
      };
    }
    
    return { 
      success: false, 
      message: `SMTP Test Failed: ${error.message}` 
    };
  }
}

// Email validation helper for Microsoft 365
export function validateEmailConfig(settings: any): { valid: boolean; errors: string[] } {
  const errors = [];
  const provider = 'microsoft365'; // Force Microsoft 365 only
  
  if (!settings.smtpFromEmail && !settings.smtpUser) {
    errors.push('SMTP From Email is required');
  }
  
  if (!settings.smtpPassword) {
    errors.push('Microsoft 365 Password is required (use regular password or App Password for MFA-enabled accounts)');
  }
  
  if (!settings.adminEmail) {
    errors.push('Admin Email is required for notifications');
  }

  if (!settings.smtpHost || !settings.smtpPort) {
    errors.push('Microsoft 365 SMTP requires Host and Port configuration');
  }

  return { valid: errors.length === 0, errors };
}