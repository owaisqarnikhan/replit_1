# InnovanceOrbit AWS Deployment Troubleshooting Guide

## 🚨 **EMERGENCY QUICK FIXES**

### **Website Down - Immediate Actions**
```bash
# 1. Check if application is running
pm2 status

# 2. If app is stopped, start it
pm2 start innovanceorbit

# 3. If app is errored, restart it
pm2 restart innovanceorbit

# 4. Check logs immediately
pm2 logs innovanceorbit --lines 50
```

---

## 🔍 **DIAGNOSTIC COMMANDS**

### **System Health Check**
```bash
# Full system status
echo "=== SYSTEM STATUS ===" && \
echo "Date: $(date)" && \
echo "Uptime: $(uptime)" && \
echo "=== DISK USAGE ===" && df -h && \
echo "=== MEMORY USAGE ===" && free -h && \
echo "=== PM2 STATUS ===" && pm2 status && \
echo "=== NGINX STATUS ===" && sudo systemctl status nginx --no-pager && \
echo "=== POSTGRESQL STATUS ===" && sudo systemctl status postgresql --no-pager
```

### **Application Diagnostics**
```bash
# Check if application responds
curl -I http://localhost:5000

# Check application process
ps aux | grep node

# Check port usage
sudo netstat -tlnp | grep :5000

# Check application logs
pm2 logs innovanceorbit --lines 100 --timestamp
```

---

## ❌ **COMMON PROBLEMS AND SOLUTIONS**

### **Problem 1: "502 Bad Gateway" Error**

**Symptoms:**
- Nginx shows 502 error page
- Website not accessible

**Diagnosis:**
```bash
# Check if Node.js app is running
pm2 status

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Test local connection
curl http://localhost:5000
```

**Solutions:**
```bash
# Solution A: Restart application
pm2 restart innovanceorbit

# Solution B: If app won't start, check logs
pm2 logs innovanceorbit

# Solution C: Check environment variables
cd /var/www/innovanceorbit
cat .env.production

# Solution D: Restart Nginx
sudo systemctl restart nginx
```

---

### **Problem 2: Database Connection Failed**

**Symptoms:**
- Application logs show database connection errors
- Login/signup not working

**Diagnosis:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
PGPASSWORD=your_password psql -h localhost -U dbuser -d innovanceorbit -c "SELECT 1;"

# Check database processes
ps aux | grep postgres
```

**Solutions:**
```bash
# Solution A: Restart PostgreSQL
sudo systemctl restart postgresql

# Solution B: Check database user permissions
sudo -u postgres psql -c "\du"

# Solution C: Recreate database user
sudo -u postgres psql << EOF
DROP USER IF EXISTS dbuser;
CREATE USER dbuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbuser;
ALTER USER dbuser CREATEDB;
EOF

# Solution D: Check disk space
df -h
```

---

### **Problem 3: Email Not Working**

**Symptoms:**
- No email notifications sent
- SMTP test fails

**Diagnosis:**
```bash
# Check application logs for email errors
pm2 logs innovanceorbit | grep -i email

# Test network connectivity to Gmail
telnet smtp.gmail.com 587
```

**Solutions:**
```bash
# Solution A: Verify Gmail settings in .env.production
nano /var/www/innovanceorbit/.env.production

# Ensure these are correct:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-gmail@gmail.com
# SMTP_PASSWORD=your-16-character-app-password

# Solution B: Generate new Gmail App Password
# 1. Go to Google Account Settings
# 2. Security → App passwords
# 3. Generate new password for Mail
# 4. Update .env.production with new password

# Solution C: Restart application after changes
pm2 restart innovanceorbit
```

---

### **Problem 4: High CPU/Memory Usage**

**Symptoms:**
- Website slow or unresponsive
- Server performance degraded

**Diagnosis:**
```bash
# Check system resources
htop

# Check process usage
ps aux --sort=-%cpu | head -10
ps aux --sort=-%mem | head -10

# Check PM2 monitoring
pm2 monit
```

**Solutions:**
```bash
# Solution A: Restart application
pm2 restart innovanceorbit

# Solution B: Check for memory leaks in logs
pm2 logs innovanceorbit | grep -i "memory\|heap"

# Solution C: Increase memory limit
# Edit ecosystem.config.js and change max_memory_restart to 1G
nano ecosystem.config.js
pm2 restart innovanceorbit

# Solution D: Check for infinite loops or heavy processes
pm2 logs innovanceorbit --lines 200
```

---

### **Problem 5: File Upload Issues**

**Symptoms:**
- Cannot upload images
- File upload errors

**Diagnosis:**
```bash
# Check uploads directory permissions
ls -la /var/www/innovanceorbit/uploads

# Check disk space
df -h

# Check Nginx file size limits
grep client_max_body_size /etc/nginx/sites-available/innovanceorbit
```

**Solutions:**
```bash
# Solution A: Fix permissions
sudo chown -R ubuntu:ubuntu /var/www/innovanceorbit/uploads
chmod -R 755 /var/www/innovanceorbit/uploads

