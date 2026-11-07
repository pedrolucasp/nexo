import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken,
} from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedMood(userId: number, overrides: { createdAt?: Date } = {}) {
  return db.mood.create({
    data: {
      userId,
      selectedMood: 'GOOD',
      anxietyLevel: 2,
      stressLevel: 3,
      energyLevel: 7,
      moment: new Date(),
      annotation: 'registro original',
      moodComponents: {
        create: [{ component: 'JOY', intensity: 'MODERATE' }],
      },
      ...overrides,
    },
  })
}

describe('PUT /moods/:id', () => {
  it('updates the levels and annotation', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        mood: { selectedMood: 'SAD', anxietyLevel: 8, annotation: 'corrigido' },
      })

    expect(res.status).toBe(200)
    expect(res.body.mood.selectedMood).toBe('SAD')
    expect(res.body.mood.anxietyLevel).toBe(8)
    expect(res.body.mood.annotation).toBe('corrigido')
    // Untouched fields stay as they were
    expect(res.body.mood.energyLevel).toBe(7)
  })

  it('replaces the whole component set', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        mood: {
          moodComponents: [
            { component: 'CALM', intensity: 'HIGH' },
            { component: 'FOCUS', intensity: 'LIGHT' },
          ],
        },
      })

    expect(res.status).toBe(200)

    const components = await db.moodComponent.findMany({
      where: { moodId: mood.id },
    })

    expect(components).toHaveLength(2)
    expect(components.map((c) => c.component).sort()).toEqual(['CALM', 'FOCUS'])
  })

  it('returns 404 for another user\'s mood', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(other.id)

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: { anxietyLevel: 9 } })

    expect(res.status).toBe(404)
  })

  it('returns 403 once the editing window has closed', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id, {
      createdAt: new Date(Date.now() - 6 * 60 * 1000),
    })

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: { anxietyLevel: 9 } })

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Editing window has expired')

    const unchanged = await db.mood.findUnique({ where: { id: mood.id } })
    expect(unchanged?.anxietyLevel).toBe(2)
  })

  it('allows a backdated mood while the window is open', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)
    // The record describes yesterday but was written just now
    await db.mood.update({
      where: { id: mood.id },
      data: { moment: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: { anxietyLevel: 5 } })

    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid field values', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: { anxietyLevel: 42 } })

    expect(res.status).toBe(400)
  })

  it('returns 401 without a token', async () => {
    const user = await createTestUser(db)
    const mood = await seedMood(user.id)

    const res = await request(app)
      .put(`/moods/${mood.id}`)
      .send({ mood: { anxietyLevel: 5 } })

    expect(res.status).toBe(401)
  })
})

describe('DELETE /moods/:id', () => {
  it('deletes a mood inside the window', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)

    const res = await request(app)
      .delete(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    expect(await db.mood.findUnique({ where: { id: mood.id } })).toBeNull()
  })

  it('refuses to delete an expired mood', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id, {
      createdAt: new Date(Date.now() - 6 * 60 * 1000),
    })

    const res = await request(app)
      .delete(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(await db.mood.findUnique({ where: { id: mood.id } })).not.toBeNull()
  })

  it('returns 404 for another user\'s mood', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(other.id)

    const res = await request(app)
      .delete(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
