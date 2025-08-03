# 🚀 Complete AWS Ubuntu Deployment Analysis & Guide
## BAYG E-commerce Platform

---

## 📊 **Project Analysis Summary**

### **Application Architecture**
```
BAYG E-commerce Platform
├── Frontend (React + TypeScript + Vite)
│   ├── Client-side routing (Wouter)
│   ├── UI Framework (Shadcn/UI + Tailwind)
│   ├── State Management (TanStack Query)
│   └── Build Output: dist/public/
├── Backend (Express + TypeScript + Node.js)
│   ├── Authentication (Passport.js + Sessions)
│   ├── Database (PostgreSQL + Drizzle ORM)
│   ├── Email System (Nodemailer + Gmail SMTP)
│   ├── File Uploads (Multer + Local Storage)
│   ├── Payment Processing (Stripe, PayPal, Benefit Pay)
│   └── Build Output: dist/index.js
├── Database Schema (PostgreSQL)
│   ├── 12 Core Tables (users, roles, permissions, products, orders, etc.)
│   ├── 85 Granular Permissions
│   ├── 3-Tier Role System
│   └── Comprehensive Relations
└── File System
    ├── Uploads Directory (1.9MB - 3 essential images)
    ├── Static Assets
    └── User Uploaded Content
```

### **Resource Requirements**
- **CPU**: 2+ cores (recommended)
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 10GB minimum (5GB for app, 5GB for database growth)
- **Bandwidth**: Standard web hosting bandwidth
- **Node.js**: Version 20 LTS
- **PostgreSQL**: Version 12+

### **Dependencies Analysis**
- **Production Dependencies**: 42 packages
- **Development Dependencies**: 23 packages
- **Critical Runtime Dependencies**: 
  - PostgreSQL client (postgres)
  - Express web framework
  - Authentication (passport, express-session)
  - Email (nodemailer)
  - Payment processing (stripe, @paypal/paypal-server-sdk)

---

## 🏗️ **Deployment Architecture**

### **Server Infrastructure**
```
AWS EC2 Ubuntu Server (3.23.101.72)
├── System Layer
│   ├── Ubuntu 22.04 LTS
│   ├── Node.js 20 LTS
│   ├── PostgreSQL 14
│   ├── Nginx (Reverse Proxy)
│   ├── PM2 (Process Manager)
│   └── UFW Firewall
├── Application Layer
│   ├── BAYG App (/var/www/bayg/)
│   ├── Environment Configuration
│   ├── SSL/TLS (Optional)
│   └── Log Management
├── Database Layer
│   ├── PostgreSQL Instance
│   ├── Database: "bayg"
│   ├── User: "dbuser"
│   └── Session Storage
└── Network Layer
    ├── Port 80 (HTTP)
    ├── Port 443 (HTTPS - Optional)
    ├── Port 22 (SSH)
    └── Port 5000 (Internal App)
```

---

## 📋 **Phase-by-Phase Deployment Process**

### **Phase 1: Server Preparation**
```bash
# Connect to your AWS server
ssh -i RC-BAYG_1754170132424.pem ubuntu@3.23.101.72

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential development tools
sudo apt install -y curl wget git unzip build-essential software-properties-common

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### **Phase 2: Database Setup**
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create application database and user
sudo -u postgres psql << 'EOF'
-- Create database
CREATE DATABASE bayg;

-- Create application user
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;

-- Verify setup
\l
\du
\q
EOF

# Test database connection
psql -h localhost -U dbuser -d bayg -c "SELECT version();"
```

### **Phase 3: Web Server Setup**
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2 globally
sudo npm install -g pm2

# Configure firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### **Phase 4: Application Directory Setup**
```bash
# Create application directory
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg
sudo chmod -R 755 /var/www/bayg

# Create logs and uploads directories
mkdir -p /var/www/bayg/logs
mkdir -p /var/www/bayg/uploads

# Set proper permissions
chmod 755 /var/www/bayg/uploads
```

