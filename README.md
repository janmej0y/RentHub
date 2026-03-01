# 🏠 RentHub

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Integrated-3ECF8E?logo=supabase&logoColor=white">
</p>

> ✨ **RentHub** is a modern rental listing platform to browse, compare, chat, and book properties with a polished UX.

<p>
  <span style="background:#ecfeff; padding:6px 10px; border-radius:6px;">
    <strong>Highlight:</strong> Works in mock-first mode too, so development continues even when backend/network is unstable.
  </span>
</p>

## 🚀 Key Features

### 🔐 Authentication
- Mock login flow (fast local testing)
- Supabase auth integration points
- Session-based protected routes

### 🔎 Discovery & Search
- Advanced filters (location, price, type, tenant preference, amenities, furnishing)
- Sort options including **Best Match**
- List view + map-style exploration
- Pagination (10 results/page)
- Saved searches + recently viewed + compare properties

### 🏘️ Property Details
- Gallery carousel + fullscreen image preview
- Full description + highlights + amenities chips
- Reviews with sorting + helpful votes
- In-app chat with owner (mock/local)

### 📅 Booking Experience
- Multi-step booking flow
- Exact checkout date-time selection
- UPI + QR + screenshot upload
- Agreement consent before submit
- Availability preview + charge breakdown

### 🧾 Receipts & Profile
- Color, branded printable receipts
- Receipt archive
- Profile photo upload
- Profile completion meter
- Preference and notification settings

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** shadcn/ui + Radix UI + Lucide icons
- **Styling:** Tailwind CSS
- **Backend Integration:** Supabase (Auth / DB / Storage ready)
- **Runtime:** React 19

## 📁 Project Structure

```text
src/
  app/                Next.js routes, page layouts, loading/error boundaries
  components/         Reusable UI + feature components
  context/            Global auth/provider state
  hooks/              Shared hooks
  lib/                Services (rooms, booking, chat, receipt, storage, supabase)
  types/              Type definitions
```

## ⚙️ Quick Start

### 1) Install
```bash
npm install
```

### 2) Configure `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### 3) Run
```bash
npm run dev
```

Open: **`http://localhost:9002`**

## 📜 Available Scripts

- `npm run dev` → Start dev server on port `9002`
- `npm run build` → Production build
- `npm run start` → Start production server
- `npm run lint` → Lint checks
- `npm run typecheck` → TypeScript checks

## 🧠 Current Notes

- ✅ App supports mock/local fallbacks in multiple flows.
- ✅ Chat and receipt archive are currently local-storage backed.
- ✅ Booking can continue with mock pending confirmation when backend fails.

## ⚠️ Known TypeScript Issues (Pre-existing)

- `src/components/AddRoomForm.tsx`
- `src/components/ui/calendar.tsx`

These are existing issues and can be fixed in a dedicated cleanup pass.

## 🗺️ Suggested Next Upgrades

1. Real-time chat threads + unread indicators
2. Booking reschedule/cancel lifecycle
3. Full TS cleanup and CI typecheck gate
4. Analytics and monitoring (funnel + errors)

## 👨‍💻 Author

**Janmejoy Mahato**  
Full-Stack Developer • Next.js • TypeScript • Supabase
