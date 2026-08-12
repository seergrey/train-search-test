'use client';

import { useEffect } from 'react';
import { Button, CenteredMessage } from '@/components/ui';

/**
 * Safety net for uncaught exceptions only — lib/api.ts never throws for
 * expected states (network/404/409/400), those are handled inline in
 * page.tsx. This only fires on genuine bugs (bad render, etc).
 */
interface SearchErrorProps {
  error: Error & { digest?: string };
  /** Next's own prop name — it re-renders the segment when called. */
  reset: () => void;
}

export default function SearchError({ error, reset }: SearchErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <CenteredMessage
      title="Something went wrong"
      description="The search page hit an unexpected error. This is separate from the train service being slow — please try again."
    >
      <Button onClick={() => reset()}>Try again</Button>
    </CenteredMessage>
  );
}
