'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { createBooking } from '@/lib/api';
import type { ApiError, Booking } from '@/lib/types';

/** Booking step of the brief's main flow: pick a seat count, POST /bookings, handle 201/400/409. */

interface BookingFormProps {
  trainId: string;
  seatsLeft: number;
  /** Lifted to the parent so the summary card above stays in sync with post-booking counts. */
  onSeatsLeftChange: (seatsLeft: number) => void;
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

export function BookingForm({ trainId, seatsLeft, onSeatsLeftChange, backHref }: BookingFormProps) {
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
      onSeatsLeftChange(result.data.seatsLeft);
      return;
    }

    if (result.error.kind === 'conflict') {
      // The list page's seatsLeft was stale; reflect the API's current truth.
      onSeatsLeftChange(0);
    }
    setStatus({ kind: 'error', error: result.error });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-slate-900">Book seats</h2>

      <div>
        <label htmlFor="seats" className="block text-sm font-medium text-slate-700">
          Number of seats
        </label>
        <select
          id="seats"
          name="seats"
          value={seats}
          onChange={(event) => setSeats(Number(event.target.value))}
          disabled={status.kind === 'submitting'}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 disabled:opacity-60"
        >
          {seatOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {status.kind === 'error' && (
        <BookingErrorBanner error={status.error} backHref={backHref} onRetry={() => setStatus({ kind: 'idle' })} />
      )}

      <button
        type="submit"
        disabled={status.kind === 'submitting'}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white active:bg-blue-700 disabled:opacity-60"
      >
        {status.kind === 'submitting' ? 'Booking…' : 'Book now'}
      </button>
    </form>
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
      <div
        role="alert"
        aria-live="polite"
        className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
      >
        <p>{error.message}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={backHref} className="rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white">
            Back to results
          </Link>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-amber-400 px-3 py-1.5 font-medium text-amber-900"
          >
            Try a different amount
          </button>
        </div>
      </div>
    );
  }

  if (error.kind === 'not_found') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="space-y-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
      >
        <p>{error.message}</p>
        <Link href={backHref} className="inline-block rounded-md bg-red-600 px-3 py-1.5 font-medium text-white">
          Back to results
        </Link>
      </div>
    );
  }

  // 400: a general validation failure — no field-level detail from the API to surface.
  if (error.kind === 'validation') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
      >
        Booking request was invalid. Please check the number of seats and try again.
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="space-y-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
    >
      <p>{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-red-300 px-3 py-1.5 font-medium text-red-900"
      >
        Try again
      </button>
    </div>
  );
}

function SoldOut({ backHref }: { backHref: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <p className="font-medium">No seats left on this train.</p>
      <Link href={backHref} className="inline-block rounded-md bg-amber-600 px-4 py-2 font-medium text-white">
        Back to results
      </Link>
    </div>
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
    <div
      role="status"
      aria-live="polite"
      className="mt-6 space-y-3 rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-900"
    >
      <p className="font-medium">
        Booked {booking.seats} seat{booking.seats === 1 ? '' : 's'}.
      </p>
      <p className="text-green-800">Booking ID: {booking.id}</p>
      <p className="text-green-800">
        {booking.seatsLeft} seat{booking.seatsLeft === 1 ? '' : 's'} left on this train.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href={backHref} className="rounded-md bg-green-700 px-3 py-1.5 font-medium text-white">
          Back to results
        </Link>
        {booking.seatsLeft > 0 && (
          <button
            type="button"
            onClick={onBookAgain}
            className="rounded-md border border-green-700 px-3 py-1.5 font-medium text-green-900"
          >
            Book more seats
          </button>
        )}
      </div>
    </div>
  );
}
