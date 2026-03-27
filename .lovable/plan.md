

# Fix "Failed to fetch" on Lead Import

## Problem
The import sends the entire Apify response (huge objects with images, reviews, opening hours, etc.) to the `leads/import` edge function, which then processes each lead **one-by-one** with individual SELECT + INSERT queries. This causes the edge function to timeout for larger batches.

## Solution

### 1. `src/pages/Import.tsx` — Trim payload before sending
Before calling `api.leads.import(items)`, map items to only the fields the import endpoint actually uses. This dramatically reduces request size.

```ts
const trimmed = items.map((i: any) => ({
  title: i.title, phone: i.phone || i.phoneUnformatted,
  website: i.website || i.url, city: i.city, address: i.address,
  categoryName: i.categoryName, rating: i.totalScore,
  reviewsCount: i.reviewsCount,
}));
await api.leads.import(trimmed);
```

### 2. `supabase/functions/leads/index.ts` — Batch insert with upsert
Replace the one-by-one loop with a single batch insert, using an `ON CONFLICT` approach or filtering duplicates in one query upfront, to avoid N+1 database calls.

## Files modified
- `src/pages/Import.tsx` — trim items before import call (~5 lines)
- `supabase/functions/leads/index.ts` — refactor import to batch insert (~15 lines changed)

