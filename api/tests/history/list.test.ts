import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

const at = (iso: string) => new Date(iso)

async function seedMood(userId: number, moment: Date) {
  return db.mood.create({
    data: {
      userId,
      selectedMood: 'GOOD',
      anxietyLevel: 1,
      stressLevel: 1,
      energyLevel: 8,
      moment,
      moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
    },
  })
}

async function seedTrigger(userId: number, moment: Date) {
  return db.trigger.create({
    data: { userId, moment, category: 'WORK', comment: 'Reunião' },
  })
}

async function seedSleep(userId: number, date: Date, wakeMinutes?: number) {
  return db.sleepRecord.create({
    data: { userId, average: 8, date, annotations: 'Dormi bem', wakeMinutes },
  })
}

async function seedAppointment(userId: number, moment: Date) {
  return db.careAction.create({
    data: {
      userId,
      type: 'APPOINTMENT',
      moment,
      appointment: { create: { type: 'GP', duration: 50, note: 'Consulta' } },
    },
  })
}

async function seedMedicine(userId: number, moment: Date) {
  const regimen = await db.medicineRegimen.create({
    data: {
      userId,
      name: 'Sertralina',
      dosage: '50mg',
      periodicity: 'DAILY',
      scheduledAt: ['08:00'],
    },
  })

  return db.careAction.create({
    data: {
      userId,
      type: 'MEDICINE',
      moment,
      medicineLog: { create: { regimenId: regimen.id } },
    },
  })
}

const historyOrder = (body: { items: Array<{ kind: string; id: number }> }) =>
  body.items.map((item) => `${item.kind}:${item.id}`)

