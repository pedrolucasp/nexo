import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken,
  expectPublicUser,
} from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('POST /users/me/onboarding/complete', () => {
  it('records the completion and returns the public user', async () => {
    const user = await createTestUser(db, { email: 'onboarding@example.com' })
    const token = generateTestToken(user.id, user.email)

    expect(user.onboardingSeenAt).toBeNull()

    const res = await request(app)
      .post('/users/me/onboarding/complete')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.onboardingSeenAt).not.toBeNull()
    expectPublicUser(res.body.user)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.onboardingSeenAt).not.toBeNull()
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/users/me/onboarding/complete')
    expect(res.status).toBe(401)
  })
})
