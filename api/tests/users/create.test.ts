import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('POST /users', () => {
  it('creates a user and returns a JWT token', async () => {
    const res = await request(app)
      .post('/users')
      .send({ user: { email: 'new@example.com', firstName: 'Novo', password: 'senha123' } })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()

    const dbUser = await db.user.findUnique({ where: { email: 'new@example.com' } })
    expect(dbUser).not.toBeNull()
    expect(dbUser!.firstName).toBe('Novo')
  })

  it('returns 409 for duplicate email', async () => {
    await db.user.create({
      data: { email: 'dup@example.com', firstName: 'A', encryptedPassword: 'x' },
    })

    const res = await request(app)
      .post('/users')
      .send({ user: { email: 'dup@example.com', firstName: 'B', password: 'senha123' } })

    expect(res.status).toBe(409)
  })

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/users')
      .send({ user: { email: 'x@example.com' } })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
    expect(res.body.fields).toBeTruthy()
  })
})
