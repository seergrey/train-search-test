import { createBooking, getStations, getTrain, getTrains, resetSeats } from '../lib/api';
import type { Result } from '../lib/types';

/**
 * Contract check against the live API: every wrapper plus the expected
 * failure paths (404 / 400 / 409). Run with `npm run smoke`.
 * Mutates seat counts, so it resets the API at the end.
 */

function summarise<T>(result: Result<T>): string {
  if (result.ok) return `ok    ${JSON.stringify(result.data).slice(0, 110)}`;
  const { kind, status, message } = result.error;
  return `error kind=${kind} status=${status ?? '-'} "${message}"`;
}

async function check<T>(label: string, run: () => Promise<Result<T>>): Promise<void> {
  const startedAt = Date.now();
  const result = await run();
  const ms = Date.now() - startedAt;
  console.log(`${label.padEnd(26)} ${String(ms).padStart(5)}ms  ${summarise(result)}`);
}

async function main(): Promise<void> {
  await check('stations', () => getStations());
  await check('trains (sorted)', () => getTrains({ sortBy: 'price', sortOrder: 'asc', limit: 3 }));
  await check('trains (city + date)', () => getTrains({ from: 'berlin', to: 'munich' }));
  await check('trains (unknown city)', () => getTrains({ from: 'atlantis' }));
  await check('train 1', () => getTrain('1'));
  await check('train 99999 -> 404', () => getTrain('99999'));
  await check('booking bad id -> 400', () => createBooking({ trainId: 'nope' }));
  await check('booking 9999 -> 409', () => createBooking({ trainId: '2', seats: 9999 }));
  await check('booking 2 seats -> 201', () => createBooking({ trainId: '2', seats: 2 }));
  await check('reset', () => resetSeats());
}

void main();
