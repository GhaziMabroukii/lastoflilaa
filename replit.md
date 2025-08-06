# replit.md

## Overview

Ekrili is a modern property rental platform specifically designed for the Tunisian market, focusing on students and families. The application features intelligent search capabilities with geolocation, real-time messaging, secure contract management, and flexible pricing models. Built as a full-stack web application using React frontend with Express.js backend, it provides comprehensive property management, user authentication, and integrated communication tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) architecture
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system featuring glassmorphism effects and Tunisian-inspired color palette
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Architecture Pattern**: RESTful API with modular route organization
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Development Setup**: Hot module replacement with Vite integration for seamless full-stack development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Centralized schema definitions in `/shared` directory
- **Validation**: Zod integration for runtime type validation
- **Migration System**: Drizzle Kit for database schema migrations

### Authentication & Authorization
- **Client-side**: localStorage-based session management
- **User Types**: Role-based system supporting tenants and property owners
- **Profile Management**: Comprehensive user profiles with verification badges

### UI/UX Design System
- **Design Philosophy**: Neo-brutalism with glassmorphism elements
- **Color Scheme**: HSL-based system with Tunisian cultural influences (warm orange-red primary, Mediterranean blue secondary)
- **Typography**: Modern sans-serif with gradient text effects
- **Components**: Consistent design language across form inputs, buttons, cards, and navigation elements

### Key Features Architecture
- **Property Management**: CRUD operations with image upload, amenities tracking, and availability management
- **Search System**: Advanced filtering with geolocation, price ranges, and category-based search
- **Messaging**: Real-time chat interface with message history and file sharing capabilities
- **Contract Management**: French legal contract creation with CIN fields, electronic signatures (owner first, then tenant), and proper tenant identification using name/email/phone
- **Notification System**: User preference-based notification settings with multiple delivery channels

### Recent Contract Updates (August 2025)
- **Complete Workflow Implementation**: Full contract lifecycle from creation to activation with real-time notifications
- **3-Day Expiration System**: Automatic contract expiration if tenant doesn't sign within 3 days of owner signature
- **Real-time Notifications**: Live notification system with 5-second polling for instant updates between owner and tenant
- **Property Status Automation**: Properties automatically switch from "Disponible" to "Loué" when contracts become active
- **Contract Modification**: Full contract editing capability with signature reset and notifications to both parties
- **PDF Download**: Secure PDF generation for fully signed contracts with unique filenames
- **Duplicate Prevention**: System prevents multiple active contracts for the same property
- **Scheduled Cleanup**: Hourly background job to automatically expire overdue contracts and reset property status
- **French Legal Structure**: Contracts follow authentic French rental agreement format with CIN fields
- **Enhanced Status Management**: Comprehensive status tracking (draft, owner_signed, fully_signed, active, expired, cancelled)

### Proper Offer-to-Contract Workflow (August 2025)
- **Secure Contract Creation**: Only owners can create contracts, only after receiving contract requests from tenants
- **Offer Management**: Complete offers page for both sent and received offers with status tracking
- **Contract Request System**: Tenants can request contracts only after their offers are accepted by owners
- **Role-Based Access**: Tenants cannot create contracts directly, ensuring proper business logic flow
- **Notification Integration**: Real-time notifications for offer acceptance, contract requests, and contract creation
- **Navigation Integration**: Offers page integrated into main navigation for easy access

### Role-Based UI & Notifications (August 2025)
- **Tenant Experience**: "Faire une offre" button only visible to tenants on property details
- **Owner Experience**: "Faire une offre" button hidden for property owners
- **Context-Specific Notifications**: Tenants receive "Nouvelle offre envoyée" notifications, owners receive "Nouvelle offre reçue"
- **Navigation Labels**: Owners see "Mes offres reçues", tenants see "Mes offres envoyées"
- **API Filtering**: Proper user-type based offer filtering ensures correct data display for each role
- **Dual Notifications**: Both tenant and owner receive appropriate notifications when offers are created

