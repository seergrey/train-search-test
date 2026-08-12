import { Card, Skeleton } from '@/components/ui';

const SKELETON_FIELD_COUNT = 5;
const SKELETON_CARD_COUNT = 4;

/**
 * Mirrors the real search layout (form grid + card list) so there's no
 * layout shift when data streams in. Wired up automatically by Next's
 * Suspense boundary for this route segment — no manual <Suspense> needed.
 */
export default function SearchLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading search results"
      className="mx-auto flex max-w-page flex-col gap-6 px-4 py-6 sm:py-10"
    >
      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>

      <Card className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-10 rounded-control" />
          </div>
        ))}
      </Card>

      <Skeleton className="h-4 w-28" />

      <ul className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <Card as="li" key={index} className="flex items-center gap-4">
            <Skeleton className="h-18 w-24 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="hidden h-8 w-16 shrink-0 sm:block" />
          </Card>
        ))}
      </ul>
    </main>
  );
}
