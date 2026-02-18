# Gulf Courier - Courier & Logistics Platform

## Overview

Gulf Courier is a modern courier and logistics web application serving the UAE, GCC countries, and international destinations. The platform provides comprehensive shipping solutions including same-day delivery, next-day shipping, freight services, and international express courier services. Built with a focus on user experience, the application features real-time shipment tracking, instant quotations, online booking, and a premium purple gradient design aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing without the overhead of React Router
- TanStack Query (React Query) for server state management, caching, and API interaction

**UI Component System:**
- shadcn/ui components built on Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants
- Custom design system following "New York" style with purple gradient theme (#4B2EFF → #A767FF)

**Form Management:**
- React Hook Form for performant form handling with minimal re-renders
- Zod for schema validation with TypeScript integration via @hookform/resolvers
- Shared validation schemas between client and server for consistency

**Design Philosophy:**
- Premium logistics aesthetic with rounded cards, soft shadows, and large typography
- Purple gradient as primary brand color with neon blue/sky blue accents
- Minimal gradients with soft geometric shapes for backgrounds
- Modern, professional, trust-focused design approach

### Backend Architecture

**Server Framework:**
- Express.js server running on Node.js with TypeScript
- HTTP server created with Node's native `http` module for potential WebSocket support
- Custom middleware for JSON body parsing with raw body capture (for webhook verification)
- Request/response logging middleware with timestamp formatting

**API Design:**
- RESTful API endpoints under `/api` prefix
- Route registration pattern with centralized routing configuration
- Error handling with appropriate HTTP status codes
- Validation using Zod schemas shared with frontend

**Key API Endpoints:**
- `GET /api/track/:trackingNumber` - Shipment tracking by tracking number
- `POST /api/quotations` - Generate shipping quotations with price calculations
- Additional endpoints for bookings, contact messages, and newsletter subscriptions

### Data Storage Solutions

**Database:**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript types generated from Drizzle schemas
- Migration system using Drizzle Kit for version-controlled schema changes

**Database Schema:**
The application uses a well-structured relational schema:
- **shipments**: Core shipment tracking with tracking numbers, sender/receiver details, status workflow, and delivery information
- **quotations**: Quote requests with shipment details, dimensions, and customer contact information
- **bookings**: Online booking records with complete shipment and customer details
- **contactMessages**: Customer inquiry messages
- **newsletterSubscriptions**: Email subscription management

**Data Models:**
- Type-safe models generated using Drizzle's inference (`$inferSelect`)
- Zod validation schemas created from Drizzle schemas using `createInsertSchema`
- Separation of Insert types (for creation) and Select types (for queries)

**Storage Interface:**
- Abstract `IStorage` interface defining all data access methods
- Supports future implementation of in-memory, file-based, or cloud database storage
- Helper functions for business logic (tracking number generation, price calculation, delivery estimation)

### Authentication & Authorization

**Current Implementation:**
- User schema defined with username-based authentication structure
- Foundation for future authentication implementation
- Session management infrastructure prepared (connect-pg-simple for PostgreSQL sessions)

**Planned Features:**
- Passport.js integration for authentication strategies
- JWT tokens for API authentication
- Express session management with PostgreSQL store

### External Dependencies

**Third-Party Libraries:**
- **UI Components**: Radix UI primitives (@radix-ui/*) for accessible component foundations
- **Form Handling**: react-hook-form, @hookform/resolvers, zod for robust form management
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: Tailwind CSS, tailwindcss-animate, class-variance-authority
- **Database**: pg (PostgreSQL driver), drizzle-orm, drizzle-zod
- **Development**: tsx for TypeScript execution, esbuild for production builds

**Potential Future Integrations:**
- Payment processing (Stripe SDK already in dependencies)
- Email services (Nodemailer available)
- SMS notifications for shipment updates
- Google Maps API for location services
- WhatsApp Business API (WhatsApp button implemented in UI)

**Build & Deployment:**
- Production build combines Vite client build with esbuild server bundling
- Server dependencies selectively bundled (allowlist strategy) to reduce cold start times
- Static file serving from built client assets
- Environment-specific configurations via NODE_ENV

**Development Tools:**
- Replit-specific plugins for enhanced development experience
- Hot module replacement in development
- Runtime error overlay for debugging
- TypeScript type checking with path aliases (@/, @shared/, @assets/)

### Application Features

**Customer-Facing Features:**
- Real-time shipment tracking with status timeline visualization
- Instant quotation calculator with price breakdown
- Online booking system with pickup scheduling
- Multi-destination support (UAE, GCC, International)
- Multiple service tiers (same-day, next-day, express, economy)
- Newsletter subscription
- Contact form for inquiries
- Comprehensive service information pages
- Location finder for physical offices

**Business Logic:**
- Tracking number generation with format: GC-UAE-{YEAR}-{RANDOM}
- Dynamic pricing calculation based on shipment type, weight, destination, and delivery mode
- Estimated delivery date calculation
- Status workflow management (pending → picked-up → in-transit → out-for-delivery → delivered)
- Timeline generation for tracking visualization