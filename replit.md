# InnovanceOrbit E-commerce Platform

## Overview

InnovanceOrbit is a login-only e-commerce platform built with a modern full-stack architecture. The system features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and integrates with Benefit Pay and other Bahrain payment methods. The platform is designed as a private store where only predefined users can access products and make purchases - public registration is disabled.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **SMTP**: Email delivery for order confirmations and notifications
- Configurable SMTP settings for various email providers

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