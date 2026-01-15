# 🏠 RentHub

RentHub is a full-stack rental listing platform that helps users **find, list, and manage rental rooms** easily.  
It is built with **Next.js (App Router)** and **Supabase** for authentication, database, and storage.

---

## 🚀 Features

### 👤 Authentication
- Email & password sign up / login
- Supabase Auth integration
- Session persistence
- Secure client-side auth using public anon key

### 🏘️ Room Listings
- Browse available rooms
- Filter by:
  - Location
  - Rent range
  - Property type
  - Tenant preference
- View room images and details

### 🧑‍💼 Owner Features
- Add new room listings
- Upload multiple room images
- View rooms posted by the logged-in user
- Edit & delete listings

### ⚡ UX & Performance
- Skeleton loaders
- Client-side caching
- Responsive UI
- Optimized Supabase queries

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend     | Next.js 15 (App Router) |
| Language     | TypeScript |
| Styling      | Tailwind CSS |
| UI Components| shadcn/ui |
| Backend      | Supabase |
| Auth         | Supabase Auth |
| Database     | PostgreSQL (Supabase) |
| Storage      | Supabase Storage |

---

## 📁 Project Structure

```text
src/
├── app/          # App Router pages
├── components/   # Reusable UI components
├── context/      # Global auth state
├── hooks/        # Custom hooks
├── lib/          # Supabase client & services
├── types/        # Type definitions
└── styles/       # Global styles
---
🔑 Environment Variables
Create a .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
---

---

⚙️ Setup

git clone [https://github.com/your-username/renthub.git](https://github.com/your-username/renthub.git)
cd renthub
npm install
npm run dev

---


---

Open: 👉 http://localhost:9002

🎯 What This Project Demonstrates
Full-stack architecture with real backend integration

Secure authentication & protected routes

Clean, scalable folder structure

Practical use of Supabase with Next.js

Production-ready UI & UX patterns

👨‍💻 Author
Janmejoy Mahato Full-Stack Developer | Next.js | Supabase | TypeScript

⭐ This project was built as a real-world full-stack application, focusing on scalability, security, and clean architecture.

---