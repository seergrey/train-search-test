import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertActions } from './alert';
import { Badge } from './badge';

describe('Alert', () => {
  it('announces an error as an alert by default', () => {
    render(<Alert tone="danger">Could not load trains</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load trains');
  });

  // A 409 or a successful booking is an expected outcome, not a failure —
  // it should be announced as status, not as an error.
  it('announces an expected outcome as status when asked', () => {
    render(
      <Alert tone="success" role="status" title="Booked 2 seats.">
        Booking ID: 17
      </Alert>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Booked 2 seats.');
    expect(status).toHaveTextContent('Booking ID: 17');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('is polite, so it never interrupts a screen reader mid-sentence', () => {
    render(<Alert tone="warning">Not enough seats left</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('renders recovery actions passed through AlertActions', () => {
    render(
      <Alert tone="warning">
        <AlertActions>
          <button type="button">Try a different amount</button>
        </AlertActions>
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Try a different amount' })).toBeInTheDocument();
  });

  it('drives every tone from tokens, never a raw palette class', () => {
    for (const tone of ['danger', 'warning', 'success', 'info'] as const) {
      const { container, unmount } = render(<Alert tone={tone}>msg</Alert>);
      expect(container.firstElementChild?.className).not.toMatch(/(red|amber|green|slate|blue)-\d{2,3}/);
      unmount();
    }
  });
});

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge tone="warning">3 seats left</Badge>);
    expect(screen.getByText('3 seats left')).toBeInTheDocument();
  });

  it('drives every tone from tokens, never a raw palette class', () => {
    for (const tone of ['neutral', 'success', 'warning', 'danger', 'accent'] as const) {
      const { container, unmount } = render(<Badge tone={tone}>x</Badge>);
      expect(container.firstElementChild?.className).not.toMatch(/(red|amber|green|slate|rose|emerald)-\d{2,3}/);
      unmount();
    }
  });
});
