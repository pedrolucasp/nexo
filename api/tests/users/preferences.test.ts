import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { DailyReminderJobName } from '@app/lib/queue/types'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken,
} from '../test-helper'

import { recordedJobs, resetQueueMocks } from '../mocks/queue'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)

  resetQueueMocks()
})

describe('PATCH /users/me', () => {
  it('updates notification preferences and schedules a reminder', async () => {
    const user = await createTestUser(db, { email: 'prefs@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { notificationsEnabled: true, dailyReminderTime: '08:30' } })

    expect(res.status).toBe(200)
    expect(res.body.user.notificationsEnabled).toBe(true)
    expect(res.body.user.dailyReminderTime).toBe('08:30')

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.dailyReminderTime).toBe('08:30')

    expect(recordedJobs).toContainEqual(
      expect.objectContaining({
        queue: 'daily-reminders',
        name: DailyReminderJobName.Send,
        data: { userId: user.id },
      })
    )
  })

  it('accepts a null reminder time and schedules nothing', async () => {
    const user = await createTestUser(db, { email: 'prefs@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { dailyReminderTime: null } })

    expect(res.status).toBe(200)
    expect(res.body.user.dailyReminderTime).toBeNull()
    expect(recordedJobs).toHaveLength(0)
  })

  it('returns 400 for a malformed time', async () => {
    const user = await createTestUser(db, { email: 'prefs@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { dailyReminderTime: '9:5' } })

    expect(res.status).toBe(400)
    expect(res.body.fields).toBeTruthy()
  })

  it('returns 400 for a non-boolean notificationsEnabled', async () => {
    const user = await createTestUser(db, { email: 'prefs@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { notificationsEnabled: 'yes' } })

    expect(res.status).toBe(400)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .patch('/users/me')
      .send({ user: { notificationsEnabled: false } })

    expect(res.status).toBe(401)
  })
})
