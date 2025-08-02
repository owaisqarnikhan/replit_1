# BAYG E-commerce Platform - AWS Ubuntu Deployment Guide

## Complete Step-by-Step Ubuntu Server Deployment

This guide provides comprehensive commands to deploy your BAYG e-commerce platform on AWS Ubuntu 22.04 LTS server.

---

## 🚀 **Phase 1: Server Preparation & Updates**

### 1.1 Update Ubuntu System
```bash
# Update package lists and upgrade system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip software-properties-common build-essential
```

### 1.2 Setup Root User Environment
```bash
# Switch to ubuntu user (default on AWS EC2)
# All deployment will be done as ubuntu user with sudo privileges
whoami  # Should show: ubuntu
```

---

## 🗄️ **Phase 2: PostgreSQL Database Setup**

### 2.1 Install PostgreSQL
```bash
# Install PostgreSQL server
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql
```

### 2.2 Configure PostgreSQL Database
```bash
# Switch to postgres user and create database
sudo -u postgres psql << 'EOF'
-- Create BAYG database and user
CREATE DATABASE bayg;
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;
\q
EOF

# Test database connection
psql -h localhost -U dbuser -d bayg -c "\dt"
```

### 2.3 Configure PostgreSQL for Remote Access (Optional)
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf
# Add: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local   bayg   dbuser   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🟢 **Phase 3: Node.js & PM2 Installation**

### 3.1 Install Node.js 20 LTS
```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify PM2 installation
pm2 --version
```

---

## 🌐 **Phase 4: Nginx Web Server Setup**

### 4.1 Install and Configure Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### 4.2 Configure Nginx for BAYG
```bash
# Create Nginx configuration for BAYG
sudo tee /etc/nginx/sites-available/bayg << 'EOF'
server {
    listen 80;
    server_name 3.23.101.72 your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Main application proxy
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

    # File upload handling
    client_max_body_size 50M;

    # Static file serving
    location /uploads/ {
        alias /var/www/bayg/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/bayg /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📁 **Phase 5: Application Deployment**

### 5.1 Create Application Directory
```bash
# Create BAYG application directory
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg
cd /var/www/bayg
```

### 5.2 Upload and Extract Application Files
```bash
# Option A: If you have the project as a zip file
# Upload your BAYG project files to the server, then:
# sudo unzip bayg-project.zip -d /var/www/bayg/
# sudo chown -R bayg:bayg /var/www/bayg/

# Option B: Clone from repository (if available)
# git clone https://your-repo.git /var/www/bayg/
# cd /var/www/bayg

# Option C: Manual file transfer - Create project structure
mkdir -p client/src server shared uploads dist
```

### 5.3 Install Dependencies and Build
```bash
# Navigate to project directory as ubuntu user
cd /var/www/bayg

# Install Node.js dependencies
npm install

# Install additional PostgreSQL driver
npm install postgres pg

# Verify Vite is available
npx vite --version

# Build the application (with fallback methods)
npm run build || {
    echo "Build failed, trying alternative build method..."
    npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# Verify build completed
ls -la dist/
```

---

## ⚙️ **Phase 6: Environment Configuration**

### 6.1 Create Production Environment File
```bash
# Create production environment variables
cat > /var/www/bayg/.env.production << 'EOF'
# BAYG Production Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://dbuser:SecurePass123!@localhost:5432/bayg

# Session Configuration
SESSION_SECRET=bayg-ultra-secure-session-secret-production-2025

# Gmail SMTP Configuration (replace with your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# Application Configuration
APP_URL=http://3.23.101.72
UPLOAD_PATH=/var/www/bayg/uploads

# Security
CORS_ORIGIN=http://3.23.101.72
EOF

# Set proper permissions
chmod 600 /var/www/bayg/.env.production
```

### 6.2 Update Database Configuration
```bash
# Update server/db.ts for PostgreSQL
cat > /var/www/bayg/server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// PostgreSQL connection for production
const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });
export const pool = sql;
EOF

# Rebuild with updated database configuration
npm run build
```

---

## 🚀 **Phase 7: PM2 Process Management**

### 7.1 Create PM2 Ecosystem Configuration
```bash
# Create PM2 ecosystem file
cat > /var/www/bayg/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bayg-ecommerce',
    script: 'dist/index.js',
    cwd: '/var/www/bayg',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://dbuser:SecurePass123!@localhost:5432/bayg'
    },
    error_file: '/var/www/bayg/logs/err.log',
    out_file: '/var/www/bayg/logs/out.log',
    log_file: '/var/www/bayg/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create logs directory
