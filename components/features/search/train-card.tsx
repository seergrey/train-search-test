'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import { formatDuration, formatPrice } from '@/lib/format';
import { useSavedTrains } from '@/lib/hooks/use-saved-trains';
import { serializeSearchQuery } from '@/lib/search-params';
import { seatsLabel, seatsTone } from '@/lib/seats';
import type { SearchQuery, Train } from '@/lib/types';

export function TrainCard({ train, query }: { train: Train; query: SearchQuery }) {
  const { isSaved, toggle } = useSavedTrains();
  const saved = isSaved(train.id);
  // Carries the current search onto the detail page, so its "back to results" link can restore it.
  const qs = serializeSearchQuery(query);

  return (
    <Card as="li" padded={false} interactive className="flex items-center gap-1 pr-2">
      <Link
        href={`/train/${encodeURIComponent(train.id)}${qs === '' ? '' : `?${qs}`}`}
        className="flex min-w-0 flex-1 items-center gap-4 p-3 sm:p-4"
      >
        <Image
          src={train.image}
          alt=""
          width={96}
          height={72}
          className="hidden h-18 w-24 shrink-0 rounded-lg object-cover sm:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 text-sm text-content-muted">
            <span className="font-medium text-content">{train.trainNumber}</span>
            <span>{train.carriageClass}</span>
            {saved ? <Badge tone="accent">Saved</Badge> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold text-content sm:text-lg">
            <span>{train.departureTime}</span>
            <span aria-hidden="true" className="text-content-subtle">
              →
            </span>
            <span>{train.arrivalTime}</span>
            <span className="text-xs font-normal text-content-subtle">
              {formatDuration(train.departureTime, train.arrivalTime)}
            </span>
          </div>
          <div className="mt-0.5 truncate text-sm text-content-muted">
            {train.from} → {train.to} · {train.departureDate}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-lg font-semibold text-content sm:text-xl">{formatPrice(train.price)}</span>
          <Badge tone={seatsTone(train.seatsLeft)}>{seatsLabel(train.seatsLeft)}</Badge>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggle(train.id)}
        aria-pressed={saved}
        aria-label={
          saved
            ? `Remove train ${train.trainNumber} from saved trains`
            : `Save train ${train.trainNumber}`
        }
        title={saved ? 'Remove from saved' : 'Save'}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-content-subtle transition hover:bg-accent-subtle hover:text-accent"
      >
        <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      </button>
    </Card>
  );
}