### **Phase 5: File Upload & Project Setup**
```bash
# Navigate to application directory
cd /var/www/bayg

# Option A: Upload via SCP (from your local machine)
# scp -i RC-BAYG_1754170132424.pem -r /path/to/bayg/* ubuntu@3.23.101.72:/var/www/bayg/

# Option B: Git clone (if using version control)
# git clone YOUR_REPOSITORY_URL .

# Option C: Manual upload via SFTP/WinSCP
# Upload all project files to /var/www/bayg/

# Verify essential files exist
ls -la
# Should see: client/ server/ shared/ package.json uploads/ etc.
```

### **Phase 6: Dependencies Installation**
```bash
# Install all dependencies (including dev dependencies for build)
npm install --include=dev

# Install additional PostgreSQL driver
npm install postgres pg

# Verify critical packages
npm list postgres
npm list express
npm list vite
```

### **Phase 7: Environment Configuration**
```bash
# Create production environment file
cat > .env.production << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=5000
APP_URL=http://3.23.101.72

# Database Configuration
DATABASE_URL=postgresql://dbuser:SecurePass123!@localhost:5432/bayg

# Session Configuration
SESSION_SECRET=bayg-ultra-secure-session-secret-2025-$(openssl rand -hex 32)

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# File Upload Configuration
UPLOAD_PATH=/var/www/bayg/uploads
MAX_FILE_SIZE=5242880

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Security Headers
CORS_ORIGIN=http://3.23.101.72
EOF

# Secure environment file
chmod 600 .env.production
```

### **Phase 8: Database Configuration Update**
```bash
# Update database connection for production
cat > server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Configure PostgreSQL connection with production settings
const sql = postgres(process.env.DATABASE_URL, {
  max: 20,                    // Maximum connections
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 10,        // Connection timeout
  ssl: false,                 // SSL not required for local PostgreSQL
  prepare: false,             // Disable prepared statements for compatibility
  types: {
    bigint: postgres.BigInt,  // Handle bigint types properly
  },
});

export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development' 
});

export const pool = sql;
EOF
```

### **Phase 9: Application Build**
```bash
# Build frontend and backend
npm run build

# If build fails, try manual build
if [ $? -ne 0 ]; then
    echo "Standard build failed, trying manual build..."
    
    # Build frontend manually
    npx vite build
    
    # Build backend manually
    npx esbuild server/index.ts \
        --platform=node \
        --packages=external \
        --bundle \
        --format=esm \
        --outdir=dist \
        --target=node20
fi

# Verify build output
ls -la dist/
ls -la dist/public/

# Check build size
du -sh dist/
```

### **Phase 10: Process Management Setup**
```bash
# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bayg-ecommerce',
    script: 'dist/index.js',
    cwd: '/var/www/bayg',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://dbuser:SecurePass123!@localhost:5432/bayg',
    },
    error_file: '/var/www/bayg/logs/err.log',
    out_file: '/var/www/bayg/logs/out.log',
    log_file: '/var/www/bayg/logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
  }]
};
EOF
```

### **Phase 11: Nginx Configuration**
```bash
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/bayg << 'EOF'
server {
    listen 80;
    server_name 3.23.101.72;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Main application proxy
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Static file serving with caching
    location /uploads/ {
        alias /var/www/bayg/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API routes with increased timeout
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # File upload configuration
    client_max_body_size 50M;
    client_body_timeout 300s;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security - hide server version
    server_tokens off;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bayg /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **Phase 12: Application Startup**
```bash
# Set environment variables
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by PM2 startup command

# Monitor application
pm2 status
pm2 logs bayg-ecommerce --lines 50
```

---

## 🔍 **Verification & Testing**

### **System Health Checks**
```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test database connection
psql -h localhost -U dbuser -d bayg -c "SELECT COUNT(*) FROM users;"

# Test web server
curl -I http://localhost:5000
curl -I http://3.23.101.72

# Check application logs
pm2 logs bayg-ecommerce --lines 20

