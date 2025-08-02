# Quick Commands Reference for InnovanceOrbit AWS Deployment

## 🚀 **ESSENTIAL DAILY COMMANDS**

### **Application Management**
```bash
# Check application status
pm2 status

# View live logs
pm2 logs innovanceorbit

# Restart application
pm2 restart innovanceorbit

# Stop application
pm2 stop innovanceorbit

# Monitor application resources
pm2 monit
```

### **System Status Checks**
```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Check system resources
htop                    # Interactive system monitor
df -h                   # Disk usage
free -h                 # Memory usage
uptime                  # System uptime and load
```

### **Log Monitoring**
```bash
# Application logs
pm2 logs innovanceorbit --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
journalctl -u postgresql -f
```

---

## 🔧 **MAINTENANCE COMMANDS**

### **Application Updates**
```bash
# Navigate to project directory
cd /var/www/innovanceorbit

# Pull latest code (if using Git)
git pull

# Install new dependencies
npm install

# Rebuild application
npm run build

# Push database changes
npm run db:push

# Restart application
pm2 restart innovanceorbit
```

### **Database Operations**
```bash
# Connect to database
sudo -u postgres psql -d innovanceorbit

# Create database backup
pg_dump -h localhost -U dbuser innovanceorbit > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U dbuser -d innovanceorbit < backup_file.sql

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('innovanceorbit'));"
```

### **Nginx Management**
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check configuration syntax
sudo nginx -T
```

---

## 🛠️ **TROUBLESHOOTING COMMANDS**

### **Connection Issues**
```bash
# Check port usage
sudo netstat -tlnp | grep :5000  # Application port
sudo netstat -tlnp | grep :80    # HTTP port
sudo netstat -tlnp | grep :443   # HTTPS port

# Test local connection
curl http://localhost:5000
curl http://localhost

# Check process information
ps aux | grep node
ps aux | grep nginx
ps aux | grep postgres
```

### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R ubuntu:ubuntu /var/www/innovanceorbit
chmod -R 755 /var/www/innovanceorbit
chmod -R 755 /var/www/innovanceorbit/uploads

# Fix log permissions
sudo chown -R ubuntu:ubuntu /var/log/pm2
```

### **Service Recovery**
```bash
# If PM2 is not responding
pm2 kill
pm2 start ecosystem.config.js --env production

# If Nginx fails to start
sudo systemctl stop nginx
sudo nginx -t  # Check for errors
sudo systemctl start nginx

# If PostgreSQL issues
sudo systemctl restart postgresql
sudo -u postgres psql -c "SELECT version();"
```

---

## 📊 **MONITORING AND PERFORMANCE**

### **Performance Monitoring**
```bash
# CPU and memory usage
top
htop

# Disk I/O monitoring
iotop

# Network monitoring
netstat -i
ss -tuln

# Application specific monitoring
pm2 monit
```

### **Security Checks**
```bash
# Check firewall status
sudo ufw status

# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log

# Check running processes
ps aux

# Check open ports
sudo ss -tuln
```

---

## 🔄 **BACKUP AND RESTORE**

### **Manual Backup**
```bash
# Create full backup
mkdir -p ~/backups/$(date +%Y%m%d)
cd ~/backups/$(date +%Y%m%d)

# Database backup
pg_dump -h localhost -U dbuser innovanceorbit > database.sql

# Files backup
tar -czf files.tar.gz /var/www/innovanceorbit/uploads
tar -czf config.tar.gz /var/www/innovanceorbit/.env.production

# System configuration backup
cp /etc/nginx/sites-available/innovanceorbit nginx-config.conf
```

### **Quick Restore**
```bash
# Restore database
psql -h localhost -U dbuser -d innovanceorbit < database.sql

# Restore files
tar -xzf files.tar.gz -C /

# Restart services
pm2 restart innovanceorbit
sudo systemctl reload nginx
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **If Website Goes Down**
```bash
# 1. Check application status
pm2 status

# 2. If application is down, restart it
pm2 restart innovanceorbit

# 3. Check logs for errors
pm2 logs innovanceorbit --lines 100

# 4. Check system resources
free -h
df -h

# 5. Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### **If Database Connection Fails**
```bash
# 1. Check PostgreSQL status
sudo systemctl status postgresql

# 2. Restart PostgreSQL if needed
sudo systemctl restart postgresql

# 3. Test connection
PGPASSWORD=your_password psql -h localhost -U dbuser -d innovanceorbit -c "SELECT 1;"

# 4. Check disk space
df -h

# 5. Restart application
pm2 restart innovanceorbit
```

### **If SSL Certificate Expires**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📋 **USEFUL ONE-LINERS**

```bash
# Check all service status at once
echo "=== PM2 ===" && pm2 status && echo "=== Nginx ===" && sudo systemctl is-active nginx && echo "=== PostgreSQL ===" && sudo systemctl is-active postgresql

# Quick health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000

# Find largest files
find /var/www/innovanceorbit -type f -exec du -h {} + | sort -rh | head -20

# Check total disk usage
du -sh /var/www/innovanceorbit

# Monitor real-time access logs
sudo tail -f /var/log/nginx/access.log | grep -v "\.css\|\.js\|\.png\|\.jpg\|\.ico"

# Quick backup with timestamp
pg_dump -h localhost -U dbuser innovanceorbit > ~/backup-$(date +%Y%m%d_%H%M%S).sql

# Check memory usage by process
ps aux --sort=-%mem | head -10

# Find configuration files
find /etc -name "*innovanceorbit*" 2>/dev/null
```

---

## 📞 **WHEN TO GET HELP**

Contact system administrator or developer when:
- Application keeps crashing despite restarts
- Database corruption is suspected
- Unusual network traffic patterns
- Security breaches suspected
- Performance severely degraded
- SSL certificate issues persist
- Major system updates needed

---

## 📝 **NOTES**

- Replace `YOUR_PASSWORD` with your actual database password
- Replace `YOUR_DOMAIN` with your actual domain name
- Always test commands in a safe environment first
- Keep this reference handy for daily operations
- Update commands as system configuration changes