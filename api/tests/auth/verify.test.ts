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

describe('GET /auth/verify', () => {
  it('returns the token payload and a safe slice of the user', async () => {
    const user = await createTestUser(db, {
      email: 'verify@example.com',
      firstName: 'Pedro',
    })

    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/auth/verify')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
    expect(res.body.userId).toBe(user.id)
    expect(res.body.email).toBe('verify@example.com')
    expect(res.body.user.firstName).toBe('Pedro')
    expect(res.body.user.encryptedPassword).toBeUndefined()
  })

  it('returns 401 without an authorization header', async () => {
    const res = await request(app).get('/auth/verify')
    expect(res.status).toBe(401)
  })

  it('returns 401 for a malformed token', async () => {
    const res = await request(app)
      .get('/auth/verify')
      .set('Authorization', 'Bearer not.a.jwt')

    expect(res.status).toBe(401)
  })

  it('returns 404 when the token is valid but the user is gone', async () => {
    const token = generateTestToken(999999, 'ghost@example.com')

    const res = await request(app)
      .get('/auth/verify')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
