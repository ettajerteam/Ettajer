# Ettajer

A modern SaaS e-commerce platform for Moroccan and North African merchants — a Shopify/YouCan alternative with Apple-inspired design.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **shadcn/ui** — customized Apple aesthetic
- **Framer Motion** — smooth animations
- **Zustand** — state management
- **Prisma** + PostgreSQL
- **NextAuth.js** — Google OAuth + Magic Link

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (auth)/          # Login, signup, onboarding
├── (dashboard)/     # Merchant admin pages
├── api/             # API routes
components/
├── ui/              # shadcn components
├── shared/          # Navbar, Sidebar, Footer
├── dashboard/       # Analytics, charts
├── landing/         # Landing page sections
├── auth/            # Auth forms
└── onboarding/      # Wizard steps
lib/                 # Utilities, auth, db
prisma/              # Database schema
types/               # TypeScript types
```

## Features (Sprint 1 MVP)

- [x] Landing page (hero, features, pricing)
- [x] Authentication (Google + magic link)
- [x] Onboarding wizard (3 steps)
- [x] Dashboard layout (sidebar + header)
- [x] Analytics cards + recent orders
- [ ] Product management CRUD
- [ ] Order management
- [ ] Theme customizer
- [ ] Store settings

## Design System

| Element | Value |
|---------|-------|
| Primary | `#007AFF` |
| Font | Inter / SF Pro |
| Radius | `rounded-2xl` (16px) |
| Cards | `glass` (backdrop-blur) |
