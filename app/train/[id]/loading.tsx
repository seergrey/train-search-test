import { Card, Skeleton } from '@/components/ui';

const SUMMARY_DETAIL_COUNT = 4;

/** Mirrors TrainSummary + BookingForm layout so data arriving causes no layout shift. */
export default function TrainLoading() {
  return (
    <main aria-busy="true" aria-label="Loading train" className="mx-auto max-w-detail px-4 py-6 sm:py-10">
      <Skeleton className="h-5 w-32" />

      <Card padded={false} className="mt-4 overflow-hidden">
        <Skeleton className="h-40 w-full rounded-none sm:h-56" />
        <div className="space-y-3 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {Array.from({ length: SUMMARY_DETAIL_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-8" />
            ))}
          </div>
        </div>
      </Card>

      <Skeleton className="mt-6 h-32 rounded-card" />
    </main>
  );
}
