import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library doesn't auto-clean under Vitest's globals-off setup.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
