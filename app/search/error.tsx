'use client';

import { useEffect } from 'react';

/**
 * Safety net for uncaught exceptions only — lib/api.ts never throws for
 * expected states (network/404/409/400), those are handled inline in
 * page.tsx. This only fires on genuine bugs (bad render, etc).
 */
interface SearchErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function SearchError({ error, retry }: SearchErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-start gap-3 px-4 py-10">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="text-sm text-slate-600">
        The search page hit an unexpected error. This is separate from the train service being
        slow — please try again.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Try again
      </button>
    </main>
  );
}
