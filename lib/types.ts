/**
 * Domain types mirror the payloads the assignment API actually returns.
 * Nothing here is speculative — every field was observed on a live response.
 */

export interface Train {
  id: string;
  trainNumber: string;
  /** City name, e.g. 'Berlin' — not the station code. */
  from: string;
  to: string;
  /** Calendar date, 'YYYY-MM-DD'. */
  departureDate: string;
  /** 24h wall clock, 'HH:mm'. */
  departureTime: string;
  arrivalTime: string;
  /** Whole euros. */
  price: number;
  seatsLeft: number;
  totalSeats: number;
  /** Observed '1st Class' / '2nd Class', but the API documents no enum. */
  carriageClass: string;
  image: string;
}

export interface TrainsPage {
  data: Train[];
  total: number;
  page: number;
  /** Echoes back `data.length` when the request omits `limit`. */
  limit: number;
}

export interface Station {
  /** Key of the /stations map; also what /trains?from=&to= accepts. */
  slug: string;
  code: string;
  name: string;
  country: string;
}

export interface Booking {
  id: string;
  trainId: string;
  seats: number;
  /** Seats left after this booking — lets the UI update without a refetch. */
  seatsLeft: number;
  status: string;
  createdAt: string;
}

export interface ResetResult {
  status: string;
  message: string;
}

export type ApiErrorKind = 'network' | 'not_found' | 'conflict' | 'validation' | 'unknown';

export interface ApiError {
  kind: ApiErrorKind;
  /** Text from the API's `{ "error": "..." }` body, or a default per kind. */
  message: string;
  /** Absent when no response arrived at all (connection failure or timeout). */
  status?: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/**
 * The API also sorts by departureTime/arrivalTime/departureDate/trainNumber,
 * but the brief's flow only needs price, so that's all we accept.
 */
export type SortKey = 'price';
export type SortOrder = 'asc' | 'desc';

/** API-level query. Deliberately has no `maxPrice` — /trains ignores it. */
export interface TrainsQuery {
  from?: string;
  to?: string;
  date?: string;
  sortBy?: SortKey;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface BookingInput {
  trainId: string;
  /** Defaults to 1 server-side when omitted. */
  seats?: number;
}

/** URL-level search state — the single source of truth for the search page. */
export interface SearchQuery {
  from: string;
  to: string;
  /** 'YYYY-MM-DD', or '' when unset. */
  date: string;
  /** Applied client-side to the fetched page; null means no budget cap. */
  maxPrice: number | null;
  sortBy: SortKey;
  sortOrder: SortOrder;
  /** 1-based results page. Any filter change resets it to 1. */
  page: number;
}
