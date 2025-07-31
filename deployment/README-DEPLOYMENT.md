# 📦 InnovanceOrbit AWS Deployment Package

## What's Included

This deployment package contains everything needed to deploy your InnovanceOrbit e-commerce platform to AWS:

### 📁 Files Structure:
```
deployment/
├── dist/                     # Built application (production ready)
├── uploads/                  # Upload directory with existing files
├── package.json             # Dependencies list
├── package-lock.json        # Exact dependency versions
├── .env.production          # Environment configuration template
├── ecosystem.config.js      # PM2 process manager config
├── nginx-config.conf        # Nginx web server configuration
├── install-script.sh        # Automated installation script
└── README-DEPLOYMENT.md     # This file
```

## 🚀 Quick Deployment Steps

### 1. **Upload to AWS Server**
- Use WinSCP or SCP to upload this entire `deployment` folder to `/home/ubuntu/innovanceorbit/`

### 2. **Run Installation Script**
```bash
chmod +x /home/ubuntu/innovanceorbit/install-script.sh
sudo /home/ubuntu/innovanceorbit/install-script.sh
```

### 3. **Configure Database**
```bash
sudo -u postgres psql
CREATE DATABASE innovanceorbit;
CREATE USER dbadmin WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbadmin;
GRANT ALL ON SCHEMA public TO dbadmin;
ALTER USER dbadmin CREATEDB;
\q
```

### 4. **Setup Environment**
```bash
cd /home/ubuntu/innovanceorbit
cp .env.production .env
nano .env  # Edit with your actual values
```

### 5. **Install Dependencies & Deploy**
```bash
npm install --production
npm run db:push
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. **Configure Nginx**
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/innovanceorbit
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Your Website Will Be Live!

Access your InnovanceOrbit store at: `http://YOUR-SERVER-IP`

### Default Admin Login:
- **Username**: admin
- **Password**: admin123

## 💰 AWS Cost: ~$31/month

Your e-commerce platform will be running professionally on AWS infrastructure with full PostgreSQL database, file uploads, and payment processing capabilities.

## 📞 Support

If you need help during deployment, all logs are available at:
- Application logs: `pm2 logs innovanceorbit`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`