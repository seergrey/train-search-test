---
name: loading-error-skeleton
description: Use when building any page or section that fetches data from the train-booking API, to keep loading/error/empty UI consistent.
---

# Loading & error skeleton pattern

The external API is intentionally slow/unreliable for this assignment —
every data-fetching view handles three distinct states, not just the happy
path:

1. **Loading** — a skeleton that mirrors the real layout (same grid, same
   approximate sizes), via `loading.tsx` / Suspense for Server Components.
   Not a generic centered spinner.
2. **Error** — `error.tsx` (or an inline error block for client fetches)
   with a short human message + a retry action. A failed fetch must never
   look identical to "no results."
3. **Empty** — a distinct "no trains match your search" state, different
   from both loading and error.

Keep skeleton markup close to the real component so there's no layout
shift when data arrives.
