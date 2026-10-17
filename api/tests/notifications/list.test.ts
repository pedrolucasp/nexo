import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { NotificationKind } from '@prisma/client'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedNotification(
  userId: number,
  overrides: {
    kind?: NotificationKind
    title?: string
    body?: string
    scheduledFor?: Date
    regimenId?: number
  } = {},
) {
  return db.notification.create({
    data: {
      userId,
      kind: overrides.kind ?? NotificationKind.DAILY_REMINDER,
      title: overrides.title ?? 'Como você está?',
      body: overrides.body ?? 'Registre seu humor para acompanhar sua saúde.',
      scheduledFor: overrides.scheduledFor ?? new Date(),
      regimenId: overrides.regimenId ?? null,
    },
  })
}

describe('GET /notifications', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/notifications')

    expect(res.status).toBe(401)
  })

  it('returns an empty page when the user has none', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.notifications).toEqual([])
    expect(res.body.nextCursor).toBeNull()
  })

  it("returns the user's notifications newest first", async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const first = await seedNotification(user.id, { title: 'Primeira' })
    const second = await seedNotification(user.id, { title: 'Segunda' })
    const third = await seedNotification(user.id, { title: 'Terceira' })

    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.notifications.map((n: { id: number }) => n.id)).toEqual([
      third.id,
      second.id,
      first.id,
    ])
  })

  it("never returns another user's notifications", async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await seedNotification(user.id, { title: 'Minha' })
    await seedNotification(other.id, { title: 'Dele' })

    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.notifications).toHaveLength(1)
    expect(res.body.notifications[0].title).toBe('Minha')
  })

  it('pages newest first with a cursor', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const oldest = await seedNotification(user.id, { title: 'Mais antiga' })
    const middle = await seedNotification(user.id, { title: 'Do meio' })
    const newest = await seedNotification(user.id, { title: 'Mais nova' })

    const firstPage = await request(app)
      .get('/notifications?limit=2')
      .set('Authorization', `Bearer ${token}`)

    expect(firstPage.status).toBe(200)
    expect(firstPage.body.notifications.map((n: { id: number }) => n.id)).toEqual([
      newest.id,
      middle.id,
    ])
    expect(firstPage.body.nextCursor).toBe(middle.id)

    const secondPage = await request(app)
      .get(`/notifications?limit=2&cursor=${firstPage.body.nextCursor}`)
      .set('Authorization', `Bearer ${token}`)

    expect(secondPage.status).toBe(200)
    expect(secondPage.body.notifications.map((n: { id: number }) => n.id)).toEqual([
      oldest.id,
    ])
    expect(secondPage.body.nextCursor).toBeNull()
  })

  it('serializes only the fields the inbox needs', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    await seedNotification(user.id, { title: 'Como você está?' })

    const res = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`)

    const [notification] = res.body.notifications
    expect(notification).toMatchObject({
      kind: 'DAILY_REMINDER',
      title: 'Como você está?',
      body: 'Registre seu humor para acompanhar sua saúde.',
      regimenId: null,
    })
    expect(notification).not.toHaveProperty('userId')
    expect(notification).not.toHaveProperty('pushedAt')
  })

  it('rejects an out-of-range limit', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/notifications?limit=0')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })
})
