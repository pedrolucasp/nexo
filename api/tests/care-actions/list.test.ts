import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedActivity(userId: number, overrides: { moment?: Date } = {}) {
  return db.careAction.create({
    data: {
      userId,
      type: 'ACTIVITY',
      moment: overrides.moment ?? new Date(),
      activity: { create: { type: 'WALK' } },
    },
  })
}

describe('GET /care-actions', () => {
  it('returns an empty list when no actions exist', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/care-actions')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toEqual([])
    expect(res.body.total).toBe(0)
  })

  it('returns only the authenticated user\'s actions', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await seedActivity(user.id)
    await seedActivity(other.id)

    const res = await request(app)
      .get('/care-actions')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(1)
    expect(res.body.entries[0].userId).toBe(user.id)
  })

  it('filters by type', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    await seedActivity(user.id)
    await db.careAction.create({
      data: {
        userId: user.id,
        type: 'APPOINTMENT',
        moment: new Date(),
        appointment: { create: { type: 'GP', duration: 30 } },
      },
    })

    const res = await request(app)
      .get('/care-actions?type=ACTIVITY')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(1)
    expect(res.body.entries[0].type).toBe('ACTIVITY')
  })
})

describe('GET /care-actions/:id', () => {
  it('returns a single care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const action = await seedActivity(user.id)

    const res = await request(app)
      .get(`/care-actions/${action.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(action.id)
  })
})

describe('PATCH /care-actions/:id', () => {
  it('links a care action to a mood', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const action = await seedActivity(user.id)

    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GOOD',
        anxietyLevel: 1,
        stressLevel: 1,
        energyLevel: 8,
        moment: new Date(),
        moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
      },
    })

    const res = await request(app)
      .patch(`/care-actions/${action.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { moodId: mood.id } })

    expect(res.status).toBe(200)
    expect(res.body.moodId).toBe(mood.id)
  })
})

describe('DELETE /care-actions/:id', () => {
  it('deletes a care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const action = await seedActivity(user.id)

    const res = await request(app)
      .delete(`/care-actions/${action.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const dbRecord = await db.careAction.findUnique({ where: { id: action.id } })
    expect(dbRecord).toBeNull()
  })
})
