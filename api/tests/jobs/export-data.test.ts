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

const csvLines = (csv: string): string[] =>
  csv.slice(1).split('\r\n').filter(Boolean)

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
    expect(Object.keys(zip.files).sort()).toEqual([
      'leia-me.md',
      'mood_components.csv',
      'moods.csv',
      'profile.csv',
    ])

    const csv = await zip.file('profile.csv')!.async('string')
    expect(csv.startsWith('\ufeff')).toBe(true)

    const lines = csvLines(csv)
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

  it('exports mood entries and their components with pt-BR labels', async () => {
    const user = await createTestUser(db, { email: 'moods@example.com' })
    const firstMood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GREAT',
        anxietyLevel: 1,
        stressLevel: 2,
        energyLevel: 9,
        moment: new Date('2026-03-05T10:15:00.000Z'),
        annotation: 'Bom, "ótimo"\ndia',
        moodComponents: {
          create: [{ component: 'JOY', intensity: 'HIGH' }],
        },
      },
      include: { moodComponents: true },
    })
    const secondMood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'SAD',
        anxietyLevel: 6,
        stressLevel: 7,
        energyLevel: 3,
        moment: new Date('2026-03-06T21:40:00.000Z'),
        moodComponents: {
          create: [{ component: 'GRATITUDE', intensity: 'MODERATE' }],
        },
      },
      include: { moodComponents: true },
    })

    await exportProcessor(buildJob({ userId: user.id }))

    const { attachment } = await attachmentFromLastEmail()
    const zip = await JSZip.loadAsync(attachment.content)

    const moodsCsv = await zip.file('moods.csv')!.async('string')
    const moodLines = csvLines(moodsCsv)
    expect(moodLines[0]).toContain('Humor')
    expect(moodLines[0]).toContain('Anotação')
    expect(moodLines[1]).toContain('"Ótimo"')
    expect(moodLines[1]).toContain('"Bom, ""ótimo""\ndia"')
    expect(moodLines[2]).toContain('"Triste"')

    const componentsCsv = await zip.file('mood_components.csv')!.async('string')
    const componentLines = csvLines(componentsCsv)
    expect(componentLines[0]).toContain('Sentimento')
    expect(componentLines[0]).toContain('Intensidade')

    const moodIdFor = new Map(
      [...firstMood.moodComponents, ...secondMood.moodComponents].map((component) => [
        component.id,
        component.moodId,
      ]),
    )
    const header = componentLines[0].split(',').map((field) => field.replace(/"/g, ''))
    const idIndex = header.indexOf('id')
    const moodIdIndex = header.indexOf('mood_id')

    const componentRows = componentLines.slice(1)
    expect(componentRows).toHaveLength(2)
    for (const row of componentRows) {
      const fields = row.split(',')
      expect(Number(fields[moodIdIndex])).toBe(moodIdFor.get(Number(fields[idIndex])))
    }
    expect(componentsCsv).toContain('"Alegria"')
    expect(componentsCsv).toContain('"Intensa"')
    expect(componentsCsv).toContain('"Gratidão"')
    expect(componentsCsv).toContain('"Moderada"')

    const manifest = await zip.file('leia-me.md')!.async('string')
    expect(manifest).toContain('`moods.csv` — 2 registros')
    expect(manifest).toContain('`mood_components.csv` — 2 registros')
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
