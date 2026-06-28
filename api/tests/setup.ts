import { vi } from 'vitest'

vi.mock('@app/lib/queue', () => ({
  bootWorkers: vi.fn(),
  closeAllWorkers: vi.fn(),
  closeAllQueues: vi.fn(),
  scheduleInsights: vi.fn(),
  getQueue: vi.fn(() => ({ add: vi.fn(), addBulk: vi.fn() })),
  MailJobName: {
    WelcomeEmail: 'mail:welcome',
    PasswordReset: 'mail:password-reset',
    ActivateAccountEmail: 'mail:activate-account',
  },
}))
