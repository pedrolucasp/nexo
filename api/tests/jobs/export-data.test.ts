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
      'activities.csv',
      'appointments.csv',
      'care_actions.csv',
      'insights.csv',
      'leia-me.md',
      'medicine_logs.csv',
      'medicine_regimens.csv',
      'mood_components.csv',
      'moods.csv',
      'profile.csv',
      'sleep_records.csv',
      'trigger_mood_links.csv',
      'triggers.csv',
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

  it('exports sleep records, triggers and their mood links', async () => {
    const user = await createTestUser(db, { email: 'timeline@example.com' })
    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GOOD',
        anxietyLevel: 3,
        stressLevel: 3,
        energyLevel: 6,
        moment: new Date('2026-03-05T10:00:00.000Z'),
      },
    })
    await db.sleepRecord.create({
      data: {
        userId: user.id,
        date: new Date('2026-03-05T00:00:00.000Z'),
        average: 7.5,
        annotations: 'Dormi bem, "profundo"',
      },
    })
    const trigger = await db.trigger.create({
      data: {
        userId: user.id,
        category: 'WORK',
        moment: new Date('2026-03-05T14:30:00.000Z'),
        comment: 'Reunião difícil',
      },
    })
    await db.trigger.create({
      data: {
        userId: user.id,
        category: 'HEALTH',
        moment: new Date('2026-03-05T18:00:00.000Z'),
        comment: 'Consulta',
      },
    })
    await db.triggerMoodLink.create({
      data: {
        triggerId: trigger.id,
        moodId: mood.id,
        perceivedImpact: 4,
        linkedAt: new Date('2026-03-05T15:00:00.000Z'),
      },
    })

    await exportProcessor(buildJob({ userId: user.id }))

    const { attachment } = await attachmentFromLastEmail()
    const zip = await JSZip.loadAsync(attachment.content)

    const sleepCsv = await zip.file('sleep_records.csv')!.async('string')
    const sleepLines = csvLines(sleepCsv)
    expect(sleepLines[0]).toContain('Data')
    expect(sleepLines[0]).toContain('Média')
    expect(sleepLines[0]).toContain('Anotações')
    expect(sleepLines[1]).toContain('"2026-03-05"')
    expect(sleepLines[1]).toContain('7.5')
    expect(sleepLines[1]).toContain('"Dormi bem, ""profundo"""')

    const triggersCsv = await zip.file('triggers.csv')!.async('string')
    const triggerLines = csvLines(triggersCsv)
    expect(triggerLines[0]).toContain('Categoria')
    expect(triggerLines[0]).toContain('Comentário')
    expect(triggerLines[1]).toContain('"Trabalho"')
    expect(triggerLines[1]).toContain('"Reunião difícil"')
    expect(triggerLines[2]).toContain('"Saúde"')

    const linksCsv = await zip.file('trigger_mood_links.csv')!.async('string')
    const linkLines = csvLines(linksCsv)
    expect(linkLines[0]).toContain('Impacto percebido')
    expect(linkLines[0]).toContain('Vinculado em')

    const header = linkLines[0].split(',').map((field) => field.replace(/"/g, ''))
    const fields = linkLines[1].split(',')
    expect(Number(fields[header.indexOf('trigger_id')])).toBe(trigger.id)
    expect(Number(fields[header.indexOf('mood_id')])).toBe(mood.id)

    const manifest = await zip.file('leia-me.md')!.async('string')
    expect(manifest).toContain('`sleep_records.csv` — 1 registro')
    expect(manifest).toContain('`triggers.csv` — 2 registros')
    expect(manifest).toContain('`trigger_mood_links.csv` — 1 registro')
  })

  it('exports care actions, their subtypes and medicine regimens', async () => {
    const user = await createTestUser(db, { email: 'care@example.com' })
    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GOOD',
        anxietyLevel: 3,
        stressLevel: 3,
        energyLevel: 6,
        moment: new Date('2026-03-05T10:00:00.000Z'),
      },
    })
    const trigger = await db.trigger.create({
      data: {
        userId: user.id,
        category: 'WORK',
        moment: new Date('2026-03-05T14:00:00.000Z'),
      },
    })
    const regimen = await db.medicineRegimen.create({
      data: {
        userId: user.id,
        name: 'Sertralina',
        dosage: '50mg',
        periodicity: 'DAILY',
        scheduledAt: ['08:00', '20:00'],
        active: true,
      },
    })

    const medicineAction = await db.careAction.create({
      data: {
        userId: user.id,
        type: 'MEDICINE',
        moment: new Date('2026-03-05T08:05:00.000Z'),
        triggerId: trigger.id,
        moodId: mood.id,
        medicineLog: {
          create: {
            regimenId: regimen.id,
            takenAt: new Date('2026-03-05T08:05:00.000Z'),
          },
        },
      },
      include: { medicineLog: true },
    })
    const appointmentAction = await db.careAction.create({
      data: {
        userId: user.id,
        type: 'APPOINTMENT',
        moment: new Date('2026-03-06T15:00:00.000Z'),
        appointment: {
          create: { type: 'ANALYST', duration: 50, note: 'Primeira sessão' },
        },
      },
      include: { appointment: true },
    })
    const activityAction = await db.careAction.create({
      data: {
        userId: user.id,
        type: 'ACTIVITY',
        moment: new Date('2026-03-07T07:30:00.000Z'),
        activity: { create: { type: 'WALK', duration: 30 } },
      },
      include: { activity: true },
    })

    await exportProcessor(buildJob({ userId: user.id }))

    const { attachment } = await attachmentFromLastEmail()
    const zip = await JSZip.loadAsync(attachment.content)

    for (const file of [
      'care_actions.csv',
      'medicine_logs.csv',
      'appointments.csv',
      'activities.csv',
      'medicine_regimens.csv',
    ]) {
      expect(zip.file(file)).not.toBeNull()
    }

    const careCsv = await zip.file('care_actions.csv')!.async('string')
    const careLines = csvLines(careCsv)
    expect(careLines[0]).toContain('Tipo')
    expect(careLines[0]).toContain('trigger_id')
    expect(careLines[0]).toContain('mood_id')
    expect(careLines[0]).toContain('Criado em')
    expect(careLines[0]).toContain('Atualizado em')
    expect(careCsv).toContain('"Medicação"')
    expect(careCsv).toContain('"Consulta"')
    expect(careCsv).toContain('"Atividade"')

    const careHeader = careLines[0].split(',').map((field) => field.replace(/"/g, ''))
    const idIndex = careHeader.indexOf('id')
    const triggerIndex = careHeader.indexOf('trigger_id')
    const moodIndex = careHeader.indexOf('mood_id')
    const careIds = new Set(
      careLines.slice(1).map((row) => Number(row.split(',')[idIndex])),
    )
    expect(careIds.size).toBe(3)

    const medicineRow = careLines.slice(1).find((row) => row.includes('"Medicação"'))!
    const medicineFields = medicineRow.split(',')
    expect(Number(medicineFields[triggerIndex])).toBe(trigger.id)
    expect(Number(medicineFields[moodIndex])).toBe(mood.id)

    const logsCsv = await zip.file('medicine_logs.csv')!.async('string')
    const logLines = csvLines(logsCsv)
    expect(logLines[0]).toContain('care_action_id')
    expect(logLines[0]).toContain('regimen_id')
    expect(logLines[0]).toContain('Tomado em')
    const logHeader = logLines[0].split(',').map((field) => field.replace(/"/g, ''))
    const logFields = logLines[1].split(',')
    expect(Number(logFields[logHeader.indexOf('care_action_id')])).toBe(medicineAction.id)
    expect(Number(logFields[logHeader.indexOf('regimen_id')])).toBe(regimen.id)

    const appointmentCsv = await zip.file('appointments.csv')!.async('string')
    const appointmentLines = csvLines(appointmentCsv)
    expect(appointmentLines[0]).toContain('Tipo')
    expect(appointmentLines[0]).toContain('Duração')
    expect(appointmentLines[0]).toContain('Observação')
    expect(appointmentCsv).toContain('"Analista"')
    expect(appointmentCsv).toContain('50')
    expect(appointmentCsv).toContain('"Primeira sessão"')
    const appointmentHeader = appointmentLines[0]
      .split(',')
      .map((field) => field.replace(/"/g, ''))
    expect(
      Number(appointmentLines[1].split(',')[appointmentHeader.indexOf('care_action_id')]),
    ).toBe(appointmentAction.id)

    const activityCsv = await zip.file('activities.csv')!.async('string')
    const activityLines = csvLines(activityCsv)
    expect(activityLines[0]).toContain('Duração')
    expect(activityCsv).toContain('"Caminhada"')
    expect(activityCsv).toContain('30')
    const activityHeader = activityLines[0].split(',').map((field) => field.replace(/"/g, ''))
    expect(
      Number(activityLines[1].split(',')[activityHeader.indexOf('care_action_id')]),
    ).toBe(activityAction.id)

    const regimenCsv = await zip.file('medicine_regimens.csv')!.async('string')
    const regimenLines = csvLines(regimenCsv)
    expect(regimenLines[0]).toContain('Nome')
    expect(regimenLines[0]).toContain('Dosagem')
    expect(regimenLines[0]).toContain('Periodicidade')
    expect(regimenLines[0]).toContain('Horários')
    expect(regimenLines[0]).toContain('Ativo')
    expect(regimenLines[1]).toContain('"Sertralina"')
    expect(regimenLines[1]).toContain('"50mg"')
    expect(regimenLines[1]).toContain('"Diário"')
    expect(regimenLines[1]).toContain('"08:00 · 20:00"')
    expect(regimenLines[1]).toContain('"Sim"')

    const manifest = await zip.file('leia-me.md')!.async('string')
    expect(manifest).toContain('`care_actions.csv` — 3 registros')
    expect(manifest).toContain('`medicine_logs.csv` — 1 registro')
    expect(manifest).toContain('`appointments.csv` — 1 registro')
    expect(manifest).toContain('`activities.csv` — 1 registro')
    expect(manifest).toContain('`medicine_regimens.csv` — 1 registro')
  })

  it('exports insights with pt-BR labels and JSON metadata', async () => {
    const user = await createTestUser(db, { email: 'insights@example.com' })
    await db.insight.create({
      data: {
        userId: user.id,
        type: 'WEEKLY_SUMMARY',
        period: 'WEEKLY',
        title: 'Sua semana',
        body: 'Você registrou sete dias.',
        metadata: { note: 'bom, "ótimo"' },
        generatedAt: new Date('2026-03-08T09:00:00.000Z'),
        periodStart: new Date('2026-03-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-07T23:59:59.000Z'),
      },
    })
    await db.insight.create({
      data: {
        userId: user.id,
        type: 'STREAK',
        period: 'DAILY',
        title: 'Sequência de 3 dias',
        body: 'Continue assim!',
        generatedAt: new Date('2026-03-09T09:00:00.000Z'),
        periodStart: new Date('2026-03-09T00:00:00.000Z'),
        periodEnd: new Date('2026-03-09T23:59:59.000Z'),
      },
    })

    await exportProcessor(buildJob({ userId: user.id }))

    const { attachment } = await attachmentFromLastEmail()
    const zip = await JSZip.loadAsync(attachment.content)

    const insightsCsv = await zip.file('insights.csv')!.async('string')
    const lines = csvLines(insightsCsv)
    expect(lines[0]).toContain('Tipo')
    expect(lines[0]).toContain('Período')
    expect(lines[0]).toContain('Título')
    expect(lines[0]).toContain('Corpo')
    expect(lines[0]).toContain('Metadados')
    expect(lines[0]).toContain('Início do período')
    expect(lines[0]).toContain('Fim do período')
    expect(lines[0]).toContain('Gerado em')
    expect(lines).toHaveLength(3)

    expect(insightsCsv).toContain('"Resumo Semanal"')
    expect(insightsCsv).toContain('"Semanal"')
    expect(insightsCsv).toContain('"Sequência"')
    expect(insightsCsv).toContain('"Diário"')

    // The JSON travels as one quoted cell; un-escaping it yields the original.
    const metadataCell = '"{""note"":""bom, \\""ótimo\\""""}"'
    expect(insightsCsv).toContain(metadataCell)
    const unescaped = metadataCell.slice(1, -1).replace(/""/g, '"')
    expect(JSON.parse(unescaped)).toEqual({ note: 'bom, "ótimo"' })

    const manifest = await zip.file('leia-me.md')!.async('string')
    expect(manifest).toContain('`insights.csv` — 2 registros')
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