# Monitor resource usage
free -h
df -h
htop
```

### **Application Testing**
1. **Frontend Access**: http://3.23.101.72
2. **API Health Check**: http://3.23.101.72/api/settings
3. **File Upload Test**: Upload image through admin panel
4. **Login Test**: Use default credentials
5. **Database Test**: Create a product/category
6. **Email Test**: Configure Gmail SMTP and test

### **Performance Optimization**
```bash
# Enable HTTP/2 (if using SSL)
# Add to Nginx: listen 443 ssl http2;

# Database optimization
sudo -u postgres psql -d bayg << 'EOF'
-- Analyze tables for optimal query plans
ANALYZE;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expire ON sessions(expire);
EOF

# Node.js optimization
export NODE_OPTIONS="--max-old-space-size=1024"
pm2 restart bayg-ecommerce
```

---

## 🔒 **Security Configuration**

### **Database Security**
```bash
# Secure PostgreSQL installation
sudo -u postgres psql << 'EOF'
-- Remove default postgres user access
ALTER USER postgres PASSWORD 'SecurePostgresPassword123!';

-- Restrict database connections
REVOKE ALL ON DATABASE template0 FROM PUBLIC;
REVOKE ALL ON DATABASE template1 FROM PUBLIC;
EOF

# Update PostgreSQL configuration
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql
```

### **File System Security**
```bash
# Set proper permissions
sudo chown -R ubuntu:www-data /var/www/bayg
sudo chmod -R 750 /var/www/bayg
sudo chmod -R 755 /var/www/bayg/uploads

# Secure configuration files
chmod 600 /var/www/bayg/.env.production
chmod 600 /var/www/bayg/ecosystem.config.js
```

### **Network Security**
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## 📊 **Monitoring & Maintenance**

### **Log Management**
```bash
# Setup log rotation
sudo tee /etc/logrotate.d/bayg << 'EOF'
/var/www/bayg/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### **Backup Strategy**
```bash
# Database backup script
cat > /home/ubuntu/backup-bayg.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U dbuser bayg > $BACKUP_DIR/bayg_db_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/bayg_files_$DATE.tar.gz /var/www/bayg --exclude=/var/www/bayg/node_modules

# Keep only last 7 days of backups
find $BACKUP_DIR -name "bayg_*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/ubuntu/backup-bayg.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-bayg.sh") | crontab -
```

---

## 🎯 **Final Access Information**

### **Application URLs**
- **Main Application**: http://3.23.101.72
- **API Endpoint**: http://3.23.101.72/api
- **Admin Panel**: http://3.23.101.72/admin
- **File Uploads**: http://3.23.101.72/uploads

### **Default Login Credentials**
- **Super Admin**: admin / admin123 (admin@bayg.com)
- **Manager**: manager / manager123 (manager@bayg.com)
- **Customer**: user / user123

### **System Access**
- **SSH**: `ssh -i RC-BAYG_1754170132424.pem ubuntu@3.23.101.72`
- **Database**: `psql -h localhost -U dbuser -d bayg`

### **Management Commands**
```bash
# Application management
pm2 restart bayg-ecommerce
pm2 logs bayg-ecommerce
pm2 monit

# Service management
sudo systemctl restart nginx
sudo systemctl restart postgresql

# View system status
pm2 status
sudo systemctl status nginx postgresql
df -h && free -h
```

---

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions**

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   # Check connection
   psql -h localhost -U dbuser -d bayg -c "SELECT 1;"
   ```

3. **Permission Errors**
   ```bash
   # Fix file permissions
   sudo chown -R ubuntu:ubuntu /var/www/bayg
   chmod 755 /var/www/bayg/uploads
   ```

4. **Application Not Starting**
   ```bash
   # Check logs
   pm2 logs bayg-ecommerce
   # Restart application
   pm2 restart bayg-ecommerce
   ```

5. **Nginx Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

Your BAYG e-commerce platform is now fully deployed and ready for production use!