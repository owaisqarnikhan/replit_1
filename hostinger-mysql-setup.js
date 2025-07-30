#!/usr/bin/env node

/**
 * Hostinger MySQL Deployment Setup Script
 * This script prepares the InnovanceOrbit application for Hostinger with MySQL
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Preparing InnovanceOrbit for Hostinger with MySQL...\n');

// Step 1: Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create MySQL-specific environment template
console.log('🔧 Creating MySQL environment template...');
const envTemplate = `# Hostinger MySQL Production Environment Variables
NODE_ENV=production
PORT=3000

# MySQL Database Configuration (Update with your Hostinger MySQL details)
DATABASE_URL=mysql://username:password@hostname:port/database_name

# Alternative: Individual MySQL settings
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

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

fs.writeFileSync('.env.mysql', envTemplate);
console.log('✅ Created .env.mysql template\n');

// Step 3: Create MySQL deployment package
console.log('📁 Creating MySQL deployment package...');
const deploymentDir = 'hostinger-mysql-deployment';

if (!fs.existsSync(deploymentDir)) {
  fs.mkdirSync(deploymentDir);
}

// Copy essential files for MySQL deployment
const filesToCopy = [
  { src: 'dist', dest: path.join(deploymentDir, 'dist') },
  { src: 'uploads', dest: path.join(deploymentDir, 'uploads') },
  { src: 'package.json', dest: path.join(deploymentDir, 'package.json') },
  { src: 'package-lock.json', dest: path.join(deploymentDir, 'package-lock.json') },
  { src: '.env.mysql', dest: path.join(deploymentDir, '.env') },
  { src: 'mysql-migration.sql', dest: path.join(deploymentDir, 'mysql-migration.sql') },
  { src: 'server/db-mysql.ts', dest: path.join(deploymentDir, 'db-mysql.ts') },
  { src: 'shared/schema-mysql.ts', dest: path.join(deploymentDir, 'schema-mysql.ts') }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      execSync(`cp -r ${src} ${dest}`, { stdio: 'pipe' });
    } else {
      execSync(`cp ${src} ${dest}`, { stdio: 'pipe' });
    }
    console.log(`✅ Copied ${src} to MySQL deployment package`);
  }
});

// Step 4: Create MySQL-specific instructions
console.log('📝 Creating MySQL deployment instructions...');
const mysqlInstructions = `# Hostinger MySQL Deployment Instructions

## MySQL Database Setup

### 1. Create MySQL Database in Hostinger hPanel
- Go to hPanel > Databases > MySQL Databases
- Create new database (note the database name, username, and password)
- Note the MySQL hostname (usually localhost or specific server)

### 2. Import Database Schema
Upload and run the \\\`mysql-migration.sql\\\` file:

**Option A: Using phpMyAdmin (Recommended)**
1. Access phpMyAdmin from hPanel
2. Select your database
3. Go to Import tab
4. Upload \\\`mysql-migration.sql\\\`
5. Execute the import

**Option B: Using MySQL Command Line**
\\\`\\\`\\\`bash
mysql -h hostname -u username -p database_name < mysql-migration.sql
\\\`\\\`\\\`

### 3. Configure Environment Variables
Update the \\\`.env\\\` file with your MySQL credentials:

\\\`\\\`\\\`
# Use either DATABASE_URL format:
DATABASE_URL=mysql://username:password@hostname:port/database_name

# Or individual settings:
DB_HOST=your_mysql_host_from_hostinger
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
\\\`\\\`\\\`

### 4. Seed Initial Data
After importing the schema, you'll need to add initial data:

**Admin User** (Run in phpMyAdmin):
\\\`\\\`\\\`sql
INSERT INTO users (id, username, email, password, salt, first_name, last_name, is_admin) 
VALUES (
  UUID(), 
  'admin', 
  'admin@innovanceorbit.com',
  'your_hashed_password_here',
  'your_salt_here',
  'Admin',
  'User',
  true
);
\\\`\\\`\\\`

**Site Settings**:
\\\`\\\`\\\`sql
INSERT INTO site_settings (id, site_name, primary_color, secondary_color, accent_color)
VALUES ('default', 'InnovanceOrbit', '#2563eb', '#64748b', '#0ea5e9');
\\\`\\\`\\\`

### 5. File Upload Structure
Ensure the uploads directory has proper structure:
\\\`\\\`\\\`
uploads/
├── categories/          # Category images
├── products/           # Product images  
├── slider/             # Slider images
├── site/              # Site logos and assets
└── temp/              # Temporary uploads
\\\`\\\`\\\`

### 6. Node.js App Configuration
- Entry point: \\\`dist/index.js\\\`
- Environment: Production
- Node version: 18.x or higher

## Key Differences from PostgreSQL

1. **Data Types**: VARCHAR instead of TEXT for IDs
2. **JSON Fields**: Native JSON support in MySQL 5.7+
3. **Enums**: MySQL native ENUM types
4. **UUIDs**: Use VARCHAR(36) for UUID storage
5. **Foreign Keys**: Explicit foreign key constraints

## Testing the MySQL Setup

After deployment, test these endpoints:
- \\\`GET /api/user\\\` - Authentication
- \\\`GET /api/products\\\` - Product listing
- \\\`GET /api/categories\\\` - Categories
- \\\`GET /api/settings\\\` - Site settings

## Troubleshooting MySQL Issues

### Connection Problems:
- Verify MySQL hostname (often localhost for shared hosting)
- Check port (usually 3306)
- Ensure database user has proper permissions
- Test connection using phpMyAdmin first

### Performance Optimization:
- Index frequently queried columns
- Use connection pooling
- Optimize JSON field queries
- Monitor slow query log

### Common Hostinger MySQL Limits:
- Connection limit: Usually 15-30 concurrent connections
- Database size: Varies by plan (1GB to unlimited)
- Query timeout: Usually 30 seconds
- Memory usage: Optimized for shared hosting

## Data Migration from PostgreSQL

If you have existing PostgreSQL data:
1. Export current data using admin panel
2. Convert PostgreSQL dump to MySQL format
3. Import using provided MySQL schema
4. Verify data integrity and relationships
\\\`;

fs.writeFileSync(path.join(deploymentDir, 'MYSQL-DEPLOYMENT-GUIDE.md'), mysqlInstructions);
console.log('✅ Created MySQL deployment guide\n');

// Step 5: Create data seeding script
console.log('🌱 Creating data seeding script...');
const seedScript = \`-- MySQL Data Seeding Script for InnovanceOrbit
-- Run this after importing the schema

-- Insert default admin user (password: admin123)
-- Note: In production, use a secure password hash
INSERT INTO users (id, username, email, password, salt, first_name, last_name, is_admin, created_at) VALUES
('admin-uuid-here', 'admin', 'admin@innovanceorbit.com', 'hashed_password_here', 'salt_here', 'Admin', 'User', true, NOW());

-- Insert default site settings
INSERT INTO site_settings (
  id, site_name, primary_color, secondary_color, accent_color, 
  header_text_color, tab_text_color, footer_description, footer_copyright,
  quick_links_title, services_title, created_at, updated_at
) VALUES (
  'default', 
  'InnovanceOrbit', 
  '#2563eb', 
  '#64748b', 
  '#0ea5e9',
  '#374151',
  '#2563eb',
  'Your trusted e-commerce partner for innovative solutions.',
  '© 2025 InnovanceOrbit. All rights reserved.',
  'Quick Links',
  'Our Services',
  NOW(),
  NOW()
);

-- Insert sample categories
INSERT INTO categories (id, name, description, created_at) VALUES
(UUID(), 'Electronics', 'Electronic devices and accessories', NOW()),
(UUID(), 'Clothing', 'Fashion and apparel', NOW()),
(UUID(), 'Home & Garden', 'Home improvement and garden supplies', NOW());

-- Note: Add your actual product data and other content as needed
\`;

fs.writeFileSync(path.join(deploymentDir, 'seed-data.sql'), seedScript);
console.log('✅ Created data seeding script\n');

console.log('🎉 MySQL deployment preparation complete!');
console.log('\n📁 Check the \`hostinger-mysql-deployment\` folder for all files');
console.log('📖 Read MYSQL-DEPLOYMENT-GUIDE.md for detailed MySQL setup');
console.log('\n🔗 Your application is ready for Hostinger MySQL deployment');