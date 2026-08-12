import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SEARCH_QUERY,
  PAGE_SIZE,
  pageInfo,
  parseSearchQuery,
  searchHref,
  serializeSearchQuery,
  toTrainsQuery,
  withFilters,
  withPage,
} from './search-params';

describe('parseSearchQuery: page', () => {
  it('defaults to page 1 when absent', () => {
    expect(parseSearchQuery({}).page).toBe(1);
  });

  it('keeps a valid page number', () => {
    expect(parseSearchQuery({ page: '4' }).page).toBe(4);
  });

  it.each(['0', '-2', '1.5', 'abc', ''])('falls back to page 1 for %o', (raw) => {
    expect(parseSearchQuery({ page: raw }).page).toBe(DEFAULT_SEARCH_QUERY.page);
  });

  it('takes the first value when the key is repeated', () => {
    expect(parseSearchQuery({ page: ['3', '9'] }).page).toBe(3);
  });
});

describe('serializeSearchQuery: page', () => {
  it('omits page 1 so shared links stay short', () => {
    expect(serializeSearchQuery({ ...DEFAULT_SEARCH_QUERY, page: 1 })).toBe('');
  });

  it('includes any other page', () => {
    expect(serializeSearchQuery({ ...DEFAULT_SEARCH_QUERY, page: 3 })).toBe('page=3');
  });

  it('round-trips through parse', () => {
    const query = { ...DEFAULT_SEARCH_QUERY, from: 'berlin', to: 'munich', page: 5 };
    const parsed = parseSearchQuery(Object.fromEntries(new URLSearchParams(serializeSearchQuery(query))));
    expect(parsed).toEqual(query);
  });
});

describe('toTrainsQuery', () => {
  it('sends the query page and an explicit limit', () => {
    const trainsQuery = toTrainsQuery({ ...DEFAULT_SEARCH_QUERY, page: 3 });
    expect(trainsQuery.page).toBe(3);
    expect(trainsQuery.limit).toBe(PAGE_SIZE);
  });

  it('lets an explicit pagination override win', () => {
    const trainsQuery = toTrainsQuery({ ...DEFAULT_SEARCH_QUERY, page: 3 }, { page: 1, limit: 100 });
    expect(trainsQuery.page).toBe(1);
    expect(trainsQuery.limit).toBe(100);
  });

  it('never leaks maxPrice, which /trains does not support', () => {
    const trainsQuery = toTrainsQuery({ ...DEFAULT_SEARCH_QUERY, maxPrice: 50 });
    expect(trainsQuery).not.toHaveProperty('maxPrice');
  });
});

describe('withFilters / withPage', () => {
  it('resets the page when a filter changes', () => {
    const current = { ...DEFAULT_SEARCH_QUERY, page: 7 };
    expect(withFilters(current, { from: 'berlin' }).page).toBe(1);
  });

  it('keeps an explicitly requested page', () => {
    const current = { ...DEFAULT_SEARCH_QUERY, page: 7 };
    expect(withFilters(current, { from: 'berlin', page: 2 }).page).toBe(2);
  });

  it('changes only the page and preserves the filters', () => {
    const current = { ...DEFAULT_SEARCH_QUERY, from: 'berlin', maxPrice: 80, page: 2 };
    expect(withPage(current, 4)).toEqual({ ...current, page: 4 });
  });

  it('builds a page href that carries the filters along', () => {
    const current = { ...DEFAULT_SEARCH_QUERY, from: 'berlin', to: 'munich', page: 1 };
    expect(searchHref(withPage(current, 3))).toBe('/search?from=berlin&to=munich&page=3');
  });
});

describe('pageInfo', () => {
  it('derives the page count from total and limit', () => {
    expect(pageInfo(141, 1, 10)).toMatchObject({ page: 1, pageCount: 15, hasPrevious: false, hasNext: true });
  });

  it('reports a partial last page as its own page', () => {
    expect(pageInfo(21, 3, 10).pageCount).toBe(3);
  });

  it('marks the last page as having no next', () => {
    expect(pageInfo(30, 3, 10)).toMatchObject({ hasPrevious: true, hasNext: false });
  });

  it('clamps a page number beyond the end', () => {
    expect(pageInfo(30, 99, 10).page).toBe(3);
  });

  it('clamps a page number below the start', () => {
    expect(pageInfo(30, 0, 10).page).toBe(1);
  });

  it('reports a single page when there are no results at all', () => {
    expect(pageInfo(0, 1, 10)).toMatchObject({ pageCount: 1, hasPrevious: false, hasNext: false });
  });

  it('falls back to PAGE_SIZE when the API echoes a zero limit', () => {
    expect(pageInfo(25, 1, 0).pageCount).toBe(Math.ceil(25 / PAGE_SIZE));
  });
});
