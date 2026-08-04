'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'saved-trains';
const SYNC_EVENT = 'saved-trains:sync';
const EMPTY_IDS: string[] = [];

export interface UseSavedTrainsResult {
  savedIds: string[];
  isSaved: (trainId: string) => boolean;
  toggle: (trainId: string) => void;
}

// getSnapshot must return a stable reference while the underlying value is
// unchanged (useSyncExternalStore requirement), so the parsed array is
// cached against the raw localStorage string instead of re-parsed per call.
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY_IDS;

function parseIds(raw: string | null): string[] {
  if (raw === null) return EMPTY_IDS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_IDS;
    const ids = parsed.filter((id): id is string => typeof id === 'string');
    return ids.length === 0 ? EMPTY_IDS : ids;
  } catch {
    return EMPTY_IDS;
  }
}

function readSavedIds(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedIds;
  cachedRaw = raw;
  cachedIds = parseIds(raw);
  return cachedIds;
}

function writeSavedIds(ids: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(SYNC_EVENT));
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(SYNC_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(SYNC_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getServerSnapshot(): string[] {
  return EMPTY_IDS;
}

/**
 * Bookmarked train ids for the "saved trains" feature — persisted as a
 * plain string[] in localStorage, no extra entities. Backed by
 * useSyncExternalStore so every mounted instance (any train-card, the
 * results list) reads the same value and re-renders together: on the
 * server and on the very first client render it returns `[]` (matches
 * SSR, localStorage isn't available there), then swaps to the real list
 * once React checks the client snapshot after hydration.
 */
export function useSavedTrains(): UseSavedTrainsResult {
  const savedIds = useSyncExternalStore(subscribe, readSavedIds, getServerSnapshot);

  const isSaved = useCallback((trainId: string) => savedIds.includes(trainId), [savedIds]);

  const toggle = useCallback((trainId: string) => {
    const current = readSavedIds();
    const next = current.includes(trainId)
      ? current.filter((id) => id !== trainId)
      : [...current, trainId];
    writeSavedIds(next);
  }, []);

  return { savedIds, isSaved, toggle };
}
