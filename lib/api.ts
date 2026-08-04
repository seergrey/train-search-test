import {
  API_BASE_URL,
  GET_RETRY_ATTEMPTS,
  REQUEST_TIMEOUT_MS,
  RETRY_BACKOFF_MS,
  STATIONS_REVALIDATE_S,
  TRAIN_LIST_REVALIDATE_S,
} from './config';
import type {
  ApiError,
  ApiErrorKind,
  Booking,
  BookingInput,
  ResetResult,
  Result,
  Station,
  Train,
  TrainsPage,
  TrainsQuery,
} from './types';

/**
 * The only module allowed to call `fetch`. Every endpoint returns
 * `Result<T>`; expected API states (400/404/409) come back typed instead of
 * throwing, so callers can render recovery UI without try/catch.
 */

export interface RequestOpts {
  signal?: AbortSignal;
  /** Overrides the endpoint's default cache lifetime. */
  revalidateSeconds?: CachePolicy;
}

/**
 * Seconds of cache lifetime, or no caching at all. Spelled out rather than
 * reusing Next's `next.revalidate: false`, which means the opposite
 * (cache forever).
 */
export type CachePolicy = number | 'no-store';

type QueryValue = string | number | undefined;

interface RequestConfig<T> {
  path: string;
  method: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
  body?: unknown;
  parse: (raw: unknown) => T | null;
  revalidateSeconds: CachePolicy;
  retry: boolean;
  signal?: AbortSignal;
}

const KIND_BY_STATUS: Readonly<Record<number, ApiErrorKind>> = {
  400: 'validation',
  404: 'not_found',
  409: 'conflict',
};

const DEFAULT_MESSAGE: Readonly<Record<ApiErrorKind, string>> = {
  network: 'Could not reach the train service.',
  not_found: 'This train no longer exists.',
  conflict: 'Not enough seats left on this train.',
  validation: 'The request was rejected as invalid.',
  unknown: 'The train service is having trouble right now.',
};

// ---------------------------------------------------------------- endpoints

/** Search page: the train list behind /search. */
export function getTrains(query: TrainsQuery = {}, opts: RequestOpts = {}): Promise<Result<TrainsPage>> {
  return request({
    path: '/trains',
    method: 'GET',
    query: {
      from: emptyToUndefined(query.from),
      to: emptyToUndefined(query.to),
      date: emptyToUndefined(query.date),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    },
    parse: parseTrainsPage,
    revalidateSeconds: opts.revalidateSeconds ?? TRAIN_LIST_REVALIDATE_S,
    retry: true,
    signal: opts.signal,
  });
}

/** Train detail page. Never cached: `seatsLeft` must be truthful before booking. */
export function getTrain(id: string, opts: RequestOpts = {}): Promise<Result<Train>> {
  return request({
    path: `/trains/${encodeURIComponent(id)}`,
    method: 'GET',
    parse: parseTrain,
    revalidateSeconds: opts.revalidateSeconds ?? 'no-store',
    retry: true,
    signal: opts.signal,
  });
}

/** City dropdowns on the search form. */
export function getStations(opts: RequestOpts = {}): Promise<Result<Station[]>> {
  return request({
    path: '/stations',
    method: 'GET',
    parse: parseStations,
    revalidateSeconds: opts.revalidateSeconds ?? STATIONS_REVALIDATE_S,
    retry: true,
    signal: opts.signal,
  });
}

/**
 * Booking step. Not retried: the endpoint is not idempotent, and a retried
 * 500 could take seats twice.
 */
export function createBooking(input: BookingInput, opts: RequestOpts = {}): Promise<Result<Booking>> {
  return request({
    path: '/bookings',
    method: 'POST',
    body: input.seats === undefined ? { trainId: input.trainId } : input,
    parse: parseBooking,
    revalidateSeconds: 'no-store',
    retry: false,
    signal: opts.signal,
  });
}

/** Test-only helper for replaying the sold-out (409) flow. Not part of the user flow. */
export function resetSeats(opts: RequestOpts = {}): Promise<Result<ResetResult>> {
  return request({
    path: '/reset',
    method: 'POST',
    parse: parseResetResult,
    revalidateSeconds: 'no-store',
    retry: false,
    signal: opts.signal,
  });
}

// ------------------------------------------------------------- transport

async function request<T>(config: RequestConfig<T>): Promise<Result<T>> {
  const url = buildUrl(config.path, config.query);
  const attempts = config.retry ? GET_RETRY_ATTEMPTS + 1 : 1;
  let lastError: ApiError = { kind: 'unknown', message: DEFAULT_MESSAGE.unknown };

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) {
      await delay(RETRY_BACKOFF_MS[attempt - 1] ?? RETRY_BACKOFF_MS[RETRY_BACKOFF_MS.length - 1] ?? 0);
    }

    const outcome = await attemptRequest(config, url);
    if (outcome.ok) return outcome;

    lastError = outcome.error;
    if (config.signal?.aborted === true || !isRetriable(outcome.error)) return outcome;
  }

  return { ok: false, error: lastError };
}

