import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Inline status message for the typed API outcomes (409/404/400/network) and
 * for successful bookings. `tone` picks the token set; `role` distinguishes
 * a genuine error (assertive-ish `alert`) from an informational `status`.
 */
export type AlertTone = 'danger' | 'warning' | 'success' | 'info';

const TONES: Record<AlertTone, string> = {
  danger: 'border-danger-border bg-danger-subtle text-danger-content',
  warning: 'border-warning-border bg-warning-subtle text-warning-content',
  success: 'border-success-border bg-success-subtle text-success-content',
  info: 'border-border bg-surface-muted text-content-muted',
};

export function Alert({
  tone,
  role = 'alert',
  title,
  className,
  children,
}: {
  tone: AlertTone;
  role?: 'alert' | 'status';
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={role}
      aria-live="polite"
      className={cn('space-y-3 rounded-card border p-4 text-sm', TONES[tone], className)}
    >
      {title !== undefined ? <p className="font-medium">{title}</p> : null}
      {children}
    </div>
  );
}

/** Row of recovery actions inside an Alert. */
export function AlertActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
