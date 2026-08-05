import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getStations, getTrains } from '@/lib/api';
import {
  applyMaxPrice,
  parseSearchQuery,
  searchHref,
  toTrainsQuery,
  type RawSearchParams,
} from '@/lib/search-params';
import type { Result, SearchQuery, TrainsPage } from '@/lib/types';
import { RetryButton } from './retry-button';
import { SearchForm } from './search-form';
import { TrainList } from './train-list';

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = parseSearchQuery(await searchParams);
  const title = describeRoute(query);
  return {
    title,
    description: `${title} — compare departure times and prices, then book seats.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = parseSearchQuery(await searchParams);
  // Both requests hit different endpoints, so it's safe to run them together
  // (see lib/api.ts: never call the *same* endpoint twice per render).
  const [trainsResult, stationsResult] = await Promise.all([
    getTrains(toTrainsQuery(query)),
    getStations(),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {describeRoute(query)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare departures across Germany and book in a few taps.
        </p>
      </header>

      <SearchForm
        stations={stationsResult.ok ? stationsResult.data : []}
        stationsError={stationsResult.ok ? null : stationsResult.error.message}
        initialQuery={query}
      />

      <section aria-live="polite" className="flex flex-col gap-4">
        <Results query={query} trainsResult={trainsResult} />
      </section>
    </main>
  );
}

function Results({
  query,
  trainsResult,
}: {
  query: SearchQuery;
  trainsResult: Result<TrainsPage>;
}) {
  if (!trainsResult.ok) {
    return (
      <div role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">Couldn&apos;t load trains</p>
        <p className="mt-1 text-sm text-red-700">{trainsResult.error.message}</p>
        <div className="mt-3">
          <RetryButton />
        </div>
      </div>
    );
  }

  const fetchedTrains = trainsResult.data.data;
  const visibleTrains = applyMaxPrice(fetchedTrains, query.maxPrice);

  if (fetchedTrains.length === 0) {
    return (
      <EmptyState
        title="No trains found"
        description="Try a different route or date — this route may not run every day."
      />
    );
  }

  if (visibleTrains.length === 0) {
    return (
      <EmptyState
        title={`No trains under €${query.maxPrice ?? 0}`}
        description={`${fetchedTrains.length} train${fetchedTrains.length === 1 ? '' : 's'} found on this route, but none fit that budget.`}
        action={
          <Link
            href={searchHref({ ...query, maxPrice: null })}
            className="text-sm font-medium text-slate-900 underline underline-offset-2"
          >
            Clear budget filter
          </Link>
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-slate-500">
        {visibleTrains.length} train{visibleTrains.length === 1 ? '' : 's'} found
      </p>
      <TrainList trains={visibleTrains} query={query} />
    </>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-300 p-6"
    >
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

function describeRoute(query: SearchQuery): string {
  const from = capitalize(query.from);
  const to = capitalize(query.to);
  if (from === '' && to === '') return 'Search trains';
  if (from !== '' && to !== '') return `Trains from ${from} to ${to}`;
  return from !== '' ? `Trains from ${from}` : `Trains to ${to}`;
}

function capitalize(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
