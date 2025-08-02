# InnovanceOrbit E-commerce Platform

## Overview
InnovanceOrbit is a login-only e-commerce platform for private stores, built with React, Express.js, and PostgreSQL. It integrates with Bahraini payment methods like Benefit Pay. Its purpose is to provide a secure, controlled environment for predefined users, with public registration disabled. The business vision is to offer a robust, visually appealing, and customizable e-commerce solution for niche markets requiring exclusive access.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Vite build tool.
- **UI**: Shadcn/ui (Radix UI primitives), Tailwind CSS for styling.
- **State Management**: TanStack Query (React Query).
- **Routing**: Wouter with dynamic category routing.
- **Forms**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Responsive design, dark/light theme, accessible components. Features geometric artwork, glass-morphism, gradient and modern animations for UI elements, enhanced logos, and redesigned product/category sections. Individual category pages are dynamically generated.

### Backend Architecture
- **Runtime**: Node.js with TypeScript, Express.js framework.
- **Authentication**: Passport.js with local strategy, express-session, Node.js crypto module for scrypt hashing.
- **Session Storage**: PostgreSQL-backed sessions using `connect-pg-simple`.

### Database Architecture
- **Database**: PostgreSQL.
- **ORM**: Drizzle with migrations support.
- **Schema**: Shared between client and server via TypeScript types.

### Key Features and Specifications
- **Authentication**: Login-only for predefined users, session-based, secure password hashing.
- **E-commerce**: Product catalog with categories, shopping cart, order management, email notifications for order confirmations. Dynamic individual category pages with search.
- **Payment Integration**: Support for Benefit Pay, Cash on Delivery, and Stripe.
- **Email System**: SMTP integration using Nodemailer for order confirmations, customizable HTML templates.
- **Admin Management**: Comprehensive footer management, CRUD for slider images, unit of measure system, Excel data management (export/import for Products, Categories, Users, Orders, Order Items, Units of Measure, Site Settings, Slider Images), database export/import.
- **System Design**: Monorepo structure with shared TypeScript schemas. Authentication-first approach. Stock management and Wishlist functionality removed. Optimized for stability with database connection fixes.
- **Permission System**: Comprehensive role-based permission system with 85 permissions across 15 modules. Features a 3-tier role hierarchy (Super Admin, Manager, User) with granular control and middleware for checking permissions. UI adapts dynamically based on user roles and permissions.
- **Order Approval Workflow**: Admin dashboard for order management (pending/approved filtering). Email notifications for various stages (submission, approval, payment confirmation, delivery confirmation). Payment options are locked until admin approval.

## External Dependencies

### Payment Providers
- **Benefit Pay**: Primary payment gateway for Bahrain.
- **Cash on Delivery**: Local fulfillment payment option.
- **Stripe**: International credit card processing.
- **PayPal**: International payment option (currently disabled).

### Database
- **Neon**: Serverless PostgreSQL hosting.

### Email Services
- **Microsoft 365 SMTP**: Professional email delivery (`smtp.office365.com`) with admin-configurable settings.

### UI Components
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.