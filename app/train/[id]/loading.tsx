/** Mirrors TrainSummary + BookingForm layout so data arriving causes no layout shift. */
export default function TrainLoading() {
  return (
    <main className="mx-auto max-w-2xl animate-pulse px-4 py-6 sm:py-10">
      <div className="h-5 w-32 rounded bg-slate-200" />

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <div className="h-40 w-full bg-slate-200 sm:h-56" />
        <div className="space-y-3 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <div className="h-6 w-36 rounded bg-slate-200" />
            <div className="h-6 w-16 rounded bg-slate-200" />
          </div>
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="h-8 rounded bg-slate-200" />
            <div className="h-8 rounded bg-slate-200" />
            <div className="h-8 rounded bg-slate-200" />
            <div className="h-8 rounded bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mt-6 h-32 rounded-lg border border-slate-200 bg-slate-100" />
    </main>
  );
}
