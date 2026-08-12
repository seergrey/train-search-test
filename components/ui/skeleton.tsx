import { cn } from '@/lib/cn';

/** Pulsing placeholder block. One fill token, so loading states stay in step
 *  with the surfaces they stand in for. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-skeleton', className)} />;
}
