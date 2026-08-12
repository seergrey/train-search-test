import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Bordered surface used by the search form, result rows and the train summary. */
interface CardProps {
  /** Rendered element — `li` for result rows, `article` for the summary card. */
  as?: 'div' | 'li' | 'article' | 'section';
  /** Adds the hover affordance used by clickable result rows. */
  interactive?: boolean;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ as: Tag = 'div', interactive = false, padded = true, className, children }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-card border border-border bg-surface',
        padded && 'p-4',
        interactive && 'transition hover:border-border-strong hover:shadow-sm',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
