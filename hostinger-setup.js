#!/usr/bin/env node

/**
 * Hostinger Deployment Setup Script
 * This script helps prepare the InnovanceOrbit application for Hostinger deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Preparing InnovanceOrbit for Hostinger deployment...\n');

// Step 1: Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create production environment template
console.log('🔧 Creating production environment template...');
const envTemplate = `# Hostinger Production Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration (Update with your Hostinger database details)
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_here

# Email Configuration (Microsoft 365)
MICROSOFT365_EMAIL_USER=your-email@yourdomain.com
MICROSOFT365_EMAIL_PASSWORD=your_app_password_here

# SendGrid (Alternative email service)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Payment Gateway Keys (Optional)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Application URL
APP_URL=https://yourdomain.com
`;

fs.writeFileSync('.env.production', envTemplate);
console.log('✅ Created .env.production template\n');

// Step 3: Create deployment package structure
console.log('📁 Creating deployment package structure...');
const deploymentDir = 'hostinger-deployment';

if (!fs.existsSync(deploymentDir)) {
  fs.mkdirSync(deploymentDir);
}

// Copy essential files for deployment
const filesToCopy = [
  { src: 'dist', dest: path.join(deploymentDir, 'dist') },
  { src: 'uploads', dest: path.join(deploymentDir, 'uploads') },
  { src: 'package.json', dest: path.join(deploymentDir, 'package.json') },
  { src: 'package-lock.json', dest: path.join(deploymentDir, 'package-lock.json') },
  { src: '.env.production', dest: path.join(deploymentDir, '.env') }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      execSync(`cp -r ${src} ${dest}`, { stdio: 'pipe' });
    } else {
      execSync(`cp ${src} ${dest}`, { stdio: 'pipe' });
    }
    console.log(`✅ Copied ${src} to deployment package`);
  }
});

// Step 4: Create Hostinger-specific server configuration
console.log('⚙️ Creating Hostinger server configuration...');
const hostingerServerConfig = `/**
 * Hostinger-specific server configuration
 * This file optimizes the server for shared hosting environments
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Hostinger environment optimizations
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle port assignment (Hostinger assigns ports automatically)
const PORT = process.env.PORT || 3000;

// Serve static files (adjust path for Hostinger's public_html structure)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../dist')));

// Import and use your main application routes
// (Your existing server code goes here)

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`🌐 Environment: \${process.env.NODE_ENV}\`);
});

export default app;
`;

fs.writeFileSync(path.join(deploymentDir, 'server-hostinger.js'), hostingerServerConfig);
console.log('✅ Created Hostinger server configuration\n');

// Step 5: Create deployment instructions
console.log('📝 Creating deployment instructions...');
const deploymentInstructions = `# Hostinger Deployment Instructions

## Files Ready for Upload
Your deployment package is ready in the \`hostinger-deployment\` folder.

## Next Steps:

### 1. Database Setup
- Create a PostgreSQL database in Hostinger hPanel
- Import your schema using the database export feature in admin panel
- Update DATABASE_URL in .env file

### 2. Upload Files
- Compress the \`hostinger-deployment\` folder contents
- Upload to your public_html directory via Hostinger File Manager
- Extract the files

### 3. Configure Node.js App
- Go to hPanel > Advanced > Node.js
- Create new Node.js application
- Set entry point to: \`dist/index.js\`
- Install dependencies: \`npm install --production\`

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
`;

fs.writeFileSync(path.join(deploymentDir, 'DEPLOYMENT-INSTRUCTIONS.md'), deploymentInstructions);
console.log('✅ Created deployment instructions\n');

// Step 6: Generate database export for migration
console.log('💾 Database export instructions...');
const dbExportInstructions = `# Database Migration Instructions

## Export from Current Environment
1. Go to Admin Panel > Database tab
2. Click "Export Database" to download SQL dump
3. Save the file as \`database-backup.sql\`

## Import to Hostinger
1. Create PostgreSQL database in hPanel
2. Use phpPgAdmin or command line to import:
   \`psql -h hostname -U username -d database_name -f database-backup.sql\`

## Alternative: Use provided conversion script
If Hostinger only supports MySQL, use the MySQL conversion script in deployment-guide.md
`;

fs.writeFileSync(path.join(deploymentDir, 'DATABASE-MIGRATION.md'), dbExportInstructions);
console.log('✅ Created database migration instructions\n');

console.log('🎉 Deployment preparation complete!');
console.log('\n📁 Check the \`hostinger-deployment\` folder for all deployment files');
console.log('📖 Read DEPLOYMENT-INSTRUCTIONS.md for next steps');
console.log('\n🔗 Your application will be ready to deploy to Hostinger hPanel');