# Complete AWS Ubuntu EC2 Deployment Walkthrough
## InnovanceOrbit E-commerce Platform - Step-by-Step Guide

### 🎯 **OVERVIEW**
This guide will walk you through deploying your complete e-commerce platform on AWS Ubuntu EC2, from initial server setup to having a fully functional live website.

---

## 📋 **PREREQUISITES CHECKLIST**

Before starting, ensure you have:
- [ ] AWS EC2 Ubuntu instance (20.04 LTS or newer) running
- [ ] .ppk file for SSH access to your EC2 instance
- [ ] Public IP address of your EC2 instance
- [ ] PuTTY or SSH client installed on your computer
- [ ] Gmail account with 2FA enabled (for email functionality)
- [ ] Domain name (optional but recommended for production)

---

## 🔗 **PHASE 1: CONNECTING TO YOUR AWS SERVER**

### **Step 1.1: Using PuTTY (Windows Users)**

1. **Open PuTTY application**
2. **Configure Connection:**
   - Host Name (or IP address): `YOUR_EC2_PUBLIC_IP`
   - Port: `22`
   - Connection type: `SSH`

3. **Set up SSH Key:**
   - Go to `Connection` → `SSH` → `Auth` → `Credentials`
   - Click `Browse` next to "Private key file for authentication"
   - Select your `.ppk` file

4. **Save Session (Optional):**
   - Go back to `Session`
   - Enter a name in "Saved Sessions"
   - Click `Save`

5. **Connect:**
   - Click `Open`
   - Accept security alert if prompted
   - Login as: `ubuntu`

### **Step 1.2: Using SSH (Mac/Linux Users)**

```bash
# If you have a .ppk file, convert it to .pem format
puttygen your-key.ppk -O private-openssh -o your-key.pem

# Set correct permissions
chmod 400 your-key.pem

# Connect to your server
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

### **Step 1.3: Verify Connection**
Once connected, you should see something like:
```
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-1051-aws x86_64)
ubuntu@ip-172-31-xx-xx:~$
```

---

## 🔧 **PHASE 2: INITIAL SERVER SETUP**

### **Step 2.1: Update System Packages**
```bash
# Update package list and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# This may take 5-10 minutes depending on updates available
```

### **Step 2.2: Install Node.js 20 (LTS)**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### **Step 2.3: Install System Dependencies**
```bash
# Install essential packages
sudo apt install -y git nginx postgresql postgresql-contrib htop curl wget unzip

# Install PM2 process manager globally
sudo npm install -g pm2

# Verify installations
nginx -v          # Should show nginx version
psql --version    # Should show PostgreSQL version
pm2 --version     # Should show PM2 version
```

### **Step 2.4: Configure Firewall**
```bash
# Allow SSH (port 22)
sudo ufw allow ssh

# Allow HTTP and HTTPS (ports 80 and 443)
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw --force enable

# Check firewall status
sudo ufw status
```
Expected output:
```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 🗄️ **PHASE 3: DATABASE SETUP**

### **Step 3.1: Start PostgreSQL Service**
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### **Step 3.2: Create Database and User**
```bash
# Switch to postgres user and open PostgreSQL prompt
sudo -u postgres psql
```

In the PostgreSQL prompt, run these commands:
```sql
-- Create database
CREATE DATABASE innovanceorbit;


-- Create user with secure password (replace 'your_secure_password')
CREATE USER dbuser WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbuser;
ALTER USER dbuser CREATEDB;

-- Connect to the database and set permissions
\c innovanceorbit
GRANT ALL ON SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbuser;

-- Exit PostgreSQL
\q
```

### **Step 3.3: Test Database Connection**
```bash
# Test connection (replace 'your_secure_password')
PGPASSWORD=your_secure_password psql -h localhost -U dbuser -d innovanceorbit -c "SELECT version();"
```

If successful, you'll see PostgreSQL version information.

---

## 📁 **PHASE 4: APPLICATION SETUP**

### **Step 4.1: Create Application Directory**
```bash
# Create directory for your application
sudo mkdir -p /var/www/innovanceorbit

# Change ownership to ubuntu user
sudo chown ubuntu:ubuntu /var/www/innovanceorbit

# Navigate to the directory
cd /var/www/innovanceorbit
```

### **Step 4.2: Upload Your Project Files**