mkdir -p /var/www/bayg/logs
```

### 7.2 Start Application with PM2
```bash
# Set environment variables
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production
export PORT=5000

# Start BAYG application with PM2
cd /var/www/bayg
pm2 start ecosystem.config.js --env production

# Check application status
pm2 status
pm2 logs bayg-ecommerce

# Test application
curl http://localhost:5000

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command PM2 provides to setup startup
```

---

## 🔒 **Phase 8: SSL Certificate (Let's Encrypt)**

### 8.1 Install Certbot
```bash
# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx

# For IP address, SSL setup is optional
# If you have a domain, replace with your domain:
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 8.2 Update Nginx for HTTPS
```bash
# Nginx will be automatically updated by Certbot
# Verify SSL configuration
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 **Phase 9: System Services & Monitoring**

### 9.1 Create Systemd Service (Alternative to PM2)
```bash
# Optional: Create systemd service for BAYG
sudo tee /etc/systemd/system/bayg.service << 'EOF'
[Unit]
Description=BAYG E-commerce Platform
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/bayg
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=DATABASE_URL=postgresql://dbuser:SecurePass123!@localhost:5432/bayg
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=bayg

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service (if not using PM2)
# sudo systemctl enable bayg
# sudo systemctl start bayg
```

### 9.2 Setup Log Rotation
```bash
# Create log rotation for BAYG
sudo tee /etc/logrotate.d/bayg << 'EOF'
/var/www/bayg/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reload bayg-ecommerce
    endscript
}
EOF
```

---

## 🛡️ **Phase 10: Security & Firewall**

### 10.1 Configure UFW Firewall
```bash
# Enable and configure firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check firewall status
sudo ufw status
```

### 10.2 Secure PostgreSQL
```bash
# Secure PostgreSQL installation
sudo -u postgres psql << 'EOF'
ALTER USER postgres PASSWORD 'your-strong-postgres-password';
\q
EOF

# Update PostgreSQL configuration for security
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/14/main/postgresql.conf
sudo systemctl restart postgresql
```

---

## ✅ **Phase 11: Final Testing & Verification**

### 11.1 Application Health Checks
```bash
# Check all services status
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test database connection
psql -h localhost -U dbuser -d bayg -c "SELECT 1;"

# Test application endpoints
curl -I http://localhost:5000
curl -I http://3.23.101.72

# Check application logs
pm2 logs bayg-ecommerce --lines 50
```

### 11.2 Performance Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Monitor system resources
htop
pm2 monit

# Check disk usage
df -h
du -sh /var/www/bayg/
```

---

## 📋 **Phase 12: Post-Deployment Configuration**

### 12.1 BAYG Application Setup
```bash
# Access your BAYG application at: https://your-domain.com

# Login with default credentials:
# Super Admin: admin / admin123 (admin@bayg.com)
# Manager: manager / manager123 (manager@bayg.com)
# Customer: user / user123

# Update site settings through admin panel
# Configure SMTP settings with your Gmail credentials
# Upload your company logo and branding
```

### 12.2 Database Initialization
The application will automatically:
- Create database tables on first run
- Seed initial user accounts
- Setup permission system
- Configure default settings

---

## 🔧 **Maintenance Commands**

### Daily Operations
```bash
# View application logs
pm2 logs bayg-ecommerce

# Restart application
pm2 restart bayg-ecommerce

# Check system resources
pm2 monit

# Backup database
pg_dump -h localhost -U dbuser bayg > /var/www/bayg/backups/bayg-$(date +%Y%m%d).sql
```

### Updates & Maintenance
```bash
# Update application code
cd /var/www/bayg
git pull origin main  # If using git
npm install
npm run build
pm2 restart bayg-ecommerce

# System updates
sudo apt update && sudo apt upgrade -y
sudo systemctl restart nginx
```

---

## 🚨 **Troubleshooting**

### Common Issues & Solutions

**Application won't start:**
```bash
# Check environment variables
env | grep -E "(DATABASE_URL|NODE_ENV|PORT)"

# Check database connection
psql -h localhost -U dbuser -d bayg

# Check application logs
pm2 logs bayg-ecommerce --lines 100
```

**Database connection errors:**
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**Nginx errors:**
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 **Support Information**

- **Application**: BAYG E-commerce Platform
- **Database**: PostgreSQL (bayg)
- **Web Server**: Nginx
- **Process Manager**: PM2
- **Login URL**: https://your-domain.com
- **Admin Panel**: https://your-domain.com (login as admin)

Your BAYG e-commerce platform is now fully deployed and ready for production use!