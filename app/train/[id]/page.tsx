import { notFound } from 'next/navigation';
import { getTrain } from '@/lib/api';

/** Scaffold placeholder: proves getTrain + the 404 path, no UI yet. */

interface TrainPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainPage({ params }: TrainPageProps) {
  const { id } = await params;
  const result = await getTrain(id);

  if (!result.ok && result.error.kind === 'not_found') notFound();

  return (
    <main className="p-4 font-mono text-xs">
      <h1 className="mb-4 text-base font-semibold">Train contract check</h1>
      <pre className="overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(result.ok ? result.data : result.error, null, 2)}
      </pre>
    </main>
  );
}
