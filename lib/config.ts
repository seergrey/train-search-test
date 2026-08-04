export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://train-booking-assignment.onrender.com'
).replace(/\/+$/, '');

/** The API answers in ~1.5-2s; anything past this is treated as unavailable. */
export const REQUEST_TIMEOUT_MS = 15_000;

/**
 * The API injects random 500s (~1 in 15 identical requests), so idempotent
 * reads are retried. Writes are not — see createBooking.
 */
export const GET_RETRY_ATTEMPTS = 2;
export const RETRY_BACKOFF_MS: readonly number[] = [400, 1000];

/** Search results are indexable and hot, so serve them from cache briefly. */
export const TRAIN_LIST_REVALIDATE_S = 30;
/** The city directory is effectively static. */
export const STATIONS_REVALIDATE_S = 3600;
