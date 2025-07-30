# 🗄️ Hostinger MySQL Deployment Guide

## Complete MySQL Setup for InnovanceOrbit

Your e-commerce platform is ready for Hostinger with MySQL database support. This guide covers everything needed for a successful deployment.

## 📋 What's Included

✅ **Complete Application**: Built and optimized for production
✅ **MySQL Schema**: Database structure optimized for MySQL
✅ **Environment Configuration**: Production-ready settings template
✅ **Data Migration**: Tools for importing existing data
✅ **Deployment Instructions**: Step-by-step Hostinger setup

## 🔧 Step 1: Create MySQL Database in Hostinger

### Via hPanel:
1. **Login** to your Hostinger hPanel
2. **Navigate** to "Databases" → "MySQL Databases"
3. **Create** new database:
   - Database name: `innovanceorbit_db` (or your choice)
   - Username: `innovanceorbit_user` (or your choice)
   - Password: Generate a secure password
4. **Note down** the connection details:
   - Host: Usually `localhost` or specific hostname
   - Port: Usually `3306`
   - Database name, username, and password

## 🗃️ Step 2: Import Database Schema

### Option A: Using phpMyAdmin (Recommended)
1. **Access phpMyAdmin** from hPanel
2. **Select** your database from the left sidebar
3. **Click** "Import" tab
4. **Choose** the `mysql-migration.sql` file
5. **Execute** the import

### Option B: Using Command Line (Advanced)
```bash
mysql -h hostname -u username -p database_name < mysql-migration.sql
```

## ⚙️ Step 3: Configure Environment Variables

Update the `.env` file with your actual Hostinger MySQL credentials:

### Database Connection (Choose one format):

**Format 1: DATABASE_URL (Recommended)**
```bash
DATABASE_URL=mysql://your_username:your_password@your_host:3306/your_database_name
```

**Format 2: Individual Settings**
```bash
DB_HOST=your_mysql_host_from_hostinger
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
```

### Required Settings:
```bash
SESSION_SECRET=generate_a_long_random_string_here
MICROSOFT365_EMAIL_USER=your-email@yourdomain.com
MICROSOFT365_EMAIL_PASSWORD=your_app_password
APP_URL=https://yourdomain.com
```

## 📤 Step 4: Upload Files to Hostinger

### Prepare Upload:
1. **Compress** all files in this folder into a ZIP
2. **Access** Hostinger File Manager via hPanel
3. **Navigate** to `public_html` directory
4. **Upload** and extract the ZIP file

### File Structure:
```
public_html/
├── dist/                    # Built application
├── uploads/                 # User uploaded content
├── .env                    # Environment variables
├── package.json            # Dependencies
├── mysql-migration.sql     # Database schema
└── node_modules/           # Will be created by npm install
```

## 🚀 Step 5: Configure Node.js Application

### In hPanel:
1. **Go to** "Advanced" → "Node.js"
2. **Create** new Node.js application:
   - **App root**: `/public_html` (or your domain folder)
   - **Entry point**: `dist/index.js`
   - **Node.js version**: 18.x or higher
3. **Install dependencies**:
   ```bash
   npm install --production
   ```

## 🌱 Step 6: Seed Initial Data

Run these SQL commands in phpMyAdmin to create your admin account:

### Create Admin User:
```sql
INSERT INTO users (
  id, username, email, password, salt, 
  first_name, last_name, is_admin, created_at
) VALUES (
  UUID(), 
  'admin', 
  'admin@innovanceorbit.com',
  'admin_password_hash_here',
  'salt_here',
  'Admin',
  'User',
  true,
  NOW()
);
```

### Create Site Settings:
```sql
INSERT INTO site_settings (
  id, site_name, primary_color, secondary_color, accent_color,
  header_text_color, tab_text_color, created_at, updated_at
) VALUES (
  'default',
  'InnovanceOrbit',
  '#2563eb',
  '#64748b', 
  '#0ea5e9',
  '#374151',
  '#2563eb',
  NOW(),
  NOW()
);
```

## 🔍 Step 7: Test Your Deployment

### Key Endpoints to Test:
- **Homepage**: `https://yourdomain.com/`
- **Admin Login**: `https://yourdomain.com/auth`
- **API Health**: `https://yourdomain.com/api/settings`

### Login Credentials:
- **Username**: `admin`
- **Password**: `admin123` (change immediately after first login)

## 📊 MySQL vs PostgreSQL Key Differences

| Feature | PostgreSQL | MySQL |
|---------|------------|--------|
| JSON Fields | Native JSON | JSON (MySQL 5.7+) |
| UUIDs | Native UUID | VARCHAR(36) |
| Arrays | Native arrays | JSON arrays |
| Enums | Custom types | Native ENUM |
| Text Fields | TEXT | TEXT/LONGTEXT |

## 🛠️ Troubleshooting Common Issues

### Database Connection Issues:
1. **Verify credentials** in phpMyAdmin first
2. **Check hostname** (often `localhost` for shared hosting)
3. **Ensure database user** has all necessary permissions
4. **Test connection** using a simple PHP script if needed

### File Upload Issues:
1. **Check folder permissions**: Set uploads to 755 or 777
2. **Verify Node.js app** has write access to uploads directory
3. **Check disk space** limits on your hosting plan

### Performance Optimization:
1. **Enable MySQL query cache** if available
2. **Use connection pooling** for database connections
3. **Optimize images** before uploading to reduce storage
4. **Monitor memory usage** and optimize for shared hosting limits

## 🔒 Security Checklist

✅ **Change default admin password** immediately
✅ **Use strong SESSION_SECRET** (generate random 64+ characters)
✅ **Enable HTTPS** for your domain (usually free with Hostinger)
✅ **Set proper file permissions** (755 for directories, 644 for files)
✅ **Keep environment variables** secure and never commit to version control

## 📈 Post-Deployment Features

Once deployed, your MySQL-powered e-commerce platform includes:

- **Complete product catalog** with categories and search
- **Shopping cart and wishlist** functionality  
- **Secure payment processing** (Stripe, PayPal, Benefit Pay)
- **Admin dashboard** with full inventory management
- **Order management** with email notifications
- **User account system** with order history
- **Dynamic content management** (sliders, banners)
- **Excel import/export** for bulk data management
- **Responsive design** with custom branding

## 📞 Support Resources

### Hostinger Support:
- **Knowledge Base**: Hostinger's MySQL and Node.js documentation
- **Live Chat**: 24/7 technical support
- **Tutorials**: hPanel video guides

### Application Support:
- **Admin Panel**: Built-in database management tools
- **Error Logs**: Check Node.js app logs in hPanel
- **Database Tools**: phpMyAdmin for direct database access

Your InnovanceOrbit e-commerce platform is now ready for production deployment on Hostinger with MySQL!