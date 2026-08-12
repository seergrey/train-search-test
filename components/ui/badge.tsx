import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Pill label. Tones mirror the status tokens, so a "low seats" amber is the
 *  same amber on the results list and on the train detail page. */
export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-content-muted',
  success: 'bg-success-subtle text-success-content',
  warning: 'bg-warning-subtle text-warning-content',
  danger: 'bg-danger-subtle text-danger-content',
  accent: 'bg-accent-subtle text-accent-content',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}
