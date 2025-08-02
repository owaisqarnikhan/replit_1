#!/bin/bash

# Database Setup Script for InnovanceOrbit
# Run this script after uploading your project files

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

print_status "🗄️  Setting up PostgreSQL database for InnovanceOrbit..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory (/var/www/innovanceorbit)"
    exit 1
fi

# Prompt for database password
read -s -p "Enter a secure password for the database user: " DB_PASSWORD
echo

if [ -z "$DB_PASSWORD" ]; then
    print_error "Password cannot be empty"
    exit 1
fi

print_status "Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
-- Drop database and user if they exist (for clean reinstall)
DROP DATABASE IF EXISTS innovanceorbit;
DROP USER IF EXISTS dbuser;

-- Create new database and user
CREATE DATABASE innovanceorbit;
CREATE USER dbuser WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE innovanceorbit TO dbuser;
ALTER USER dbuser CREATEDB;

-- Grant additional permissions
\c innovanceorbit
GRANT ALL ON SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dbuser;

\q
EOF

if [ $? -eq 0 ]; then
    print_status "✅ Database and user created successfully"
else
    print_error "❌ Failed to create database and user"
    exit 1
fi

# Test database connection
print_status "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U dbuser -d innovanceorbit -c "SELECT version();" > /dev/null

if [ $? -eq 0 ]; then
    print_status "✅ Database connection successful"
else
    print_error "❌ Database connection failed"
    exit 1
fi

# Update environment file if it exists
if [ -f ".env.production" ]; then
    print_status "Updating .env.production with database URL..."
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://dbuser:$DB_PASSWORD@localhost:5432/innovanceorbit|g" .env.production
    sed -i "s|PGPASSWORD=.*|PGPASSWORD=$DB_PASSWORD|g" .env.production
    print_status "✅ Environment file updated"
else
    print_warning "⚠️  .env.production not found. Please create it with the correct DATABASE_URL"
    echo "DATABASE_URL=postgresql://dbuser:$DB_PASSWORD@localhost:5432/innovanceorbit"
fi

print_status "Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "✅ Dependencies installed successfully"
else
    print_error "❌ Failed to install dependencies"
    exit 1
fi

print_status "Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
    print_status "✅ Database schema created successfully"
else
    print_error "❌ Failed to create database schema"
    exit 1
fi

print_status "Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "✅ Application built successfully"
else
    print_error "❌ Failed to build application"
    exit 1
fi

print_status "🎉 Database setup completed successfully!"
print_warning "Next steps:"
echo "1. Configure Nginx with the provided nginx.conf"
echo "2. Start the application with PM2"
echo "3. Configure SSL certificate (optional)"

print_status "Database credentials:"
echo "Database: innovanceorbit"
echo "User: dbuser"
echo "Password: [hidden]"
echo "Connection URL: postgresql://dbuser:****@localhost:5432/innovanceorbit"