describe('GET /history', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/history')

    expect(res.status).toBe(401)
  })

  it('returns an empty page when the user has no records', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ items: [], nextCursor: null })
  })

  it("never returns another user's records", async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    const mine = await seedMood(user.id, at('2026-11-10T10:00:00.000Z'))
    await seedMood(other.id, at('2026-11-10T11:00:00.000Z'))

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([`mood:${mine.id}`])
  })

  it('merges all four kinds newest first', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const mood = await seedMood(user.id, at('2026-11-10T10:00:00.000Z'))
    const appointment = await seedAppointment(
      user.id,
      at('2026-11-10T11:00:00.000Z'),
    )
    const trigger = await seedTrigger(user.id, at('2026-11-10T12:00:00.000Z'))
    // Noon in America/Sao_Paulo is 15:00Z
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'))

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([
      `sleep:${sleep.id}`,
      `trigger:${trigger.id}`,
      `care_action:${appointment.id}`,
      `mood:${mood.id}`,
    ])
    expect(res.body.items[0].sortAt).toBe('2026-11-10T15:00:00.000Z')
    expect(res.body).not.toHaveProperty('total')
    expect(res.body).not.toHaveProperty('page')
  })

  it('breaks ties by kind, then by id', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const tied = at('2026-11-10T15:00:00.000Z')

    const firstMood = await seedMood(user.id, tied)
    const secondMood = await seedMood(user.id, tied)
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'))
    const trigger = await seedTrigger(user.id, tied)
    const appointment = await seedAppointment(user.id, tied)

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([
      `mood:${secondMood.id}`,
      `mood:${firstMood.id}`,
      `sleep:${sleep.id}`,
      `trigger:${trigger.id}`,
      `care_action:${appointment.id}`,
    ])
  })

  it('places a sleep record at noon of its day', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const before = await seedMood(user.id, at('2026-11-10T14:00:00.000Z'))
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'))
    const after = await seedMood(user.id, at('2026-11-10T16:00:00.000Z'))

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([
      `mood:${after.id}`,
      `sleep:${sleep.id}`,
      `mood:${before.id}`,
    ])
    expect(res.body.items[1].sortAt).toBe('2026-11-10T15:00:00.000Z')
  })

  it('places a sleep record at its wake time instead of noon', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    // 05:00, 06:30 and 09:00 in America/Sao_Paulo (UTC-3)
    const early = await seedMood(user.id, at('2026-11-10T08:00:00.000Z'))
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'), 390)
    const late = await seedMood(user.id, at('2026-11-10T12:00:00.000Z'))

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([
      `mood:${late.id}`,
      `sleep:${sleep.id}`,
      `mood:${early.id}`,
    ])
    expect(res.body.items[1].sortAt).toBe('2026-11-10T09:30:00.000Z')
  })

  it('pages through sleep records anchored at their wake time', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const early = await seedMood(user.id, at('2026-11-10T08:00:00.000Z'))
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'), 390)
    const late = await seedMood(user.id, at('2026-11-10T12:00:00.000Z'))

    const expected = [
      `mood:${late.id}`,
      `sleep:${sleep.id}`,
      `mood:${early.id}`,
    ]

    const seen: string[] = []
    let cursor: string | null = null

    for (let page = 0; page < 10; page++) {
      const query: string = cursor ? `?limit=1&cursor=${cursor}` : '?limit=1'
      const res = await request(app)
        .get(`/history${query}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      seen.push(...historyOrder(res.body))
      cursor = res.body.nextCursor

      if (!cursor) break
    }

    expect(cursor).toBeNull()
    expect(seen).toEqual(expected)
  })

  it('orders same-day sleep records by wake time, not id', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    // Inserted so the latest wake time has the lowest id: an id-ordered
    // prefilter would pick 05:00 instead
    const latest = await seedSleep(
      user.id,
      at('2026-11-10T00:00:00.000Z'),
      1100,
    )
    await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'), 300)
    await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'), 200)

    const res = await request(app)
      .get('/history?limit=1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([`sleep:${latest.id}`])
  })

  it('filters by type', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    await seedMood(user.id, at('2026-11-10T10:00:00.000Z'))
    const trigger = await seedTrigger(user.id, at('2026-11-10T12:00:00.000Z'))

    const res = await request(app)
      .get('/history?type=trigger')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(historyOrder(res.body)).toEqual([`trigger:${trigger.id}`])
    expect(res.body.nextCursor).toBeNull()
  })

  it('pages with a cursor without gaps or duplicates', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const seeded = []
    for (let i = 0; i < 7; i++) {
      const moment = at(`2026-11-10T${String(10 + i).padStart(2, '0')}:00:00.000Z`)
      seeded.push(
        i % 2 === 0
          ? `mood:${(await seedMood(user.id, moment)).id}`
          : `trigger:${(await seedTrigger(user.id, moment)).id}`,
      )
    }
    const expected = [...seeded].reverse()

    const seen: string[] = []
    let cursor: string | null = null

    for (let page = 0; page < 10; page++) {
      const query: string = cursor ? `?limit=2&cursor=${cursor}` : '?limit=2'
      const res = await request(app)
        .get(`/history${query}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      seen.push(...historyOrder(res.body))
      cursor = res.body.nextCursor

      if (!cursor) break
    }

    expect(cursor).toBeNull()
    expect(seen).toEqual(expected)
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('hydrates the relations the cards read', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    await seedMood(user.id, at('2026-11-10T10:00:00.000Z'))
    await seedAppointment(user.id, at('2026-11-10T11:00:00.000Z'))
    await seedMedicine(user.id, at('2026-11-10T12:00:00.000Z'))

    const res = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`)

    const mood = res.body.items.find(
      (item: { kind: string }) => item.kind === 'mood',
    )
    const appointment = res.body.items.find(
      (item: { kind: string; type?: string }) =>
        item.kind === 'care_action' && item.type === 'APPOINTMENT',
    )
    const medicine = res.body.items.find(
      (item: { kind: string; type?: string }) =>
        item.kind === 'care_action' && item.type === 'MEDICINE',
    )

    expect(mood.moodComponents).toHaveLength(1)
    expect(appointment.appointment).toMatchObject({ type: 'GP', duration: 50 })
    expect(medicine.medicineLog.regimen).toMatchObject({
      name: 'Sertralina',
      dosage: '50mg',
    })
  })

  it('walks a same-instant cluster larger than the page', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const tied = at('2026-11-10T15:00:00.000Z')
    const seeded = []

    for (let i = 0; i < 5; i++) {
      seeded.push(`mood:${(await seedMood(user.id, tied)).id}`)
    }

    const expected = [...seeded].reverse()
    const seen: string[] = []
    let cursor: string | null = null

    for (let page = 0; page < 10; page++) {
      const query: string = cursor ? `?limit=2&cursor=${cursor}` : '?limit=2'
      const res = await request(app)
        .get(`/history${query}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      seen.push(...historyOrder(res.body))
      cursor = res.body.nextCursor

      if (!cursor) break
    }

    expect(seen).toEqual(expected)
  })

  it('crosses midnight in the app timezone while paging', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    // 02:00Z on the 11th is still 23:00 of the 10th in America/Sao_Paulo, so
    // the sleep record of the 10th must follow it
    const mood = await seedMood(user.id, at('2026-11-11T02:00:00.000Z'))
    const sleep = await seedSleep(user.id, at('2026-11-10T00:00:00.000Z'))

    const first = await request(app)
      .get('/history?limit=1')
      .set('Authorization', `Bearer ${token}`)

    expect(historyOrder(first.body)).toEqual([`mood:${mood.id}`])
    expect(first.body.nextCursor).toEqual(expect.any(String))

    const second = await request(app)
      .get(`/history?limit=1&cursor=${first.body.nextCursor}`)
      .set('Authorization', `Bearer ${token}`)

    expect(historyOrder(second.body)).toEqual([`sleep:${sleep.id}`])
    expect(second.body.nextCursor).toBeNull()
  })

  it('rejects a malformed cursor', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/history?cursor=not-a-cursor')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
    expect(res.body.fields).toHaveProperty('cursor')
  })

  it.each(['limit=0', 'limit=101', 'limit=abc', 'type=insight'])(
    'rejects an invalid query (%s)',
    async (query) => {
      const user = await createTestUser(db)
      const token = generateTestToken(user.id, user.email)

      const res = await request(app)
        .get(`/history?${query}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
    },
  )
})
