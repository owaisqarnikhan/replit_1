# Hostinger hPanel Deployment Guide

## Overview
This guide helps you deploy the InnovanceOrbit e-commerce platform to Hostinger's shared hosting environment through hPanel.

## Prerequisites
- Hostinger hosting account with Node.js support
- Access to hPanel control panel
- Database access (MySQL/PostgreSQL depending on your plan)

## Deployment Steps

### 1. Prepare the Application

#### Build the Frontend
```bash
npm run build
```

#### Prepare Environment Variables
Create a `.env` file with your production settings:
```
NODE_ENV=production
DATABASE_URL=your_hostinger_database_url
PORT=3000
SESSION_SECRET=your_secure_session_secret
SENDGRID_API_KEY=your_sendgrid_key
```

### 2. Database Setup

#### Option A: PostgreSQL (if supported by your plan)
- Create a PostgreSQL database in hPanel
- Import your schema using the provided SQL export
- Update DATABASE_URL with Hostinger's connection string

#### Option B: MySQL (more common on shared hosting)
- Create a MySQL database in hPanel
- Convert PostgreSQL schema to MySQL (script provided below)
- Update the application to use MySQL instead of PostgreSQL

### 3. File Upload Configuration

Update file upload paths for shared hosting:
```javascript
// In server/routes.ts, update upload destination
destination: (req, file, cb) => {
  const uploadPath = path.join(process.cwd(), 'public', 'uploads');
  // Ensure this maps to your public_html directory
  cb(null, uploadPath);
}
```

### 4. Static File Serving

Ensure static files are served correctly:
```javascript
// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../dist')));
```

### 5. Package.json Scripts

Update package.json for production:
```json
{
  "scripts": {
    "start": "node dist/server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server/index.js --external:pg-native",
    "deploy": "npm run build && npm start"
  }
}
```

### 6. hPanel Upload Process

1. **Compress Your Files**: Create a ZIP file containing:
   - All built files (dist directory)
   - node_modules (or use npm install on server)
   - package.json
   - .env file
   - uploads directory

2. **Upload via File Manager**:
   - Access hPanel File Manager
   - Navigate to public_html
   - Upload and extract your ZIP file

3. **Set up Node.js App**:
   - Go to hPanel > Advanced > Node.js
   - Create new Node.js app
   - Set entry point to `dist/server/index.js`
   - Install dependencies with `npm install`

### 7. Domain Configuration

Point your domain to the Node.js app:
- Update DNS settings if needed
- Configure subdomain if using one
- Set up SSL certificate through hPanel

## Database Migration Scripts

### PostgreSQL to MySQL Conversion
```sql
-- Convert PostgreSQL schema to MySQL
-- This script converts the main tables

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  is_admin BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add similar conversions for other tables...
```

## Troubleshooting

### Common Issues:

1. **Port Conflicts**: Hostinger assigns ports automatically
2. **File Permissions**: Ensure uploads directory has write permissions
3. **Database Connection**: Check connection string format
4. **Memory Limits**: Optimize for shared hosting constraints

### Environment-Specific Fixes:

```javascript
// Handle port assignment
const PORT = process.env.PORT || 3000;

// Handle database URL format
const dbUrl = process.env.DATABASE_URL || 'mysql://user:pass@localhost/db';

// Optimize for shared hosting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **File Upload Limits**: Restrict file sizes and types
3. **Rate Limiting**: Implement for API endpoints
4. **CORS**: Configure for your domain only

## Monitoring

Set up basic monitoring:
- Check logs through hPanel
- Monitor database usage
- Track file storage limits
- Monitor bandwidth usage

## Support

For Hostinger-specific issues:
- Check Hostinger documentation
- Contact Hostinger support
- Use their knowledge base for Node.js apps

For application issues:
- Check application logs
- Verify environment variables
- Test database connectivity