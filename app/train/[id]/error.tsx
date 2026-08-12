'use client';

import { Button, CenteredMessage, LinkButton } from '@/components/ui';

/**
 * Safety net for unexpected thrown errors only — the typed 404/409/400/network
 * cases from getTrain/createBooking never throw and are handled inline in page.tsx.
 */
export default function TrainError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <CenteredMessage
      title="Something went wrong"
      description="The train service is having trouble right now."
    >
      <Button onClick={() => reset()}>Try again</Button>
      <LinkButton href="/search" variant="secondary">
        Back to search
      </LinkButton>
    </CenteredMessage>
  );
}
