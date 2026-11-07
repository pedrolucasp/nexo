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

const sixMinutesAgo = () => new Date(Date.now() - 6 * 60 * 1000)

async function seedAppointment(userId: number, createdAt?: Date) {
  return db.careAction.create({
    data: {
      userId,
      type: 'APPOINTMENT',
      moment: new Date(),
      ...(createdAt && { createdAt }),
      appointment: {
        create: { type: 'ANALYST', duration: 50, note: 'primeira sessão' },
      },
    },
  })
}

async function seedActivity(userId: number, createdAt?: Date) {
  return db.careAction.create({
    data: {
      userId,
      type: 'ACTIVITY',
      moment: new Date(),
      ...(createdAt && { createdAt }),
      activity: { create: { type: 'WALK', duration: 30 } },
    },
  })
}

describe('PATCH /care-actions/:id (content)', () => {
  it('updates an appointment type, duration and note', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedAppointment(user.id)

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: {
          appointment: {
            type: 'PSYCHIATRIST',
            duration: 30,
            note: 'ajustei a medicação',
          },
        },
      })

    expect(res.status).toBe(200)
    expect(res.body.appointment.type).toBe('PSYCHIATRIST')
    expect(res.body.appointment.duration).toBe(30)
    expect(res.body.appointment.note).toBe('ajustei a medicação')
  })

  it('updates an activity type and duration', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id)

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { activity: { type: 'GYM', duration: 45 } } })

    expect(res.status).toBe(200)
    expect(res.body.activity.type).toBe('GYM')
    expect(res.body.activity.duration).toBe(45)
  })

  it('updates only the moment', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id)
    const moment = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { moment } })

    expect(res.status).toBe(200)
    expect(new Date(res.body.moment).toISOString()).toBe(moment)
  })

  it('refuses content changes once the window has closed', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id, sixMinutesAgo())

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { activity: { type: 'YOGA' } } })

    expect(res.status).toBe(403)

    const unchanged = await db.activity.findUnique({
      where: { careActionId: careAction.id },
    })
    expect(unchanged?.type).toBe('WALK')
  })

  it('allows a link-only update after the window has closed', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedAppointment(user.id, sixMinutesAgo())
    const mood = await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GOOD',
        anxietyLevel: 1,
        stressLevel: 1,
        energyLevel: 5,
        moment: new Date(),
        moodComponents: {
          create: [{ component: 'CALM', intensity: 'LIGHT' }],
        },
      },
    })

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { moodId: mood.id } })

    expect(res.status).toBe(200)
    expect(res.body.moodId).toBe(mood.id)
  })

  it('creates the subtype row when the care action had none', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await db.careAction.create({
      data: { userId: user.id, type: 'APPOINTMENT', moment: new Date() },
    })

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: { appointment: { type: 'GP', duration: 20 } },
      })

    expect(res.status).toBe(200)
    expect(res.body.appointment.type).toBe('GP')
  })

  it('rejects subtype fields that do not match the care action type', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id)

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { appointment: { duration: 30 } } })

    expect(res.status).toBe(400)
  })

  it('rejects unknown fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id)

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { type: 'MEDICINE' } })

    expect(res.status).toBe(400)
  })

  it('returns 404 for another user\'s care action', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(other.id)

    const res = await request(app)
      .patch(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ careAction: { activity: { type: 'YOGA' } } })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /care-actions/:id', () => {
  it('deletes inside the window', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id)

    const res = await request(app)
      .delete(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    expect(
      await db.careAction.findUnique({ where: { id: careAction.id } }),
    ).toBeNull()
  })

  it('refuses to delete an expired care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const careAction = await seedActivity(user.id, sixMinutesAgo())

    const res = await request(app)
      .delete(`/care-actions/${careAction.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)

    expect(
      await db.careAction.findUnique({ where: { id: careAction.id } }),
    ).not.toBeNull()
  })
})
