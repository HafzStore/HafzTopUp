# GameTopUp - Platform Top Up Game

Platform top up game dengan tema hitam dan kuning yang memungkinkan pengguna untuk membeli kredit/item game melalui sistem pembayaran Stripe.

## Tech Stack

### Frontend
- React + TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Tailwind CSS + Shadcn UI (styling)
- Firebase Authentication (Google Sign-In + Email/Password)
- Stripe React SDK (payments)

### Backend
- Express.js
- PostgreSQL (Neon database)
- Drizzle ORM
- Firebase Admin (authentication verification)
- Stripe API (payment processing)

## Features

### User Features
1. **Authentication**
   - Google Sign-In via Firebase
   - Email/Password registration and login
   - Protected routes for authenticated users

2. **Game Catalog**
   - Browse available games
   - Search and filter by category
   - View game details with packages
   - Real-time stock tracking

3. **Purchase Flow**
   - Select game and package
   - Enter User ID and Server ID
   - Checkout with Stripe payment
   - Payment confirmation page
   - Transaction history in dashboard

### Admin Features
1. **Admin Panel** (single admin session)
   - Dashboard with statistics
   - Game management (CRUD)
   - Game packages management
   - Banner management for hero carousel
   - Site configuration (name, icon, description, contact)

2. **Admin Authentication**
   - Separate admin login system
   - Email and password authentication
   - Single session enforcement (button hides when admin logged in)

## Database Schema

### Tables
- **users**: Firebase authenticated users
- **games**: Game catalog with stock tracking
- **game_packages**: Pricing and packages for each game
- **transactions**: Purchase history
- **banners**: Homepage carousel banners
- **site_config**: Website settings
- **admin_users**: Admin credentials

## Environment Variables

Required secrets (all already configured):
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL` (auto-configured)
- `SESSION_SECRET` (auto-configured)

## Design System

### Colors
- **Primary (Yellow)**: `hsl(45 100% 51%)` - CTAs, highlights, active states
- **Background (Black)**: `hsl(0 0% 7%)` - Main background
- **Card**: `hsl(0 0% 12%)` - Elevated surfaces
- **Foreground**: `hsl(0 0% 98%)` - Primary text
- **Muted**: `hsl(0 0% 71%)` - Secondary text

### Typography
- **Headings**: Exo 2 (Bold, ExtraBold)
- **Body**: Inter (Regular, Medium, SemiBold)

### Components
All components use Shadcn UI with custom black/yellow theme following the design guidelines.

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── GameCard.tsx
│   │   └── HeroBanner.tsx
│   ├── pages/         # Route pages
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── GameDetail.tsx
│   │   ├── Checkout.tsx
│   │   ├── PaymentSuccess.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   └── AdminPanel.tsx
│   ├── contexts/      # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/           # Utilities
│   │   ├── firebase.ts
│   │   └── queryClient.ts
│   └── App.tsx
server/
├── routes.ts          # API routes (to be implemented)
├── storage.ts         # Data access layer (to be implemented)
└── db.ts             # Database connection (to be implemented)
shared/
└── schema.ts         # Database schema with Drizzle
```

## Development Status

### Completed (Task 1)
- ✅ Complete database schema with all tables and relations
- ✅ Firebase authentication setup (Google + Email/Password)
- ✅ Stripe payment integration setup
- ✅ Design system implementation (black/yellow theme)
- ✅ All frontend components and pages
- ✅ Responsive design for mobile and desktop
- ✅ Admin panel UI with full CRUD interfaces

### Next Steps (Task 2)
- Backend API implementation
- Database migration with `npm run db:push`
- Admin authentication logic
- Payment processing with Stripe
- Transaction creation and stock management

### Final Steps (Task 3)
- Connect frontend to backend APIs
- Test complete user flows
- Error handling and loading states
- Final polish and testing

## Running the App

1. All secrets are already configured
2. Start the development server: `npm run dev`
3. The app will be available on port 5000

## Notes

- Dark mode only (black/yellow theme)
- Admin panel access button only visible when no admin is logged in
- Stock tracking per game with real-time updates
- Instant payment confirmation with Stripe
- Beautiful loading and error states throughout
