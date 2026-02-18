# Gulf Courier Website - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from premium logistics and SaaS platforms with modern, trust-focused aesthetics. Clean, minimal layouts with high-end futuristic elements.

## Brand Identity

**Style Direction:**
- Modern, professional, trust-focused design
- Clean minimal layouts with rounded cards and soft shadows
- Large, bold typography with smart spacing
- High-end futuristic aesthetic
- Purple gradient theme throughout

**Color Palette:**
- Primary: Purple Gradient (#4B2EFF → #A767FF)
- Secondary: White, Off-White, Soft Gray backgrounds
- Accent: Neon Blue / Light Sky Blue for interactive elements
- Background: Minimal gradients with soft geometric shapes

**Logo:**
- Purple gradient wordmark for "Gulf Courier"
- Modern courier icon integration
- Clean sans-serif typography

## Typography System

**Hierarchy:**
- Hero Headlines: Extra large, bold weight (think 4xl-6xl)
- Section Headers: Large, semi-bold (2xl-4xl)
- Body Text: Regular weight, comfortable reading size
- Buttons/CTAs: Medium weight, uppercase or sentence case
- Form Labels: Small, medium weight

**Font Selection:**
- Primary: Modern geometric sans-serif (e.g., Inter, Outfit, or Satoshi)
- Use single font family with varied weights for consistency

## Layout System

**Spacing Primitives:**
- Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24, 32
- Section padding: py-16 to py-32 for desktop, py-12 to py-20 for mobile
- Card padding: p-6 to p-8
- Element spacing: gap-4 to gap-8

**Container Strategy:**
- Full-width sections with max-w-7xl inner containers
- Content sections: max-w-6xl
- Form containers: max-w-2xl

## Homepage Structure

### Hero Section (100vh)
- Full-width purple gradient background (#4B2EFF → #A767FF)
- Large hero image: Modern delivery truck, courier rider, or parcel visuals (right-aligned or background)
- Headline (left-aligned): "Fast. Reliable. Global. Your UAE Delivery Partner."
- Subtext: Service description
- Three prominent CTAs with blurred backgrounds: "Book a Shipment", "Get a Quotation", "Track Shipment"

### Service Highlights Section
- 4-column grid (responsive: 1 col mobile, 2 col tablet, 4 col desktop)
- Glassmorphism cards with:
  - Large icons (courier, clock, globe, freight symbols)
  - Service title
  - Brief description
  - Smooth hover lift animation

### Tracking Section
- Centered layout with max-w-2xl
- Large tracking input field
- Prominent "Track Now" button
- Minimal, clean design with ample whitespace

### Pickup Locations Section
- Two-column layout: Interactive map (60%) + Location list (40%)
- UAE city icons: Abu Dhabi, Dubai, Sharjah, Ajman, RAK, Fujairah, UAQ
- Rounded location cards with addresses

### Quotation Form Section
- Single column, max-w-2xl
- Multi-step visual progression (if supported) or single comprehensive form
- Fields: Sender details, receiver country, shipment type, weight, dimensions, pickup toggle, delivery mode, contact info
- Large "Get Instant Quote" CTA

### Why Choose Gulf Courier
- 3-column grid with icon-headline-description cards
- Subtle hover animations
- Benefits: Reliability, Tracking, Experience, Reach, Pricing, Support

### Testimonials Section
- 3-column grid of testimonial cards
- Profile avatars (circular)
- Customer name, role, company
- Quote text with star ratings

### Final CTA Section
- Full-width with gradient background
- Centered large headline
- Dual CTAs: "Book Shipment" + "Contact Support"

## Component Library

### Cards
- Rounded corners (rounded-xl to rounded-2xl)
- Glassmorphism effects where appropriate
- Soft shadows (shadow-lg, shadow-xl)
- Smooth hover states (scale-105, shadow-2xl)

### Forms
- Large input fields with rounded borders
- Clear labels above inputs
- Dropdown selectors with custom styling
- Toggle switches for binary choices
- Radio buttons for delivery modes
- Multi-step progress indicators where applicable

### Buttons
- Primary: Purple gradient background with blurred effect when on images
- Secondary: White with purple border
- Sizes: Large for CTAs, medium for forms
- Rounded-full or rounded-lg

### Icons
- Use Heroicons or Font Awesome via CDN
- Consistent size across sections (6x6 to 8x8 for features)
- Purple or accent blue coloring

### Navigation
- Sticky header with transparent-to-solid transition on scroll
- Logo left, nav links center, CTA button right
- Mobile: Hamburger menu with slide-in drawer

### Footer
- Multi-column layout (Services, Company, Contact, Social)
- Newsletter subscription form
- WhatsApp floating button (bottom-right, fixed position)

## Page-Specific Elements

### Services Page
- Hero section with service overview
- Tabbed or accordion sections for each service type
- Feature comparison table for delivery modes
- CTA blocks between sections

### Track Shipment Page
- Centered tracking form
- Shipment status card mockup showing:
  - Shipment ID
  - Progress timeline (visual stepper)
  - Current location
  - Estimated delivery
  - Status badges (In Transit, Out for Delivery, Delivered)

### Quotation Page
- Comprehensive form (as described in homepage)
- Instant price estimate display
- Breakdown of costs (if applicable)
- "Proceed to Booking" CTA

### Contact Page
- Two-column: Form (left) + Info (right)
- Info includes: Phone, WhatsApp, Email, Address, Map embed
- Quick contact form with name, email, subject, message

## Images

**Hero Image:** Large, professional image of courier delivery - modern delivery van, professional courier with package, or logistics operation. Right-aligned or full-background with gradient overlay.

**Service Icons:** Use icon library for service cards (no custom images needed)

**Pickup Locations:** Embedded map (Google Maps or similar) + UAE city icons

**About Page:** Team photos (professional office environment), coverage map visualization

**Testimonials:** Customer avatar placeholders (circular, 64x64)

## Animations & Interactions

**Minimal & Purposeful:**
- Card hover: Subtle lift (translateY) + shadow increase
- Button hover: Slight scale or brightness change
- Hero elements: Gentle fade-in on load
- Scroll animations: Disabled unless specifically enhancing UX
- Form interactions: Clear focus states, smooth transitions

## Mobile Responsiveness

- Stack all multi-column layouts to single column on mobile
- Increase touch target sizes (min 44x44px)
- Adjust font sizes proportionally
- Hamburger navigation for mobile
- Sticky CTAs on mobile for booking/quotation

## Trust & Credibility Elements

- Security badges near forms
- Customer logos (if applicable)
- Delivery statistics (packages delivered, years in service)
- Real-time tracking visualization
- Professional imagery throughout

This design creates a premium, trustworthy courier platform that balances modern aesthetics with functional clarity, ensuring users can easily book shipments, get quotes, and track packages while experiencing a visually cohesive brand identity.