'use client';

import { Badge } from '@/components/ui';
import { seatsLabel, seatsTone } from '@/lib/seats';
import { useSeatsLeft } from './seats-left-context';

/** The one part of the summary card that must react to a just-completed booking.
 *  Availability tone and wording come from lib/seats, shared with the results list. */
export function SeatsBadge({ totalSeats }: { totalSeats: number }) {
  const { seatsLeft } = useSeatsLeft();

  return <Badge tone={seatsTone(seatsLeft)}>{seatsLabel(seatsLeft, totalSeats)}</Badge>;
}
