import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Both projects import source through the same `@app/*` alias the app uses
const appPaths = () => tsconfigPaths({ projects: ['./tsconfig.test.json'] })

export default defineConfig({
  test: {
    // Report-only: there is no threshold and CI does not gate on it. The point
    // is a visible unit-versus-integration ratio, not a build-breaking number.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
    projects: [
      // Pure tests: a single function, no HTTP, no database. No global mocks,
      // so files run in parallel and need no running stack. The token module
      // reads its secret at import time and this project runs without dotenv,
      // so the env carries it.
      {
        plugins: [appPaths()],
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/**/*.unit.test.ts'],
          fileParallelism: true,
          testTimeout: 15_000,
          env: { JWT_SECRET: 'unit-test-secret' },
        },
      },

      // Integration and job tests: real app and database, serial because every
      // file shares one database. Excludes the unit files so none runs twice.
      {
        plugins: [appPaths()],
        test: {
          name: 'db',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'tests/**/*.unit.test.ts'],
          setupFiles: ['./tests/setup.ts'],
          fileParallelism: false,
          testTimeout: 15_000,
          typecheck: {
            tsconfig: './tsconfig.test.json',
          },
        },
      },
    ],
  },
})