async function attemptRequest<T>(config: RequestConfig<T>, url: string): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(url, buildInit(config));
  } catch (cause) {
    return { ok: false, error: { kind: 'network', message: describeTransportFailure(cause) } };
  }

  const payload = await readJson(response);

  if (!response.ok) {
    const kind = KIND_BY_STATUS[response.status] ?? 'unknown';
    return {
      ok: false,
      error: {
        kind,
        status: response.status,
        message: extractMessage(payload) ?? DEFAULT_MESSAGE[kind],
      },
    };
  }

  const parsed = config.parse(payload);
  if (parsed === null) {
    return {
      ok: false,
      error: {
        kind: 'unknown',
        status: response.status,
        message: 'The train service returned data in an unexpected shape.',
      },
    };
  }

  return { ok: true, data: parsed };
}

function buildInit<T>(config: RequestConfig<T>): RequestInit {
  const init: RequestInit = {
    method: config.method,
    signal: withTimeout(config.signal),
  };

  if (config.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(config.body);
  }

  // Caching is opt-in since Next 16: without force-cache, `revalidate` is inert.
  if (config.revalidateSeconds === 'no-store') {
    init.cache = 'no-store';
  } else {
    init.cache = 'force-cache';
    init.next = { revalidate: config.revalidateSeconds };
  }

  return init;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Every request is time-boxed, because the API can hang. Side effect: passing a
 * signal opts out of Next's per-render fetch memoization, so don't call the same
 * endpoint twice within one render pass — it will hit the network twice.
 */
function withTimeout(external?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return external === undefined ? timeout : AbortSignal.any([external, timeout]);
}

/** Random 5xx and dropped connections are worth another shot; 4xx never is. */
function isRetriable(error: ApiError): boolean {
  if (error.kind === 'network') return true;
  return error.kind === 'unknown' && error.status !== undefined && error.status >= 500;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractMessage(payload: unknown): string | null {
  if (isRecord(payload) && typeof payload.error === 'string' && payload.error.length > 0) {
    return payload.error;
  }
  return null;
}

function describeTransportFailure(cause: unknown): string {
  const name = cause instanceof Error ? cause.name : '';
  if (name === 'TimeoutError') {
    return `The train service did not respond within ${REQUEST_TIMEOUT_MS / 1000}s.`;
  }
  if (name === 'AbortError') return 'Request cancelled.';
  return DEFAULT_MESSAGE.network;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value.length === 0 ? undefined : value;
}

// --------------------------------------------------------------- parsing

const TRAIN_TEXT_FIELDS = [
  'id',
  'trainNumber',
  'from',
  'to',
  'departureDate',
  'departureTime',
  'arrivalTime',
  'carriageClass',
  'image',
] as const;

const TRAIN_NUMERIC_FIELDS = ['price', 'seatsLeft', 'totalSeats'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTrain(raw: unknown): Train | null {
  if (!isRecord(raw)) return null;
  for (const field of TRAIN_TEXT_FIELDS) {
    if (typeof raw[field] !== 'string') return null;
  }
  for (const field of TRAIN_NUMERIC_FIELDS) {
    if (typeof raw[field] !== 'number') return null;
  }
  return raw as unknown as Train;
}

function parseTrainsPage(raw: unknown): TrainsPage | null {
  if (!isRecord(raw) || !Array.isArray(raw.data)) return null;
  if (typeof raw.total !== 'number' || typeof raw.page !== 'number' || typeof raw.limit !== 'number') {
    return null;
  }

  const data: Train[] = [];
  for (const item of raw.data) {
    const train = parseTrain(item);
    if (train === null) return null;
    data.push(train);
  }

  return { data, total: raw.total, page: raw.page, limit: raw.limit };
}

/** /stations answers with a slug-keyed map, not an array. */
function parseStations(raw: unknown): Station[] | null {
  if (!isRecord(raw)) return null;

  const stations: Station[] = [];
  for (const [slug, value] of Object.entries(raw)) {
    if (!isRecord(value)) return null;
    const { code, name, country } = value;
    if (typeof code !== 'string' || typeof name !== 'string' || typeof country !== 'string') {
      return null;
    }
    stations.push({ slug, code, name, country });
  }

  return stations.sort((a, b) => a.name.localeCompare(b.name));
}

function parseBooking(raw: unknown): Booking | null {
  if (!isRecord(raw)) return null;
  const { id, trainId, seats, seatsLeft, status, createdAt } = raw;
  if (typeof id !== 'string' || typeof trainId !== 'string' || typeof status !== 'string') return null;
  if (typeof createdAt !== 'string' || typeof seats !== 'number' || typeof seatsLeft !== 'number') return null;
  return { id, trainId, seats, seatsLeft, status, createdAt };
}

function parseResetResult(raw: unknown): ResetResult | null {
  if (!isRecord(raw)) return null;
  const { status, message } = raw;
  if (typeof status !== 'string' || typeof message !== 'string') return null;
  return { status, message };
}
