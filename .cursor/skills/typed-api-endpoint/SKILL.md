---
name: typed-api-endpoint
description: Use when adding or changing a wrapper function in lib/api.ts for an endpoint of the train-booking API.
---

# Typed API endpoint pattern

1. Define/reuse a type in `lib/types.ts` matching the actual response shape —
   never invent fields the API doesn't document.
2. Function signature takes typed params, returns `Promise<Result<T>>`:
   `type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }`.
   Don't throw for expected API states (404, 409, 400) — return them typed.
3. `ApiError.kind`: `'network'` (fetch failed/timeout), `'not_found'` (404),
   `'conflict'` (409), `'validation'` (400), `'unknown'` (anything else).
4. Never call `fetch` outside this file — components/pages import from
   `lib/api.ts` only.
5. One-line comment noting which part of the brief this endpoint serves.
