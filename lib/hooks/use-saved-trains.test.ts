import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSavedTrains } from './use-saved-trains';

const STORAGE_KEY = 'saved-trains';

function storedIds(): unknown {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

describe('useSavedTrains', () => {
  it('starts empty when nothing is stored', () => {
    const { result } = renderHook(() => useSavedTrains());
    expect(result.current.savedIds).toEqual([]);
    expect(result.current.isSaved('1')).toBe(false);
  });

  it('reads ids already in localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['7', '9']));
    const { result } = renderHook(() => useSavedTrains());
    expect(result.current.savedIds).toEqual(['7', '9']);
    expect(result.current.isSaved('9')).toBe(true);
  });

  it('saves a train and persists it', () => {
    const { result } = renderHook(() => useSavedTrains());
    act(() => result.current.toggle('42'));
    expect(result.current.isSaved('42')).toBe(true);
    expect(storedIds()).toEqual(['42']);
  });

  it('unsaves a train that was already saved', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['1', '2']));
    const { result } = renderHook(() => useSavedTrains());
    act(() => result.current.toggle('1'));
    expect(result.current.savedIds).toEqual(['2']);
    expect(storedIds()).toEqual(['2']);
  });

  // The reason for useSyncExternalStore over plain useState: every mounted
  // instance must see the same list, not just the one that was clicked.
  it('propagates a toggle to every mounted instance', () => {
    const first = renderHook(() => useSavedTrains());
    const second = renderHook(() => useSavedTrains());

    act(() => first.result.current.toggle('5'));

    expect(second.result.current.isSaved('5')).toBe(true);
  });

  it('picks up a write from another tab via the storage event', () => {
    const { result } = renderHook(() => useSavedTrains());

    act(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['99']));
      window.dispatchEvent(new Event('storage'));
    });

    expect(result.current.savedIds).toEqual(['99']);
  });

  it('ignores malformed JSON instead of throwing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    const { result } = renderHook(() => useSavedTrains());
    expect(result.current.savedIds).toEqual([]);
  });

  it('ignores a stored value that is not an array', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }));
    const { result } = renderHook(() => useSavedTrains());
    expect(result.current.savedIds).toEqual([]);
  });

  it('drops non-string entries from a mixed array', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['1', 2, null, '3']));
    const { result } = renderHook(() => useSavedTrains());
    expect(result.current.savedIds).toEqual(['1', '3']);
  });
});
