# BAYG - Ubuntu Root User Deployment Guide

## 🚀 **Deployment Using Ubuntu User (AWS EC2 Default)**

All commands run as the default `ubuntu` user with sudo privileges. No additional user creation needed.

---

## **Complete Deployment Script**

```bash
#!/bin/bash
# BAYG E-commerce Platform - Ubuntu Deployment Script
# Run as ubuntu user on AWS EC2 Ubuntu 22.04 LTS

set -e  # Exit on any error

echo "🚀 Starting BAYG deployment..."

# Step 1: System Update
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential software-properties-common

# Step 2: Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create BAYG database
echo "📊 Setting up BAYG database..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE bayg;
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;
\q
EOF

# Step 3: Install Node.js 20 LTS
echo "🟢 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Step 4: Install PM2
echo "⚙️ Installing PM2 process manager..."
sudo npm install -g pm2

# Step 5: Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Step 6: Create application directory
echo "📁 Creating BAYG application directory..."
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg

# Step 7: Nginx configuration
echo "🔧 Configuring Nginx for BAYG..."
sudo tee /etc/nginx/sites-available/bayg << 'EOF'
server {
    listen 80;
    server_name 3.23.101.72 your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Main proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # File uploads
    client_max_body_size 50M;
    
    # Static files
    location /uploads/ {
        alias /var/www/bayg/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript;
}
EOF

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/bayg /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Step 8: Setup firewall
echo "🛡️ Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

echo "✅ Basic server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your BAYG project files to: /var/www/bayg/"
echo "2. Run the application setup commands below"
echo ""
```

---

## **Application Setup Commands**

After uploading your BAYG project files to `/var/www/bayg/`, run these commands:

```bash
# Navigate to application directory
cd /var/www/bayg

# Install dependencies
npm install
npm install postgres pg

# Build application (with error handling)
npm run build || {
    echo "Build failed, trying manual build..."
    npx vite build
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://dbuser:SecurePass123!@localhost:5432/bayg
SESSION_SECRET=bayg-ultra-secure-session-secret-2025
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
APP_URL=http://3.23.101.72
UPLOAD_PATH=/var/www/bayg/uploads
EOF

# Set environment file permissions
chmod 600 .env.production

# Update database configuration for PostgreSQL
cat > server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });
export const pool = sql;
EOF

# Rebuild with updated database config and error handling
npm run build || npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bayg-ecommerce',
    script: 'dist/index.js',
    cwd: '/var/www/bayg',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://dbuser:SecurePass123!@localhost:5432/bayg'
    },
    error_file: '/var/www/bayg/logs/err.log',
    out_file: '/var/www/bayg/logs/out.log',
    log_file: '/var/www/bayg/logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Run the command that PM2 outputs

# Verify application is running
pm2 status
curl -I http://localhost:5000
```

---

## **SSL Certificate Setup (Optional)**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# SSL setup (optional for IP addresses)
# If you have a domain, replace with your domain:
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

---

## **Verification Commands**

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test database connection
psql -h localhost -U dbuser -d bayg -c "SELECT 1;"

# Test application
curl -I http://localhost:5000
curl -I http://3.23.101.72

# View application logs
pm2 logs bayg-ecommerce

# Monitor system resources
pm2 monit
```

---

## **Important Information**

### **File Locations:**
- **Application**: `/var/www/bayg/`
- **Logs**: `/var/www/bayg/logs/`
- **Uploads**: `/var/www/bayg/uploads/`
- **Nginx Config**: `/etc/nginx/sites-available/bayg`

### **Default Credentials:**
- **Super Admin**: admin / admin123 (admin@bayg.com)
- **Manager**: manager / manager123 (manager@bayg.com)
- **Customer**: user / user123

### **Required Customization:**
1. Replace `your-domain.com` with your actual domain
2. Replace Gmail credentials in `.env.production`
3. Change database password from default
4. Update default user passwords after first login

### **Maintenance Commands:**
```bash
# Restart application
pm2 restart bayg-ecommerce

# View logs
pm2 logs bayg-ecommerce

# Update application
cd /var/www/bayg
npm run build || npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
pm2 restart bayg-ecommerce

# Database backup
pg_dump -h localhost -U dbuser bayg > bayg-backup-$(date +%Y%m%d).sql
```

Your BAYG e-commerce platform is now deployed and running as the ubuntu user!