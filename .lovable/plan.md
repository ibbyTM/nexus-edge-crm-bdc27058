

# Mobile-Friendly Nexus Edge CRM

## Problem
The app has no mobile responsiveness. On a 393px screen:
- The 248px sidebar eats 63% of the width, leaving ~145px for content
- The leads table is unusable (10 columns, no horizontal scroll affordance)
- The lead detail panel is 440px wide (wider than the screen)
- Dashboard stat grids and kanban overflow
- Filter bar dropdowns stack poorly
- No way to collapse the sidebar

## Approach
Keep the existing dark, professional aesthetic. No Tailwind refactoring — all changes stay in the existing plain CSS system. Add a collapsible sidebar on mobile with a hamburger toggle, and targeted `@media` queries for small screens.

## Changes

### 1. Layout.tsx — Collapsible mobile sidebar
- Add a hamburger menu button visible only on mobile (top-left)
- Sidebar becomes an overlay drawer on screens < 768px
- Tapping a nav link auto-closes the sidebar
- Add a backdrop overlay when sidebar is open

### 2. index.css — Mobile media queries
Add a `@media (max-width: 768px)` block covering:

**Layout:**
- Sidebar: `position: fixed`, `transform: translateX(-100%)` by default, slides in when open
- Main content: full width, no sidebar offset
- Page padding: reduce from 28px 32px to 16px

**Dashboard:**
- Stat grid: 2 columns (already has this at 1200px, add for smaller)
- Status breakdown grid: 3 columns instead of 6
- Kanban: horizontal scroll stays, reduce min-width per column

**Leads page:**
- Filter bar: stack vertically, search input full-width
- Hide keyboard shortcuts hint on mobile
- Table: ensure horizontal scroll works, hide less important columns (Rating, Last Called, Calls) via CSS
- Bulk action bar: wrap properly

**Lead detail panel:**
- Panel width: 100vw instead of 440px (full-screen takeover)

**Import page:**
- Actor grid: single column

**Modal:**
- Already has `max-width: 96vw` — good

### 3. Dashboard.tsx — Minor tweak
- Status breakdown grid: add a CSS class instead of inline `gridTemplateColumns` so media query can override it

## Files modified
- `src/components/Layout.tsx` — hamburger toggle, sidebar state, backdrop, auto-close on nav