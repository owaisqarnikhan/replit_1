# BAYG - Quick AWS Ubuntu Deployment Commands

## 🚀 **Essential Commands Only** (Copy & Paste Ready)

### **Step 1: System Setup**
```bash
# Update system and install essentials
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential

# Verify ubuntu user (default on AWS EC2)
whoami  # Should show: ubuntu
```

### **Step 2: Install PostgreSQL**
```bash
# Install and setup PostgreSQL
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
```

### **Step 3: Install Node.js & PM2**
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### **Step 4: Install & Configure Nginx**
```bash
# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create BAYG Nginx config
sudo tee /etc/nginx/sites-available/bayg << 'EOF'
server {
    listen 80;
    server_name 3.23.101.72 your-domain.com www.your-domain.com;
    
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
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 5: Deploy BAYG Application**
```bash
# Create application directory
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg
cd /var/www/bayg

# Upload your BAYG project files here, then:
npm install
npm install postgres pg

# Verify installation and build
npx vite --version
npm run build || npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### **Step 6: Environment Configuration**
```bash
# Create production environment
cat > /var/www/bayg/.env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://dbuser:SecurePass123!@localhost:5432/bayg
SESSION_SECRET=bayg-ultra-secure-session-secret-2025
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
APP_URL=http://3.23.101.72
EOF

chmod 600 /var/www/bayg/.env.production
```

### **Step 7: Update Database Config**
```bash
# Update server/db.ts for PostgreSQL
cat > /var/www/bayg/server/db.ts << 'EOF'
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

# Rebuild application
npm run build
```

### **Step 8: Start with PM2**
```bash
# Create PM2 config
cat > /var/www/bayg/ecosystem.config.js << 'EOF'
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
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **Step 9: Setup SSL (Optional)**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# SSL setup (optional for IP addresses)
# If you have a domain, replace with your domain:
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### **Step 10: Setup Firewall**
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

## ✅ **Verification Commands**
```bash
# Check services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test application
curl http://localhost:5000
curl http://3.23.101.72

# Check logs
pm2 logs bayg-ecommerce
```

## 🔑 **BAYG Login Credentials**
- **Admin**: admin / admin123 (admin@bayg.com)
- **Manager**: manager / manager123 (manager@bayg.com)
- **Customer**: user / user123

## 📝 **Important Notes**
1. Replace `your-domain.com` with your actual domain
2. Replace `your-email@gmail.com` and `your-gmail-app-password` with your Gmail credentials
3. Change default passwords after first login
4. Upload your BAYG project files to `/var/www/bayg/` before running npm commands

Your BAYG e-commerce platform is now deployed and running!