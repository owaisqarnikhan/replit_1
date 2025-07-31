# ✅ AWS Deployment Checklist for InnovanceOrbit

## Pre-Deployment Preparation

### Account Setup
- [ ] Create AWS account and verify payment method
- [ ] Set up billing alerts and cost monitoring
- [ ] Choose optimal region based on target market
- [ ] Create IAM user with administrative permissions
- [ ] Generate EC2 key pair for secure access

### Cost Management
- [ ] Set up CloudWatch billing alarms
- [ ] Review pricing calculator estimates
- [ ] Consider Reserved Instance savings for long-term
- [ ] Enable AWS Cost Explorer for monitoring

## Phase 1: Database Setup (15 minutes)

### RDS MySQL Configuration
- [ ] Launch RDS instance (recommended: db.t3.micro)
- [ ] Choose MySQL 8.0 engine
- [ ] Configure 20-50 GB gp2 storage
- [ ] Set up automated backups (7-day retention)
- [ ] Create database security group (port 3306)
- [ ] Note RDS endpoint URL for application configuration

### Database Import
- [ ] Connect to RDS using MySQL client
- [ ] Import schema using `mysql-migration.sql`
- [ ] Verify all tables created successfully
- [ ] Insert initial admin user and site settings
- [ ] Test database connectivity

## Phase 2: Server Setup (20 minutes)

### EC2 Instance Launch
- [ ] Launch Ubuntu Server 22.04 LTS
- [ ] Select instance type (recommended: t3.small)
- [ ] Configure 20-50 GB gp3 SSD storage
- [ ] Create security group allowing ports 22, 80, 443
- [ ] Associate Elastic IP for static public IP
- [ ] Connect via SSH using key pair

### Software Installation
- [ ] Update system packages (`sudo apt update && upgrade`)
- [ ] Install Node.js 18.x from NodeSource repository
- [ ] Install PM2 process manager globally
- [ ] Install and configure Nginx reverse proxy
- [ ] Install MySQL client for database connectivity
- [ ] Configure firewall rules (ufw) if needed

## Phase 3: Application Deployment (30 minutes)

### File Upload and Setup
- [ ] Create application directory (`/var/www/innovanceorbit`)
- [ ] Upload deployment package via SCP or Git
- [ ] Set proper file permissions (ubuntu:ubuntu)
- [ ] Install production dependencies (`npm install --production`)
- [ ] Verify all required files are present

### Environment Configuration
- [ ] Configure `.env` file with RDS connection string
- [ ] Set NODE_ENV=production
- [ ] Configure email settings (SES or external SMTP)
- [ ] Set secure SESSION_SECRET
- [ ] Configure payment gateway credentials
- [ ] Set APP_URL to your domain

### Application Testing
- [ ] Test application startup (`node dist/index.js`)
- [ ] Verify database connection works
- [ ] Test API endpoints respond correctly
- [ ] Check file upload functionality
- [ ] Verify admin login works

## Phase 4: Nginx Configuration (15 minutes)

### Reverse Proxy Setup
- [ ] Create Nginx site configuration file
- [ ] Configure proxy_pass to localhost:3000
- [ ] Set up proper headers for proxy forwarding
- [ ] Configure static file serving for uploads
- [ ] Enable site configuration
- [ ] Test Nginx configuration (`nginx -t`)
- [ ] Restart Nginx service

### Basic Security
- [ ] Configure rate limiting in Nginx
- [ ] Hide Nginx version information
- [ ] Set up basic security headers
- [ ] Configure gzip compression
- [ ] Test HTTP access works

## Phase 5: Process Management (10 minutes)

### PM2 Configuration
- [ ] Start application with PM2
- [ ] Configure PM2 to restart on reboot
- [ ] Set up log rotation
- [ ] Test PM2 status and monitoring
- [ ] Save PM2 configuration
- [ ] Verify application starts automatically

### Monitoring Setup
- [ ] Configure PM2 monitoring dashboard
- [ ] Set up log file locations
- [ ] Test application restart functionality
- [ ] Verify error handling and logging

## Phase 6: SSL Certificate (10 minutes)

### Let's Encrypt Setup
- [ ] Install Certbot for Nginx
- [ ] Obtain SSL certificate for domain
- [ ] Configure automatic renewal
- [ ] Test HTTPS access
- [ ] Verify HTTP to HTTPS redirect
- [ ] Check SSL certificate grade (A+ recommended)

