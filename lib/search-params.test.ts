import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH_QUERY, isValidIsoDate, parseSearchQuery } from './search-params';

describe('parseSearchQuery: sortBy/sortOrder validation', () => {
  it('keeps a valid sortBy', () => {
    const query = parseSearchQuery({ sortBy: 'price' });
    expect(query.sortBy).toBe('price');
  });

  it('falls back to the default sortBy for an unsupported key', () => {
    const query = parseSearchQuery({ sortBy: 'departureTime' });
    expect(query.sortBy).toBe(DEFAULT_SEARCH_QUERY.sortBy);
  });

  it('falls back to the default sortBy when empty', () => {
    const query = parseSearchQuery({ sortBy: '' });
    expect(query.sortBy).toBe(DEFAULT_SEARCH_QUERY.sortBy);
  });

  it('keeps a valid sortOrder', () => {
    const query = parseSearchQuery({ sortOrder: 'desc' });
    expect(query.sortOrder).toBe('desc');
  });

  it('falls back to the default sortOrder for a garbage value', () => {
    const query = parseSearchQuery({ sortOrder: 'ascending' });
    expect(query.sortOrder).toBe(DEFAULT_SEARCH_QUERY.sortOrder);
  });

  it('takes the first value when given an array (repeated query key)', () => {
    const query = parseSearchQuery({ sortOrder: ['desc', 'asc'] });
    expect(query.sortOrder).toBe('desc');
  });
});

describe('isValidIsoDate / parseSearchQuery: malformed date rejection', () => {
  it('accepts a well-formed calendar date', () => {
    expect(isValidIsoDate('2026-06-15')).toBe(true);
    expect(parseSearchQuery({ date: '2026-06-15' }).date).toBe('2026-06-15');
  });

  it('rejects a date with the wrong separators/order', () => {
    expect(isValidIsoDate('15-06-2026')).toBe(false);
    expect(parseSearchQuery({ date: '15-06-2026' }).date).toBe('');
  });

  it('rejects a date that rolls over to a different day (Feb 30)', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(parseSearchQuery({ date: '2026-02-30' }).date).toBe('');
  });

  it('rejects a month/day out of range', () => {
    expect(isValidIsoDate('2026-13-40')).toBe(false);
  });

  it('rejects free-form garbage and blank input', () => {
    expect(isValidIsoDate('not-a-date')).toBe(false);
    expect(parseSearchQuery({ date: 'not-a-date' }).date).toBe('');
    expect(parseSearchQuery({}).date).toBe('');
  });
});

describe('parseSearchQuery: city -> slug normalization', () => {
  it('lowercases a mixed-case city name', () => {
    expect(parseSearchQuery({ from: 'MUNICH' }).from).toBe('munich');
  });

  it('trims surrounding whitespace', () => {
    expect(parseSearchQuery({ to: '  Berlin  ' }).to).toBe('berlin');
  });

  it('normalizes both from and to independently', () => {
    const query = parseSearchQuery({ from: ' Paris', to: 'lyon ' });
    expect(query.from).toBe('paris');
    expect(query.to).toBe('lyon');
  });

  it('defaults to an empty string when unset', () => {
    expect(parseSearchQuery({}).from).toBe('');
    expect(parseSearchQuery({}).to).toBe('');
  });
});
