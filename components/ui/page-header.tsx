import type { ReactNode } from 'react';

/** Page title + supporting line. Keeps heading scale consistent across routes. */
export function PageHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight text-content">{title}</h1>
      {description !== undefined ? <p className="mt-1 text-sm text-content-muted">{description}</p> : null}
    </header>
  );
}
