# Email Configuration Guide for InnovanceOrbit

## Overview
InnovanceOrbit uses Microsoft 365 SMTP for sending order notifications. This guide explains how to configure email notifications for the complete order approval workflow.

## Order Email Workflow

### 1. Order Submission (Customer)
When a customer submits an order:
- Customer receives "Order Received - Awaiting Approval" email
- Payment methods are locked until admin approval
- Admin receives notification email about new order request

### 2. Order Approval (Admin)
When admin approves an order:
- Customer receives "Order Approved - Payment Required" email
- Payment methods are unlocked for customer
- Customer can proceed with payment

### 3. Payment Completion (Customer)  
When customer completes payment:
- Customer receives "Order Confirmed - Being Prepared" email
- Order status changes to "processing"

### 4. Order Delivery (Admin)
When admin marks order as delivered:
- Customer receives "Order Delivered Successfully" email
- Order lifecycle is complete

## Microsoft 365 SMTP Configuration

### Option 1: Environment Variables (Recommended for Production)
Add these to your `.env` file:
```
MICROSOFT365_EMAIL_USER=your-email@yourdomain.com
MICROSOFT365_EMAIL_PASSWORD=your-app-password
```

### Option 2: Admin Dashboard Settings
1. Login as admin
2. Go to Admin Dashboard > Settings tab
3. Configure SMTP settings:
   - **SMTP Host**: smtp.office365.com
   - **SMTP Port**: 587
   - **From Email**: your-email@yourdomain.com
   - **From Name**: InnovanceOrbit
   - **SMTP Password**: Your Microsoft 365 app password
   - **Admin Email**: admin@yourdomain.com
   - **Enable Email Notifications**: Yes

## Setting Up Microsoft 365 App Password

### Step 1: Enable 2FA (Required)
1. Sign in to your Microsoft 365 account
2. Go to Security settings
3. Enable Two-Factor Authentication

### Step 2: Create App Password
1. Go to Security > Advanced security options
2. Select "App passwords"
3. Click "Create a new app password"
4. Name it "InnovanceOrbit SMTP"
5. Copy the generated password (use this in SMTP settings)

### Step 3: Enable SMTP Authentication
1. Go to Microsoft 365 Admin Center
2. Navigate to Settings > Mail flow
3. Enable "SMTP AUTH" for your mailbox
4. Or contact your IT administrator to enable SMTP authentication

## Common Issues & Solutions

### Issue: "Authentication unsuccessful, SmtpClientAuthentication is disabled"
**Solution**: Enable SMTP authentication in Microsoft 365 Admin Center or use an app password.

### Issue: "Invalid login credentials"
**Solution**: 
- Use app password instead of regular password
- Ensure 2FA is enabled on the account
- Verify the email address is correct

### Issue: "Connection timeout"
**Solution**:
- Check firewall settings (allow port 587)
- Verify network connectivity
- Try using port 25 or 465 as alternative

## Testing Email Configuration

### Development Testing
1. Configure SMTP settings in Admin Dashboard
2. Submit a test order as a customer
3. Check server logs for email status
4. Verify emails are sent (check spam folder)

### Production Deployment
1. Set environment variables in your hosting platform
2. Configure domain-specific email address
3. Set up SPF/DKIM records for better delivery
4. Test the complete order workflow

## Security Best Practices

1. **Never commit passwords to git**
2. **Use app passwords, not regular passwords**
3. **Enable 2FA on email accounts**
4. **Use domain-specific email addresses**
5. **Monitor email delivery logs**

## Alternative Email Services

If Microsoft 365 doesn't work, you can modify the code to use:
- **SendGrid** (API-based, more reliable)
- **Amazon SES** (AWS service)
- **Gmail SMTP** (with app passwords)
- **Mailgun** (Transactional email service)

## Deployment Checklist

- [ ] SMTP credentials configured
- [ ] App password generated
- [ ] SMTP authentication enabled
- [ ] Test order workflow complete
- [ ] Email templates customized
- [ ] Admin email address configured
- [ ] Domain SPF/DKIM records set up
- [ ] Production email testing completed

## Support

For deployment support and email configuration assistance, refer to:
- Microsoft 365 Admin Documentation
- Your hosting provider's email guides
- InnovanceOrbit deployment documentation