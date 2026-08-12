'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button, type ButtonVariant } from './button';

/**
 * Re-runs the Server Component for the current route without a full
 * navigation. Used by every inline error state, because lib/api.ts returns a
 * typed ApiError instead of throwing, so error.tsx never sees those cases.
 *
 * Single implementation on purpose: this used to be duplicated per route,
 * and the copies had drifted apart (one showed a pending state, one didn't).
 */
export function RetryButton({
  label = 'Try again',
  pendingLabel = 'Retrying…',
  variant = 'danger',
}: {
  label?: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
