

# Add Search Form for Google Maps Scraper

## What changes

### `src/pages/Import.tsx`

**1. Add state for the run form:**
- `showRunForm`: tracks which actor ID has the form open (or `null`)
- `searchTerm`: string for the search query
- `maxResults`: number, default 50

**2. Modify `ActorCard` to accept `onShowForm` prop:**
- For the Google Maps Scraper (`compass/crawler-google-places`), the "Run Actor" button calls `onShowForm(actor.id)` instead of `onRun(actor.id)`.
- For all other actors, behavior stays the same (direct `onRun`).

**3. Add inline form below the actor card (or inside it):**
When `showRunForm === actor.id` and it's the Google Maps actor, render a small form with:
- Text input: "Search term" with placeholder `"HVAC companies in Denver"`
- Number input: "Max results" defaulting to `50`
- "Start Run" button and "Cancel" button

**4. Update `handleRun`:**
- When called for `compass/crawler-google-places`, pass the structured input:
  ```json
  {
    "searchStringsArray": ["<searchTerm>"],
    "maxCrawledPlacesPerSearch": <maxResults>
  }
  ```
- For other actors, keep passing `{}`.

## Files modified
- `src/pages/Import.tsx` — ~40 lines added

