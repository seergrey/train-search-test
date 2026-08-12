import Image from 'next/image';
import Link from 'next/link';
import { BookingForm, SeatsBadge, SeatsLeftProvider } from '@/components/features/train';
import { Card, CenteredMessage, LinkButton, RetryButton } from '@/components/ui';
import { getTrain } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { parseSearchQuery, searchHref, type RawSearchParams } from '@/lib/search-params';
import type { Train } from '@/lib/types';

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
    <main className="mx-auto max-w-detail px-4 py-6 sm:py-10">
      <BackLink href={backHref} />
      {/* Client boundary is just the seats count + form; the summary card below stays server-rendered. */}
      <SeatsLeftProvider initialSeatsLeft={train.seatsLeft}>
        <TrainSummary train={train} />
        <BookingForm trainId={train.id} backHref={backHref} />
      </SeatsLeftProvider>
    </main>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      <span aria-hidden="true">←</span> Back to results
    </Link>
  );
}

function TrainSummary({ train }: { train: Train }) {
  return (
    <Card as="article" padded={false} className="mt-4 overflow-hidden">
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
          <h1 className="text-lg font-semibold text-content">
            {train.from} → {train.to}
          </h1>
          <span className="text-xl font-bold text-content">{formatPrice(train.price)}</span>
        </div>
        <p className="text-sm text-content-muted">
          {train.trainNumber} · {train.carriageClass}
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <SummaryItem term="Date" detail={train.departureDate} />
          <div>
            <dt className="text-content-muted">Seats</dt>
            <dd>
              <SeatsBadge totalSeats={train.totalSeats} />
            </dd>
          </div>
          <SummaryItem term="Departure" detail={train.departureTime} />
          <SummaryItem term="Arrival" detail={train.arrivalTime} />
        </dl>
      </div>
    </Card>
  );
}

function SummaryItem({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="text-content-muted">{term}</dt>
      <dd className="font-medium text-content">{detail}</dd>
    </div>
  );
}

function TrainNotFound({ backHref }: { backHref: string }) {
  return (
    <CenteredMessage title="Train not found" description="This train doesn't exist or may have been removed.">
      <LinkButton href={backHref}>Back to results</LinkButton>
    </CenteredMessage>
  );
}

function TrainLoadError({ backHref, message }: { backHref: string; message: string }) {
  return (
    <CenteredMessage title="Couldn't load this train" description={message}>
      <RetryButton />
      <LinkButton href={backHref} variant="secondary">
        Back to results
      </LinkButton>
    </CenteredMessage>
  );
}
