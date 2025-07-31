# InnovanceOrbit E-commerce Platform

## Overview

InnovanceOrbit is a login-only e-commerce platform built with a modern full-stack architecture. The system features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and integrates with Benefit Pay and other Bahrain payment methods. The platform is designed as a private store where only predefined users can access products and make purchases - public registration is disabled.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Migration Progress

**Migration Status: ✅ COMPLETED**

### Migration to Replit (January 30, 2025):
- ✅ **Environment Setup**: Successfully migrated from Replit Agent to standard Replit environment
- ✅ **Database Configuration**: PostgreSQL database created and schema deployed
- ✅ **Dependencies**: All Node.js packages installed and working correctly  
- ✅ **Application Launch**: Server running successfully on port 5000
- ✅ **User Accounts**: Predefined accounts seeded (admin/admin123 for testing)
- ✅ **Authentication**: Session-based login system working properly
- ✅ **Admin Interface**: All admin management panels accessible and functional

### Previous Fixed Issues (January 29, 2025):
- ✅ **Authentication System**: Fixed session persistence issues - admin can now login and maintain session across requests
- ✅ **Admin Functionality**: All admin buttons now working properly:
  - Add Category button works - creates categories successfully
  - Add Product button works - creates products with image upload capability  
  - Add User button works - creates new user accounts with proper validation
- ✅ **Image Upload System**: Implemented comprehensive image upload functionality:
  - Added multer-based file upload endpoint (`/api/upload-image`)
  - Integrated image upload buttons in Category and Product forms
  - Added image preview functionality
  - Proper file validation and error handling
- ✅ **Logo Propagation System**: Logo updates now propagate across entire site:
  - Navigation header displays updated logo from site settings
  - Footer displays logo with proper styling (inverted for dark background)
  - Logo changes in admin site settings reflect immediately across all components
- ✅ **UI/UX Improvements**: 
  - Fixed Dialog accessibility warnings by adding descriptions
  - Enhanced forms with proper validation and error handling
  - Added loading states and proper feedback messages

### API Endpoints Confirmed Working:
- `POST /api/login` - Authentication ✅
- `POST /api/admin/users` - User creation ✅ 
- `POST /api/categories` - Category creation ✅
- `POST /api/products` - Product creation ✅
- `POST /api/upload-image` - Image upload ✅
- `PUT /api/settings` - Site settings update ✅
- `GET /api/admin/database/export` - Database export ✅
- `POST /api/admin/database/import` - Database import ✅

### Latest Updates (January 30, 2025):
- ✅ **Database Export/Import System**: Complete PostgreSQL database backup and restore functionality using native SQL format
- ✅ **Geometric Design Integration**: Applied user's custom geometric artwork across hero sections, admin dashboard, and promotional banners
- ✅ **Promotional Banner Component**: Created reusable promotional banner with geometric backgrounds and multiple variants
- ✅ **Microsoft 365 Email Integration**: Migrated from SendGrid/Hostinger to Microsoft 365 SMTP for professional email delivery
- ✅ **Admin SMTP Configuration**: Updated SMTP settings panel with Microsoft 365 configuration and setup instructions
- ✅ **Custom Footer Background**: Applied user's geometric artwork as footer background with professional overlay
- ✅ **Modern Card UI Redesign**: Enhanced all card components with glass-morphism, gradients, and modern animations
- ✅ **Email Template System**: Professional HTML email templates for customer order confirmations and admin notifications
- ✅ **Error Fixes**: Resolved user dashboard runtime errors with null-safe checks
- ✅ **Admin-Managed Image Slider**: Replaced static "Welcome Back" section with dynamic image slider system
- ✅ **Slider Management System**: Full CRUD operations for slider images with admin panel integration
- ✅ **Prominent Artboard Integration**: Enhanced geometric design prominence in corners across slider and promotional components

**Latest Enhancements (January 30, 2025):**
- ✅ **Prominent Corner Geometric Design**: Applied Artboard-1 geometric design prominently in corners of image slider and promotional banners for enhanced visual impact and brand consistency
- ✅ **Enhanced Header & Footer Logos**: Significantly increased logo sizes throughout the site - header logos from 32px to 64px, footer logos from 32px to 64px for better brand prominence
- ✅ **Redesigned Featured Products Section**: Complete visual overhaul with gradient backgrounds, modern typography, sophisticated layout, subtle background design elements, enhanced section header with icon and gradient text, call-to-action button, and improved empty state design
- ✅ **Redesigned Shop by Category Section**: Applied matching sophisticated design with emerald-blue gradient theme, enhanced category cards with hover effects, improved empty state fallbacks, and consistent visual hierarchy
- ✅ **Complete Footer Admin Management**: Implemented comprehensive footer management system allowing full control over footer content including:
  - Footer description and copyright text management
  - Quick Links section with customizable titles and link text
  - Services section with four configurable service links
  - Social media links for Facebook, Twitter, Instagram, and LinkedIn
  - Dynamic footer background image configuration
  - All footer content now fully editable through admin panel Footer tab
- ✅ **Complete Unit of Measure System**: Implemented comprehensive unit management functionality:
  - Database table with 16 predefined units (kg, g, lbs, pieces, liters, meters, boxes, packs, etc.)
  - Full CRUD operations with dedicated Units tab in admin dashboard
  - Unit selection integration in product forms and displays throughout platform
  - Unit-aware product displays (e.g., "kg", "liters", "pieces")
  - Complete integration with Excel export/import functionality
