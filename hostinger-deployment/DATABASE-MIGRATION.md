# Database Migration Instructions

## Export from Current Environment
1. Go to Admin Panel > Database tab
2. Click "Export Database" to download SQL dump
3. Save the file as `database-backup.sql`

## Import to Hostinger
1. Create PostgreSQL database in hPanel
2. Use phpPgAdmin or command line to import:
   `psql -h hostname -U username -d database_name -f database-backup.sql`

## Alternative: Use provided conversion script
If Hostinger only supports MySQL, use the MySQL conversion script in deployment-guide.md
