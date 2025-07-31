# 🚀 AWS Deployment Guide for InnovanceOrbit E-commerce

## Recommended AWS Services & Server Configuration

### 📊 Recommended Server Setup for E-commerce

#### **Option 1: Cost-Effective Starter (Recommended for Small to Medium Business)**
- **EC2 Instance**: `t3.small` (2 vCPU, 2 GB RAM)
- **Storage**: 20-50 GB gp3 SSD
- **Database**: RDS MySQL db.t3.micro (20 GB storage)
- **Estimated Monthly Cost**: $25-40/month

#### **Option 2: Performance Optimized (Growing Business)**
- **EC2 Instance**: `t3.medium` (2 vCPU, 4 GB RAM)
- **Storage**: 50-100 GB gp3 SSD
- **Database**: RDS MySQL db.t3.small (50 GB storage)
- **Estimated Monthly Cost**: $50-80/month

#### **Option 3: High-Performance (Established Business)**
- **EC2 Instance**: `t3.large` (2 vCPU, 8 GB RAM)
- **Storage**: 100-200 GB gp3 SSD
- **Database**: RDS MySQL db.t3.medium (100 GB storage)
- **Estimated Monthly Cost**: $100-150/month

## 🏗️ Complete AWS Architecture

### Core Services You'll Need:

1. **EC2 (Elastic Compute Cloud)** - Web server hosting
2. **RDS (Relational Database Service)** - MySQL database
3. **S3 (Simple Storage Service)** - File storage for images
4. **CloudFront** - CDN for fast content delivery
5. **Route 53** - DNS management
6. **Application Load Balancer** - High availability
7. **Certificate Manager** - Free SSL certificates

### Optional but Recommended:
- **ElastiCache** - Redis for session storage
- **SES (Simple Email Service)** - Email notifications
- **CloudWatch** - Monitoring and logging

## 💰 Detailed Cost Breakdown (Option 1 - Recommended)

### Monthly Costs:
- **EC2 t3.small**: ~$15/month
- **RDS MySQL db.t3.micro**: ~$12/month
- **S3 Storage (50GB)**: ~$1/month
- **CloudFront**: ~$1/month
- **Route 53**: ~$0.50/month
- **Data Transfer**: ~$5-10/month
- **Total**: ~$35-40/month

### Annual Savings:
- **Reserved Instances**: Save 30-60% with 1-year commitment
- **Savings Plans**: Additional 10-20% savings

## 🔧 Step-by-Step AWS Setup

### Phase 1: Account Setup (10 minutes)
1. **Create AWS Account** at aws.amazon.com
2. **Set up billing alerts** to monitor costs
3. **Choose region** closest to your customers (e.g., us-east-1, eu-west-1)
4. **Create IAM user** with admin permissions for security

### Phase 2: Database Setup (15 minutes)
1. **Launch RDS MySQL Instance**:
   - Engine: MySQL 8.0
   - Instance: db.t3.micro (or db.t3.small for better performance)
   - Storage: 20-50 GB gp2 SSD
   - Backup: 7-day retention
   - Multi-AZ: No (for cost savings, Yes for production)

2. **Configure Security Group**:
   - Allow inbound MySQL (port 3306) from EC2 security group only
   - No public access for security

### Phase 3: Server Setup (20 minutes)
1. **Launch EC2 Instance**:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.small
   - Storage: 20-50 GB gp3 SSD
   - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Install Required Software**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install MySQL client
sudo apt install mysql-client -y
```

### Phase 4: Application Deployment (30 minutes)
1. **Upload Application Files**:
```bash
# Create application directory
sudo mkdir -p /var/www/innovanceorbit
sudo chown ubuntu:ubuntu /var/www/innovanceorbit

