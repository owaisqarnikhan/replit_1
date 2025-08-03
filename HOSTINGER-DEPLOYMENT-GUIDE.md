# 🚀 BAYG Deployment to Hostinger VPS
## Server: 148.230.88.243 (srv937692.hstgr.cloud)

---

## **Server Specifications Analysis**
- **Location**: United States - Boston
- **OS**: Ubuntu 24.04 LTS (Latest)
- **Resources**: 4 CPU cores, 16GB RAM, 200GB storage
- **IP**: 148.230.88.243
- **Access**: root user (full privileges)
- **Plan**: KVM 4 (Premium performance)

**Verdict**: Perfect specifications for BAYG e-commerce platform!

---

## **Phase 1: Connect to Your Hostinger VPS**

```bash
# Connect via SSH (no key required - password authentication)
ssh root@148.230.88.243

# Or connect via Hostinger panel SSH terminal
# Go to: VPS → Manage → SSH Access
```

---

## **Phase 2: System Preparation**

```bash
# Update Ubuntu 24.04 system
apt update && apt upgrade -y

# Install essential development tools
apt install -y curl wget git unzip build-essential software-properties-common

# Install additional tools for monitoring
apt install -y htop neofetch ufw fail2ban

# Show system info
neofetch
```

---

## **Phase 3: Install Node.js 20 LTS**

```bash
# Install Node.js 20 LTS (latest stable)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install global packages
npm install -g pm2 npm@latest
```

---

## **Phase 4: PostgreSQL Database Setup**

```bash
# Install PostgreSQL 16 (latest for Ubuntu 24.04)
apt install -y postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Check PostgreSQL status
systemctl status postgresql

# Create BAYG database and user
sudo -u postgres psql << 'EOF'
-- Create database
CREATE DATABASE bayg;

-- Create application user with strong password
CREATE USER bayg_user WITH PASSWORD 'BAYG_SecurePass_2025!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bayg TO bayg_user;
ALTER USER bayg_user CREATEDB;
GRANT ALL ON SCHEMA public TO bayg_user;

-- Set connection limits
ALTER USER bayg_user CONNECTION LIMIT 20;

-- Show databases and users
\l
\du

-- Exit
\q
EOF

# Test database connection
psql -h localhost -U bayg_user -d bayg -c "SELECT version();"
```

---

## **Phase 5: Nginx Web Server Setup**

```bash
# Install Nginx (latest version)
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check Nginx status
systemctl status nginx

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx is accessible
curl -I http://localhost
```

---

## **Phase 6: Application Directory Setup**

```bash
# Create application directory
mkdir -p /var/www/bayg
cd /var/www/bayg

# Create necessary subdirectories
mkdir -p logs uploads temp backups

# Set proper ownership and permissions
chown -R root:www-data /var/www/bayg
chmod -R 755 /var/www/bayg
chmod -R 775 uploads
```

---

## **Phase 7: Upload BAYG Project Files**

### **Option A: Direct Upload (Recommended)**

```bash
# If you have the project as ZIP file
cd /var/www/bayg

# Upload via SCP (from your local machine)
# scp bayg-project.zip root@148.230.88.243:/var/www/bayg/

# Or use Hostinger File Manager:
# VPS Panel → File Manager → Navigate to /var/www/bayg
# Upload your project files

# Extract if uploaded as ZIP
# unzip bayg-project.zip
# mv bayg-project/* .  # Move files to current directory
# rm -rf bayg-project bayg-project.zip
```

### **Option B: Git Clone (If using repository)**

```bash
cd /var/www/bayg

# Clone your repository
# git clone YOUR_REPOSITORY_URL .

# Or download from Replit export
# wget YOUR_REPLIT_EXPORT_URL -O bayg-project.zip
# unzip bayg-project.zip
```

### **Option C: Manual File Creation (Emergency method)**

```bash
# If you need to manually recreate the project structure
cd /var/www/bayg

# Create basic structure
mkdir -p client/src server shared uploads
touch package.json
# ... (copy files manually via file manager)
```

---

## **Phase 8: Dependencies Installation**

```bash
cd /var/www/bayg

# Install all dependencies
npm install

# Install additional PostgreSQL drivers
npm install postgres pg @types/pg

# Install global dependencies if needed
npm install -g typescript drizzle-kit

# Verify critical packages
npm list express react postgres drizzle-orm

# Clear npm cache if needed
npm cache clean --force
```

---