You have several options to upload your files:

#### **Option A: Using SCP (Secure Copy)**
From your local machine (where your project files are):
```bash
# Upload entire project directory
scp -i your-key.pem -r /path/to/your/project/* ubuntu@YOUR_PUBLIC_IP:/var/www/innovanceorbit/
```

#### **Option B: Using WinSCP (Windows)**
1. Open WinSCP
2. Set File protocol to `SFTP`
3. Enter your EC2 public IP as Host name
4. Username: `ubuntu`
5. Go to Advanced → SSH → Authentication → Private key file: Select your .ppk file
6. Connect and drag/drop your project files

#### **Option C: Using FileZilla**
1. Open FileZilla
2. Go to Edit → Settings → SFTP → Add key file (your .ppk file)
3. Connect using: `sftp://ubuntu@YOUR_PUBLIC_IP`
4. Upload your project files

### **Step 4.3: Create Environment Configuration**
```bash
# Navigate to your project directory
cd /var/www/innovanceorbit

# Create production environment file
nano .env.production
```

Add this content (replace with your actual values):
```env
# Application Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (use the password you set earlier)
DATABASE_URL=postgresql://dbuser:your_secure_password@localhost:5432/innovanceorbit
PGHOST=localhost
PGPORT=5432
PGDATABASE=innovanceorbit
PGUSER=dbuser
PGPASSWORD=your_secure_password

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=khanawais51@gmail.com
SMTP_PASSWORD=nrfxywdxvqsaiwvh

# Session Security (generate a long random string)
SESSION_SECRET=your-very-long-random-session-secret-min-32-characters

# Optional: Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

**Important Gmail Setup:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this 16-character password in SMTP_PASSWORD

### **Step 4.4: Install Dependencies and Build**
```bash
# Install Node.js dependencies
npm install

# Build the application for production
npm run build

# Run database migrations to create tables
npm run db:push
```

---

## ⚙️ **PHASE 5: PROCESS MANAGEMENT WITH PM2**

### **Step 5.1: Create PM2 Configuration**
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/innovanceorbit',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/innovanceorbit-error.log',
    out_file: '/var/log/pm2/innovanceorbit-out.log',
    log_file: '/var/log/pm2/innovanceorbit-combined.log',
    time: true,
    autorestart: true
  }]
};
```

### **Step 5.2: Create Log Directory and Start Application**
```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually starts with 'sudo env PATH=...')

# Check application status
pm2 status
```

### **Step 5.3: Verify Application is Running**
```bash
# Check if application responds on port 5000
curl http://localhost:5000

# View application logs
pm2 logs innovanceorbit

# Monitor application in real-time
pm2 monit
```

---

## 🌐 **PHASE 6: NGINX REVERSE PROXY SETUP**

### **Step 6.1: Create Nginx Configuration**
```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/innovanceorbit
```

Add this configuration (replace YOUR_DOMAIN_OR_IP):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Handle file uploads
    client_max_body_size 10M;

    # Serve static files (images, uploads)
    location /uploads/ {
        alias /var/www/innovanceorbit/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy all other requests to Node.js application
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
}
```

### **Step 6.2: Enable Site and Start Nginx**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
sudo systemctl status nginx
```

### **Step 6.3: Create Uploads Directory**
```bash
# Create uploads directory for file uploads
mkdir -p /var/www/innovanceorbit/uploads
chmod 755 /var/www/innovanceorbit/uploads
```

---

## 🔒 **PHASE 7: SSL CERTIFICATE (OPTIONAL BUT RECOMMENDED)**

### **Step 7.1: Install Certbot**
```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx -y
```

### **Step 7.2: Get SSL Certificate**
```bash
# Get certificate (replace yourdomain.com with your actual domain)
sudo certbot --nginx -d yourdomain.com

# Follow the prompts:
# 1. Enter email address
# 2. Agree to terms
# 3. Choose whether to share email with EFF
# 4. Certbot will automatically configure Nginx for HTTPS
```

### **Step 7.3: Set Up Auto-renewal**
```bash
# Enable automatic certificate renewal
sudo systemctl enable certbot.timer

# Test renewal process
sudo certbot renew --dry-run
```

---

## 🧪 **PHASE 8: TESTING AND VERIFICATION**

