# 🚀 Quick Setup Commands for Your Ubuntu Server

## Since you've uploaded the files to /home/ubuntu/innovanceorbit/, run these commands in order:

### 1. Navigate to your project folder
```bash
cd /home/ubuntu/innovanceorbit
```

### 2. Make the installation script executable and run it
```bash
chmod +x install-script.sh
sudo ./install-script.sh
```

### 3. Configure PostgreSQL Database
```bash
sudo -u postgres psql
```

In the PostgreSQL prompt, run these commands:
```sql
CREATE DATABASE innovanceorbit;
CREATE USER dbadmin WITH PASSWORD 'SecurePassword123';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbadmin;
GRANT ALL ON SCHEMA public TO dbadmin;
ALTER USER dbadmin CREATEDB;
\q
```

### 4. Set up environment variables
```bash
cp .env.production .env
nano .env
```

Update the DATABASE_URL line in .env file:
```
DATABASE_URL=postgresql://dbadmin:SecurePassword123@localhost:5432/innovanceorbit
```

### 5. Install dependencies and setup database
```bash
npm install --production
npm run db:push
```

### 6. Start the application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
(Follow the instructions from the pm2 startup command)

### 7. Configure Nginx web server
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/innovanceorbit
sudo ln -s /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Check if everything is running
```bash
pm2 status
sudo systemctl status nginx
```

## Your website will be available at: http://YOUR-SERVER-IP

## Default admin login:
- Username: admin
- Password: admin123

## Troubleshooting commands:
```bash
pm2 logs innovanceorbit          # Check application logs
sudo tail -f /var/log/nginx/error.log  # Check web server logs
sudo systemctl status postgresql  # Check database status
```