## **Phase 9: Environment Configuration**

```bash
# Create production environment file
cat > .env.production << 'EOF'
# Application Configuration
NODE_ENV=production
PORT=5000
APP_URL=http://148.230.88.243
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://bayg_user:BAYG_SecurePass_2025!@localhost:5432/bayg

# Session Configuration  
SESSION_SECRET=hostinger-bayg-ultra-secure-session-$(openssl rand -hex 32)
SESSION_MAX_AGE=86400000

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

# File Upload Configuration
UPLOAD_PATH=/var/www/bayg/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif,webp

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# Security Configuration
CORS_ORIGIN=http://148.230.88.243
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/www/bayg/logs/app.log
EOF

# Secure the environment file
chmod 600 .env.production
chown root:root .env.production
```

---

## **Phase 10: Database Configuration Update**

```bash
# Update database connection for production
cat > server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Production PostgreSQL connection configuration
const sql = postgres(process.env.DATABASE_URL, {
  max: 20,                    // Maximum connections (good for 16GB RAM)
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 10,        // Connection timeout
  ssl: false,                 // SSL not required for local PostgreSQL
  prepare: false,             // Disable prepared statements for compatibility
  transform: postgres.camel, // Transform snake_case to camelCase
  types: {
    bigint: postgres.BigInt,  // Handle bigint types properly
  },
  debug: process.env.NODE_ENV === 'development',
});

export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

export const pool = sql;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await sql.end();
  process.exit(0);
});
EOF
```

---

## **Phase 11: Application Build**

```bash
cd /var/www/bayg

# Clean previous builds
rm -rf dist/

# Build the application
echo "Building BAYG application..."
npm run build

# If build fails, try manual build
if [ $? -ne 0 ]; then
    echo "Standard build failed, trying manual build..."
    
    # Build frontend
    npx vite build
    
    # Build backend
    npx esbuild server/index.ts \
        --platform=node \
        --packages=external \
        --bundle \
        --format=esm \
        --outdir=dist \
        --target=node20 \
        --minify
fi

# Verify build output
ls -la dist/
du -sh dist/

# Test the built server
echo "Testing built application..."
export NODE_ENV=production
export DATABASE_URL="postgresql://bayg_user:BAYG_SecurePass_2025!@localhost:5432/bayg"
timeout 10s node dist/index.js || echo "Build test completed"
```

---

## **Phase 12: PM2 Process Management Setup**

```bash
# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bayg-ecommerce',
    script: 'dist/index.js',
    cwd: '/var/www/bayg',
    instances: 2,                    // Use 2 instances for 4 CPU cores
    exec_mode: 'cluster',            // Cluster mode for better performance
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',        // Restart if memory exceeds 2GB
    node_args: '--max-old-space-size=2048',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://bayg_user:BAYG_SecurePass_2025!@localhost:5432/bayg',
      HOST: '0.0.0.0'
    },
    error_file: '/var/www/bayg/logs/pm2-err.log',
    out_file: '/var/www/bayg/logs/pm2-out.log',
    log_file: '/var/www/bayg/logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
  }]
};
EOF

# Create PM2 logs directory
mkdir -p /var/www/bayg/logs
chown -R root:www-data /var/www/bayg/logs
```

---

## **Phase 13: Nginx Configuration**

```bash
# Create Nginx site configuration for BAYG
cat > /etc/nginx/sites-available/bayg << 'EOF'
# BAYG E-commerce Platform - Hostinger VPS Configuration
# Server: 148.230.88.243

server {
    listen 80;
    listen [::]:80;
    server_name 148.230.88.243 srv937692.hstgr.cloud;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;
    
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
        
        # Timeouts
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # Buffer settings for better performance
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Static file serving with aggressive caching
    location /uploads/ {
        alias /var/www/bayg/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
        
        # Security for uploads
        location ~* \.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # API routes with specific configuration
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API-specific timeouts
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # Rate limiting (optional)
        # limit_req zone=api burst=20 nodelay;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
    
    # File upload configuration
    client_max_body_size 50M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Security - hide server version
    server_tokens off;
    
    # Block common exploits
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Logging
    access_log /var/log/nginx/bayg_access.log;
    error_log /var/log/nginx/bayg_error.log warn;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bayg /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "Nginx configuration updated successfully"
else
    echo "Nginx configuration test failed"
    exit 1
fi
```

---

## **Phase 14: Security Configuration**

