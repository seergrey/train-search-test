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
      className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:py-10"
    >
      <header className="flex flex-col gap-2">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      </header>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
            <div className="h-10 animate-pulse rounded-md bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

      <ul className="flex flex-col gap-3">
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
          >
            <div className="h-18 w-24 shrink-0 animate-pulse rounded-lg bg-slate-200" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="hidden h-8 w-16 shrink-0 animate-pulse rounded bg-slate-200 sm:block" />
          </li>
        ))}
      </ul>
    </main>
  );
}