- ✅ **Enhanced Excel Data Management System**: Upgraded Excel functionality to support both bulk and individual sheet operations:
  - **Individual Sheet Export/Import**: Dedicated export/import functionality for each of the 8 data types (Products, Categories, Users, Orders, Order Items, Units of Measure, Site Settings, Slider Images)
  - **Granular Data Control**: Individual operations prevent foreign key conflicts and provide precise data management control
  - **Tabbed Interface**: Organized Excel management with separate tabs for individual sheets and bulk operations
  - **Flexible Field Handling**: Missing columns automatically use default values, missing IDs auto-generated by database
  - **Enhanced API Routes**: Individual export (`/api/admin/export/excel/:sheetType`) and import (`/api/admin/import/excel/:sheetType`) endpoints for all sheet types
  - **Comprehensive Error Handling**: Detailed error messages and validation for each sheet type with proper file cleanup
  - **User-Friendly Interface**: Card-based design with clear descriptions, field information, and status indicators for each data type
- ✅ **Admin Dashboard Optimization**: Removed "Items in Stock" card per user request and restored clean 4-column layout
- ✅ **Footer Height Optimization**: Reduced footer height from 400px to 280px and decreased padding for more compact layout
- ✅ **Individual Excel Import Cache Invalidation**: Individual imports now automatically refresh relevant admin sections - categories, products, users, orders, units, settings, and slider images update immediately after import
- ✅ **Cascade Delete System**: Products can be deleted safely with automatic removal of dependent order items, preventing foreign key constraint violations
- ✅ **Enhanced Category Validation**: Category deletion validates for dependent products and provides clear error messages for data integrity
- ✅ **Stock Management Removal**: Completely removed stock/inventory functionality from entire system - no stock tracking, validation, or display anywhere in application
- ✅ **Responsive Footer Fix**: Fixed footer positioning for all screen sizes using flex layout with proper sticky bottom positioning and responsive design optimizations
- ✅ **Centered Header Layout**: Redesigned navigation header with centered logo, left-side navigation tabs, and right-side user actions (wishlist, cart, user menu) with full responsive support
- ✅ **Complete Wishlist Functionality**: Created dedicated wishlist page with full CRUD operations, real-time status tracking, and seamless integration with product cards
- ✅ **Dedicated Orders Page**: Fixed "My Orders" navigation by creating comprehensive orders page with detailed order history, status tracking, and responsive design
- ✅ **Header Logo Height Control**: Added admin setting for header logo height with database field and dynamic sizing implementation
- ✅ **Footer Removal from Login**: Removed footer from auth/login page for cleaner authentication experience

The project is now fully functional with enhanced visual branding, prominent logo sizing, modern sophisticated design elements, complete footer management capabilities, comprehensive Excel data management, optimized layout dimensions, and comprehensive wishlist functionality. Complete deployment packages have been prepared for both PostgreSQL and MySQL databases, with comprehensive deployment documentation for multiple hosting platforms including Hostinger hPanel and AWS cloud infrastructure, featuring optimized configurations for production hosting environments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Node.js crypto module with scrypt hashing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with migrations support
- **Schema**: Shared between client and server via TypeScript types

## Key Components

### Authentication System
- Login-only access with predefined user accounts (no public registration)
- Session-based authentication using Passport.js
- Secure password hashing with scrypt and salt
- Protected routes that redirect unauthenticated users to login
- Admin account and multiple test customer accounts for development

### E-commerce Features
- Product catalog with categories and featured products
- Shopping cart functionality with persistent storage
- Order management and tracking
- Email notifications for order confirmations

### Payment Integration (Bahrain Market)
- **Benefit Pay**: Primary payment gateway for Bahrain market with secure transaction processing
- **Cash on Delivery**: Local delivery option for customers preferring to pay upon receipt
- **K-Net**: Kuwaiti debit card integration (planned)
- **Benefit Debit**: Local Bahraini debit card support (planned)
- Multi-payment gateway architecture supporting regional payment preferences

### User Interface
- Responsive design optimized for mobile and desktop
- Dark/light theme support via CSS variables
- Accessible components using Radix UI primitives
- Professional e-commerce layout with product cards, cart, and checkout flow

### Email System
- SMTP integration using Nodemailer
- Order confirmation emails sent from info@innovanceorbit.com
- Customizable HTML email templates

## Data Flow

1. **User Authentication**: Users must register/login before accessing the store
2. **Product Browsing**: Authenticated users can view categorized products
3. **Cart Management**: Users add products to cart with quantity management
4. **Checkout Process**: Multi-step checkout with shipping and payment details
5. **Payment Processing**: Integration with Stripe and PayPal for secure payments
6. **Order Fulfillment**: Order creation, email notifications, and admin management

## External Dependencies

### Payment Providers (Bahrain Focused)
- **Benefit Pay**: Primary payment gateway for Bahrain market with webhook support
- **Cash on Delivery**: Local fulfillment payment option
- **Stripe**: International credit card processing (optional, configurable)
- **PayPal**: International payment option (temporarily disabled)

### Database
- **Neon**: Serverless PostgreSQL hosting
- WebSocket support for real-time connections

### Email Services
- **Microsoft 365 SMTP**: Professional email delivery for order confirmations and notifications
- Configured for smtp.office365.com with STARTTLS encryption
- Supports both regular passwords and app passwords for MFA-enabled accounts

### UI Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- TSX for TypeScript execution in development
- Replit integration with runtime error overlay

### Production Build
- Vite builds optimized React bundle
- ESBuild bundles Node.js server code
- Single deployment artifact with static assets

### Environment Configuration
- Database URL for PostgreSQL connection
- Stripe API keys for payment processing
- PayPal client credentials
- SMTP credentials for email delivery
- Session secret for authentication security

The application follows a monorepo structure with shared TypeScript schemas between client and server, ensuring type safety across the full stack. The authentication-first approach ensures all e-commerce functionality is protected behind user login, making it suitable for private or membership-based stores.