### Complete Offer Workflow Implementation (August 2025) ✅ COMPLETE
- **Full Workflow Logic**: Complete implementation of tenant offer workflow - tenant views property → makes offer → owner accepts/rejects → tenant can request contract
- **Automatic Role-Based UI**: System automatically detects user type and shows appropriate interface without manual switching
- **Duplicate Prevention**: Tenants cannot create multiple pending offers for the same property; system prevents duplicate pending offers
- **Real-time Status Updates**: Property details page shows offer status (pending, accepted, rejected, contract requested) with appropriate UI states
- **Smart Offer Management**: After rejection, tenants can create new offers; after acceptance, contract request workflow begins
- **Contract Request Button**: Appears only when offer is accepted, allowing tenant to request contract creation
- **Status-Based Notifications**: Both parties receive real-time notifications for offer creation, acceptance, rejection, and contract requests
- **Visual Status Indicators**: Color-coded status cards (yellow for pending, green for accepted, red for rejected, blue for contract requested)
- **Role-Based UI Logic**: Tenants automatically see "Mes offres envoyées", owners automatically see "Mes offres reçues" with proper filtering and display logic
- **Proper Error Handling**: Server prevents duplicate offers with clear error messages and client-side validation
- **Testing Verified**: Complete workflow tested and working - offers created successfully with proper tenant/owner separation

### Database Population & Testing Infrastructure (August 2025) ✅ COMPLETE
- **Complete Mock Data**: Database populated with 5 users (2 owners, 3 tenants), 6 realistic properties across Tunis area, 4 offers with different statuses, and 1 sample contract
- **Automatic User Type Detection**: System automatically determines user type from email patterns (student/etudiant emails → tenant, others → owner) without manual switching
- **Comprehensive Test Data**: Properties include studios, apartments, villas with realistic pricing (180-1200 DT/month), addresses, amenities, and high-quality images
- **Full Workflow Testing**: All features now testable with realistic data - property browsing, offer creation, contract signing, role-based interfaces
- **Error Handling Improvements**: Fixed ContractGenerator null reference errors with proper loading states and error boundaries

### Replit Migration & Production Deployment (August 2025) ✅ COMPLETE
- **Environment Migration**: Successfully migrated from Replit Agent to standard Replit environment with full compatibility
- **Database Integration**: PostgreSQL database properly configured with Neon serverless driver and all tables created
- **Authentication System**: Complete role-based authentication with session tokens that embed user type and ID for security
- **Real User Sessions**: Implemented secure user type separation using session tokens instead of localStorage-only authentication
- **Production-Ready Setup**: All dependencies installed, workflows configured, and application serving on port 5000 with proper error handling
- **User Type Validation**: Smart user type detection during registration based on email patterns with proper tenant/owner separation
- **Security Hardening**: Proper request validation, error handling, and user session management with token-based authentication

### Replit Migration & Production Deployment (August 2025) ✅ COMPLETE
- **Environment Migration**: Successfully migrated from Replit Agent to standard Replit environment with full compatibility
- **Database Integration**: PostgreSQL database properly configured with Neon serverless driver and all tables created
- **Authentication System**: Complete role-based authentication with session tokens that embed user type and ID for security
- **Real User Sessions**: Implemented secure user type separation using session tokens instead of localStorage-only authentication
- **Production-Ready Setup**: All dependencies installed, workflows configured, and application serving on port 5000 with proper error handling
- **User Type Validation**: Smart user type detection during registration based on email patterns with proper tenant/owner separation
- **Security Hardening**: Proper request validation, error handling, and user session management with token-based authentication

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Form Handling**: React Hook Form with Hookform Resolvers for validation

### UI Component Libraries
- **Radix UI**: Complete set of unstyled, accessible components including dialogs, dropdowns, tooltips, and form elements
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional CSS classes, class-variance-authority for component variants

### Database & Backend
- **Database**: PostgreSQL with Neon Database serverless driver
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for schema validation and Drizzle-Zod integration
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development Experience**: Replit-specific plugins for enhanced development workflow
- **Date Handling**: date-fns for date manipulation and formatting

### Specialized Features
- **Carousel**: Embla Carousel React for image galleries
- **Command Interface**: cmdk for search and command functionality
- **Digital Signatures**: React Signature Canvas for contract signing
- **Utility Libraries**: nanoid for unique ID generation, various utility functions for common operations