'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Thin client boundary that carries the live `seatsLeft` count between the
 * (server-rendered, cacheable) summary card and the booking form, so a
 * successful booking updates just the badge — not the whole card — while
 * everything else in the tree stays a Server Component.
 */

interface SeatsLeftContextValue {
  seatsLeft: number;
  setSeatsLeft: (seatsLeft: number) => void;
}

const SeatsLeftContext = createContext<SeatsLeftContextValue | null>(null);

export function SeatsLeftProvider({
  initialSeatsLeft,
  children,
}: {
  initialSeatsLeft: number;
  children: ReactNode;
}) {
  const [seatsLeft, setSeatsLeft] = useState(initialSeatsLeft);
  return <SeatsLeftContext.Provider value={{ seatsLeft, setSeatsLeft }}>{children}</SeatsLeftContext.Provider>;
}

export function useSeatsLeft(): SeatsLeftContextValue {
  const context = useContext(SeatsLeftContext);
  if (!context) {
    throw new Error('useSeatsLeft must be used within a SeatsLeftProvider');
  }
  return context;
}
