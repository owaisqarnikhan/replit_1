import nodemailer from "nodemailer";

// Microsoft 365 SMTP - Single Provider Configuration
// Hardcoded for maximum reliability and simplicity
export async function createSMTPTransporter() {
  console.log("Creating Microsoft 365 SMTP transporter...");

  const config = {
    host: "smtp.office365.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: "itsupport@bayg.bh",
      pass: "yccdswrqpghkftfy", // Microsoft 365 App Password
    },
    debug: true, // Enable debug for troubleshooting
    logger: true, // Enable logging
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  };

  try {
    const transporter = nodemailer.createTransport(config);
    console.log("Microsoft 365 SMTP transporter ready");
    return transporter;
  } catch (error: any) {
    console.error("Microsoft 365 SMTP Error:", error.message);
    throw new Error(`Microsoft 365 SMTP failed: ${error.message}`);
  }
}

// Send test email using Microsoft 365
export async function sendTestEmail(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const transporter = await createSMTPTransporter();

    const testEmail = {
      from: '"BAYG System" <itsupport@bayg.bh>',
      to: ["itsupport@bayg.bh", "admin@bayg.bh"], // Send to multiple addresses for testing
      subject: `Microsoft 365 SMTP Test - ${new Date().toISOString()}`,
      text: "Microsoft 365 SMTP is working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Microsoft 365 SMTP Test Successful!</h2>
          <p>Your BAYG email system is configured and ready.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration:</h3>
            <ul>
              <li><strong>Provider:</strong> Microsoft 365</li>
              <li><strong>Host:</strong> smtp.office365.com</li>
              <li><strong>Port:</strong> 587</li>
              <li><strong>From:</strong> itsupport@bayg.bh</li>
            </ul>
          </div>
          
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>System ready for order confirmations and notifications!</p>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);
    return {
      success: true,
      message: "Microsoft 365 SMTP test successful!",
    };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return {
      success: false,
      message: `SMTP Test Failed: ${error.message}`,
    };
  }
}

// Validate Microsoft 365 configuration
export async function validateMicrosoft365Config(): Promise<{
  isValid: boolean;
  message: string;
}> {
  try {
    const transporter = await createSMTPTransporter();
    await transporter.verify();
    
    return {
      isValid: true,
      message: "Microsoft 365 SMTP configuration is valid",
    };
  } catch (error: any) {
    console.error("Microsoft 365 validation error:", error);
    return {
      isValid: false,
      message: `Microsoft 365 SMTP configuration error: ${error.message}`,
    };
  }
}