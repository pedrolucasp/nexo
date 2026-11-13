import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedMood(userId: number) {
  return db.mood.create({
    data: {
      userId,
      selectedMood: 'GOOD',
      anxietyLevel: 2,
      stressLevel: 3,
      energyLevel: 7,
      moment: new Date(),
      annotation: 'registro privado',
      moodComponents: {
        create: [{ component: 'JOY', intensity: 'MODERATE' }],
      },
    },
  })
}

describe('GET /moods/:id', () => {
  it('returns the caller\'s own mood with its linked records', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(user.id)

    const trigger = await db.trigger.create({
      data: { userId: user.id, category: 'WORK', moment: new Date() },
    })
    await db.triggerMoodLink.create({
      data: { triggerId: trigger.id, moodId: mood.id, perceivedImpact: 4 },
    })

    const regimen = await db.medicineRegimen.create({
      data: {
        userId: user.id,
        name: 'Sertralina',
        dosage: '50mg',
        periodicity: 'DAILY',
      },
    })
    const careAction = await db.careAction.create({
      data: {
        userId: user.id,
        type: 'MEDICINE',
        moodId: mood.id,
        moment: new Date(),
      },
    })
    await db.medicineLog.create({
      data: {
        careActionId: careAction.id,
        regimenId: regimen.id,
        takenAt: new Date(),
      },
    })

    const res = await request(app)
      .get(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(mood.id)
    expect(res.body.triggerLinks).toHaveLength(1)
    expect(res.body.triggerLinks[0].trigger.id).toBe(trigger.id)
    expect(res.body.careActions).toHaveLength(1)
    expect(res.body.careActions[0].medicineLog.regimen.name).toBe('Sertralina')
    expect(res.body.careActions[0].medicineLog.regimen.dosage).toBe('50mg')
  })

  it('returns 404 for another user\'s mood without leaking its body', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)
    const mood = await seedMood(other.id)

    const res = await request(app)
      .get(`/moods/${mood.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ errors: 'Mood was not found' })
  })

  it('returns 404 when the mood does not exist', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/moods/999999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('returns 401 without a token', async () => {
    const user = await createTestUser(db)
    const mood = await seedMood(user.id)

    const res = await request(app).get(`/moods/${mood.id}`)

    expect(res.status).toBe(401)
  })
})
