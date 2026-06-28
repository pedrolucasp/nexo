import { vi } from 'vitest'

const mockQueue = () => ({
  add: vi.fn().mockResolvedValue({}),
  addBulk: vi.fn().mockResolvedValue([]),
  getRepeatableJobs: vi.fn().mockResolvedValue([]),
  removeRepeatableByKey: vi.fn().mockResolvedValue(undefined),
})

// Mock the barrel export used by controllers and most services
vi.mock('@app/lib/queue', () => ({
  bootWorkers: vi.fn(),
  closeAllWorkers: vi.fn(),
  closeAllQueues: vi.fn(),
  scheduleInsights: vi.fn(),
  getQueue: vi.fn(() => mockQueue()),
  MailJobName: {
    WelcomeEmail: 'mail:welcome',
    PasswordReset: 'mail:password-reset',
    ActivateAccountEmail: 'mail:activate-account',
  },
}))

// syncMedicineReminderJobs imports getQueue directly from QueueRegistry
vi.mock('@app/lib/queue/QueueRegistry', () => ({
  getQueue: vi.fn(() => mockQueue()),
  closeAllQueues: vi.fn(),
}))

// avatar.ts constructs multer-s3 at import time and requires S3_BUCKET env var
vi.mock('@app/services/avatar', () => ({
  default: { single: vi.fn(() => (_req: any, _res: any, next: any) => next()) },
}))
