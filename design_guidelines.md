# Design Guidelines: Game Top-Up Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from TopUpNoLimit.com, Codashop, and modern gaming e-commerce platforms, while implementing a distinctive black and yellow brand identity that conveys premium quality and gaming excitement.

**Core Principles**:
- Build trust through professional, polished design
- Create visual excitement that appeals to gamers
- Ensure clarity in transactional flows
- Balance bold aesthetics with usability

---

## Color Palette

### Primary Colors
**Dark Theme Foundation**:
- **Deep Black**: 0 0% 7% - Primary background
- **Rich Black**: 0 0% 12% - Card backgrounds, elevated surfaces
- **Charcoal**: 0 0% 20% - Borders, dividers, inactive states

**Brand Yellow**:
- **Primary Yellow**: 45 100% 51% - Primary CTAs, highlights, active states
- **Golden Yellow**: 43 96% 56% - Hover states, accents
- **Soft Yellow**: 48 100% 88% - Subtle highlights, badges

### Accent & Semantic Colors
- **Success Green**: 142 76% 36% - Successful transactions, stock available
- **Warning Orange**: 25 95% 53% - Low stock alerts
- **Error Red**: 0 84% 60% - Out of stock, errors
- **Info Blue**: 199 89% 48% - Informational messages

### Text Colors
- **Primary Text**: 0 0% 98% - Headings, important content
- **Secondary Text**: 0 0% 71% - Body text, descriptions
- **Muted Text**: 0 0% 51% - Helper text, placeholders

---

## Typography

**Font Families**:
- **Headings**: "Exo 2" (Google Fonts) - Bold, futuristic gaming aesthetic
  - Weights: 700 (Bold), 800 (ExtraBold)
  - Usage: Page titles, game names, CTAs
  
- **Body**: "Inter" (Google Fonts) - Clean, highly readable
  - Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
  - Usage: Descriptions, forms, navigation

**Type Scale**:
- **Hero Heading**: 3.5rem (56px) / 700 weight / -0.02em tracking
- **Page Title**: 2.5rem (40px) / 700 weight
- **Section Heading**: 1.875rem (30px) / 700 weight
- **Card Title**: 1.25rem (20px) / 600 weight
- **Body Large**: 1.125rem (18px) / 400 weight
- **Body**: 1rem (16px) / 400 weight
- **Small**: 0.875rem (14px) / 500 weight

---

## Layout System

**Spacing Units**: Use Tailwind units of **2, 4, 8, 12, 16, 24** for consistent rhythm
- **Component padding**: p-4, p-6, p-8
- **Section spacing**: py-12, py-16, py-24
- **Element gaps**: gap-2, gap-4, gap-6

**Container Widths**:
- **Maximum width**: max-w-7xl (1280px)
- **Content sections**: max-w-6xl (1152px)
- **Form containers**: max-w-md (448px)

**Grid System**:
- **Desktop**: 3-4 column grid for game cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- **Tablet**: 2 column layout
- **Mobile**: Single column stack

---

## Component Library

### Navigation Header
- **Sticky top navigation** with black background (bg-black/95 backdrop-blur)
- **Logo** on left (yellow accent), **search bar** center, **user menu/login** on right
- **Secondary nav** below: Categories, Promo, Customer Service
- **Height**: 64px main nav, 48px secondary nav

### Hero Section
- **Full-width banner carousel** (h-96 on desktop, h-64 on mobile)
- **Promotional images** with yellow gradient overlays
- **Auto-rotating slides** every 5 seconds with pagination dots
- **CTAs** overlaid with blurred black backgrounds

