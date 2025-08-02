#!/bin/bash

# Complete Deployment Script for InnovanceOrbit
# Run this script after database setup

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}====== $1 ======${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory (/var/www/innovanceorbit)"
    exit 1
fi

print_header "Starting Application Deployment"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production not found. Please create it before running deployment."
    exit 1
fi

print_status "Environment file found ✅"

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 delete innovanceorbit 2>/dev/null || true

# Configure Nginx
print_header "Nginx Configuration"
print_status "Creating Nginx configuration..."

# Prompt for domain or IP
read -p "Enter your domain name or public IP address: " DOMAIN_OR_IP

if [ -z "$DOMAIN_OR_IP" ]; then
    print_error "Domain or IP address cannot be empty"
    exit 1
fi

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/innovanceorbit > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_OR_IP;
    
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/innovanceorbit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration is invalid"
    exit 1
fi

# Reload Nginx
sudo systemctl reload nginx
print_status "✅ Nginx reloaded"

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Start application with PM2
print_header "Starting Application"
print_status "Starting InnovanceOrbit with PM2..."

pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    print_status "✅ Application started successfully"
else
    print_error "❌ Failed to start application"
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup
print_status "Configuring PM2 startup..."
pm2 startup | grep -E '^sudo' | bash

print_status "Waiting for application to start..."
sleep 10

# Check application status
print_status "Checking application status..."
pm2 status

# Test application endpoint
print_status "Testing application endpoint..."
sleep 5

if curl -f -s "http://localhost:5000" > /dev/null; then
    print_status "✅ Application is responding on port 5000"
else
    print_warning "⚠️  Application may not be responding. Check PM2 logs."
fi

print_header "Deployment Summary"
print_status "✅ Nginx configured for domain: $DOMAIN_OR_IP"
print_status "✅ Application started with PM2"
print_status "✅ PM2 startup configured"
print_status "✅ Uploads directory created"

print_header "Access Information"
echo "🌐 Application URL: http://$DOMAIN_OR_IP"
echo "👤 Default Admin Login: admin / admin123"
echo "👤 Default Manager Login: manager / manager123"
echo "👤 Default User Login: user / user123"

print_header "Important Security Notes"
print_warning "🔒 IMPORTANT: Change default passwords immediately after first login!"
print_warning "🔒 Consider setting up SSL certificate for HTTPS"
print_warning "🔒 Review and update firewall rules as needed"

print_header "Useful Commands"
echo "📊 Check application logs: pm2 logs innovanceorbit"
echo "🔄 Restart application: pm2 restart innovanceorbit"
echo "📈 Monitor application: pm2 monit"
echo "🔧 Check Nginx status: sudo systemctl status nginx"
echo "🗄️  Check database: sudo -u postgres psql -d innovanceorbit"

print_header "SSL Setup (Optional)"
echo "To enable HTTPS with Let's Encrypt:"
echo "1. sudo apt install certbot python3-certbot-nginx"
echo "2. sudo certbot --nginx -d $DOMAIN_OR_IP"

print_status "🎉 Deployment completed successfully!"
print_status "Your InnovanceOrbit e-commerce platform is now live at: http://$DOMAIN_OR_IP"