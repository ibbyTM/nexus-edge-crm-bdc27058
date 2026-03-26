

# Plan: Migrate Nexus Edge CRM to Lovable

## What Your App Has

- **Frontend**: React 18 + Vite, 4 pages (Dashboard, Leads, Import, Scripts), 6 components, plain CSS (822 lines), react-router-dom
- **Backend**: Express API with 3 route files (leads, stats, apify), SQLite database with `leads` and `call_log` tables, Apify integration

## The Problem

Lovable cannot run a persistent Node.js server or SQLite database. The backend must be replaced with **Lovable Cloud** (Supabase): Postgres database + Edge Functions.

## Migration Plan

### Step 1 — Database (Supabase)

Create two tables mirroring your SQLite schema:

- **leads**: id, company_name, phone, website, city, postcode, industry, status (enum: new/called/interested/demo_booked/closed/dead), source, rating, review_count, notes, last_called_at, call_count, created_at, updated_at
- **call_log**: id, lead_id (FK to leads), outcome, notes, created_at

### Step 2 — Backend API (Edge Functions)

Replicate your 3 Express route files as Supabase Edge Functions:

- **leads**: list with filters/search/pagination, create, update, delete, get calls, import, bulk update
- **stats**: total leads, called today, demos booked, conversion rate, status breakdown, recent activity
- **apify**: proxy to Apify API (actors list, run actor, get last run, get runs) — uses your Apify token passed via header

### Step 3 — Frontend Integration

Port your frontend code into this Lovable project:
- Bring in all 4 pages (Dashboard, Leads, Import, Scripts) and 6 components as JSX files
- Bring in the full 822-line index.css
- Replace the `api.js` fetch wrapper to call Supabase Edge Functions instead of `/api/*`
- Update routing in App.tsx to include all 4 routes with the Layout wrapper

### Step 4 — Scripts Page (No Backend Needed)

The Scripts page is purely static content (cold call scripts) — it ports directly with zero changes.

## What Stays the Same

- All UI components and styling (pixel-perfect match)
- All page logic and interactions (kanban, lead detail panel, filters, etc.)
- Apify integration (just proxied through Edge Functions instead of Express)
- localStorage-based Apify token storage

## What Changes

- SQLite queries become Postgres/Supabase queries
- Express routes become Supabase Edge Functions
- `fetch('/api/...')` becomes `fetch('SUPABASE_URL/functions/v1/...')`

## Technical Details

- Frontend files will be converted from `.jsx` to `.tsx` (or kept as `.jsx` with TypeScript config allowing JS)
- The existing Lovable project's Tailwind setup won't conflict — your app uses plain CSS variables
- Supabase RLS policies will be set to allow all operations (matching your current setup with no auth)