### Game Cards
- **Black card background** (bg-[#1a1a1a]) with subtle yellow border on hover
- **Game thumbnail** at top (aspect-ratio-square or 16:9)
- **Game title** in yellow, platform badge
- **"Top Up Now" button** - yellow background, black text, full width
- **Discount badges** in top-right corner when applicable
- **Rounded corners**: rounded-xl

### Authentication Pages (Login/Register)
- **Centered card layout** on dark background with subtle pattern
- **Form container**: max-w-md with black card background
- **Logo at top** with yellow accent
- **Google Sign-In button**: White with Google logo, prominent placement
- **Divider**: "OR" with horizontal lines
- **Email/Password fields**: Dark inputs with yellow focus rings
- **Submit button**: Full-width yellow button
- **Toggle link**: "Don't have an account? Sign up" in yellow

### Admin Panel
- **Dark sidebar** navigation (w-64) with yellow active indicators
- **Top bar** with admin identifier and logout
- **Dashboard cards**: Grid layout showing stats (total games, active users, today's revenue)
- **Data tables**: Dark theme with yellow headers
- **Form layouts**: Two-column responsive forms
- **Action buttons**: Yellow primary, outlined secondary
- **Access button**: Small yellow badge "Admin" in top-right corner (only visible when no admin logged in)

### Product Detail Page
- **Two-column layout**: Game image/info left, purchase form right
- **Step indicators**: 1. Enter ID, 2. Select Amount, 3. Choose Payment
- **User ID input**: Large, clear field with validation
- **Amount selection**: Grid of cards with pricing
- **Payment methods**: Icon grid with logos
- **Checkout button**: Fixed bottom bar on mobile, prominent on desktop

### Payment Result Page
- **Success state**: Large checkmark icon, yellow accent
- **Transaction details card**: Order ID, game, amount, payment method, timestamp
- **Action buttons**: "View Receipt" (yellow), "Top Up Again" (outlined)
- **Email confirmation notice**

### Footer
- **Three-column layout**: About/Links, Payment Methods, Contact
- **Payment logos grid**: Grayscale logos with yellow tint on hover
- **Social media icons**: Yellow on hover
- **Copyright** and trust badges

---

## Images

### Hero Banners
- **Large promotional images** showcasing current offers (1920x600px)
- **Overlay**: Black gradient from bottom (opacity 60%) for text readability
- **Content**: Game key art, cashback promotions, limited-time offers
- **Placement**: Top of homepage in carousel

### Game Thumbnails
- **Official game logos/key art** (square format, 400x400px minimum)
- **Consistent sizing** across all cards
- **Lazy loading** for performance

### Icons
- **Payment method logos**: Full color on dark background
- **Feature icons**: Line icons in yellow for benefits section
- **Social proof icons**: Trust badges, secure payment indicators

### Background Elements
- **Subtle hexagonal pattern** on page backgrounds (10% opacity)
- **Gradient overlays** on hero sections (black to transparent)
- **Glow effects** around CTAs using box-shadow with yellow tint

---

## Interactive States

**Buttons**:
- **Primary (Yellow)**: Solid yellow, black text, shadow on hover, slight scale
- **Secondary**: Yellow border, yellow text, filled on hover
- **Ghost**: Transparent, yellow text, yellow background on hover

**Cards**:
- **Default**: Static with subtle shadow
- **Hover**: Lift effect (translateY -2px), yellow border glow
- **Active/Selected**: Yellow border, subtle yellow background tint

**Form Inputs**:
- **Default**: Dark background, subtle border
- **Focus**: Yellow ring (ring-2 ring-yellow-400)
- **Error**: Red ring with error message below
- **Success**: Green checkmark icon right

---

## Accessibility & Dark Mode

- **Single theme**: Dark mode only (brand consistency)
- **Contrast ratios**: Ensure yellow text on black meets WCAG AA standards (adjust to 48 100% 88% for body text if needed)
- **Focus indicators**: Always visible yellow rings
- **Form labels**: Clear, always visible above inputs
- **Error states**: Icon + color + text message (never color alone)

---

## Animations

**Use sparingly for polish**:
- **Page transitions**: Subtle fade-in (200ms)
- **Card hover**: Smooth lift and glow (150ms ease-out)
- **Button interactions**: Scale and shadow (100ms)
- **Loading states**: Yellow spinner/skeleton screens
- **Success confirmations**: Checkmark draw animation

**Avoid**: Excessive parallax, auto-playing videos, distracting effects