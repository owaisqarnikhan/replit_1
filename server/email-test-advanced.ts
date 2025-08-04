import nodemailer from 'nodemailer';

// Advanced email testing with multiple authentication methods
export async function testEmailWithAlternatives() {
  const testResults: any[] = [];
  
  // Test 1: Basic Auth (current method)
  try {
    console.log('Testing Method 1: Basic Authentication...');
    const transporter1 = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'itsupport@bayg.bh',
        pass: 'zlyfshvfklwrrclm',
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
    
    await transporter1.verify();
    testResults.push({ method: 'Basic Auth', status: 'Success', error: null });
  } catch (error: any) {
    testResults.push({ 
      method: 'Basic Auth', 
      status: 'Failed', 
      error: error.message,
      suggestion: 'SMTP authentication disabled by organization'
    });
  }

  // Test 2: OAuth2 Alternative (requires different setup)
  try {
    console.log('Testing Method 2: Alternative SMTP settings...');
    const transporter2 = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 25,  // Alternative port
      secure: false,
      auth: {
        user: 'itsupport@bayg.bh',
        pass: 'zlyfshvfklwrrclm',
      },
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      }
    });
    
    await transporter2.verify();
    testResults.push({ method: 'Alternative Port 25', status: 'Success', error: null });
  } catch (error: any) {
    testResults.push({ 
      method: 'Alternative Port 25', 
      status: 'Failed', 
      error: error.message
    });
  }

  // Test 3: Gmail fallback (if user provides credentials)
  try {
    console.log('Testing Method 3: Gmail fallback test...');
    // This would require Gmail credentials - placeholder for now
    testResults.push({ 
      method: 'Gmail Fallback', 
      status: 'Not Configured', 
      error: null,
      suggestion: 'Gmail credentials not provided'
    });
  } catch (error: any) {
    testResults.push({ 
      method: 'Gmail Fallback', 
      status: 'Failed', 
      error: error.message
    });
  }

  return {
    summary: 'Email system diagnosis complete',
    totalTests: testResults.length,
    successful: testResults.filter(r => r.status === 'Success').length,
    results: testResults,
    recommendations: [
      'Contact IT administrator to enable SMTP authentication for bayg.bh domain',
      'Request a dedicated service account with SMTP permissions',
      'Consider using Gmail as temporary alternative',
      'Set up Microsoft Graph API for email sending (modern approach)'
    ]
  };
}

// Mock email function for testing UI without actual sending
export async function sendMockTestEmail(to: string, testType: string = 'admin') {
  console.log(`Mock email test: Sending ${testType} email to ${to}`);
  
  // Simulate email content based on test type
  const emailContent = {
    admin: {
      subject: 'Admin Test Email - BAYG System',
      body: 'This is a test email from the BAYG admin system. Email functionality is being tested.'
    },
    order: {
      subject: 'Order Confirmation Test - BAYG',
      body: 'This is a test order confirmation email from BAYG system.'
    },
    notification: {
      subject: 'System Notification Test - BAYG',
      body: 'This is a test system notification from BAYG.'
    }
  };

  const content = emailContent[testType as keyof typeof emailContent] || emailContent.admin;
  
  return {
    success: true,
    message: `Mock email sent successfully`,
    details: {
      to,
      subject: content.subject,
      timestamp: new Date().toISOString(),
      testType,
      note: 'This is a simulated email test - no actual email was sent due to SMTP authentication restrictions'
    }
  };
}