### Security Verification
- [ ] Test all pages work over HTTPS
- [ ] Verify mixed content warnings resolved
- [ ] Check payment gateway SSL requirements
- [ ] Test email functionality with SSL

## Phase 7: Domain and DNS (15 minutes)

### Domain Configuration
- [ ] Point domain A record to Elastic IP
- [ ] Configure www subdomain (CNAME or A record)
- [ ] Set up MX records for email (if using custom domain)
- [ ] Verify DNS propagation globally
- [ ] Test domain access from multiple locations

### Route 53 Setup (Optional)
- [ ] Create hosted zone in Route 53
- [ ] Configure DNS records
- [ ] Set up health checks
- [ ] Configure failover routing if needed

## Phase 8: Performance Optimization (20 minutes)

### CloudFront CDN Setup
- [ ] Create CloudFront distribution
- [ ] Configure origin to point to EC2/ALB
- [ ] Set up caching behaviors for static assets
- [ ] Configure custom error pages
- [ ] Test CDN functionality
- [ ] Update application to use CDN URLs

### S3 Storage Setup (Optional)
- [ ] Create S3 bucket for file uploads
- [ ] Configure bucket policy for public read
- [ ] Set up CORS configuration
- [ ] Update application to use S3 for uploads
- [ ] Test file upload to S3

## Phase 9: Monitoring and Alerts (15 minutes)

### CloudWatch Setup
- [ ] Enable detailed monitoring for EC2
- [ ] Set up CPU utilization alerts
- [ ] Configure memory monitoring
- [ ] Set up disk space alerts
- [ ] Create custom application metrics
- [ ] Test alert notifications

### Application Monitoring
- [ ] Configure application health check endpoint
- [ ] Set up database connection monitoring
- [ ] Monitor application logs
- [ ] Set up error rate alerts
- [ ] Configure uptime monitoring

## Phase 10: Security Hardening (20 minutes)

### EC2 Security
- [ ] Disable root login via SSH
- [ ] Configure fail2ban for SSH protection
- [ ] Update security group rules (minimal access)
- [ ] Enable VPC flow logs
- [ ] Configure CloudTrail for audit logging

### Application Security
- [ ] Change default admin passwords
- [ ] Configure secure session settings
- [ ] Set up CSRF protection
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Test for common vulnerabilities

## Phase 11: Backup Strategy (10 minutes)

### Automated Backups
- [ ] Configure RDS automated backups
- [ ] Set up EC2 snapshot schedule
- [ ] Configure S3 versioning (if using S3)
- [ ] Test backup restoration process
- [ ] Document backup procedures

### Disaster Recovery
- [ ] Create AMI image of configured EC2
- [ ] Document recovery procedures
- [ ] Test database restore process
- [ ] Create runbook for emergencies

## Final Testing and Go-Live (30 minutes)

### Comprehensive Testing
- [ ] Test all user registration and login flows
- [ ] Verify product browsing and search
- [ ] Test shopping cart and wishlist functionality
- [ ] Process test orders through payment gateways
- [ ] Verify email notifications work
- [ ] Test admin panel functionality
- [ ] Check mobile responsiveness
- [ ] Test performance under load

### Go-Live Checklist
- [ ] All tests passing successfully
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Documentation completed
- [ ] Emergency contacts and procedures ready
- [ ] Launch announcement prepared

### Post-Launch Monitoring (First 24 hours)
- [ ] Monitor application performance
- [ ] Check error logs for issues
- [ ] Verify all integrations working
- [ ] Monitor user activity and feedback
- [ ] Track conversion rates and metrics
- [ ] Be ready for quick fixes if needed

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Database Setup | 15 min | 15 min |
| Server Setup | 20 min | 35 min |
| Application Deployment | 30 min | 1h 5min |
| Nginx Configuration | 15 min | 1h 20min |
| Process Management | 10 min | 1h 30min |
| SSL Certificate | 10 min | 1h 40min |
| Domain and DNS | 15 min | 1h 55min |
| Performance Optimization | 20 min | 2h 15min |
| Monitoring and Alerts | 15 min | 2h 30min |
| Security Hardening | 20 min | 2h 50min |
| Backup Strategy | 10 min | 3h |
| Final Testing | 30 min | 3h 30min |

**Total Deployment Time: 3-4 hours**

Your InnovanceOrbit e-commerce platform will be production-ready on AWS!