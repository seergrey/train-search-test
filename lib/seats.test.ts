import { describe, expect, it } from 'vitest';
import { LOW_SEATS_THRESHOLD, seatsLabel, seatsLevel, seatsTone } from './seats';

/**
 * These assertions are the point of lib/seats existing: the results list and
 * the train detail page must agree on when a train is "low" and what colour
 * that is. They used to each carry their own copy of this rule.
 */

describe('seatsLevel', () => {
  it('reports sold out at zero', () => {
    expect(seatsLevel(0)).toBe('sold-out');
  });

  it('reports sold out for a negative count, however that arises', () => {
    expect(seatsLevel(-3)).toBe('sold-out');
  });

  it('treats the threshold itself as low', () => {
    expect(seatsLevel(LOW_SEATS_THRESHOLD)).toBe('low');
  });

  it('treats one above the threshold as available', () => {
    expect(seatsLevel(LOW_SEATS_THRESHOLD + 1)).toBe('available');
  });

  it('treats a single seat as low, not sold out', () => {
    expect(seatsLevel(1)).toBe('low');
  });
});

describe('seatsTone', () => {
  it.each([
    [0, 'neutral'],
    [LOW_SEATS_THRESHOLD, 'warning'],
    [LOW_SEATS_THRESHOLD + 1, 'success'],
  ])('maps %i seats to the %s tone', (seatsLeft, tone) => {
    expect(seatsTone(seatsLeft)).toBe(tone);
  });
});

describe('seatsLabel', () => {
  it('says sold out at zero, ignoring the total', () => {
    expect(seatsLabel(0, 60)).toBe('Sold out');
  });

  it('uses the singular for one seat', () => {
    expect(seatsLabel(1)).toBe('1 seat left');
  });

  it('uses the plural beyond one', () => {
    expect(seatsLabel(12)).toBe('12 seats left');
  });

  it('includes the total when the detail page knows it', () => {
    expect(seatsLabel(12, 60)).toBe('12 of 60 left');
  });
});
