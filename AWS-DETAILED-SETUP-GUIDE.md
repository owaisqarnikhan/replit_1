# Complete AWS Setup Guide for InnovanceOrbit

## 🎯 Step-by-Step AWS Infrastructure Setup

### **Prerequisites**
- AWS Account with billing enabled
- Domain name (optional but recommended)
- Basic understanding of cloud infrastructure

## Phase 1: Core Infrastructure Setup

### **1. VPC and Network Configuration**

#### Create VPC
```bash
# VPC CIDR: 10.0.0.0/16
# Name: innovanceorbit-vpc
```

#### Subnets
```bash
# Public Subnet 1: 10.0.1.0/24 (us-east-1a)
# Public Subnet 2: 10.0.2.0/24 (us-east-1b)
# Private Subnet 1: 10.0.3.0/24 (us-east-1a) - Database
# Private Subnet 2: 10.0.4.0/24 (us-east-1b) - Database
```

#### Security Groups
```yaml
# Application Server Security Group
Name: innovanceorbit-app-sg
Inbound Rules:
  - Port 22 (SSH): Your IP only
  - Port 80 (HTTP): 0.0.0.0/0
  - Port 443 (HTTPS): 0.0.0.0/0
  - Port 5000 (App): Load Balancer only

# Database Security Group  
Name: innovanceorbit-db-sg
Inbound Rules:
  - Port 5432 (PostgreSQL): App Security Group only
```

### **2. EC2 Instance Setup**

#### Launch Instance
```yaml
AMI: Ubuntu Server 22.04 LTS
Instance Type: t3.medium (recommended)
Key Pair: Create new keypair (innovanceorbit-keypair)
VPC: innovanceorbit-vpc
Subnet: Public Subnet 1
Security Group: innovanceorbit-app-sg
Storage: 50 GB gp3 SSD
```

#### Initial Server Configuration
```bash
# Connect to your instance
ssh -i "innovanceorbit-keypair.pem" ubuntu@YOUR_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### **3. RDS PostgreSQL Setup**

#### Create DB Subnet Group
```yaml
Name: innovanceorbit-db-subnet-group
VPC: innovanceorbit-vpc
Subnets: Private Subnet 1, Private Subnet 2
```

#### Launch RDS Instance
```yaml
Engine: PostgreSQL
Version: 15.4
Instance Class: db.t3.micro (can upgrade later)
Instance Identifier: innovanceorbit-db
Master Username: dbadmin
Master Password: [Generate strong password]
VPC: innovanceorbit-vpc
Subnet Group: innovanceorbit-db-subnet-group
Security Group: innovanceorbit-db-sg
Initial Database: innovanceorbit
Backup Retention: 7 days
Storage: 20 GB gp3 (can scale automatically)
```

### **4. S3 Bucket Setup**

#### Create S3 Bucket
```yaml
Bucket Name: innovanceorbit-uploads-[random-suffix]
Region: us-east-1 (same as EC2)
Versioning: Enabled
Public Access: Block all public access initially
```

#### Bucket Policy for Application Access
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT:role/EC2-S3-Role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::innovanceorbit-uploads-[suffix]/*"
    }
  ]
}
```

## Phase 2: Application Deployment

### **5. Application Code Deployment**

#### Clone and Setup Application
```bash
# Clone your repository
git clone https://github.com/yourusername/innovanceorbit.git
cd innovanceorbit

# Install dependencies
npm install

# Build the application
npm run build

# Create environment file
sudo nano .env.production
```

#### Environment Configuration (.env.production)
```bash
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://dbadmin:PASSWORD@your-rds-endpoint:5432/innovanceorbit

# Session Configuration
SESSION_SECRET=your-very-long-random-session-secret

# SMTP Configuration (Microsoft 365)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-app-password

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=innovanceorbit-uploads-[suffix]
```

#### PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'npm',
    args: 'start',
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

#### Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### **6. Nginx Configuration**

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/innovanceorbit
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration (will be added by certbot)
    
    # Gzip compression
    gzip on;
    gzip_types text/plain application/json application/javascript text/css application/xml text/xml;

    # Static files
    location /uploads/ {
        root /home/ubuntu/innovanceorbit;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API and app requests
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

#### Enable Site and SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Phase 3: Production Optimization

### **7. Application Load Balancer Setup**

#### Create Target Group
```yaml
Name: innovanceorbit-targets
Target Type: Instance
Protocol: HTTP
Port: 5000
VPC: innovanceorbit-vpc
Health Check Path: /api/health
```

#### Create Application Load Balancer
```yaml
Name: innovanceorbit-alb
Scheme: Internet-facing
IP Address Type: IPv4
VPC: innovanceorbit-vpc
Subnets: Public Subnet 1, Public Subnet 2
Security Group: innovanceorbit-alb-sg
```

### **8. CloudFront CDN Setup**

#### Create CloudFront Distribution
```yaml
Origin Domain: your-alb-dns-name.us-east-1.elb.amazonaws.com
Origin Protocol Policy: HTTPS Only
Viewer Protocol Policy: Redirect HTTP to HTTPS
Cache Policy: Managed-CachingOptimized
Origin Request Policy: Managed-CORS-S3Origin
Price Class: Use All Edge Locations
```

### **9. Route 53 DNS Configuration**

#### Create Hosted Zone
```yaml
Domain Name: yourdomain.com
Type: Public Hosted Zone
```

#### Create Records
```yaml
# Main domain
Type: A
Name: yourdomain.com
Alias: Yes
Target: CloudFront Distribution

# WWW subdomain
Type: A  
Name: www.yourdomain.com
Alias: Yes
Target: CloudFront Distribution
```

## Phase 4: Monitoring and Backup

### **10. CloudWatch Monitoring**

#### Create CloudWatch Dashboard
```yaml
Dashboard Name: InnovanceOrbit-Monitoring
Widgets:
  - EC2 CPU Utilization
  - EC2 Memory Usage
  - RDS CPU Utilization
  - RDS Database Connections
  - Application Response Time
  - Error Rate
```

#### Set Up Alarms
```yaml
High CPU Usage (EC2):
  Metric: CPUUtilization
  Threshold: > 80%
  Period: 5 minutes
  Action: Send SNS notification

High Database Connections:
  Metric: DatabaseConnections
  Threshold: > 80% of max
  Period: 5 minutes
  Action: Send SNS notification
```

### **11. Backup Strategy**

#### RDS Automated Backups
```yaml
Backup Retention Period: 7 days
Backup Window: 03:00-04:00 UTC
Maintenance Window: Sunday 04:00-05:00 UTC
```

#### S3 Backup for Application Files
```bash
# Create backup script
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
APP_DIR="/home/ubuntu/innovanceorbit"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Upload to S3
aws s3 cp $BACKUP_DIR/app_backup_$DATE.tar.gz s3://innovanceorbit-backups/

# Clean old local backups (keep last 3)
ls -t $BACKUP_DIR/app_backup_*.tar.gz | tail -n +4 | xargs rm -f
```

#### Schedule Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/ubuntu/backup.sh
```

## 🔒 Security Hardening

### **12. Server Security**

#### Update SSH Configuration
```bash
sudo nano /etc/ssh/sshd_config
```

```bash
# Disable root login
PermitRootLogin no

# Use key-based authentication only
PasswordAuthentication no
PubkeyAuthentication yes

# Change default port (optional)
Port 2222
```

#### Install and Configure UFW Firewall
```bash
# Install UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 2222/tcp  # SSH (if you changed port)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw --force enable
```

#### Install Fail2Ban
```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1800
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
```

## 📊 Performance Optimization

### **13. Database Optimization**

#### PostgreSQL Configuration
```bash
# Connect to RDS instance
psql -h your-rds-endpoint -U dbadmin -d innovanceorbit

# Optimize for e-commerce workload
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

# Restart required for some settings
```

#### Create Indexes
```sql
-- Optimize common queries
CREATE INDEX CONCURRENTLY idx_products_category ON products(category_id);
CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_created ON orders(created_at);
CREATE INDEX CONCURRENTLY idx_order_items_order ON order_items(order_id);
CREATE INDEX CONCURRENTLY idx_cart_items_user ON cart_items(user_id);
```

### **14. Application Performance**

#### Node.js Optimization
```bash
# Update PM2 configuration for production
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'innovanceorbit',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      UV_THREADPOOL_SIZE: 16
    }
  }]
}
```

## 💰 Cost Monitoring

### **15. Set Up Billing Alerts**

#### Create Budget
```yaml
Budget Name: InnovanceOrbit Monthly Budget
Budget Amount: $100/month
Alert Threshold: 80% ($80)
Email Notifications: your-email@domain.com
```

#### Cost Allocation Tags
```yaml
Project: InnovanceOrbit
Environment: Production
Owner: YourName
```

## 🚀 Launch Checklist

### **Pre-Launch Verification**
- [ ] All services running correctly
- [ ] Database migrations completed
- [ ] SSL certificate installed and working
- [ ] DNS propagation complete
- [ ] All environment variables configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerts configured
- [ ] Security groups properly configured
- [ ] Application performance tested
- [ ] Payment gateways tested in production mode

### **Go-Live Steps**
1. **Final DNS update** to point to AWS infrastructure
2. **Monitor application** for first 24 hours
3. **Verify all functionality** works correctly
4. **Check performance metrics** meet expectations
5. **Confirm backup systems** are functioning
6. **Test disaster recovery** procedures

---

## 📞 Support and Maintenance

### **Regular Maintenance Tasks**
- Weekly: Review CloudWatch metrics and logs
- Monthly: Update server security patches
- Quarterly: Review and optimize costs
- Yearly: Review backup and disaster recovery procedures

### **Emergency Contacts**
- AWS Support (if you have a support plan)
- Database administrator
- Domain registrar support
- SSL certificate provider

This complete setup will give you a production-ready, scalable, and secure e-commerce platform on AWS!