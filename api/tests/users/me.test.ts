import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken, expectPublicUser } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('GET /users/me', () => {
  it('returns the authenticated user', async () => {
    const user = await createTestUser(db, { email: 'me@example.com', firstName: 'Pedro' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
    expect(res.body.user.firstName).toBe('Pedro')
    expectPublicUser(res.body.user)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/users/me')
    expect(res.status).toBe(401)
  })
})
