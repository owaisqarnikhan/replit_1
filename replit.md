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
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Responsive design for mobile and desktop, dark/light theme support, accessible components. Geometric artwork is integrated across hero sections, admin dashboard, promotional banners, and as a custom footer background. Card components use glass-morphism, gradients, and modern animations. Prominent corner geometric designs are used in image sliders and promotional banners. Header and footer logos are enhanced for better brand prominence. Featured Products and Shop by Category sections are visually redesigned with gradient backgrounds and modern typography.

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
- **E-commerce Features**: Product catalog with categories, shopping cart, order management, email notifications for order confirmations.
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
- **Microsoft 365 SMTP**: Professional email delivery (`smtp.office365.com`).

### UI Components
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.