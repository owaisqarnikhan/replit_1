#!/bin/bash

# Backup Script for InnovanceOrbit
# Creates automated backups of database and files

set -e

# Configuration
BACKUP_DIR="/home/ubuntu/backups"
PROJECT_DIR="/var/www/innovanceorbit"
DATE=$(date +%Y%m%d_%H%M%S)
DAYS_TO_KEEP=7

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

print_status "🔄 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
print_status "📄 Creating database backup..."
if pg_dump -h localhost -U dbuser innovanceorbit > $BACKUP_DIR/db_backup_$DATE.sql; then
    print_status "✅ Database backup created: db_backup_$DATE.sql"
else
    print_error "❌ Database backup failed"
    exit 1
fi

# Files backup (uploads and configuration)
print_status "📁 Creating files backup..."
if tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C $PROJECT_DIR uploads .env.production; then
    print_status "✅ Files backup created: files_backup_$DATE.tar.gz"
else
    print_error "❌ Files backup failed"
    exit 1
fi

# Application code backup (optional)
print_status "💾 Creating application backup..."
if tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz --exclude=node_modules --exclude=.git -C $PROJECT_DIR .; then
    print_status "✅ Application backup created: app_backup_$DATE.tar.gz"
else
    print_warning "⚠️  Application backup failed (non-critical)"
fi

# System information backup
print_status "🖥️  Creating system info backup..."
{
    echo "=== System Information ==="
    echo "Date: $(date)"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Uptime: $(uptime)"
    echo
    echo "=== Disk Usage ==="
    df -h
    echo
    echo "=== Memory Usage ==="
    free -h
    echo
    echo "=== PM2 Status ==="
    pm2 status
    echo
    echo "=== Nginx Status ==="
    sudo systemctl status nginx --no-pager
    echo
    echo "=== PostgreSQL Status ==="
    sudo systemctl status postgresql --no-pager
} > $BACKUP_DIR/system_info_$DATE.txt

print_status "✅ System info backup created: system_info_$DATE.txt"

# Cleanup old backups
print_status "🧹 Cleaning up old backups (keeping last $DAYS_TO_KEEP days)..."
find $BACKUP_DIR -name "*.sql" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.txt" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null || true

# Calculate backup sizes
DB_SIZE=$(du -h $BACKUP_DIR/db_backup_$DATE.sql | cut -f1)
FILES_SIZE=$(du -h $BACKUP_DIR/files_backup_$DATE.tar.gz | cut -f1)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

print_status "📊 Backup Summary:"
echo "   Database: $DB_SIZE"
echo "   Files: $FILES_SIZE"
echo "   Total backup directory: $TOTAL_SIZE"
echo "   Location: $BACKUP_DIR"

# List recent backups
print_status "📋 Recent backups:"
ls -lah $BACKUP_DIR/*_$DATE* 2>/dev/null || echo "   No backups found for today"

print_status "✅ Backup process completed successfully!"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# print_status "☁️  Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://your-backup-bucket/innovanceorbit/
# aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://your-backup-bucket/innovanceorbit/