import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createBooking, getTrain } from './api';
import { API_BASE_URL } from './config';

/**
 * `createBooking` isn't retried (see api.ts), so it's the cheapest endpoint
 * to exercise every status -> ApiErrorKind branch without eating retry
 * backoff delays in the test run.
 */

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ApiError.kind mapping', () => {
  it('maps 404 to not_found', async () => {
    server.use(
      http.get(`${API_BASE_URL}/trains/:id`, () =>
        HttpResponse.json({ error: 'Train not found' }, { status: 404 }),
      ),
    );

    const result = await getTrain('missing-id');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('not_found');
    expect(result.error.status).toBe(404);
    expect(result.error.message).toBe('Train not found');
  });

  it('maps 409 to conflict', async () => {
    server.use(
      http.post(`${API_BASE_URL}/bookings`, () =>
        HttpResponse.json({ error: 'Not enough seats left' }, { status: 409 }),
      ),
    );

    const result = await createBooking({ trainId: 'train-1', seats: 5 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('conflict');
    expect(result.error.status).toBe(409);
    expect(result.error.message).toBe('Not enough seats left');
  });

  it('maps 400 to validation', async () => {
    server.use(
      http.post(`${API_BASE_URL}/bookings`, () =>
        HttpResponse.json({ error: 'seats must be a positive integer' }, { status: 400 }),
      ),
    );

    const result = await createBooking({ trainId: 'train-1', seats: -1 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('validation');
    expect(result.error.status).toBe(400);
    expect(result.error.message).toBe('seats must be a positive integer');
  });

  it('maps an unreachable host / connection failure to network', async () => {
    server.use(http.post(`${API_BASE_URL}/bookings`, () => HttpResponse.error()));

    const result = await createBooking({ trainId: 'train-1' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('network');
    expect(result.error.status).toBeUndefined();
  });

  it('falls back to the default message when the error body has no `error` field', async () => {
    server.use(http.post(`${API_BASE_URL}/bookings`, () => HttpResponse.json({}, { status: 409 })));

    const result = await createBooking({ trainId: 'train-1' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('conflict');
    expect(result.error.message).toBe('Not enough seats left on this train.');
  });
});