# Solution B: Increase file size limits
sudo nano /etc/nginx/sites-available/innovanceorbit
# Ensure line exists: client_max_body_size 10M;
sudo systemctl reload nginx

# Solution C: Create uploads directory if missing
mkdir -p /var/www/innovanceorbit/uploads
chmod 755 /var/www/innovanceorbit/uploads
```

---

### **Problem 6: SSL Certificate Issues**

**Symptoms:**
- HTTPS not working
- Certificate warnings

**Diagnosis:**
```bash
# Check certificate status
sudo certbot certificates

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Check Nginx SSL configuration
sudo nginx -t
```

**Solutions:**
```bash
# Solution A: Renew certificate
sudo certbot renew --force-renewal

# Solution B: Reconfigure certificate
sudo certbot --nginx -d yourdomain.com

# Solution C: Check Nginx configuration
sudo nano /etc/nginx/sites-available/innovanceorbit
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 **ADVANCED TROUBLESHOOTING**

### **Application Won't Start**

**Step 1: Check Dependencies**
```bash
cd /var/www/innovanceorbit
npm install
```

**Step 2: Check Environment Variables**
```bash
# Verify all required variables are set
cat .env.production | grep -E "DATABASE_URL|SMTP_"
```

**Step 3: Test Database Migration**
```bash
npm run db:push
```

**Step 4: Try Manual Start**
```bash
# Start manually to see direct errors
npm start
```

---

### **Performance Issues**

**Monitor Real-time Performance:**
```bash
# CPU and memory monitoring
top -p $(pgrep -f "innovanceorbit")

# Disk I/O monitoring
iotop

# Network monitoring
iftop
```

**Optimize Application:**
```bash
# Check for memory leaks
pm2 logs innovanceorbit | grep -i "heap\|memory"

# Restart with monitoring
pm2 restart innovanceorbit
pm2 monit
```

---

### **Database Corruption**

**Check Database Integrity:**
```bash
# Connect to database
sudo -u postgres psql -d innovanceorbit

# Check for corruption
VACUUM VERBOSE;
REINDEX DATABASE innovanceorbit;
```

**Restore from Backup:**
```bash
# If you have a recent backup
sudo systemctl stop postgresql
sudo -u postgres dropdb innovanceorbit
sudo -u postgres createdb innovanceorbit
sudo -u postgres psql -d innovanceorbit < /path/to/backup.sql
sudo systemctl start postgresql
```

---

## 📞 **ESCALATION PROCEDURES**

### **When to Escalate:**
- Data corruption suspected
- Security breach indicators
- Hardware failure signs
- Multiple service failures
- Performance completely degraded

### **Information to Gather:**
```bash
# System information
uname -a > system-info.txt
df -h >> system-info.txt
free -h >> system-info.txt
ps aux >> system-info.txt

# Application logs
pm2 logs innovanceorbit --lines 500 > app-logs.txt

# System logs
sudo journalctl --since "1 hour ago" > system-logs.txt

# Network status
netstat -tlnp > network-status.txt
```

---

## 🛡️ **SECURITY TROUBLESHOOTING**

### **Suspicious Activity Detection**
```bash
# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20

# Check unusual network connections
netstat -an | grep ESTABLISHED

# Check running processes
ps aux | grep -v "\["
```

### **Security Hardening Check**
```bash
# Check firewall status
sudo ufw status verbose

# Check open ports
sudo ss -tuln

# Check user permissions
sudo cat /etc/passwd | grep -E "ubuntu|dbuser"
```

---

## 📋 **MAINTENANCE CHECKLIST**

### **Daily Checks**
- [ ] Application status: `pm2 status`
- [ ] System resources: `free -h && df -h`
- [ ] Error logs: `pm2 logs innovanceorbit --lines 10`

### **Weekly Checks**
- [ ] System updates: `sudo apt update && sudo apt list --upgradable`
- [ ] Log rotation: `sudo logrotate -f /etc/logrotate.conf`
- [ ] Backup verification: Test restore from recent backup
- [ ] SSL certificate: `sudo certbot certificates`

### **Monthly Checks**
- [ ] Performance review: Analyze trends in PM2 monit
- [ ] Security audit: Review access logs and failed login attempts
- [ ] Dependency updates: `npm audit && npm update`
- [ ] Database optimization: `VACUUM ANALYZE;` in PostgreSQL

---

## 🔄 **RECOVERY PROCEDURES**

### **Complete System Recovery**
```bash
# 1. Stop all services
pm2 stop all
sudo systemctl stop nginx

# 2. Restore from backup
cd /var/www/innovanceorbit
# Upload your backup files

# 3. Restore database
sudo -u postgres psql -d innovanceorbit < database-backup.sql

# 4. Install dependencies
npm install

# 5. Rebuild application
npm run build

# 6. Start services
pm2 start ecosystem.config.js --env production
sudo systemctl start nginx

# 7. Verify everything works
curl http://localhost:5000
```

---

Remember: When in doubt, check the logs first, restart services second, and restore from backup as a last resort. Always test fixes in a safe environment when possible.