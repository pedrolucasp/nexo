import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedResetToken(
  userId: number,
  overrides: { token?: string; expiresAt?: Date } = {}
) {
  return db.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: overrides.token ?? 'reset-token-123',
      passwordResetExpires: overrides.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000),
    },
  })
}

describe('POST /auth/reset-password', () => {
  it('replaces the password and clears the reset token', async () => {
    const user = await createTestUser(db, {
      email: 'reset@example.com',
      password: 'old-password',
    })

    await seedResetToken(user.id)

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'reset-token-123', newPassword: 'brand-new-password' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.passwordResetToken).toBeNull()
    expect(dbUser!.passwordResetExpires).toBeNull()

    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'reset@example.com', password: 'brand-new-password' })

    expect(login.status).toBe(200)

    const oldLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'reset@example.com', password: 'old-password' })

    expect(oldLogin.status).toBe(401)
  })

  it('returns 400 for an expired token', async () => {
    const user = await createTestUser(db, { email: 'expired@example.com' })
    await seedResetToken(user.id, {
      token: 'stale-token',
      expiresAt: new Date(Date.now() - 60 * 1000),
    })

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'stale-token', newPassword: 'whatever-123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/token/i)
  })

  it('returns 400 for an unknown token', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'does-not-exist', newPassword: 'whatever-123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 for a too-short password', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'reset-token-123', newPassword: '123' })

    expect(res.status).toBe(400)
    expect(res.body.fields).toBeTruthy()
  })
})
