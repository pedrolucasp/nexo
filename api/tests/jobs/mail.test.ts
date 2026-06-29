import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest'
import { sendWelcomeEmail } from '@app/services/mail/welcome'
import { sendActivateAccountEmail } from '@app/services/mail/sendActivateAccountEmail'
import { sendResetPasswordEmail } from '@app/services/mail/sendPasswordReset'
import { mailProcessor } from '@app/lib/queue/processors/mail'
import { MailJobName } from '@app/lib/queue/types'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

// Intercept all Resend calls
vi.mock('@app/lib/mail', () => ({
  sendEmail: vi.fn().mockResolvedValue({
    data: { id: 'fake-email-id' },
    error: null
  }),
}))

import { sendEmail } from '@app/lib/mail'
const mockedSendEmail = vi.mocked(sendEmail)

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)
  mockedSendEmail.mockClear()
})

describe('sendWelcomeEmail', () => {
  it('sends to the correct address with the activation code', async () => {
    const user = await createTestUser(db, {
      email: 'welcome@example.com',
      firstName: 'Maria'
    })

    await sendWelcomeEmail(user.id, '123456')

    expect(mockedSendEmail).toHaveBeenCalledOnce()
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'welcome@example.com',
        subject: expect.stringContaining('nexo'),
        text: expect.stringContaining('Maria'),
      })
    )

    // The code itself is in the body so the user knows what to enter
    const [call] = mockedSendEmail.mock.calls
    expect(call[0].text).toContain('123456')
  })
})

describe('sendActivateAccountEmail', () => {
  it('sends to the correct address with the activation code', async () => {
    const user = await createTestUser(db, {
      email: 'activate@example.com',
      firstName: 'João'
    })

    await sendActivateAccountEmail(user.id, '654321')

    expect(mockedSendEmail).toHaveBeenCalledOnce()
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'activate@example.com',
        text: expect.stringContaining('João'),
      })
    )
    const [call] = mockedSendEmail.mock.calls
    expect(call[0].text).toContain('654321')
  })
})

describe('sendResetPasswordEmail', () => {
  it('sends to the correct address with the reset token', async () => {
    const user = await createTestUser(db, {
      email: 'reset@example.com',
      firstName: 'Ana'
    })

    await sendResetPasswordEmail(user.id, 'token-abc-xyz')

    expect(mockedSendEmail).toHaveBeenCalledOnce()
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'reset@example.com',
        subject: expect.stringContaining('nexo'),
        text: expect.stringContaining('token-abc-xyz'),
      })
    )
  })
})

describe('mailProcessor', () => {
  it('dispatches a password reset email and awaits it', async () => {
    const user = await createTestUser(db, {
      email: 'proc@example.com',
      firstName: 'Lucas'
    })

    await mailProcessor({
      name: MailJobName.PasswordReset,
      data: { userId: user.id, token: 'reset-token-123' },
    } as any)

    expect(mockedSendEmail).toHaveBeenCalledOnce()
    expect(mockedSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'proc@example.com' })
    )
  })

  it('throws for unknown job names', async () => {
    await expect(
      mailProcessor({ name: 'mail:unknown', data: {} } as any)
    ).rejects.toThrow('Unknown mail job')
  })
})
