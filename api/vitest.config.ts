import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Both projects import source through the same `@app/*` alias the app uses
const appPaths = () => tsconfigPaths({ projects: ['./tsconfig.test.json'] })

export default defineConfig({
  test: {
    // Every database test file truncates and repopulates the same database, so
    // they must not overlap. This has to live at the root: a project's own
    // `fileParallelism` is not honored, and the default (parallel) corrupts the
    // shared database across files.
    fileParallelism: false,

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
      // so files need no running stack. The token module reads its secret at
      // import time and this project runs without dotenv, so the env carries it.
      {
        plugins: [appPaths()],
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/**/*.unit.test.ts'],
          testTimeout: 15_000,
          env: { JWT_SECRET: 'unit-test-secret' },
        },
      },

      // Integration and job tests: real app and database. Excludes the unit
      // files so none runs twice.
      {
        plugins: [appPaths()],
        test: {
          name: 'db',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'tests/**/*.unit.test.ts'],
          setupFiles: ['./tests/setup.ts'],
          testTimeout: 15_000,
          // Every request is logged by pino-http and most services log at info,
          // which buries the run output. Errors stay visible; override per-run
          // with LOG_LEVEL=debug (or any level) to see everything.
          env: { LOG_LEVEL: process.env.LOG_LEVEL || 'error' },
          typecheck: {
            tsconfig: './tsconfig.test.json',
          },
        },
      },
    ],
  },
})
