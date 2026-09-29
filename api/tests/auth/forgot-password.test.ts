import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'
import { recordedJobs, resetQueueMocks } from '../mocks/queue'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)

  resetQueueMocks()
})

describe('POST /auth/forgot-password', () => {
  it('stores a reset token and enqueues the email for a known user', async () => {
    const user = await createTestUser(db, { email: 'forgot@example.com' })

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'forgot@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeTruthy()

    const dbUser = await db.user.findUnique({ where: { id: user.id } })

    expect(dbUser!.passwordResetToken).toBe(res.body.token)
    expect(dbUser!.passwordResetExpires).not.toBeNull()

    expect(recordedJobs).toContainEqual(
      expect.objectContaining({
        queue: 'mail',
        name: 'mail:password-reset',
        data: { userId: user.id, token: res.body.token },
      })
    )
  })

  it('answers 200 without a token for an unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'ghost@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeUndefined()
    expect(recordedJobs).toHaveLength(0)
  })

  it('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
    expect(res.body.fields).toBeTruthy()
  })
})
