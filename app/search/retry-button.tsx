'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * Re-runs the server component for this route without a full navigation.
 * Used for inline error states where the API layer returned a typed
 * ApiError instead of throwing, so error.tsx never sees it.
 */
export function RetryButton({ label = 'Try again' }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Retrying…' : label}
    </button>
  );
}
