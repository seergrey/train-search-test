'use client';

import { useMemo } from 'react';
import { useSavedTrains } from '@/lib/hooks/use-saved-trains';
import type { SearchQuery, Train } from '@/lib/types';
import { TrainCard } from './train-card';

/** Saved trains float to the top of the current page only — sorting across
 *  pages would need the whole result set, which the API pages for us. */

/**
 * Renders the fetched trains in the order the server sent them until the
 * saved-trains hook loads (localStorage isn't available server-side, so
 * `savedIds` starts empty and this matches the SSR markup exactly). Once
 * the hook's effect populates `savedIds`, a single re-sort moves saved
 * trains to the top — no layout jump because the pre-hydration render is
 * identical to the server's.
 */
export function TrainList({ trains, query }: { trains: Train[]; query: SearchQuery }) {
  const { savedIds } = useSavedTrains();

  const orderedTrains = useMemo(() => {
    if (savedIds.length === 0) return trains;
    const saved = new Set(savedIds);
    return [...trains].sort((a, b) => Number(saved.has(b.id)) - Number(saved.has(a.id)));
  }, [trains, savedIds]);

  return (
    <ul role="list" aria-label="Train results" className="flex flex-col gap-3">
      {orderedTrains.map((train) => (
        <TrainCard key={train.id} train={train} query={query} />
      ))}
    </ul>
  );
}