# Upload your deployment package (use SCP or Git)
scp -r hostinger-mysql-deployment/* ubuntu@your-ec2-ip:/var/www/innovanceorbit/
```

2. **Install Dependencies**:
```bash
cd /var/www/innovanceorbit
npm install --production
```

3. **Configure Environment**:
```bash
# Edit .env file with AWS RDS connection
DATABASE_URL=mysql://username:password@your-rds-endpoint:3306/database_name
NODE_ENV=production
PORT=3000
```

4. **Import Database Schema**:
```bash
mysql -h your-rds-endpoint -u username -p database_name < mysql-migration.sql
```

### Phase 5: Nginx Configuration (15 minutes)
Create Nginx configuration file:
```nginx
# /etc/nginx/sites-available/innovanceorbit
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        alias /var/www/innovanceorbit/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Phase 6: Process Management (10 minutes)
Set up PM2 for application management:
```bash
# Start application with PM2
cd /var/www/innovanceorbit
pm2 start dist/index.js --name "innovanceorbit"

# Save PM2 configuration
pm2 save
pm2 startup

# Monitor application
pm2 status
pm2 logs innovanceorbit
```

### Phase 7: SSL Certificate (10 minutes)
Install Let's Encrypt SSL certificate:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## 🔒 Security Configuration

### EC2 Security Group Rules:
- **SSH (22)**: Your IP only
- **HTTP (80)**: 0.0.0.0/0 (will redirect to HTTPS)
- **HTTPS (443)**: 0.0.0.0/0
- **Custom (3000)**: Localhost only (for Node.js app)

### RDS Security Group Rules:
- **MySQL (3306)**: EC2 security group only

### Additional Security Measures:
1. **Disable root login** via SSH
2. **Use key pairs** instead of passwords
3. **Enable CloudTrail** for audit logging
4. **Set up CloudWatch** alerts for unusual activity
5. **Regular security updates** with automatic patching

## 📈 Scaling Options

### Horizontal Scaling:
- **Application Load Balancer** with multiple EC2 instances
- **Auto Scaling Groups** for automatic scaling
- **RDS Read Replicas** for database read scaling

### Vertical Scaling:
- **Upgrade EC2 instance** type as needed
- **Increase RDS instance** size and storage
- **Add ElastiCache** for caching layer

## 🌍 Global Performance

### CloudFront CDN Setup:
1. **Create CloudFront distribution**
2. **Origin**: Your EC2 instance or ALB
3. **Cache behaviors** for static assets
4. **Custom domain** with SSL certificate

### S3 for Static Assets:
1. **Create S3 bucket** for uploads
2. **Configure bucket policy** for public read
3. **Update application** to use S3 URLs
4. **Enable S3 Transfer Acceleration**

## 📊 Monitoring & Maintenance

### CloudWatch Monitoring:
- **CPU utilization** alerts
- **Memory usage** monitoring
- **Database connections** tracking
- **Application logs** centralization

### Backup Strategy:
- **RDS automated backups** (7-30 days)
- **EC2 snapshots** weekly
- **S3 versioning** for uploaded files
- **Database export** through admin panel

## 💡 Cost Optimization Tips

1. **Use Reserved Instances** for 30-60% savings
2. **Right-size instances** based on actual usage
3. **Implement auto-scaling** to handle traffic spikes
4. **Use S3 Intelligent Tiering** for long-term storage
5. **Monitor costs** with AWS Cost Explorer
6. **Set billing alerts** for budget control

## 🚀 Go-Live Checklist

### Pre-Launch:
- [ ] Database schema imported and tested
- [ ] Application deployed and running
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Email notifications tested
- [ ] Payment gateways configured
- [ ] Admin account created
- [ ] Site settings configured

### Post-Launch:
- [ ] Monitor application performance
- [ ] Set up backup schedule
- [ ] Configure monitoring alerts
- [ ] Test all e-commerce functionality
- [ ] Load test for expected traffic
- [ ] Document maintenance procedures

## 📞 AWS Support Options

### Support Plans:
- **Basic**: Free (forums, documentation)
- **Developer**: $29/month (business hours support)
- **Business**: $100/month (24/7 support, faster response)

### Getting Help:
- **AWS Documentation**: Comprehensive guides
- **AWS Forums**: Community support
- **AWS Support Center**: Official support tickets
- **AWS Trusted Advisor**: Cost and performance recommendations

Your InnovanceOrbit e-commerce platform will run excellently on AWS with professional-grade reliability and scalability!