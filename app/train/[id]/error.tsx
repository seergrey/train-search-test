'use client';

import Link from 'next/link';

/**
 * Safety net for unexpected thrown errors only — the typed 404/409/400/network
 * cases from getTrain/createBooking never throw and are handled inline in page.tsx.
 */
export default function TrainError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="text-sm text-slate-600">The train service is having trouble right now.</p>
      <div className="flex gap-2">
        <button type="button" onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          Try again
        </button>
        <Link href="/search" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Back to search
        </Link>
      </div>
    </main>
  );
}
