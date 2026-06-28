import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken
} from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedSleepRecord(
  userId: number,
  overrides: { average?: number; annotations?: string } = {}
) {
  return db.sleepRecord.create({
    data: {
      userId,
      date: new Date(),
      average: overrides.average ?? 7,
      annotations: overrides.annotations,
    },
  })
}

describe('POST /sleep_records', () => {
  it('creates a sleep record and returns it', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/sleep_records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sleepRecord: {
          date: new Date().toISOString(),
          average: 8,
          annotations: 'Slept well',
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.sleepRecord.average).toBe(8)
    expect(res.body.sleepRecord.annotations).toBe('Slept well')

    const dbRecord = await db.sleepRecord.findFirst({ where: { userId: user.id } })

    expect(dbRecord).not.toBeNull()
  })

  it('returns 400 for out-of-range average', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/sleep_records')
      .set('Authorization', `Bearer ${token}`)
      .send({ sleepRecord: { date: new Date().toISOString(), average: 20 } })

    expect(res.status).toBe(400)
  })

  it('returns 400 for missing required fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/sleep_records')
      .set('Authorization', `Bearer ${token}`)
      .send({ sleepRecord: { annotations: 'No date or average' } })

    expect(res.status).toBe(400)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/sleep_records')
      .send({ sleepRecord: { date: new Date().toISOString(), average: 7 } })

    expect(res.status).toBe(401)
  })
})

describe('GET /sleep_records', () => {
  it('returns only the authenticated user\'s records', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await seedSleepRecord(user.id, { average: 6 })
    await seedSleepRecord(user.id, { average: 8 })
    await seedSleepRecord(other.id, { average: 5 })

    const res = await request(app)
      .get('/sleep_records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(2)
    expect(res.body.entries.every((r: any) => r.userId === user.id)).toBe(true)
  })

  it('returns an empty list when no records exist', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/sleep_records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toEqual([])
    expect(res.body.total).toBe(0)
  })
})

describe('GET /sleep_records/:id', () => {
  it('returns a single sleep record', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const record = await seedSleepRecord(
      user.id, { average: 9, annotations: 'Great night' }
    )

    const res = await request(app)
      .get(`/sleep_records/${record.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(record.id)
    expect(res.body.average).toBe(9)
    expect(res.body.annotations).toBe('Great night')
  })
})

describe('PUT /sleep_records/:id', () => {
  it('updates sleep record fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const record = await seedSleepRecord(user.id, { average: 5 })

    const res = await request(app)
      .put(`/sleep_records/${record.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ sleepRecord: { average: 10, annotations: 'Dreamt with Sade' } })

    expect(res.status).toBe(200)
    expect(res.body.sleepRecord.average).toBe(10)
    expect(res.body.sleepRecord.annotations).toBe('Dreamt with Sade')
  })
})

describe('DELETE /sleep_records/:id', () => {
  it('deletes a sleep record', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const record = await seedSleepRecord(user.id)

    const res = await request(app)
      .delete(`/sleep_records/${record.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const dbRecord = await db.sleepRecord.findUnique({
      where: { id: record.id }
    })

    expect(dbRecord).toBeNull()
  })
})
