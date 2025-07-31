# 🚀 InnovanceOrbit AWS Deployment Guide Using PuTTY

## Prerequisites for Deployment

### What You Need:
1. **AWS Account** (sign up at aws.amazon.com)
2. **PuTTY** installed on your Windows computer
3. **WinSCP** for file transfers (optional but recommended)
4. **Your project files** (we'll prepare a deployment package)

---

## Phase 1: AWS Account Setup (15 minutes)

### Step 1: Create AWS Account
1. Go to **aws.amazon.com**
2. Click **"Create an AWS Account"**
3. Enter your email and create password
4. Add billing information (you get $300 free credits)
5. Verify your phone number
6. Choose **Basic Support Plan** (free)

### Step 2: Create Key Pair for PuTTY
1. Login to **AWS Console**
2. Go to **EC2 Dashboard**
3. Click **"Key Pairs"** in left menu
4. Click **"Create key pair"**
5. Name: `innovanceorbit-key`
6. Type: **RSA**
7. Format: **ppk** (for PuTTY)
8. Click **"Create key pair"**
9. **Save the .ppk file** - you'll need this for PuTTY

---

## Phase 2: Launch EC2 Server (20 minutes)

### Step 1: Launch EC2 Instance
1. In **EC2 Dashboard**, click **"Launch Instance"**
2. **Name**: `InnovanceOrbit-Server`
3. **Operating System**: Ubuntu Server 22.04 LTS (free tier eligible)
4. **Instance Type**: `t3.small` (2 vCPU, 2 GB RAM)
5. **Key Pair**: Select `innovanceorbit-key` (created above)

### Step 2: Configure Storage
1. **Storage**: 30 GB gp3 SSD
2. Keep default settings
3. Click **"Launch Instance"**

### Step 3: Configure Security Group
1. In **Security Groups**, edit your instance's security group
2. **Add these rules**:
   ```
   Type: SSH        Port: 22    Source: My IP
   Type: HTTP       Port: 80    Source: 0.0.0.0/0
   Type: HTTPS      Port: 443   Source: 0.0.0.0/0
   Type: Custom     Port: 5000  Source: 0.0.0.0/0
   ```

---

## Phase 3: Connect Using PuTTY (10 minutes)

### Step 1: Get Server IP Address
1. In **EC2 Instances**, select your server
2. Copy the **Public IPv4 address** (e.g., 3.15.123.456)

### Step 2: Connect with PuTTY
1. Open **PuTTY**
2. **Host Name**: `ubuntu@YOUR-SERVER-IP` (e.g., ubuntu@3.15.123.456)
3. **Port**: 22
4. **Connection Type**: SSH
5. In left panel: **Connection > SSH > Auth > Credentials**
6. **Private key file**: Browse and select your `.ppk` file
7. Click **"Open"**
8. Accept the security alert
9. You should see: `ubuntu@ip-xxx-xxx-xxx:~$`

---

## Phase 4: Prepare Deployment Package (Local Computer)

### Step 1: Create Deployment Folder
Create a folder on your computer: `innovanceorbit-deployment`

### Step 2: Required Files to Include
```
innovanceorbit-deployment/
├── dist/                    # Built application files
├── uploads/                 # Upload directory
├── package.json            # Dependencies
├── package-lock.json       # Lock file
├── .env                    # Environment variables (create new)
└── ecosystem.config.js     # PM2 configuration (create new)
```

### Step 3: Create .env File
Create `.env` file with these contents:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/innovanceorbit
SESSION_SECRET=your-super-secret-session-key-here
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=info@innovanceorbit.com
EMAIL_PASS=your-email-password
STRIPE_SECRET_KEY=your-stripe-key-if-needed
```

### Step 4: Create PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

---

## Phase 5: Server Setup via PuTTY (30 minutes)

### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 4: Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE DATABASE innovanceorbit;
CREATE USER dbadmin WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbadmin;
GRANT ALL ON SCHEMA public TO dbadmin;
ALTER USER dbadmin CREATEDB;
\q

# Exit back to ubuntu user
exit
```

### Step 5: Install PM2 and Nginx
```bash
sudo npm install -g pm2
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Phase 6: Upload Files Using WinSCP (15 minutes)

### Option A: Using WinSCP (Recommended)
1. Download **WinSCP** from winscp.net
2. **Host name**: Your server IP
3. **User name**: ubuntu
4. **Private key file**: Your .ppk file
5. Connect and upload your `innovanceorbit-deployment` folder to `/home/ubuntu/`

### Option B: Using PuTTY + Manual Upload
If you don't have WinSCP, you can use these PuTTY commands:
```bash
# Create app directory
mkdir -p /home/ubuntu/innovanceorbit
cd /home/ubuntu/innovanceorbit

# You'll need to manually transfer files using scp or other methods
```

---

## Phase 7: Deploy Application (20 minutes)

### Step 1: Install Dependencies
```bash
cd /home/ubuntu/innovanceorbit
npm install --production
```

### Step 2: Setup Database Schema
```bash
# Set your DATABASE_URL in .env first
export DATABASE_URL="postgresql://dbadmin:your-secure-password@localhost:5432/innovanceorbit"

# Run database migration
npm run db:push
```

### Step 3: Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions from the startup command
```

### Step 4: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/innovanceorbit
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

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
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 8: Test Your Deployment (10 minutes)

### Step 1: Check Application Status
```bash
pm2 status
pm2 logs innovanceorbit
```

### Step 2: Test Website
1. Open browser
2. Go to `http://YOUR-SERVER-IP`
3. You should see your InnovanceOrbit website
4. Test login with: admin / admin123

---

## 🎯 Monthly Costs with This Setup

```
EC2 t3.small (2 vCPU, 2GB RAM):     $15.30/month
EBS Storage (30GB):                  $3.00/month
Data Transfer (100GB):               $9.00/month
Elastic IP (optional):               $3.65/month
-------------------------------------------
TOTAL:                              $30.95/month
```

## 🔧 Useful PuTTY Commands

### Monitor Your Application:
```bash
pm2 status                    # Check app status
pm2 logs innovanceorbit      # View logs
pm2 restart innovanceorbit   # Restart app
sudo systemctl status nginx  # Check nginx
sudo systemctl status postgresql  # Check database
```

### Update Your Application:
```bash
cd /home/ubuntu/innovanceorbit
pm2 stop innovanceorbit
# Upload new files via WinSCP
npm install --production
pm2 start innovanceorbit
```

## ✅ Deployment Complete!

Your InnovanceOrbit e-commerce platform is now running on AWS! Access it at your server's IP address and start managing your online store.

## 📞 Need Help?

If you encounter any issues during deployment, check the logs:
```bash
pm2 logs innovanceorbit --lines 50
sudo tail -f /var/log/nginx/error.log
```

This setup gives you a professional e-commerce platform with full control and lower costs than using managed services.