# 🚀 Deploy BAYG to Your AWS Server RIGHT NOW!

**Your Server**: 3.23.101.72  
**Key File**: RC-BAYG_1754170132424.ppk  
**Target**: Ubuntu server with full BAYG deployment

---

## **Step 1: Connect to Your Server**

### **Option A: Using PuTTY (Windows)**
1. Open PuTTY
2. Host Name: `3.23.101.72`
3. Port: `22`
4. Connection Type: SSH
5. Go to Connection → SSH → Auth → Private key file
6. Browse and select: `RC-BAYG_1754170132424.ppk`
7. Click "Open" and login as: `ubuntu`

### **Option B: Using SSH (Mac/Linux)**
```bash
# Convert .ppk to .pem first (if needed)
# Or use PuTTY tools: puttygen RC-BAYG_1754170132424.ppk -O private-openssh -o bayg-key.pem

# Connect to server
ssh -i RC-BAYG_1754170132424.pem ubuntu@3.23.101.72
```

---

## **Step 2: Server Setup (Copy & Paste This Script)**

```bash
#!/bin/bash
# BAYG Complete Server Setup - Run this on your AWS server
set -e

echo "🚀 Setting up BAYG server environment..."

# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create BAYG database
echo "🗄️ Setting up database..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE bayg;
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;
\q
EOF

# Install Node.js 20
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/bayg << 'EOF'
server {
    listen 80;
    server_name 3.23.101.72;
    
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
    }
    
    client_max_body_size 50M;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/bayg /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

echo "✅ Server setup complete! Ready for BAYG application upload."
```

---

## **Step 3: Upload BAYG Files**

### **Method A: Using SCP (Recommended)**
From your local machine where you have the BAYG project:

```bash
# Create a zip of your project (exclude node_modules and .git)
tar -czf bayg-project.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.cache \
  client/ server/ shared/ uploads/ \
  package.json package-lock.json \
  tsconfig.json vite.config.ts tailwind.config.ts \
  postcss.config.js drizzle.config.ts components.json

# Upload to server
scp -i RC-BAYG_1754170132424.pem bayg-project.tar.gz ubuntu@3.23.101.72:/var/www/bayg/

# Connect to server and extract
ssh -i RC-BAYG_1754170132424.pem ubuntu@3.23.101.72
cd /var/www/bayg
tar -xzf bayg-project.tar.gz
rm bayg-project.tar.gz
```

### **Method B: Using Git (Alternative)**
```bash
# On your server
cd /var/www/bayg
git clone YOUR_REPOSITORY_URL .
# Or upload files manually via SFTP
```

---

## **Step 4: Deploy Application (Run on Server)**

```bash
# Navigate to project directory
cd /var/www/bayg

# Install dependencies
echo "📦 Installing dependencies..."
npm install --include=dev
npm install postgres pg

# Create production environment
echo "⚙️ Creating environment file..."
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

chmod 600 .env.production

# Update database config
echo "🗄️ Updating database configuration..."
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

# Build application
echo "🔨 Building application..."
npm run build || {
    echo "Build failed, trying manual build..."
    npx vite build
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# Verify build
ls -la dist/

# Create PM2 config
echo "⚙️ Creating PM2 configuration..."
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

# Set environment variables
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production

# Start application
echo "🚀 Starting BAYG application..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo "✅ BAYG deployment complete!"
```

---

## **Step 5: Verify Deployment**

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test application
curl -I http://localhost:5000
curl -I http://3.23.101.72

# View logs if needed
pm2 logs bayg-ecommerce
```

---

## **🎉 Access Your BAYG Platform**

**🌐 URL**: http://3.23.101.72

**🔑 Login Credentials**:
- **Super Admin**: admin / admin123 (admin@bayg.com)
- **Manager**: manager / manager123 (manager@bayg.com)  
- **Customer**: user / user123

---

## **⚙️ Post-Deployment Configuration**

1. **Update Gmail SMTP** in `.env.production`:
   ```bash
   nano .env.production
   # Update SMTP_USER and SMTP_PASSWORD with your Gmail credentials
   pm2 restart bayg-ecommerce
   ```

2. **Change Default Passwords** (Login and go to Settings)

3. **Upload Your Logo/Images** (Admin Panel → Settings)

4. **Test All Features**:
   - User registration
   - Product management
   - Order workflow
   - Email notifications
   - Payment processing

---

## **🛠️ Troubleshooting**

If you encounter issues, check:
```bash
# Service status
sudo systemctl status nginx postgresql
pm2 status

# Application logs
pm2 logs bayg-ecommerce

# Database connection
psql -h localhost -U dbuser -d bayg

# Network connectivity
curl http://localhost:5000/api/settings
```

**Your BAYG e-commerce platform is now live at http://3.23.101.72!**