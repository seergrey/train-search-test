import { expect, test, type Page } from '@playwright/test';
import { createBooking, getStations, getTrains, resetSeats } from '../lib/api';
import type { Station, Train } from '../lib/types';

/**
 * Full booking flow against the live assignment API, no mocks: find a train
 * with few seats left via /trains, then race it — someone else books the
 * rest between our page load and our submit — so our attempt gets a real
 * 409. Checks that the "not enough seats" outcome is shown and that "back
 * to results" restores the from/to/date we searched with. Ends with /reset.
 */

test.afterAll(async () => {
  await resetSeatsWithRetry();
});

test('booking a train with no seats left shows a conflict message and a way back to the same search', async ({
  page,
}) => {
  await resetSeatsWithRetry(); // deterministic seat counts to start from

  const [trainsResult, stationsResult] = await Promise.all([getTrains({ limit: 100 }), getStations()]);
  if (!trainsResult.ok) throw new Error(`Could not load /trains for setup: ${trainsResult.error.message}`);
  if (!stationsResult.ok) throw new Error(`Could not load /stations for setup: ${stationsResult.error.message}`);

  const train = pickScarcestTrain(trainsResult.data.data);
  const fromSlug = slugFor(train.from, stationsResult.data);
  const toSlug = slugFor(train.to, stationsResult.data);

  await page.goto(`/search?from=${fromSlug}&to=${toSlug}&date=${train.departureDate}`);

  const trainLink = page.getByRole('list').getByRole('link', { name: train.trainNumber });
  await expect(trainLink).toHaveCount(1);
  await trainLink.click();

  await expect(page).toHaveURL(new RegExp(`/train/${train.id}(\\?|$)`));
  expectSearchParams(page, { from: fromSlug, to: toSlug, date: train.departureDate });

  const seatsSelect = page.getByLabel('Number of seats');
  await expect(seatsSelect).toHaveValue('1');

  // Someone else takes every remaining seat right now — the real-world race
  // that turns our still-open form into a 409 on submit.
  await bookAllSeatsWithRetry(train.id, train.seatsLeft);

  await seatsSelect.selectOption(String(Math.min(train.seatsLeft, 9)));
  await page.getByRole('button', { name: 'Book now' }).click();

  // The 409 response resolves to seatsLeft=0 client-side, so the booking
  // form's own sold-out state is what surfaces the "not enough seats"
  // outcome here — not a transient inline banner.
  await expect(page.getByText(/no seats left on this train/i)).toBeVisible();
  // Two "back" links exist on this page (the page-level one at the top, and
  // this component's own); the latter is the one that renders alongside the
  // sold-out message, so match it precisely.
  const backToResultsLink = page.getByRole('link', { name: 'Back to results', exact: true });
  await expect(backToResultsLink).toBeVisible();
  await backToResultsLink.click();

  await expect(page).toHaveURL(/\/search(\?|$)/);
  expectSearchParams(page, { from: fromSlug, to: toSlug, date: train.departureDate });
  await expect(page.getByRole('list').getByRole('link', { name: train.trainNumber })).toHaveCount(1);
});

function pickScarcestTrain(trains: readonly Train[]): Train {
  const bookable = trains.filter((train) => train.seatsLeft > 0);
  if (bookable.length === 0) throw new Error('No train with available seats found via /trains.');
  return bookable.reduce((scarcest, train) => (train.seatsLeft < scarcest.seatsLeft ? train : scarcest));
}

function slugFor(cityName: string, stations: readonly Station[]): string {
  const match = stations.find((station) => station.name.toLowerCase() === cityName.toLowerCase());
  if (!match) throw new Error(`No station slug found for city "${cityName}".`);
  return match.slug;
}

function expectSearchParams(page: Page, expected: { from: string; to: string; date: string }): void {
  const params = new URL(page.url()).searchParams;
  expect(params.get('from')).toBe(expected.from);
  expect(params.get('to')).toBe(expected.to);
  expect(params.get('date')).toBe(expected.date);
}

/**
 * createBooking is deliberately not retried in lib/api.ts (POST /bookings
 * isn't idempotent). Here it's test setup, not the flow under test — retrying
 * a handful of times makes the scenario reliable against the API's injected
 * 500s, which fail before touching seat counts.
 */
async function bookAllSeatsWithRetry(trainId: string, seats: number, attemptsLeft = 3): Promise<void> {
  const result = await createBooking({ trainId, seats });
  if (result.ok) return;
  if (result.error.kind !== 'unknown' || attemptsLeft <= 1) {
    throw new Error(`Could not reserve the remaining seats for setup: ${result.error.message}`);
  }
  await bookAllSeatsWithRetry(trainId, seats, attemptsLeft - 1);
}

async function resetSeatsWithRetry(attemptsLeft = 3): Promise<void> {
  const result = await resetSeats();
  if (result.ok) return;
  if (attemptsLeft <= 1) throw new Error(`Could not reset seats via /reset: ${result.error.message}`);
  await resetSeatsWithRetry(attemptsLeft - 1);
}
