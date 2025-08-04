import nodemailer from "nodemailer";
import { createSMTPTransporter } from "./microsoft365-smtp";

// Comprehensive email diagnostic system
export async function runEmailDiagnostics() {
  const results = {
    connectionTest: false,
    authTest: false,
    sendTest: false,
    errors: [] as string[],
    success: false,
    message: "",
  };

  try {
    // Test 1: Create transporter
    console.log("🔍 Testing SMTP transporter creation...");
    const transporter = await createSMTPTransporter();
    results.connectionTest = true;
    console.log("✅ Transporter created successfully");

    // Test 2: Verify connection and authentication
    console.log("🔍 Testing SMTP authentication...");
    await transporter.verify();
    results.authTest = true;
    console.log("✅ SMTP authentication successful");

    // Test 3: Send actual test email
    console.log("🔍 Sending test email...");
    const testEmail = {
      from: '"BAYG System Test" <itsupport@bayg.bh>',
      to: "itsupport@bayg.bh",
      subject: `[BAYG] Email Test - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">🧪 BAYG Email System Test</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Test Results:</h3>
            <ul style="color: #374151;">
              <li>✅ SMTP Connection: Successful</li>
              <li>✅ Authentication: Verified</li>
              <li>✅ Email Delivery: In Progress</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="color: #065f46; margin: 0;">
              <strong>If you receive this email, your BAYG email system is working correctly!</strong>
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              Test sent at: ${new Date().toISOString()}<br>
              From: Microsoft 365 SMTP (smtp.office365.com:587)
            </p>
          </div>
        </div>
      `,
      text: `BAYG Email System Test - If you receive this email, your system is working! Test sent at: ${new Date().toISOString()}`,
    };

    const info = await transporter.sendMail(testEmail);
    results.sendTest = true;
    results.success = true;
    results.message = `Email sent successfully! Message ID: ${info.messageId}`;
    console.log("✅ Test email sent successfully:", info.messageId);

  } catch (error: any) {
    console.error("❌ Email diagnostic failed:", error);
    results.errors.push(error.message);
    results.message = `Email diagnostic failed: ${error.message}`;
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes("authentication") || error.message.includes("auth")) {
      results.errors.push("Authentication issue: Check if app password is correct and SMTP auth is enabled");
    }
    if (error.message.includes("connection") || error.message.includes("ECONNREFUSED")) {
      results.errors.push("Connection issue: Check firewall settings and network connectivity");
    }
    if (error.message.includes("timeout")) {
      results.errors.push("Timeout issue: Network may be blocking SMTP traffic");
    }
  }

  return results;
}

// Send test email to a specific address
export async function sendTestEmailToAddress(email: string) {
  try {
    const transporter = await createSMTPTransporter();
    
    const testEmail = {
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: email,
      subject: `BAYG Email Test to ${email} - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">✉️ BAYG Email System Test</h2>
          <p>This is a test email sent to <strong>${email}</strong> from the BAYG system.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Configuration Details:</h4>
            <ul>
              <li>Provider: Microsoft 365</li>
              <li>Host: smtp.office365.com</li>
              <li>Port: 587</li>
              <li>From: itsupport@bayg.bh</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Test sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    return {
      success: true,
      message: `Test email sent to ${email}! Message ID: ${info.messageId}`,
      messageId: info.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to send test email to ${email}: ${error.message}`,
      error: error.message,
    };
  }
}