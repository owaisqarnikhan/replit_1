# Microsoft 365 SMTP Authentication Troubleshooting Guide

## Current Issue
Your Microsoft 365 tenant has SMTP authentication disabled, which prevents the application from sending emails through the `itsupport@bayg.bh` account.

**Error:** `535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant`

## Solution Options

### Option 1: Enable SMTP Authentication (IT Administrator Required)
Your IT administrator needs to enable SMTP authentication in Microsoft 365:

1. **Access Microsoft 365 Admin Center**
   - Go to [Microsoft 365 Admin Center](https://admin.microsoft.com)
   - Navigate to "Settings" > "Security & privacy"

2. **Enable SMTP Authentication**
   - Go to "Exchange Admin Center"
   - Navigate to "Settings" > "Mail flow" > "Accepted domains"
   - Or use PowerShell commands:

```powershell
# Connect to Exchange Online
Connect-ExchangeOnline

# Enable SMTP AUTH for the specific user
Set-CasMailbox -Identity "itsupport@bayg.bh" -SmtpClientAuthenticationDisabled $false

# Or enable SMTP AUTH tenant-wide (less secure)
Set-TransportConfig -SmtpClientAuthenticationDisabled $false
```

### Option 2: Use Application-Specific Password
If MFA is enabled, create an app-specific password:

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Select "Additional security options"
3. Under "App passwords", create a new password
4. Use this app password instead of your regular password

### Option 3: Alternative Email Service
Consider using a different email service that supports SMTP:

#### Gmail SMTP (Alternative)
- Host: `smtp.gmail.com`
- Port: `587`
- Use App Password for Gmail accounts with 2FA

#### Custom SMTP Service
- Use a dedicated email service like:
  - Amazon SES
  - Mailgun
  - Postmark

## Current Configuration Status
- **SMTP Host:** smtp.office365.com
- **SMTP Port:** 587
- **SMTP User:** itsupport@bayg.bh
- **From Email:** itsupport@bayg.bh
- **From Name:** Rate Card - Bahrain Asian Youth Games 2025

## Next Steps
1. **Contact your IT administrator** to enable SMTP authentication for the `itsupport@bayg.bh` account
2. **Provide them this document** with the PowerShell commands above
3. **Test the connection** again once changes are made
4. **Alternative:** Switch to a different email service if organizational policies prevent SMTP authentication

## Testing the Fix
Once your IT administrator makes the changes:
1. Go to Admin Settings > Email tab
2. Click "Send Test Email"
3. Check the recipient inbox for the test email

## Support Information
- **Microsoft Documentation:** [SMTP AUTH and Modern Authentication](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-smtp)
- **Error Reference:** Error 535 5.7.139 indicates tenant-level SMTP authentication is disabled