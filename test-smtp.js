import nodemailer from 'nodemailer';

// Test SMTP configuration
async function testSMTP() {
  console.log('Testing SMTP configuration...');
  
  try {
    // Create test transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    console.log('SMTP User:', process.env.SMTP_USER ? 'Set' : 'Not set');
    console.log('SMTP Pass:', process.env.SMTP_PASS ? 'Set' : 'Not set');

    // Verify connection
    const isConnected = await transporter.verify();
    console.log('SMTP Connection:', isConnected ? 'Success' : 'Failed');

    // Send test email
    if (isConnected) {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER, // Send to self for testing
        subject: 'SMTP Test Email',
        text: 'This is a test email to verify SMTP configuration.',
        html: '<p>This is a test email to verify SMTP configuration.</p>'
      });
      
      console.log('Test email sent:', info.messageId);
    }
    
  } catch (error) {
    console.error('SMTP Test Failed:', error.message);
    
    if (error.message.includes('Authentication unsuccessful')) {
      console.log('\n🔧 SMTP Authentication Fix:');
      console.log('1. Go to Microsoft 365 Admin Center');
      console.log('2. Go to Exchange Admin Center');
      console.log('3. Enable "Authenticated SMTP" for your tenant');
      console.log('4. Or use an App Password instead of regular password');
    }
  }
}

testSMTP();