import type { SearchQuery, SortKey, SortOrder, Train, TrainsQuery } from './types';

/**
 * The URL query string is the source of truth for search state, so parsing and
 * serialising it lives here — shared by the server page and client controls.
 */

export const SEARCH_PARAM_KEYS = [
  'from',
  'to',
  'date',
  'maxPrice',
  'sortBy',
  'sortOrder',
  'page',
] as const;

/** Shape Next hands to pages via `searchParams`. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Results per page. The API echoes `data.length` as `limit` when omitted, so
 *  it must be sent explicitly for page numbers to mean anything stable. */
export const PAGE_SIZE = 10;

export const DEFAULT_SEARCH_QUERY: SearchQuery = {
  from: '',
  to: '',
  date: '',
  maxPrice: null,
  sortBy: 'price',
  sortOrder: 'asc',
  page: 1,
};

const SORT_KEYS: readonly SortKey[] = ['price'];
const SORT_ORDERS: readonly SortOrder[] = ['asc', 'desc'];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseSearchQuery(raw: RawSearchParams): SearchQuery {
  return {
    from: parseCity(single(raw.from)),
    to: parseCity(single(raw.to)),
    date: parseDate(single(raw.date)),
    maxPrice: parseMaxPrice(single(raw.maxPrice)),
    sortBy: parseEnum(single(raw.sortBy), SORT_KEYS, DEFAULT_SEARCH_QUERY.sortBy),
    sortOrder: parseEnum(single(raw.sortOrder), SORT_ORDERS, DEFAULT_SEARCH_QUERY.sortOrder),
    page: parsePage(single(raw.page)),
  };
}

/** Omits defaults so shared links stay short; parsing restores them. */
export function serializeSearchQuery(query: SearchQuery): string {
  const params = new URLSearchParams();
  if (query.from !== '') params.set('from', query.from);
  if (query.to !== '') params.set('to', query.to);
  if (query.date !== '') params.set('date', query.date);
  if (query.maxPrice !== null) params.set('maxPrice', String(query.maxPrice));
  if (query.sortBy !== DEFAULT_SEARCH_QUERY.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder !== DEFAULT_SEARCH_QUERY.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query.page !== DEFAULT_SEARCH_QUERY.page) params.set('page', String(query.page));
  return params.toString();
}

export function searchHref(query: SearchQuery): string {
  const qs = serializeSearchQuery(query);
  return qs === '' ? '/search' : `/search?${qs}`;
}

/** Drops `maxPrice`, which /trains does not support, so it can't leak into a request. */
export function toTrainsQuery(
  query: SearchQuery,
  pagination: { page?: number; limit?: number } = {},
): TrainsQuery {
  return {
    from: query.from,
    to: query.to,
    date: query.date,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    page: pagination.page ?? query.page,
    limit: pagination.limit ?? PAGE_SIZE,
  };
}

/** Any change to the filters invalidates the current page number. */
export function withFilters(query: SearchQuery, changes: Partial<SearchQuery>): SearchQuery {
  return { ...query, ...changes, page: changes.page ?? DEFAULT_SEARCH_QUERY.page };
}

export function withPage(query: SearchQuery, page: number): SearchQuery {
  return { ...query, page };
}

export interface PageInfo {
  page: number;
  pageCount: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** Derives page info from what /trains reports, not from what we asked for —
 *  the API clamps out-of-range pages and echoes the page it actually served. */
export function pageInfo(total: number, page: number, limit: number): PageInfo {
  const safeLimit = limit > 0 ? limit : PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(total / safeLimit));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    page: current,
    pageCount,
    total,
    hasPrevious: current > 1,
    hasNext: current < pageCount,
  };
}

/** Budget filter, applied client-side to the page the API already returned. */
export function applyMaxPrice(trains: readonly Train[], maxPrice: number | null): Train[] {
  if (maxPrice === null) return [...trains];
  return trains.filter((train) => train.price <= maxPrice);
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

/** Canonical form is the /stations slug, which /trains matches case-insensitively. */
function parseCity(value: string): string {
  return value.trim().toLowerCase();
}

function parseDate(value: string): string {
  const trimmed = value.trim();
  return isValidIsoDate(trimmed) ? trimmed : '';
}

function parseMaxPrice(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parsePage(value: string): number {
  const parsed = Number(value.trim());
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_SEARCH_QUERY.page;
  return parsed;
}

function parseEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}
