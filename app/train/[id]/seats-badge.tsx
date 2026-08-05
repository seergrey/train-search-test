'use client';

import { useSeatsLeft } from './seats-left-context';

/** The one part of the summary card that must react to a just-completed booking. */
export function SeatsBadge({ totalSeats }: { totalSeats: number }) {
  const { seatsLeft } = useSeatsLeft();

  const tone =
    seatsLeft <= 0
      ? 'bg-red-100 text-red-800'
      : seatsLeft <= 5
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-800';
  const label = seatsLeft <= 0 ? 'Sold out' : `${seatsLeft} of ${totalSeats} left`;

  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
}
