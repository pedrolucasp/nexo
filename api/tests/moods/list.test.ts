import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('GET /moods', () => {
  it('returns an empty list when no moods exist', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/moods')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toEqual([])
    expect(res.body.total).toBe(0)
  })

  it('returns moods belonging to the authenticated user', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await db.mood.create({
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
    await db.mood.create({
      data: {
        userId: other.id,
        selectedMood: 'SAD',
        anxietyLevel: 5,
        stressLevel: 5,
        energyLevel: 2,
        moment: new Date(),
        moodComponents: { create: [{ component: 'SADNESS', intensity: 'HIGH' }] },
      },
    })

    const res = await request(app)
      .get('/moods')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(1)
    expect(res.body.entries[0].selectedMood).toBe('GOOD')
    expect(res.body.total).toBe(1)
  })

  it('paginates results', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    for (let i = 0; i < 5; i++) {
      await db.mood.create({
        data: {
          userId: user.id,
          selectedMood: 'NEUTRAL',
          anxietyLevel: 3,
          stressLevel: 3,
          energyLevel: 5,
          moment: new Date(Date.now() - i * 60_000),
          moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
        },
      })
    }

    const res = await request(app)
      .get('/moods?limit=2&page=1')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.entries).toHaveLength(2)
    expect(res.body.total).toBe(5)
    expect(res.body.nextPage).toBe(2)
  })
})
