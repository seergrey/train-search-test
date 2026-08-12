import type { BadgeTone } from '@/components/ui/badge';

/**
 * Seat-availability rule, in one place. Both the results list and the train
 * detail page render this — they used to each carry their own threshold and
 * their own colours, which is how "5 seats left" ended up amber in one view
 * and green in the other.
 *
 * Only the *tone name* is borrowed from the UI layer (a string union, erased
 * at compile time), never a class name — the palette stays in globals.css.
 */

export const LOW_SEATS_THRESHOLD = 5;

export type SeatsLevel = 'sold-out' | 'low' | 'available';

export function seatsLevel(seatsLeft: number): SeatsLevel {
  if (seatsLeft <= 0) return 'sold-out';
  return seatsLeft <= LOW_SEATS_THRESHOLD ? 'low' : 'available';
}

const TONE_BY_LEVEL: Record<SeatsLevel, BadgeTone> = {
  'sold-out': 'neutral',
  low: 'warning',
  available: 'success',
};

export function seatsTone(seatsLeft: number): BadgeTone {
  return TONE_BY_LEVEL[seatsLevel(seatsLeft)];
}

/** `totalSeats` is only known on the detail page, hence optional. */
export function seatsLabel(seatsLeft: number, totalSeats?: number): string {
  if (seatsLeft <= 0) return 'Sold out';
  const suffix = seatsLeft === 1 ? 'seat left' : 'seats left';
  return totalSeats === undefined ? `${seatsLeft} ${suffix}` : `${seatsLeft} of ${totalSeats} left`;
}
