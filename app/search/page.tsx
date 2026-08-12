import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchForm, TrainList } from '@/components/features/search';
import { Alert, EmptyState, PageHeader, Pagination, RetryButton } from '@/components/ui';
import { getStations, getTrains } from '@/lib/api';
import { pluralize } from '@/lib/format';
import {
  applyMaxPrice,
  pageInfo,
  parseSearchQuery,
  searchHref,
  toTrainsQuery,
  withFilters,
  withPage,
  type RawSearchParams,
} from '@/lib/search-params';
import type { Result, SearchQuery, TrainsPage } from '@/lib/types';

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
    <main className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 sm:py-10">
      <PageHeader
        title={describeRoute(query)}
        description="Compare departures across Germany and book in a few taps."
      />

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

function Results({ query, trainsResult }: { query: SearchQuery; trainsResult: Result<TrainsPage> }) {
  if (!trainsResult.ok) {
    return (
      <Alert tone="danger" title="Couldn't load trains">
        <p>{trainsResult.error.message}</p>
        <div>
          <RetryButton />
        </div>
      </Alert>
    );
  }

  const resultsPage = trainsResult.data;
  const fetchedTrains = resultsPage.data;
  // maxPrice is a client-side filter over the page the API returned, so it can
  // empty this page while later pages still hold matches — the copy says so.
  const visibleTrains = applyMaxPrice(fetchedTrains, query.maxPrice);
  const info = pageInfo(resultsPage.total, resultsPage.page, resultsPage.limit);

  if (resultsPage.total === 0) {
    return (
      <EmptyState
        title="No trains found"
        description="Try a different route or date — this route may not run every day."
      />
    );
  }

  // Out-of-range page number: the route has results, this page just isn't one of them.
  if (fetchedTrains.length === 0) {
    return (
      <EmptyState
        title="No trains on this page"
        description={`This search has ${info.pageCount} ${pluralize(info.pageCount, 'page')} of results.`}
        action={
          <Link
            href={searchHref(withPage(query, 1))}
            className="text-sm font-medium text-primary underline underline-offset-2"
          >
            Back to the first page
          </Link>
        }
      />
    );
  }

  return (
    <>
      {visibleTrains.length === 0 ? (
        <EmptyState
          title={`No trains under €${query.maxPrice ?? 0} on this page`}
          description={`${fetchedTrains.length} ${pluralize(fetchedTrains.length, 'train')} on page ${info.page}, but none fit that budget. Other pages may still have matches.`}
          action={
            <Link
              href={searchHref(withFilters(query, { maxPrice: null }))}
              className="text-sm font-medium text-primary underline underline-offset-2"
            >
              Clear budget filter
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-content-muted">
            {describeCount(visibleTrains.length, fetchedTrains.length, info.total, query.maxPrice)}
          </p>
          <TrainList trains={visibleTrains} query={query} />
        </>
      )}

      <Pagination
        page={info.page}
        pageCount={info.pageCount}
        hasPrevious={info.hasPrevious}
        hasNext={info.hasNext}
        hrefForPage={(target) => searchHref(withPage(query, target))}
      />
    </>
  );
}

/** States what's on screen *and* what the whole route holds, so the budget
 *  filter's page-local scope is never mistaken for a total. */
function describeCount(visible: number, fetched: number, total: number, maxPrice: number | null): string {
  if (maxPrice !== null && visible < fetched) {
    return `${visible} of ${fetched} on this page under €${maxPrice} · ${total} ${pluralize(total, 'train')} on this route`;
  }
  return `${visible} ${pluralize(visible, 'train')} shown · ${total} found`;
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
