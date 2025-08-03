# 🚀 Deploy Your Working BAYG Project to AWS Server NOW

Your project is working perfectly in Replit! Now let's get it running on your AWS server at 3.23.101.72.

---

## **Step 1: Connect to Your AWS Server**

```bash
# Use your .ppk key to connect
ssh -i RC-BAYG_1754170132424.pem ubuntu@3.23.101.72
```

---

## **Step 2: Quick Server Setup**

```bash
# Update system and install essentials
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql << 'EOF'
CREATE DATABASE bayg;
CREATE USER dbuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE bayg TO dbuser;
ALTER USER dbuser CREATEDB;
GRANT ALL ON SCHEMA public TO dbuser;
\q
EOF

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create app directory
sudo mkdir -p /var/www/bayg
sudo chown -R ubuntu:ubuntu /var/www/bayg
```

---

## **Step 3: Upload Your Project Files**

### **Option A: Download from Replit and Upload**

1. **From Replit**: Download your project as ZIP
   - Go to Files → Export as ZIP
   - Download the project

2. **Upload to AWS**:
```bash
# From your local machine
scp -i RC-BAYG_1754170132424.pem bayg-project.zip ubuntu@3.23.101.72:/home/ubuntu/

# On AWS server
cd /var/www/bayg
unzip /home/ubuntu/bayg-project.zip
```

### **Option B: Direct Transfer**

```bash
# On AWS server
cd /var/www/bayg

# If you have git repository
git clone YOUR_REPO_URL .

# Or manually upload via SFTP/WinSCP to /var/www/bayg/
```

---

## **Step 4: Install Dependencies & Build**

```bash
cd /var/www/bayg

# Install dependencies
npm install
npm install postgres pg

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

# Update database config for production
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
npm run build || {
    npx vite build
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
}
```

---

## **Step 5: Configure Nginx**

```bash
# Create Nginx configuration
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

# Configure firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

---

## **Step 6: Start Application**

```bash
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

# Set environment and start
export DATABASE_URL="postgresql://dbuser:SecurePass123!@localhost:5432/bayg"
export NODE_ENV=production

pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## **Step 7: Verify Deployment**

```bash
# Check services
sudo systemctl status nginx postgresql
pm2 status

# Test locally
curl -I http://localhost:5000

# Test externally from your browser
# Go to: http://3.23.101.72
```

---

## **🎯 Expected Result**

After following these steps, your BAYG e-commerce platform will be accessible at:

**🌐 URL**: http://3.23.101.72

**🔑 Login Credentials**:
- **Super Admin**: admin / admin123
- **Manager**: manager / manager123  
- **Customer**: user / user123

---

## **🔧 Quick Troubleshooting**

If something doesn't work:

```bash
# Check application logs
pm2 logs bayg-ecommerce

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test database connection
psql -h localhost -U dbuser -d bayg -c "SELECT version();"

# Check if port 5000 is listening
sudo netstat -tlnp | grep :5000
```

---

## **📱 Why Your Current Setup Shows Development Mode**

Your current Replit environment is perfect for development, but:
- It's running in development mode with Vite dev server
- It's not accessible via external IP (3.23.101.72) because it's running on Replit's servers
- The HTML you see includes Vite development features and Replit banners

Once deployed to AWS, you'll have:
- Production build with optimized static files
- External IP access (3.23.101.72)
- Full production environment with PostgreSQL
- All your 85 permissions and user management features

**Your project is working perfectly - now let's get it live on your AWS server!**