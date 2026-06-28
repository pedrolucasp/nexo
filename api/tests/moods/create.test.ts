import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

const validMood = {
  selectedMood: 'GOOD',
  anxietyLevel: 2,
  stressLevel: 3,
  energyLevel: 7,
  moment: new Date().toISOString(),
  moodComponents: [{ component: 'JOY', intensity: 'MODERATE' }],
}

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('POST /moods', () => {
  it('creates a mood entry and returns it', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: validMood })

    expect(res.status).toBe(201)
    expect(res.body.mood.selectedMood).toBe('GOOD')
    expect(res.body.mood.energyLevel).toBe(7)
    expect(res.body.mood.moodComponents).toHaveLength(1)

    const dbMood = await db.mood.findFirst({ where: { userId: user.id } })
    expect(dbMood).not.toBeNull()
  })

  it('returns 400 for missing required fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: { selectedMood: 'GOOD' } })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeTruthy()
  })

  it('returns 401 without token', async () => {
    const res = await request(app).post('/moods').send({ mood: validMood })
    expect(res.status).toBe(401)
  })
})
