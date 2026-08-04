'use client';

import { useRouter } from 'next/navigation';

/** Re-runs the Server Component fetch in place, for the generic (non-404) load error. */
export function RetryButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white active:bg-blue-700"
    >
      Try again
    </button>
  );
}