```bash
# Configure UFW firewall
ufw --force enable
ufw default deny incoming
ufw default allow outgoing

# Allow essential services
ufw allow ssh
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Nginx
ufw allow 'Nginx Full'

# Show firewall status
ufw status verbose

# Configure fail2ban for SSH protection
systemctl enable fail2ban
systemctl start fail2ban

# Create fail2ban jail for nginx
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = 80,443
maxretry = 5
EOF

systemctl restart fail2ban
```

---

## **Phase 15: Application Startup**

```bash
cd /var/www/bayg

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://bayg_user:BAYG_SecurePass_2025!@localhost:5432/bayg"

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root

# Monitor application
pm2 status
pm2 logs bayg-ecommerce --lines 20
```

---

## **Phase 16: SSL Certificate (Optional but Recommended)**

```bash
# Install Certbot for Let's Encrypt SSL
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (if you have a domain)
# certbot --nginx -d yourdomain.com

# For IP-only access, create self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/bayg-selfsigned.key \
    -out /etc/ssl/certs/bayg-selfsigned.crt \
    -subj "/C=US/ST=MA/L=Boston/O=BAYG/CN=148.230.88.243"

# Update Nginx for SSL (optional)
# Add SSL configuration to /etc/nginx/sites-available/bayg
```

---

## **Phase 17: Monitoring & Maintenance**

```bash
# Create system monitoring script
cat > /root/monitor-bayg.sh << 'EOF'
#!/bin/bash
echo "=== BAYG System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo ""

echo "=== Service Status ==="
systemctl is-active nginx postgresql pm2
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== Disk Usage ==="
df -h /var/www/bayg
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Application Logs (Last 10 lines) ==="
tail -n 10 /var/www/bayg/logs/pm2-combined.log
EOF

chmod +x /root/monitor-bayg.sh

# Create daily backup script
cat > /root/backup-bayg.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/bayg/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U bayg_user bayg > $BACKUP_DIR/bayg_db_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/bayg_files_$DATE.tar.gz \
    /var/www/bayg \
    --exclude=/var/www/bayg/node_modules \
    --exclude=/var/www/bayg/backups \
    --exclude=/var/www/bayg/logs

# Keep only last 7 days of backups
find $BACKUP_DIR -name "bayg_*" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup-bayg.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-bayg.sh") | crontab -
```

---

## **🎯 Final Verification**

```bash
# Check all services
systemctl status nginx postgresql
pm2 status

# Test database connection
psql -h localhost -U bayg_user -d bayg -c "SELECT COUNT(*) FROM users;"

# Test application locally
curl -I http://localhost:5000

# Test application externally
curl -I http://148.230.88.243

# View application logs
pm2 logs bayg-ecommerce --lines 50

# Monitor system resources
htop
```

---

## **🌐 Access Your BAYG Platform**

### **Production URLs**
- **Main Application**: http://148.230.88.243
- **Admin Panel**: http://148.230.88.243/admin
- **API Endpoints**: http://148.230.88.243/api

### **Default Login Credentials**
- **Super Admin**: admin / admin123 (admin@bayg.com)
- **Manager**: manager / manager123 (manager@bayg.com)
- **Customer**: user / user123

### **Server Management**
- **SSH Access**: `ssh root@148.230.88.243`
- **Database Access**: `psql -h localhost -U bayg_user -d bayg`
- **Hostinger Panel**: VPS Management Dashboard

---

## **🔧 Troubleshooting Commands**

```bash
# Application issues
pm2 restart bayg-ecommerce
pm2 logs bayg-ecommerce --lines 100

# Database issues
systemctl restart postgresql
psql -h localhost -U bayg_user -d bayg

# Web server issues
systemctl restart nginx
nginx -t
tail -f /var/log/nginx/bayg_error.log

# System monitoring
/root/monitor-bayg.sh
htop
df -h
```

---

## **🎉 Success!**

Your BAYG e-commerce platform is now deployed on Hostinger VPS with:

✅ **High-performance setup** (4 CPU cores, 16GB RAM)  
✅ **Production-grade database** (PostgreSQL 16)  
✅ **Load balancing** (PM2 cluster mode)  
✅ **Reverse proxy** (Nginx with optimizations)  
✅ **Security** (Firewall, fail2ban, security headers)  
✅ **Monitoring** (PM2, logs, backups)  
✅ **Auto-restart** (PM2 process management)

**Your BAYG platform is now live at: http://148.230.88.243**