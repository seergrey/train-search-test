import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui';
import { seatsLabel, seatsTone } from '@/lib/seats';
import { SeatsBadge } from './seats-badge';
import { SeatsLeftProvider } from './seats-left-context';

function renderBadge(seatsLeft: number, totalSeats = 60) {
  return render(
    <SeatsLeftProvider initialSeatsLeft={seatsLeft}>
      <SeatsBadge totalSeats={totalSeats} />
    </SeatsLeftProvider>,
  );
}

describe('SeatsBadge', () => {
  it('shows the remaining count against the total', () => {
    renderBadge(12);
    expect(screen.getByText('12 of 60 left')).toBeInTheDocument();
  });

  it('shows sold out at zero', () => {
    renderBadge(0);
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });

  /**
   * The regression this guards: the detail page used to compute its own
   * threshold and colours, so a train that read amber in the results list
   * could read green here. Both now render the same Badge tone.
   */
  it.each([0, 1, 5, 6, 34])('matches the results-list styling at %i seats', (seatsLeft) => {
    const { container: detail, unmount } = renderBadge(seatsLeft);
    const detailClass = detail.firstElementChild?.className;
    unmount();

    const { container: list } = render(<Badge tone={seatsTone(seatsLeft)}>{seatsLabel(seatsLeft)}</Badge>);
    expect(detailClass).toBe(list.firstElementChild?.className);
  });
});
