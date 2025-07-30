# Hostinger Deployment Instructions

## Files Ready for Upload
Your deployment package is ready in the `hostinger-deployment` folder.

## Next Steps:

### 1. Database Setup
- Create a PostgreSQL database in Hostinger hPanel
- Import your schema using the database export feature in admin panel
- Update DATABASE_URL in .env file

### 2. Upload Files
- Compress the `hostinger-deployment` folder contents
- Upload to your public_html directory via Hostinger File Manager
- Extract the files

### 3. Configure Node.js App
- Go to hPanel > Advanced > Node.js
- Create new Node.js application
- Set entry point to: `dist/index.js`
- Install dependencies: `npm install --production`

### 4. Environment Variables
- Upload the .env file to your application root
- Update all placeholder values with your actual credentials

### 5. File Permissions
- Set uploads directory permissions to 755 or 777
- Ensure Node.js app has write access to uploads folder

### 6. Domain Configuration
- Point your domain to the Node.js application
- Configure SSL certificate if needed

## Troubleshooting
- Check Node.js app logs in hPanel
- Verify database connection string
- Ensure all environment variables are set
- Check file permissions for uploads

## Support
Contact Hostinger support for hosting-specific issues.
