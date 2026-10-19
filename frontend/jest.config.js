/** @type {import('jest').Config} */
module.exports = {
  // The runner Expo ships for this SDK. Android-only, like the app itself.
  preset: 'jest-expo/android',

  // The suite mirrors the source under its own `tests/` tree. Nothing under the
  // router's `app/` is ever matched, so expo-router cannot mistake a test for a
  // route. Pure tests carry the `.unit.test` suffix, mirroring the API.
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],

  // Source is imported through the same `@/` alias the app uses.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // One place shades the native/Expo boundary for the whole suite, so no
  // individual test re-stubs the device.
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Report-only, matching the API: the unit-versus-render ratio is visible but
  // never gates a build.
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'constants/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
  ],
  coverageReporters: ['text', 'html'],
};
