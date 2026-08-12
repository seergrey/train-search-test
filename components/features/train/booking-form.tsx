'use client';

import { useState, type FormEvent } from 'react';
import { Alert, AlertActions, Button, Card, Field, LinkButton, Select } from '@/components/ui';
import { createBooking } from '@/lib/api';
import { pluralize } from '@/lib/format';
import type { ApiError, Booking } from '@/lib/types';
import { useSeatsLeft } from './seats-left-context';

/** Booking step of the brief's main flow: pick a seat count, POST /bookings, handle 201/400/409. */

interface BookingFormProps {
  trainId: string;
  /** /search URL with the searchParams the user arrived with, for every "back to results" action. */
  backHref: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; booking: Booking }
  | { kind: 'error'; error: ApiError };

/** No documented upper bound on `seats`; capped for a sane dropdown. */
const MAX_SEATS_PER_BOOKING = 9;

export function BookingForm({ trainId, backHref }: BookingFormProps) {
  const { seatsLeft, setSeatsLeft } = useSeatsLeft();
  const [seats, setSeats] = useState(1);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  if (seatsLeft <= 0) {
    return <SoldOut backHref={backHref} />;
  }

  if (status.kind === 'success') {
    return (
      <BookingConfirmation
        booking={status.booking}
        backHref={backHref}
        onBookAgain={() => setStatus({ kind: 'idle' })}
      />
    );
  }

  const maxSelectable = Math.min(seatsLeft, MAX_SEATS_PER_BOOKING);
  const seatOptions = Array.from({ length: maxSelectable }, (_, index) => index + 1);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus({ kind: 'submitting' });

    const result = await createBooking({ trainId, seats });

    if (result.ok) {
      setStatus({ kind: 'success', booking: result.data });
      setSeatsLeft(result.data.seatsLeft);
      return;
    }

    if (result.error.kind === 'conflict') {
      // The list page's seatsLeft was stale; reflect the API's current truth.
      setSeatsLeft(0);
    }
    setStatus({ kind: 'error', error: result.error });
  }

  return (
    <Card padded={false} className="mt-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <h2 className="text-sm font-semibold text-content">Book seats</h2>

        <Field label="Number of seats" htmlFor="seats">
          <Select
            id="seats"
            name="seats"
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            disabled={status.kind === 'submitting'}
          >
            {seatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        {status.kind === 'error' && (
          <BookingErrorBanner
            error={status.error}
            backHref={backHref}
            onRetry={() => setStatus({ kind: 'idle' })}
          />
        )}

        <Button type="submit" size="full" disabled={status.kind === 'submitting'}>
          {status.kind === 'submitting' ? 'Booking…' : 'Book now'}
        </Button>
      </form>
    </Card>
  );
}

function BookingErrorBanner({
  error,
  backHref,
  onRetry,
}: {
  error: ApiError;
  backHref: string;
  onRetry: () => void;
}) {
  // 409: expected business outcome, not a system error — inline recovery, no redirect.
  if (error.kind === 'conflict') {
    return (
      <Alert tone="warning">
        <p>{error.message}</p>
        <AlertActions>
          <LinkButton href={backHref} variant="warning" size="sm">
            Back to results
          </LinkButton>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try a different amount
          </Button>
        </AlertActions>
      </Alert>
    );
  }

  if (error.kind === 'not_found') {
    return (
      <Alert tone="danger">
        <p>{error.message}</p>
        <AlertActions>
          <LinkButton href={backHref} variant="secondary" size="sm">
            Back to results
          </LinkButton>
        </AlertActions>
      </Alert>
    );
  }

  // 400: a general validation failure — no field-level detail from the API to surface.
  if (error.kind === 'validation') {
    return (
      <Alert tone="danger">
        Booking request was invalid. Please check the number of seats and try again.
      </Alert>
    );
  }

  return (
    <Alert tone="danger">
      <p>{error.message}</p>
      <AlertActions>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </AlertActions>
    </Alert>
  );
}

function SoldOut({ backHref }: { backHref: string }) {
  return (
    <Alert tone="warning" role="status" title="No seats left on this train." className="mt-6">
      <AlertActions>
        <LinkButton href={backHref} variant="warning" size="sm">
          Back to results
        </LinkButton>
      </AlertActions>
    </Alert>
  );
}

function BookingConfirmation({
  booking,
  backHref,
  onBookAgain,
}: {
  booking: Booking;
  backHref: string;
  onBookAgain: () => void;
}) {
  return (
    <Alert
      tone="success"
      role="status"
      title={`Booked ${booking.seats} ${pluralize(booking.seats, 'seat')}.`}
      className="mt-6"
    >
      <p>Booking ID: {booking.id}</p>
      <p>
        {booking.seatsLeft} {pluralize(booking.seatsLeft, 'seat')} left on this train.
      </p>
      <AlertActions>
        <LinkButton href={backHref} variant="success" size="sm">
          Back to results
        </LinkButton>
        {booking.seatsLeft > 0 && (
          <Button variant="secondary" size="sm" onClick={onBookAgain}>
            Book more seats
          </Button>
        )}
      </AlertActions>
    </Alert>
  );
}
