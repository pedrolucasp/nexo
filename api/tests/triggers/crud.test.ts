import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

const moment = new Date().toISOString()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedTrigger(
  userId: number,
  overrides: { category?: string; comment?: string } = {}
) {
  return db.trigger.create({
    data: {
      userId,
      moment: new Date(),
      category: (overrides.category ?? 'WORK') as any,
      comment: overrides.comment,
    },
  })
}

describe('POST /triggers', () => {
  it('creates a trigger and returns it', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/triggers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        trigger: {
          moment,
          category: 'SOCIAL',
          comment: 'Reunião difícil',
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.trigger.category).toBe('SOCIAL')
    expect(res.body.trigger.comment).toBe('Reunião difícil')

    const dbRecord = await db.trigger.findFirst({ where: { userId: user.id } })

    expect(dbRecord).not.toBeNull()
  })

  it('returns 400 for missing required fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/triggers')
      .set('Authorization', `Bearer ${token}`)
      .send({ trigger: { comment: 'No category or moment' } })

    expect(res.status).toBe(400)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/triggers')
      .send({ trigger: { moment, category: 'WORK' } })

    expect(res.status).toBe(401)
  })
})

describe('GET /triggers', () => {
  it('returns only the authenticated user\'s triggers', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await seedTrigger(user.id, { category: 'WORK' })
    await seedTrigger(user.id, { category: 'FAMILY' })
    await seedTrigger(other.id, { category: 'HEALTH' })

    const res = await request(app)
      .get('/triggers')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(2)
    expect(res.body.entries.every((t: any) => t.userId === user.id)).toBe(true)
  })

  it('returns an empty list when no triggers exist', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/triggers')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toEqual([])
    expect(res.body.total).toBe(0)
  })
})

describe('GET /triggers/:id', () => {
  it('returns a single trigger', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id, {
      category: 'INTERNAL', comment: 'Anxious'
    })

    const res = await request(app)
      .get(`/triggers/${trigger.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(trigger.id)
    expect(res.body.category).toBe('INTERNAL')
    expect(res.body.comment).toBe('Anxious')
  })
})

describe('PUT /triggers/:id', () => {
  it('updates trigger fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id, { category: 'WORK' })

    const res = await request(app)
      .put(`/triggers/${trigger.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ trigger: { category: 'FAMILY', comment: 'Updated' } })

    expect(res.status).toBe(200)
    expect(res.body.trigger.category).toBe('FAMILY')
    expect(res.body.trigger.comment).toBe('Updated')
  })
})

describe('DELETE /triggers/:id', () => {
  it('deletes a trigger', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id)

    const res = await request(app)
      .delete(`/triggers/${trigger.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const dbRecord = await db.trigger.findUnique({ where: { id: trigger.id } })

    expect(dbRecord).toBeNull()
  })
})

describe('POST /triggers/:triggerId/link-mood', () => {
  it('links a trigger to a mood', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id)

    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'SAD',
        anxietyLevel: 4,
        stressLevel: 4,
        energyLevel: 2,
        moment: new Date(),
        moodComponents: { create: [{ component: 'FEAR', intensity: 'HIGH' }] },
      },
    })

    const res = await request(app)
      .post(`/triggers/${trigger.id}/link-mood`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moodId: mood.id, perceivedImpact: 3 })

    expect(res.status).toBe(201)
    expect(res.body.link.triggerId).toBe(trigger.id)
    expect(res.body.link.moodId).toBe(mood.id)
    expect(res.body.link.perceivedImpact).toBe(3)
  })

  it('returns 400 for invalid perceivedImpact', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id)

    const res = await request(app)
      .post(`/triggers/${trigger.id}/link-mood`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moodId: 1, perceivedImpact: 10 })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /triggers/:triggerId/link-mood/:moodId', () => {
  it('unlinks a trigger from a mood', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const trigger = await seedTrigger(user.id)

    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'SAD',
        anxietyLevel: 3,
        stressLevel: 3,
        energyLevel: 3,
        moment: new Date(),
        moodComponents: { create: [] },
      },
    })

    await db.triggerMoodLink.create({
      data: { triggerId: trigger.id, moodId: mood.id, perceivedImpact: 2 },
    })

    const res = await request(app)
      .delete(`/triggers/${trigger.id}/link-mood/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const link = await db.triggerMoodLink.findFirst({
      where: { triggerId: trigger.id, moodId: mood.id },
    })

    expect(link).toBeNull()
  })
})
