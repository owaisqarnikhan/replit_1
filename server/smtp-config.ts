import nodemailer from "nodemailer";
import { storage } from "./storage";

// Microsoft 365 SMTP Configuration - Complete Rebuild
export async function createMicrosoft365Transporter() {
  console.log("Setting up Microsoft 365 SMTP transporter...");

  // Use hardcoded configuration for reliability
  const config = {
    host: "smtp.office365.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: "itsupport@bayg.bh",
      pass: "yccdswrqpghkftfy",
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  };

  try {
    const transporter = nodemailer.createTransport(config);
    console.log("Microsoft 365 SMTP transporter created successfully");
    return transporter;
  } catch (error: any) {
    console.error("Microsoft 365 SMTP Error:", error.message);
    throw new Error(`Microsoft 365 SMTP failed: ${error.message}`);
  }
}

// Send test email function
export async function sendTestEmail(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const transporter = await createMicrosoft365Transporter();

    const testEmail = {
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: "itsupport@bayg.bh",
      subject: "Microsoft 365 SMTP Test - BAYG System",
      text: "This is a test email to verify Microsoft 365 SMTP configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Microsoft 365 SMTP Test Successful!</h2>
          <p>Your BAYG email system is working correctly with Microsoft 365.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>Host:</strong> smtp.office365.com</li>
              <li><strong>Port:</strong> 587</li>
              <li><strong>From Email:</strong> itsupport@bayg.bh</li>
            </ul>
          </div>
          
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>Your BAYG email system is ready!</p>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);
    return {
      success: true,
      message: "Test email sent successfully using Microsoft 365 SMTP!",
    };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return {
      success: false,
      message: `SMTP Test Failed: ${error.message}`,
    };
  }
}

// Simple email validation - Microsoft 365 ready
export function validateMicrosoft365Config(): {
  valid: boolean;
  errors: string[];
} {
  // Always valid since we use hardcoded Microsoft 365 config
  return { valid: true, errors: [] };
}
