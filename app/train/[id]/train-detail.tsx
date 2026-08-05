'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Train } from '@/lib/types';
import { BookingForm } from './booking-form';

interface TrainDetailProps {
  train: Train;
  backHref: string;
}

/**
 * Owns `seatsLeft` for the whole detail view so the summary card and the
 * booking form always agree on the current count after a booking succeeds.
 */
export function TrainDetail({ train, backHref }: TrainDetailProps) {
  const [seatsLeft, setSeatsLeft] = useState(train.seatsLeft);

  return (
    <>
      <TrainSummary train={train} seatsLeft={seatsLeft} />
      <BookingForm
        trainId={train.id}
        seatsLeft={seatsLeft}
        onSeatsLeftChange={setSeatsLeft}
        backHref={backHref}
      />
    </>
  );
}

function TrainSummary({ train, seatsLeft }: { train: Train; seatsLeft: number }) {
  return (
    <article className="mt-4 overflow-hidden rounded-lg border border-slate-200">
      <div className="relative h-40 w-full sm:h-56">
        <Image
          src={train.image}
          alt={`${train.from} to ${train.to}`}
          fill
          priority
          sizes="(min-width: 640px) 640px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-semibold text-slate-900">
            {train.from} → {train.to}
          </h1>
          <span className="text-xl font-bold text-slate-900">€{train.price}</span>
        </div>
        <p className="text-sm text-slate-600">
          {train.trainNumber} · {train.carriageClass}
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-900">{train.departureDate}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Seats</dt>
            <dd>
              <SeatsBadge seatsLeft={seatsLeft} totalSeats={train.totalSeats} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Departure</dt>
            <dd className="font-medium text-slate-900">{train.departureTime}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Arrival</dt>
            <dd className="font-medium text-slate-900">{train.arrivalTime}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function SeatsBadge({ seatsLeft, totalSeats }: { seatsLeft: number; totalSeats: number }) {
  const tone =
    seatsLeft <= 0
      ? 'bg-red-100 text-red-800'
      : seatsLeft <= 5
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-800';
  const label = seatsLeft <= 0 ? 'Sold out' : `${seatsLeft} of ${totalSeats} left`;

  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
}
