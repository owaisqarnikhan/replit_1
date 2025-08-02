# BAYG Deployment to AWS Server 3.23.101.72

## 🚀 **Ready-to-Use Commands for Your Server**

Connect to your AWS server and run these commands:

```bash
ssh -i your-key.pem ubuntu@3.23.101.72
```

---

## **Complete Deployment Script**

```bash
#!/bin/bash
# BAYG deployment script for 3.23.101.72
set -e

echo "🚀 Deploying BAYG to AWS server 3.23.101.72..."

# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create BAYG database
sudo -u postgres psql << 'EOF'
CREATE DATABASE bayg;
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;
\q
EOF

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg

# Configure Nginx
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
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

echo "✅ Server setup complete!"
```

---

## **Application Setup (After uploading BAYG files)**

```bash
cd /var/www/bayg

# Install dependencies
npm install
npm install postgres pg

# Build application with error handling
npm run build || {
    echo "Build failed, trying manual build..."
    npx vite build
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}

# Create environment file
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
cat > server/db.ts << 'EOF'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = postgres(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
export const pool = sql;
EOF

# Rebuild with error handling
npm run build || npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create PM2 config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bayg-ecommerce',
    script: 'dist/index.js',
    cwd: '/var/www/bayg',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://dbuser:SecurePass123!@localhost:5432/bayg'
    }
  }]
};
EOF

# Start application
mkdir -p logs
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Verify deployment
pm2 status
curl -I http://localhost:5000
curl -I http://3.23.101.72
```

---

## **Access Your BAYG Platform**

**🌐 URL**: http://3.23.101.72

**🔑 Login Credentials**:
- **Super Admin**: admin / admin123
- **Manager**: manager / manager123  
- **Customer**: user / user123

---

## **Quick Verification**

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# View logs
pm2 logs bayg-ecommerce

# Test endpoints
curl http://3.23.101.72
```

---

## **Next Steps**

1. **Upload BAYG Files**: Transfer your project files to `/var/www/bayg/`
2. **Configure Gmail**: Update `.env.production` with your Gmail credentials
3. **Change Passwords**: Update default user passwords after first login
4. **Setup Domain** (Optional): Point your domain to 3.23.101.72

Your BAYG e-commerce platform will be live at **http://3.23.101.72**!