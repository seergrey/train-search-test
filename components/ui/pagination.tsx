import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Link-based pager: every page is a real URL, so results stay shareable,
 * back/forward works, and the whole thing renders on the server — no client
 * JavaScript needed to change page.
 */

/** Page numbers shown around the current one before collapsing to an ellipsis. */
const WINDOW_RADIUS = 1;

type PageItem = number | 'gap';

export function Pagination({
  page,
  pageCount,
  hasPrevious,
  hasNext,
  hrefForPage,
  label = 'Results pages',
}: {
  page: number;
  pageCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  hrefForPage: (page: number) => string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className="flex items-center justify-between gap-2 pt-1">
      <PageLink href={hrefForPage(page - 1)} enabled={hasPrevious} rel="prev">
        <span aria-hidden="true">←</span> Previous
      </PageLink>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageItems(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-content-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-control px-2 text-sm transition',
                  item === page
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'text-content-muted hover:bg-surface-muted hover:text-content',
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>

      <p className="text-sm text-content-muted sm:hidden">
        Page {page} of {pageCount}
      </p>

      <PageLink href={hrefForPage(page + 1)} enabled={hasNext} rel="next">
        Next <span aria-hidden="true">→</span>
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  enabled,
  rel,
  children,
}: {
  href: string;
  enabled: boolean;
  rel: 'prev' | 'next';
  children: ReactNode;
}) {
  const classes = 'inline-flex items-center gap-1 rounded-control border px-3 py-1.5 text-sm font-medium transition';

  // Rendered as a disabled <span> rather than a dead link, so assistive tech
  // doesn't announce a navigation that goes nowhere at the list's edges.
  if (!enabled) {
    return (
      <span aria-disabled="true" className={cn(classes, 'border-border text-content-subtle')}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} rel={rel} className={cn(classes, 'border-border-strong text-content hover:bg-surface-muted')}>
      {children}
    </Link>
  );
}

/** First and last page are always visible; the middle collapses around `page`. */
export function pageItems(page: number, pageCount: number): PageItem[] {
  const numbers = new Set<number>([1, pageCount]);
  for (let candidate = page - WINDOW_RADIUS; candidate <= page + WINDOW_RADIUS; candidate += 1) {
    if (candidate >= 1 && candidate <= pageCount) numbers.add(candidate);
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const items: PageItem[] = [];
  let previous = 0;
  for (const number of sorted) {
    if (previous !== 0 && number - previous > 1) items.push('gap');
    items.push(number);
    previous = number;
  }
  return items;
}
