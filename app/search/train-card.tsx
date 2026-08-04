import Image from 'next/image';
import Link from 'next/link';
import type { Train } from '@/lib/types';

const LOW_SEATS_THRESHOLD = 5;

export function TrainCard({ train }: { train: Train }) {
  const soldOut = train.seatsLeft <= 0;
  const lowSeats = !soldOut && train.seatsLeft <= LOW_SEATS_THRESHOLD;

  return (
    <li className="rounded-xl border border-slate-200 transition hover:border-slate-300 hover:shadow-sm">
      <Link
        href={`/train/${encodeURIComponent(train.id)}`}
        className="flex items-center gap-4 p-3 sm:p-4"
      >
        <Image
          src={train.image}
          alt=""
          width={96}
          height={72}
          className="hidden h-18 w-24 shrink-0 rounded-lg object-cover sm:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-900">{train.trainNumber}</span>
            <span>{train.carriageClass}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
            <span>{train.departureTime}</span>
            <span aria-hidden="true" className="text-slate-300">
              →
            </span>
            <span>{train.arrivalTime}</span>
            <span className="text-xs font-normal text-slate-400">
              {formatDuration(train.departureTime, train.arrivalTime)}
            </span>
          </div>
          <div className="mt-0.5 truncate text-sm text-slate-500">
            {train.from} → {train.to} · {train.departureDate}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-lg font-semibold text-slate-900 sm:text-xl">€{train.price}</span>
          <SeatsBadge soldOut={soldOut} lowSeats={lowSeats} seatsLeft={train.seatsLeft} />
        </div>
      </Link>
    </li>
  );
}

function SeatsBadge({
  soldOut,
  lowSeats,
  seatsLeft,
}: {
  soldOut: boolean;
  lowSeats: boolean;
  seatsLeft: number;
}) {
  if (soldOut) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        Sold out
      </span>
    );
  }
  if (lowSeats) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        {seatsLeft} seats left
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      {seatsLeft} seats left
    </span>
  );
}

/** Times are 'HH:mm'; assumes overnight trips wrap past midnight at most once. */
function formatDuration(departureTime: string, arrivalTime: string): string {
  const departureMinutes = toMinutes(departureTime);
  const arrivalMinutesRaw = toMinutes(arrivalTime);
  const arrivalMinutes = arrivalMinutesRaw < departureMinutes ? arrivalMinutesRaw + 24 * 60 : arrivalMinutesRaw;
  const totalMinutes = arrivalMinutes - departureMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function toMinutes(time: string): number {
  const [hoursPart, minutesPart] = time.split(':');
  return Number(hoursPart ?? 0) * 60 + Number(minutesPart ?? 0);
}
