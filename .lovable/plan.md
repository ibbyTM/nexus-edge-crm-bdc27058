

# Add Default Google Maps Scraper Card + Fix API Query

## Changes

### 1. `supabase/functions/apify/index.ts`
Change the actors list endpoint from `/acts?limit=50&my=1` to `/acts?limit=50` (remove `&my=1` filter).

### 2. `src/pages/Import.tsx`
After fetching actors in `loadActors`, merge in a hardcoded default actor if not already present:

```ts
const DEFAULT_ACTOR = {
  id: "compass/crawler-google-places",
  name: "Google Maps Scraper",
  stats: { totalRuns: null, lastRunStartedAt: null },
};
```

After `setActors(list || [])`, check if the default actor exists in the list by ID — if not, append it. Also show the actor grid when actors exist (the default always ensures at least one).

## Files modified
- `supabase/functions/apify/index.ts` — 1 line changed
- `src/pages/Import.tsx` — ~8 lines added

