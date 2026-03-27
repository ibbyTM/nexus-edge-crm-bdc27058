

# Fix Mobile Portrait View (393px)

## Issues at 393px portrait

1. **Leads table still shows 5 columns** (checkbox, company, phone, city, industry) — too cramped at 393px
2. **Filter bar selects have inline `style={{ width: 'auto' }}`** which overrides the mobile CSS `width: 100%`
3. **Keyboard hints row** — `.kbd` is hidden but the parent div still occupies vertical space
4. **Status breakdown** at 3 columns is tight; 2 columns would be better at this width
5. **Leads page "Call Next" button** in header may wrap awkwardly
6. **Panel info values** `max-width: 240px` is too wide for 393px screen

## Changes

### 1. `src/index.css` — Tighten the 768px media query

- Hide City and Industry columns too (only show checkbox, company, phone, status, actions) — use specific nth-child selectors instead of `n+6`
- Add `.keyboard-hints { display: none }` class for mobile
- Status breakdown grid: `repeat(2, 1fr)` instead of 3
- Reduce card and stat padding
- Panel info value: reduce max-width to 55%
- Filter bar: ensure selects are full width by adding `!important` to override inline styles
- Reduce page-header margin
- Make action buttons (Call Next) smaller on mobile

### 2. `src/pages/Leads.tsx` — Minor markup fixes

- Add `className="keyboard-hints"` to the keyboard hints div so it can be hidden via CSS
- Remove inline `style={{ width: 'auto' }}` from filter selects (let CSS handle it)

### 3. `src/components/LeadDetailPanel.tsx` — No changes needed

Panel already goes to `100vw` on mobile via CSS.

## Files modified
- `src/index.css` — ~15 lines updated in the mobile media query
- `src/pages/Leads.tsx` — 2 small changes (className on hints div, remove inline widths)

