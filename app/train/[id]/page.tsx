import Image from 'next/image';
import Link from 'next/link';
import { getTrain } from '@/lib/api';
import { parseSearchQuery, searchHref, type RawSearchParams } from '@/lib/search-params';
import type { Train } from '@/lib/types';
import { BookingForm } from './booking-form';
import { RetryButton } from './retry-button';

interface TrainPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}

export default async function TrainPage({ params, searchParams }: TrainPageProps) {
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  // The searchParams this detail page was reached with are the only link back to the same results.
  const backHref = searchHref(parseSearchQuery(rawSearchParams));
  const result = await getTrain(id);

  if (!result.ok) {
    return result.error.kind === 'not_found' ? (
      <TrainNotFound backHref={backHref} />
    ) : (
      <TrainLoadError backHref={backHref} message={result.error.message} />
    );
  }

  const train = result.data;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <BackLink href={backHref} />
      <TrainSummary train={train} />
      <BookingForm trainId={train.id} initialSeatsLeft={train.seatsLeft} backHref={backHref} />
    </main>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
      ← Back to results
    </Link>
  );
}

function TrainSummary({ train }: { train: Train }) {
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
              <SeatsBadge seatsLeft={train.seatsLeft} totalSeats={train.totalSeats} />
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

function TrainNotFound({ backHref }: { backHref: string }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Train not found</h1>
      <p className="text-sm text-slate-600">This train doesn&apos;t exist or may have been removed.</p>
      <Link href={backHref} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
        Back to results
      </Link>
    </main>
  );
}

function TrainLoadError({ backHref, message }: { backHref: string; message: string }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Couldn&apos;t load this train</h1>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-2">
        <RetryButton />
        <Link href={backHref} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Back to results
        </Link>
      </div>
    </main>
  );
}
