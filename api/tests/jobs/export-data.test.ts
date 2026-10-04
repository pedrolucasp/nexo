import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest'
import JSZip from 'jszip'
import { exportProcessor } from '@app/lib/queue/processors/exports'
import { ExportJobName } from '@app/lib/queue/types'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

// Intercept all Resend calls
vi.mock('@app/lib/mail', () => ({
  sendEmail: vi.fn().mockResolvedValue({
    data: { id: 'fake-email-id' },
    error: null,
  }),
}))

import { sendEmail } from '@app/lib/mail'
const mockedSendEmail = vi.mocked(sendEmail)

const db = buildPrisma()

const buildJob = (data: unknown, overrides: Record<string, unknown> = {}) =>
  ({
    name: ExportJobName.Data,
    data,
    attemptsMade: 0,
    opts: { attempts: 3 },
    ...overrides,
  }) as any

async function attachmentFromLastEmail() {
  const calls = mockedSendEmail.mock.calls
  const [payload] = calls[calls.length - 1]
  const [attachment] = payload.attachments!

  return { payload, attachment }
}

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)
  mockedSendEmail.mockClear()
  mockedSendEmail.mockResolvedValue({ data: { id: 'fake-email-id' }, error: null } as any)
})

describe('exportProcessor', () => {
  it('emails a zip with the profile CSV and a manifest', async () => {
    const user = await createTestUser(db, {
      email: 'export@example.com',
      firstName: 'Ana',
      lastName: 'Silva',
    })

    await exportProcessor(buildJob({ userId: user.id }))

    expect(mockedSendEmail).toHaveBeenCalledOnce()

    const { payload, attachment } = await attachmentFromLastEmail()
    expect(payload.to).toBe('export@example.com')
    expect(payload.subject).toBe('Seus dados do nexo')
    expect(attachment.filename).toMatch(/^nexo-dados-\d{4}-\d{2}-\d{2}\.zip$/)

    const zip = await JSZip.loadAsync(attachment.content)
    expect(Object.keys(zip.files).sort()).toEqual(['leia-me.md', 'profile.csv'])

    const csv = await zip.file('profile.csv')!.async('string')
    expect(csv.startsWith('\ufeff')).toBe(true)

    const lines = csv.slice(1).split('\r\n').filter(Boolean)
    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('Nome')
    expect(lines[0]).toContain('Email')

    const [row] = lines.slice(1)
    expect(row).toContain('"Ana"')
    expect(row).toContain('"Silva"')
    expect(row).toContain('"export@example.com"')
    expect(row).toContain('"Sim"') // notifications default to enabled
    expect(row).toContain('"Não"') // freshly created users are inactive

    // Secrets must never travel in the export
    const lower = csv.toLowerCase()
    expect(lower).not.toContain('senha')
    expect(lower).not.toContain('token')
    expect(lower).not.toContain('push')
    expect(lower).not.toContain('avatar')

    const manifest = await zip.file('leia-me.md')!.async('string')
    expect(manifest).toContain('`profile.csv`')
    expect(manifest).toContain('1 registro')
    expect(manifest).toContain('_id')
  })

  it('preserves commas, quotes and newlines inside a field', async () => {
    const user = await createTestUser(db, {
      email: 'quoted@example.com',
      lastName: 'Silva, "S"\nJunior',
    })

    await exportProcessor(buildJob({ userId: user.id }))

    const { attachment } = await attachmentFromLastEmail()
    const zip = await JSZip.loadAsync(attachment.content)
    const csv = await zip.file('profile.csv')!.async('string')

    expect(csv).toContain('"Silva, ""S""\nJunior"')
  })

  it('sends the failure email only on the final attempt', async () => {
    const user = await createTestUser(db, { email: 'fail@example.com' })
    mockedSendEmail
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ data: { id: 'fake-email-id' }, error: null })

    await expect(
      exportProcessor(buildJob({ userId: user.id }, { attemptsMade: 2, opts: { attempts: 3 } }))
    ).rejects.toThrow('boom')

    expect(mockedSendEmail).toHaveBeenCalledTimes(2)
    expect(mockedSendEmail.mock.calls[1][0].subject).toBe(
      'Não conseguimos exportar seus dados'
    )
  })

  it('does not send the failure email on a non-final attempt', async () => {
    const user = await createTestUser(db, { email: 'retry@example.com' })
    mockedSendEmail.mockRejectedValueOnce(new Error('boom'))

    await expect(
      exportProcessor(buildJob({ userId: user.id }, { attemptsMade: 0, opts: { attempts: 3 } }))
    ).rejects.toThrow('boom')

    expect(mockedSendEmail).toHaveBeenCalledOnce()
  })

  it('throws for unknown job names', async () => {
    await expect(
      exportProcessor({ name: 'export:unknown', data: {} } as any)
    ).rejects.toThrow('Unknown export job')
  })
})
