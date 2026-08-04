# Train Search — Test Assignment

## Getting started
```
npm install
npm run dev
```
Open http://localhost:3000 — it redirects to `/search`.

The API base URL comes from `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`),
defaulting to the assignment's public test API, so `.env` isn't required.

Also available: `npm run typecheck`, `npm run lint`,
`npm run smoke` (runs every `lib/api.ts` wrapper against the live API,
including 404/400/409; resets seats via `/reset` at the end).

## What was implemented
_(kept up to date as work progresses, not only at the end)_

- [x] Data layer: types matching the actual API, `lib/api.ts` with
      `Result<T>`/`ApiError`, the search URL contract in `lib/search-params.ts`,
      contract smoke run
- [x] Search page (from/to/date/budget in the URL, SSR results, sort by price)
- [x] Train details + booking (404/409/400 handling)
- [x] Saved trains (localStorage, pinned to the top of the list)
- [x] Loading/error/empty states across every data-fetching view
- [x] Mobile adaptation

## What was not implemented and why
_(deliberate prioritization calls, not "ran out of time")_

- Accounts / cross-device sync — the brief explicitly defers this to next
  quarter, and there's no backend for it.
- Pagination beyond the first page — actually cut. `toTrainsQuery` forwards
  `page`/`limit` to `/trains`, but the UI never calls it with anything but
  the default: no "load more" button, no infinite scroll, no page numbers.
  Partly forced: `maxPrice` is filtered client-side on only the page already
  fetched (see Assumptions), so honest pagination would require either
  pushing that filter server-side or a cursor that doesn't match the API —
  decided not to spend the remaining time on it.
- Filters other than budget, sorting other than price — the main flow from
  the brief only needs this; `/trains` doesn't support other `sortBy` values
  either.
- Autocomplete / debounce while typing cities — the form only submits on
  explicit submit (the "Search trains" button), no live search as you type.
- A full test suite — only `scripts/smoke.ts` exists (contract checks for
  `lib/api.ts` against the live API). No unit tests for `search-params.ts`,
  the parsing in `api.ts`, or `useSavedTrains` — ran out of time, deliberately
  prioritized the flow itself.
- Animations / pixel-perfect design — explicitly out of scope for this
  assignment.

## Assumptions
- `maxPrice` isn't a documented `/trains` query parameter — it's filtered
  client-side after fetching the current page; doesn't work correctly
  together with pagination beyond the first page. A deliberate trade-off.
- The search URL carries six parameters: `from`, `to`, `date`, `maxPrice`,
  `sortBy`, `sortOrder`. Sort direction is a separate parameter rather than
  glued onto the `sortBy` value (`price_desc`), to match the `/trains`
  contract 1:1 instead of inventing a custom encoding. Defaults
  (`price`/`asc`) are never written to the URL, keeping shared links short.
- `from`/`to` in the URL are `/stations` slugs (`berlin`), not display names:
  `/trains` matches city case-insensitively, and a slug gives a canonical
  shape for a shared link.
- `/stations` returns a slug-keyed map (`{ slug: { code, name, country } }`),
  not an array — `getStations()` normalizes it into `Station[]`, adding the
  slug. All 11 German cities.
- The API occasionally returns 500 for no reason (measured: ~1 in 15 identical
  requests) at 1.5–2s latency. So GET requests are retried twice with a
  400/1000ms backoff, while `POST /bookings` is never retried: it isn't
  idempotent, and a retry after a 500 could take seats twice.
- Caching differs by data type: the train list uses `revalidate: 30` (the
  page is indexable and should load fast), the train detail page uses
  `no-store`, otherwise `seatsLeft` could lie right before booking.
- The API doesn't treat an invalid `date`/city as an error — it returns `200`
  with empty `data`. For the UI that's a "nothing found" state, not an error.
- The `POST /bookings` response includes the up-to-date `seatsLeft`, so the
  UI updates after booking without an extra request.
- TypeScript is pinned to 6.0.3, ESLint to 9.x: with TS 7 and ESLint 10,
  `eslint-config-next@16` breaks (typescript-eslint doesn't support TS 7, and
  `eslint-plugin-react` doesn't support ESLint 10's flat API). Exact versions,
  not ranges — so a reviewer gets the exact same setup.
- Saved trains are per-device (localStorage), with no sync, consistent with
  accounts being planned for next quarter.
- Booking: the API body accepts an optional `seats` — the UI offers a seat
  count dropdown (from 1 to `min(seatsLeft, 9)`), since the brief has users
  booking seats.
- A 409 on booking is an expected business outcome, not a system error.
- `/reset` is a test-only endpoint, not part of the user flow (see below).
- Booking is capped at 9 seats per request (`MAX_SEATS_PER_BOOKING` in
  `booking-form.tsx`): the API doesn't document an upper bound on `seats`,
  and an unbounded dropdown based on `seatsLeft` (hundreds of seats) is
  useless for an actual passenger — 9 is a sane ceiling, not a value from
  the API.
- The train page renders its own 404 (`TrainNotFound` in
  `app/train/[id]/page.tsx`) instead of calling `notFound()` from
  `next/navigation`: `notFound()` renders `not-found.tsx` without access to
  the current request's `searchParams`, but the `backHref` (the "back to
  results" link with the same from/to/date) already computed in the page
  component needs to be preserved.
- `Results` (`app/search/page.tsx`) has two distinct empty states rather than
  one generic "nothing found": an empty API response
  (`fetchedTrains.length === 0`) versus an empty result after the client-side
  `maxPrice` filter (`visibleTrains.length === 0`) — the second case gives the
  user a way out (a "Clear budget filter" link), the first doesn't apply, so
  the copy and available actions differ.
- Caching in Next 16 is opt-in: without `cache: 'force-cache'`, the
  `next.revalidate` field does nothing, so `lib/api.ts` always sets `cache`
  explicitly (`'force-cache'` + `revalidate: revalidateSeconds`, or
  `'no-store'`) instead of relying on the framework default.
- All new files are kebab-case (`train-card.tsx`, `train-list.tsx`,
  `use-saved-trains.ts`, `search-params.ts`, `retry-button.tsx`,
  `booking-form.tsx`), no PascalCase/camelCase in file names even when the
  exported component/hook is named differently.

## Testing the booking-conflict flow
```
curl -X POST https://train-booking-assignment.onrender.com/reset
```
Rolls back seat availability so you can re-test the "no seats left" (409)
scenario.

## AI Agent Logs
See `/ai-logs` — one export per chat session:
- `01-contract-and-scaffold.md` — shared types, API client, project scaffold
- `02-search-page.md` — worktree agent, search and results
- `03-train-detail-booking.md` — worktree agent, details and booking
- `04-integration-review.md` — cross-check after merging both tracks
- (add more as new sessions happen)
