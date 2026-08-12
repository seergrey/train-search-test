import { describe, expect, it } from 'vitest';
import { formatDuration, formatPrice, pluralize } from './format';

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration('08:10', '12:45')).toBe('4h 35m');
  });

  it('drops the minutes when the trip is a whole number of hours', () => {
    expect(formatDuration('09:00', '13:00')).toBe('4h');
  });

  it('handles a sub-hour trip', () => {
    expect(formatDuration('09:10', '09:55')).toBe('0h 45m');
  });

  it('wraps an overnight trip past midnight', () => {
    expect(formatDuration('23:30', '06:15')).toBe('6h 45m');
  });

  it('treats an identical departure and arrival as zero', () => {
    expect(formatDuration('10:00', '10:00')).toBe('0h');
  });

  it('crosses the minute boundary correctly', () => {
    expect(formatDuration('08:50', '09:05')).toBe('0h 15m');
  });
});

describe('formatPrice', () => {
  it('renders whole euros with the symbol', () => {
    expect(formatPrice(89)).toBe('€89');
  });

  it('handles a free fare without special-casing', () => {
    expect(formatPrice(0)).toBe('€0');
  });
});

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'seat')).toBe('seat');
  });

  it.each([0, 2, 15])('uses the plural for %i', (count) => {
    expect(pluralize(count, 'seat')).toBe('seats');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(3, 'match', 'matches')).toBe('matches');
  });
});
