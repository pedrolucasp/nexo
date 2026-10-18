import { vi } from 'vitest'

// The database project truncates and repopulates a real database on every run.
// The container's ambient DATABASE_URL points at orbit_dev, so a vitest
// invocation that skips the npm scripts' dotenv wrapper would silently wipe the
// development database. Only a database named like the test one is safe to run
// against, so anything not ending in `_test` is refused.
const TEST_DATABASE_SUFFIX = '_test'

const databaseNameOf = (url: string | undefined): string => {
  if (!url) return '(unset)'

  try {
    return new URL(url).pathname.replace(/^\//, '') || '(none)'
  } catch {
    return '(unparseable)'
  }
}

const database = databaseNameOf(process.env.DATABASE_URL)

if (!database.endsWith(TEST_DATABASE_SUFFIX)) {
  throw new Error(
    `Refusing to run against "${database}": the database project only runs ` +
      `against a database ending in "${TEST_DATABASE_SUFFIX}" (e.g. ` +
      'orbit_test). Use `npm test` or `npm run test:coverage`, which load ' +
      '.env.test.',
  )
}

// Mock the barrel export used by controllers and most services. `getQueue`
// returns a stable per-name mock so specs can assert on scheduled jobs via
// `recordedJobs` from ./mocks/queue
vi.mock('@app/lib/queue', async () => {
  const { getQueueMock } = await import('./mocks/queue')

  return {
    bootWorkers: vi.fn(),
    closeAllWorkers: vi.fn(),
    closeAllQueues: vi.fn(),
    scheduleInsights: vi.fn(),
    getQueue: (name: string) => getQueueMock(name),
    MailJobName: {
      WelcomeEmail: 'mail:welcome',
      PasswordReset: 'mail:password-reset',
      ActivateAccountEmail: 'mail:activate-account',
    },
  }
})

// syncMedicineReminderJobs imports getQueue directly from QueueRegistry
vi.mock('@app/lib/queue/QueueRegistry', async () => {
  const { getQueueMock } = await import('./mocks/queue')

  return {
    getQueue: (name: string) => getQueueMock(name),
    closeAllQueues: vi.fn(),
  }
})

// avatar.ts constructs multer-s3 at import time and requires S3_BUCKET env var.
// The replacement is a no-op middleware unless a spec stages a file through
// setUploadedFile (see ./mocks/avatar)
vi.mock('@app/services/avatar', async () => {
  const { avatarMulterMock } = await import('./mocks/avatar')

  return { default: avatarMulterMock }
})

// The avatar controller deletes the previous object through the S3 client
vi.mock('@app/lib/s3', () => ({
  default: { send: vi.fn().mockResolvedValue({}) },
}))
