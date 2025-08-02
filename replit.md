# BAYG E-commerce Platform

## Overview

BAYG is a comprehensive e-commerce platform built for B2B and B2C sales with approval-based ordering, multi-payment gateway support, and admin management capabilities. The platform supports both purchase and rental products, features a permission-based role system, and includes specialized payment methods for the Bahrain/GCC market including Benefit Pay integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Wouter for client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Authentication**: Context-based auth system with protected routes
- **Theme System**: Dynamic theming with CSS variables supporting customizable colors and branding

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Management**: Express-session with PostgreSQL session store
- **File Handling**: Multer for image uploads with local file storage

### Database Design
- **Schema**: Comprehensive relational schema including users, products, categories, orders, permissions
- **Role-Based Access Control**: Granular permission system with modules, roles, and user assignments
- **Order Management**: Multi-status order workflow with approval mechanisms
- **Cart System**: User-specific shopping cart with product relationships

### Core Business Logic
- **Order Approval Workflow**: Orders require admin approval before payment processing
- **Product Management**: Support for both purchase and rental products with different pricing models
- **Permission System**: Module-based permissions (users, products, orders, payments, etc.)
- **Email Notifications**: SMTP-based email system for order confirmations and admin notifications

### Payment Processing
- **Multi-Gateway Support**: Stripe, PayPal, and Benefit Pay (Bahrain-specific)
- **Approval-First Model**: Payments are locked until admin approval is granted
- **Regional Compliance**: Specialized support for GCC market payment methods

### File Management
- **Upload System**: Local file storage with configurable upload paths
- **Image Handling**: Product images, category images, and site branding assets
- **Database Export/Import**: JSON-based data migration and backup system

## External Dependencies

### Payment Services
- **Stripe**: Credit card processing with webhook support
- **PayPal**: PayPal Server SDK for order creation and capture
- **Benefit Pay**: Custom integration for Bahrain regional payments

### Email Services
- **SMTP Support**: Multi-provider SMTP with Microsoft 365, Gmail, and custom SMTP servers
- **Nodemailer**: Email transport layer with template support

### Database and Infrastructure
- **PostgreSQL**: Primary database with Neon serverless support
- **Drizzle ORM**: Type-safe database operations and migrations
- **Session Storage**: Database-backed session management

### Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Full-stack type safety
- **ESBuild**: Server-side bundling for production

### UI and Styling
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Deployment Packages
- **AWS Deployment**: Complete deployment package with PM2, Nginx configuration
- **Hostinger Support**: Specialized deployment packages with MySQL migration options
- **Environment Configuration**: Multi-environment setup with production optimizations