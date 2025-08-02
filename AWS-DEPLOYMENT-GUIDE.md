# AWS Ubuntu EC2 Deployment Guide for InnovanceOrbit

## Prerequisites
- AWS EC2 Ubuntu instance (20.04 LTS or newer)
- .ppk file for SSH access
- Public IP address of your EC2 instance
- PuTTY or SSH client installed on your local machine
- Domain name (optional but recommended)

## Step-by-Step Deployment Instructions

### Step 1: Connect to Your AWS Ubuntu Server

#### Using PuTTY (Windows):
1. Open PuTTY
2. In "Host Name": Enter your EC2 public IP
3. Port: 22
4. Connection type: SSH
5. Go to Connection > SSH > Auth > Credentials
6. Browse and select your .ppk file
7. Click "Open" to connect
8. Login as: `ubuntu`

#### Using SSH (Mac/Linux):
```bash
# Convert .ppk to .pem if needed
puttygen your-key.ppk -O private-openssh -o your-key.pem
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

### Step 2: Update System and Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional dependencies
sudo apt install -y git nginx postgresql postgresql-contrib pm2 -g

# Verify installations
node --version
npm --version
nginx -v
psql --version
```

### Step 3: Setup PostgreSQL Database

```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt, run:
```sql
CREATE DATABASE innovanceorbit;
CREATE USER dbuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbuser;
ALTER USER dbuser CREATEDB;
\q
```

### Step 4: Clone and Setup Your Project

```bash
# Create application directory
sudo mkdir -p /var/www/innovanceorbit
sudo chown ubuntu:ubuntu /var/www/innovanceorbit
cd /var/www/innovanceorbit

# Clone your project (you'll need to upload your code)
# Option 1: If you have a Git repository
# git clone https://your-repo-url.git .

# Option 2: Upload via SCP/SFTP (from your local machine)
# scp -i your-key.pem -r /path/to/your/project/* ubuntu@YOUR_PUBLIC_IP:/var/www/innovanceorbit/
```

### Step 5: Configure Environment Variables

```bash
# Create production environment file
nano .env.production
```

Add the following content (replace with your actual values):
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://dbuser:your_secure_password@localhost:5432/innovanceorbit

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password

# Optional: Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Security
SESSION_SECRET=your-very-long-random-session-secret
```

### Step 6: Install Project Dependencies and Build

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run database migrations
npm run db:push
```

### Step 7: Configure PM2 for Process Management

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
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/innovanceorbit-error.log',
    out_file: '/var/log/pm2/innovanceorbit-out.log',
    log_file: '/var/log/pm2/innovanceorbit-combined.log'
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Start the application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 8: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/innovanceorbit
```

Add this configuration:
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

    # Handle uploads
    client_max_body_size 10M;

    # Serve static files
    location /uploads/ {
        alias /var/www/innovanceorbit/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js application
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

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 9: Configure Firewall

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

### Step 10: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 11: Final Steps and Verification

```bash
# Check if all services are running
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Check application logs
pm2 logs innovanceorbit

# Monitor system resources
htop
```

## Post-Deployment Configuration

### 1. Access Your Application
- Open browser and navigate to: `http://YOUR_PUBLIC_IP` or `https://yourdomain.com`
- Login with default credentials:
  - Super Admin: `admin` / `admin123`
  - Manager: `manager` / `manager123`
  - Customer: `user` / `user123`

### 2. Configure SMTP Settings
1. Login as Super Admin
2. Go to Super Admin Panel → Site Settings
3. Configure Gmail SMTP settings
4. Test email functionality

### 3. Security Checklist
- [ ] Change default admin passwords immediately
- [ ] Configure proper backup strategy
- [ ] Set up monitoring and alerts
- [ ] Configure database backups
- [ ] Review and update firewall rules

## Maintenance Commands

```bash
# View application logs
pm2 logs innovanceorbit

# Restart application
pm2 restart innovanceorbit

# Update application (after code changes)
cd /var/www/innovanceorbit
git pull  # or upload new files
npm install
npm run build
pm2 restart innovanceorbit

# Database backup
pg_dump -h localhost -U dbuser innovanceorbit > backup_$(date +%Y%m%d_%H%M%S).sql

# Monitor system
pm2 monit
htop
```

## Troubleshooting

### Common Issues:
1. **Application won't start**: Check PM2 logs and environment variables
2. **Database connection failed**: Verify PostgreSQL is running and credentials are correct
3. **Nginx 502 error**: Check if Node.js application is running on port 5000
4. **Email not working**: Verify Gmail SMTP settings and App Password

### Useful Commands:
```bash
# Check port usage
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80

# Check process status
ps aux | grep node
ps aux | grep nginx

# View system logs
journalctl -u nginx
journalctl -u postgresql
```

## Backup Strategy

### Automated Daily Backups:
```bash
# Create backup script
nano /home/ubuntu/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U dbuser innovanceorbit > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/innovanceorbit/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable and add to crontab
chmod +x /home/ubuntu/backup.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh
```

Your InnovanceOrbit e-commerce platform is now deployed and ready for production use!