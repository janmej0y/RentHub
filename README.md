# RentHub

RentHub is a rental listing platform built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase-ready services.

The project currently supports a strong mock-first flow (useful when backend/network is unstable) while keeping Supabase integration points in place.

## Highlights

- Auth (mock login + Supabase auth wiring)
- Room discovery with advanced filters and sorting
- Pagination (10 results per page)
- List and map-style discovery mode
- Room details with:
  - full description
  - highlights
  - image gallery + fullscreen preview
  - reviews and review sorting
  - chat with owner (mock/local)
- Booking flow with:
  - multi-step booking UX
  - exact checkout date-time input
  - UPI + QR payment section
  - screenshot upload requirement
  - pending confirmation messaging
- My Bookings:
  - timeline/status
  - color receipt generation
  - receipt archive
- Profile:
  - profile photo upload
  - completion score
  - preference settings
- Wishlist, recently viewed, saved searches, compare properties

## Tech Stack

- Framework: Next.js 15 (App Router, Turbopack)
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui + Radix UI
- Backend (integrated): Supabase (Auth, Postgres, Storage)
- Runtime: React 19

## Project Structure

```text
src/
  app/                App Router pages and route-level UI states
  components/         Shared UI and feature components
  context/            Auth context
  hooks/              Reusable hooks
  lib/                Services (rooms, booking, wishlist, chat, storage, supabase)
  types/              Type definitions
```

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

3. Run development server

```bash
npm run dev
```

Open: `http://localhost:9002`

## Scripts

- `npm run dev` - start local dev server on port 9002
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - lint check
- `npm run typecheck` - TypeScript check

## Current Behavior Notes

- The app gracefully falls back to local/mock behavior in multiple places when Supabase/network fails.
- Chat is currently mock/local storage based.
- Receipt archive is currently local storage based.
- Booking confirmation currently supports mock pending flow if backend is unavailable.

## Known Issues

TypeScript currently has pre-existing errors in:

- `src/components/AddRoomForm.tsx`
- `src/components/ui/calendar.tsx`

These are not caused by the latest feature updates and can be fixed in a dedicated cleanup pass.

## Roadmap (Suggested)

- Fix current TS errors and enforce clean CI typecheck
- Real-time chat threads and unread badges
- Stronger booking lifecycle (reschedule/cancel/dispute)
- Better map and geo filters
- Admin moderation and analytics expansion

## Author

Janmejoy Mahato  
Full-Stack Developer (Next.js, TypeScript, Supabase)

