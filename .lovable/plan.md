

# Fix Dashboard Mobile — No Horizontal Scrolling

## Problem
The Kanban board has 6 columns with `min-width: 140px` each (840px total), causing horizontal overflow on a 390px screen. The user shouldn't need to scroll sideways on the dashboard.

## Solution
Replace the horizontal kanban with a compact vertical summary on mobile, and ensure nothing else overflows.

### Changes

### 1. `src/index.css` — Mobile media query updates

**Kanban on mobile**: Switch from horizontal flex layout to a vertical grid. Instead of showing full kanban columns with cards, display a compact 2-column grid of status counts (similar to the status breakdown but inline in the pipeline section). Hide individual kanban cards on mobile — just show column headers with counts stacked in a grid.

```css
/* Inside @media (max-width: 768px) */
.kanban {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  overflow-x: hidden;
}
.kanban-col {
  min-width: unset;
  flex-shrink: unset;
}
.kanban-cards {
  display: none;  /* Hide card lists on mobile */
}
```

This turns the pipeline section into a quick-glance 2×3 grid of statuses with counts — no scrolling needed, and it mirrors the status breakdown style.

**Also add**: `overflow-x: hidden` on `.page` to prevent any stray overflow.

### 2. `src/components/KanbanBoard.tsx` — No changes needed
The CSS-only approach hides the cards and restructures the layout without touching JSX.

## Files modified
- `src/index.css` — ~10 lines updated in the mobile media query

