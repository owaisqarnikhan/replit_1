# InnovanceOrbit E-commerce Platform

## Overview
InnovanceOrbit is a login-only e-commerce platform designed for private stores. Built with a modern full-stack architecture, it features a React frontend with TypeScript, an Express.js backend, and a PostgreSQL database with Drizzle ORM. The platform integrates with Benefit Pay and other Bahrain payment methods. Its core purpose is to provide a secure, controlled environment for predefined users to access products and make purchases, with public registration disabled. The business vision is to offer a robust, visually appealing, and highly customizable e-commerce solution for niche markets requiring exclusive access.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter with dynamic category routing (`/category/:categoryId`)
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Responsive design for mobile and desktop, dark/light theme support, accessible components. Geometric artwork is integrated across hero sections, admin dashboard, promotional banners, and as a custom footer background. Card components use glass-morphism, gradients, and modern animations. Prominent corner geometric designs are used in image sliders and promotional banners. Header and footer logos are enhanced for better brand prominence. Featured Products and Shop by Category sections are visually redesigned with gradient backgrounds and modern typography. Individual category pages automatically created for each category with dedicated URLs.

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Node.js crypto module with scrypt hashing
- **Session Storage**: PostgreSQL-backed sessions using `connect-pg-simple`

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle with migrations support
- **Schema**: Shared between client and server via TypeScript types

### Key Features and Specifications
- **Authentication System**: Login-only access for predefined users, session-based authentication, secure password hashing.
- **E-commerce Features**: Product catalog with categories, shopping cart, order management, email notifications for order confirmations. Dynamic individual category pages with automatic URL generation (`/category/[categoryId]`) that display category-specific products, search functionality, and category details.
- **Payment Integration**: Support for Benefit Pay and Cash on Delivery. Multi-payment gateway architecture to support regional payment preferences (K-Net and Benefit Debit are planned). Stripe and PayPal are integrated for international payments.
- **Email System**: SMTP integration using Nodemailer for order confirmations. Supports customizable HTML email templates.
- **Admin Management**: Comprehensive footer management (description, copyright, quick links, services, social media, dynamic background image). Full CRUD operations for slider images. Comprehensive unit of measure system with 16 predefined units and CRUD operations. Enhanced Excel data management system for individual sheet export/import for 8 data types (Products, Categories, Users, Orders, Order Items, Units of Measure, Site Settings, Slider Images). Database export/import functionality.
- **System Design Choices**: Monorepo structure with shared TypeScript schemas between client and server. Authentication-first approach for protected e-commerce functionality. Stock management and Wishlist functionality have been removed from the system. Application optimized for stability with database connection fixes.

## External Dependencies

### Payment Providers
- **Benefit Pay**: Primary payment gateway for Bahrain.
- **Cash on Delivery**: Local fulfillment payment option.
- **Stripe**: International credit card processing.
- **PayPal**: International payment option (currently disabled).

### Database
- **Neon**: Serverless PostgreSQL hosting.

### Email Services
- **Microsoft 365 SMTP**: Professional email delivery (`smtp.office365.com`) with admin-configurable settings through dashboard.
- **SMTP Configuration**: Uses `itsupport@bayg.bh` with proper app password authentication.
- **Tenant Requirement**: Requires IT administrator to enable SMTP authentication at tenant level.

### UI Components
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.

## Migration to Replit (February 2, 2025)

### Successfully Migrated from Replit Agent:
- ✅ **PostgreSQL Database Setup**: Created and configured PostgreSQL database with all environment variables
- ✅ **Database Schema Migration**: Applied complete schema using Drizzle ORM with all tables and relations
- ✅ **Permission System Seeding**: Initialized comprehensive role-based permission system with 46 permissions across 10 modules
- ✅ **User Account Seeding**: Created predefined test accounts including admin and customer users
- ✅ **Application Launch**: Successfully running on port 5000 with full functionality
- ✅ **Security Implementation**: Maintained client/server separation and robust security practices
- ✅ **Environment Configuration**: All dependencies installed and configured for Replit environment
- ✅ **Responsive Login Page**: Updated login page to be fully responsive across all screen sizes with mobile-first design, dark mode support, and optimized mobile experience

### Ready for Development:
The platform is now fully operational on Replit with:
- Complete e-commerce functionality
- Admin dashboard with order approval workflow
- Email notification system (Microsoft 365 SMTP)
- Payment integration (Benefit Pay, Stripe, PayPal)
- Comprehensive user management and permissions
- Fully responsive login interface for all devices

## Latest Deployment Preparation (January 31, 2025)

### Complete Order Approval Workflow System:
- ✅ **Admin Order Management**: Complete order approval interface in admin dashboard with pending/approved order filtering
- ✅ **Email Notification System**: Full Microsoft 365 SMTP integration with comprehensive email workflow:
  - Order submission notification (customer receives "awaiting approval" email)
  - Admin notification when new orders submitted
  - Order approval notification (customer receives "payment unlocked" email)
  - Payment completion confirmation (customer receives "order confirmed" email)
  - Order delivery confirmation (customer receives "delivered successfully" email)
- ✅ **Payment Method Locking**: Payment options locked until admin approval, unlocked after approval
- ✅ **Email Setup Guide**: Comprehensive EMAIL-SETUP-GUIDE.md with Microsoft 365 configuration instructions
- ✅ **Admin Email Configuration**: Complete SMTP settings managed through admin dashboard with test functionality
- ✅ **SendGrid Removal**: Completely removed SendGrid in favor of Microsoft 365 SMTP with database-stored configuration
- ✅ **SMTP Troubleshooting**: Enhanced error handling with specific Microsoft 365 authentication guidance and IT administrator instructions

### AWS PuTTY Deployment Ready:
- ✅ **Complete AWS Deployment Guide**: Comprehensive step-by-step guide for deploying to AWS using PuTTY SSH client
- ✅ **Production Build Package**: Generated optimized production build (132.6kb server bundle, 706.6kb client bundle)
- ✅ **Deployment Configuration Files**: All necessary config files created:
  - Production environment variables template (.env.production)
  - PM2 process manager configuration (ecosystem.config.js)  
  - Nginx web server configuration with security headers and caching
  - Automated installation script for AWS EC2 setup
- ✅ **Complete Deployment Package**: Ready-to-upload deployment folder with built application, uploads, and all configuration files
- ✅ **Cost-Optimized AWS Setup**: Self-hosted PostgreSQL on EC2 t3.small reduces costs to $31/month vs $44/month with RDS
- ✅ **Production Security**: Configured proper file permissions, process management, and web server security headers

### Deployment Specifications:
- **Server**: AWS EC2 t3.small (2 vCPU, 2GB RAM, 30GB SSD)
- **Database**: PostgreSQL installed directly on EC2 (cost optimization)
- **Web Server**: Nginx reverse proxy with PM2 process management
- **Email Service**: Microsoft 365 SMTP with app password authentication
- **Monthly Cost**: $31/month for professional e-commerce hosting
- **Deployment Method**: PuTTY SSH with WinSCP file transfer
- **Ready for Production**: All files prepared and tested for deployment including email workflow