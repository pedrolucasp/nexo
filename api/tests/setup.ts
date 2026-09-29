import { vi } from 'vitest'

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
