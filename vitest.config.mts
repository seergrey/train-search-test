import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = { '@': fileURLToPath(new URL('.', import.meta.url)) };

/**
 * Two projects in one run: pure modules under lib/ stay on the `node`
 * environment, while anything that renders React (UI primitives, the
 * localStorage-backed hook) gets jsdom. Keeps the fast majority of the
 * suite out of a DOM it doesn't need.
 */
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'lib',
          environment: 'node',
          include: ['lib/**/*.test.ts'],
          exclude: ['lib/hooks/**'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['./test/setup.ts'],
          include: ['components/**/*.test.tsx', 'lib/hooks/**/*.test.ts', 'lib/hooks/**/*.test.tsx'],
        },
      },
    ],
  },
});
