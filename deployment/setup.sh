#!/bin/bash

# InnovanceOrbit AWS Ubuntu Deployment Setup Script
# Run this script on your AWS Ubuntu EC2 instance

set -e  # Exit on any error

echo "🚀 Starting InnovanceOrbit deployment setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}====== $1 ======${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as ubuntu user."
   exit 1
fi

print_header "System Update"
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_header "Installing Node.js"
print_status "Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "NPM version: $NPM_VERSION"

print_header "Installing System Dependencies"
print_status "Installing Nginx, PostgreSQL, and other dependencies..."
sudo apt install -y git nginx postgresql postgresql-contrib htop curl wget unzip

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

print_header "PostgreSQL Setup"
print_status "Starting and enabling PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if PostgreSQL is running
if sudo systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL is running successfully"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

print_header "Application Directory Setup"
print_status "Creating application directory..."
sudo mkdir -p /var/www/innovanceorbit
sudo chown ubuntu:ubuntu /var/www/innovanceorbit

print_header "Firewall Configuration"
print_status "Configuring UFW firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_status "Firewall status:"
sudo ufw status

print_header "PM2 Log Directory"
print_status "Creating PM2 log directory..."
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

print_header "Installation Summary"
print_status "✅ System updated"
print_status "✅ Node.js $(node --version) installed"
print_status "✅ NPM $(npm --version) installed"
print_status "✅ PM2 installed"
print_status "✅ Nginx installed"
print_status "✅ PostgreSQL installed and running"
print_status "✅ Application directory created: /var/www/innovanceorbit"
print_status "✅ Firewall configured"

print_header "Next Steps"
echo "1. Upload your project files to /var/www/innovanceorbit/"
echo "2. Create .env.production file with your configuration"
echo "3. Run the database setup script"
echo "4. Configure Nginx"
echo "5. Start the application with PM2"

print_warning "Please complete the manual steps in the deployment guide!"

print_status "🎉 Basic setup completed successfully!"