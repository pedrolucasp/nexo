import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('POST /auth/login', () => {
  it('returns a token for valid credentials', async () => {
    await createTestUser(db, { email: 'login@example.com', password: 'senha123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'senha123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('returns 401 for wrong password', async () => {
    await createTestUser(db, { email: 'login@example.com', password: 'senha123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'errada' })

    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'naoexiste@example.com', password: 'qualquer' })

    expect(res.status).toBe(401)
  })
})
