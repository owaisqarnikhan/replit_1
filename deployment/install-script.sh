#!/bin/bash

# InnovanceOrbit AWS Deployment Installation Script
# Run this script on your AWS EC2 instance after uploading files

echo "🚀 Starting InnovanceOrbit Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2 and Nginx
echo "⚙️ Installing PM2 and Nginx..."
sudo npm install -g pm2
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /home/ubuntu/innovanceorbit
sudo chown ubuntu:ubuntu /home/ubuntu/innovanceorbit

# Create logs directory
sudo mkdir -p /home/ubuntu/logs
sudo chown ubuntu:ubuntu /home/ubuntu/logs

# Create uploads directory with proper permissions
mkdir -p /home/ubuntu/innovanceorbit/uploads
chmod 755 /home/ubuntu/innovanceorbit/uploads

echo "✅ Base installation completed!"
echo ""
echo "Next steps:"
echo "1. Upload your application files to /home/ubuntu/innovanceorbit/"
echo "2. Configure PostgreSQL database"
echo "3. Install application dependencies: npm install --production"
echo "4. Configure environment variables in .env file"
echo "5. Run database migrations: npm run db:push"
echo "6. Start application: pm2 start ecosystem.config.js"
echo "7. Configure Nginx with the provided config file"
echo ""
echo "🎉 Ready for application deployment!"