### **Step 8.1: Test Website Access**
1. **Open your web browser**
2. **Navigate to:** `http://YOUR_PUBLIC_IP` or `https://yourdomain.com`
3. **You should see your InnovanceOrbit homepage**

### **Step 8.2: Test Login Functionality**
Try logging in with default credentials:
- **Super Admin:** Username: `admin`, Password: `admin123`
- **Manager:** Username: `manager`, Password: `manager123`
- **Customer:** Username: `user`, Password: `user123`

### **Step 8.3: Test Email Functionality**
1. **Login as Super Admin**
2. **Go to Super Admin Panel → Site Settings**
3. **Configure Gmail SMTP settings**
4. **Click "Test Email Connection"**
5. **You should receive a test email**

### **Step 8.4: Test Order Process**
1. **Login as a customer**
2. **Add products to cart**
3. **Place an order**
4. **Login as admin and approve the order**
5. **Complete payment process**
6. **Verify email notifications are sent**

---

## 🔧 **PHASE 9: POST-DEPLOYMENT CONFIGURATION**

### **Step 9.1: Change Default Passwords**
**CRITICAL SECURITY STEP:**
1. Login as each default user
2. Go to profile settings
3. Change passwords to secure ones
4. Document new passwords securely

### **Step 9.2: Configure Application Settings**
1. **Login as Super Admin**
2. **Go to Site Settings**
3. **Configure:**
   - Site name and branding
   - Contact information
   - Social media links
   - Footer content
   - Email templates

### **Step 9.3: Upload Company Assets**
1. **Upload company logo**
2. **Add product images**
3. **Configure slider images**
4. **Set up categories and products**

---

## 📊 **PHASE 10: MONITORING AND MAINTENANCE**

### **Step 10.1: Set Up Monitoring Commands**
```bash
# Check application status
pm2 status

# View application logs
pm2 logs innovanceorbit

# Monitor system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Step 10.2: Set Up Automated Backups**
```bash
# Create backup script
nano /home/ubuntu/backup.sh
```

Add backup script content:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U dbuser innovanceorbit > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/innovanceorbit/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /home/ubuntu/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add this line: 0 2 * * * /home/ubuntu/backup.sh
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues and Solutions:**

#### **Issue 1: Application Won't Start**
```bash
# Check PM2 logs
pm2 logs innovanceorbit

# Common causes:
# - Database connection failed
# - Environment variables missing
# - Dependencies not installed
```

#### **Issue 2: Nginx 502 Bad Gateway**
```bash
# Check if Node.js app is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check if port 5000 is in use
sudo netstat -tlnp | grep :5000
```

#### **Issue 3: Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
PGPASSWORD=your_password psql -h localhost -U dbuser -d innovanceorbit -c "SELECT 1;"
```

#### **Issue 4: Email Not Working**
1. **Verify Gmail SMTP settings**
2. **Check App Password is correct**
3. **Ensure 2FA is enabled on Gmail**
4. **Check firewall allows port 587**

---

## 📋 **FINAL CHECKLIST**

- [ ] Server connected and updated
- [ ] Node.js and dependencies installed
- [ ] PostgreSQL configured and running
- [ ] Application files uploaded
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] PM2 process manager running application
- [ ] Nginx reverse proxy configured
- [ ] Firewall properly configured
- [ ] SSL certificate installed (if using domain)
- [ ] Default passwords changed
- [ ] Email functionality tested
- [ ] Order process tested
- [ ] Backup system configured
- [ ] Monitoring tools set up

---

## 🎉 **CONGRATULATIONS!**

Your InnovanceOrbit e-commerce platform is now live and fully functional on AWS Ubuntu EC2!

**Access your live website at:**
- `http://YOUR_PUBLIC_IP` or `https://yourdomain.com`

**Key Management URLs:**
- Super Admin Panel: `/admin-dashboard`
- Manager Panel: `/admin-dashboard` (limited access)
- User Dashboard: `/user-dashboard`

**Remember to:**
1. **Keep your system updated:** `sudo apt update && sudo apt upgrade`
2. **Monitor application logs:** `pm2 logs innovanceorbit`
3. **Regular backups:** Run backup script weekly
4. **Security updates:** Keep all software current
5. **Performance monitoring:** Use `pm2 monit` and `htop`

Your platform is now ready for production use with full e-commerce functionality, role-based access control, email notifications, and secure payment processing!