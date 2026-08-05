import Link from 'next/link';
import { getTrain } from '@/lib/api';
import { parseSearchQuery, searchHref, type RawSearchParams } from '@/lib/search-params';
import { RetryButton } from './retry-button';
import { TrainDetail } from './train-detail';

interface TrainPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}

export default async function TrainPage({ params, searchParams }: TrainPageProps) {
  const [{ id }, rawSearchParams] = await Promise.all([params, searchParams]);
  // The searchParams this detail page was reached with are the only link back to the same results.
  const backHref = searchHref(parseSearchQuery(rawSearchParams));
  const result = await getTrain(id);

  if (!result.ok) {
    return result.error.kind === 'not_found' ? (
      <TrainNotFound backHref={backHref} />
    ) : (
      <TrainLoadError backHref={backHref} message={result.error.message} />
    );
  }

  const train = result.data;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <BackLink href={backHref} />
      <TrainDetail train={train} backHref={backHref} />
    </main>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
      <span aria-hidden="true">←</span> Back to results
    </Link>
  );
}

function TrainNotFound({ backHref }: { backHref: string }) {
  return (
    <main
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
    >
      <h1 className="text-lg font-semibold text-slate-900">Train not found</h1>
      <p className="text-sm text-slate-600">This train doesn&apos;t exist or may have been removed.</p>
      <Link href={backHref} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
        Back to results
      </Link>
    </main>
  );
}

function TrainLoadError({ backHref, message }: { backHref: string; message: string }) {
  return (
    <main
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
    >
      <h1 className="text-lg font-semibold text-slate-900">Couldn&apos;t load this train</h1>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-2">
        <RetryButton />
        <Link href={backHref} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Back to results
        </Link>
      </div>
    </main>
  );
}
