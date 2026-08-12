import type { ReactNode } from 'react';

/**
 * Full-page message with a row of recovery actions — used by the 404/load-error
 * states on the train page and by both error.tsx boundaries.
 */
export function CenteredMessage({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
    >
      <h1 className="text-lg font-semibold text-content">{title}</h1>
      <p className="text-sm text-content-muted">{description}</p>
      {children !== undefined ? <div className="flex flex-wrap justify-center gap-2">{children}</div> : null}
    </main>
  );
}
