import { getStations, getTrains } from '@/lib/api';
import { applyMaxPrice, parseSearchQuery, toTrainsQuery } from '@/lib/search-params';

/** Scaffold placeholder: proves the URL contract and the API layer, no UI yet. */

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = parseSearchQuery(await searchParams);
  const [trains, stations] = await Promise.all([getTrains(toTrainsQuery(query)), getStations()]);

  const visible = trains.ok ? applyMaxPrice(trains.data.data, query.maxPrice) : [];

  return (
    <main className="p-4 font-mono text-xs">
      <h1 className="mb-4 text-base font-semibold">Search contract check</h1>
      <pre className="overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(
          {
            query,
            stations: stations.ok ? stations.data.map((station) => station.slug) : stations.error,
            trains: trains.ok
              ? { total: trains.data.total, page: trains.data.page, limit: trains.data.limit }
              : trains.error,
            afterBudgetFilter: visible.length,
            firstTrain: visible[0] ?? null,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
