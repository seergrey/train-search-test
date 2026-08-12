import type { ReactNode } from 'react';

/** Dashed placeholder for "nothing to show, and that's not an error". */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-start gap-2 rounded-card border border-dashed border-border-strong p-6"
    >
      <p className="text-sm font-medium text-content">{title}</p>
      <p className="text-sm text-content-muted">{description}</p>
      {action}
    </div>
  );
}
