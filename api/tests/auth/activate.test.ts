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

async function seedActivationCode(
  userId: number,
  code = '123456',
  expiresInMs = 5 * 60 * 1000
) {
  return db.user.update({
    where: { id: userId },
    data: {
      activationCode: code,
      activationCodeExpiresAt: new Date(Date.now() + expiresInMs),
    },
  })
}

describe('POST /auth/activate', () => {
  it('activates the user and clears the code', async () => {
    const user = await createTestUser(db, { email: 'activate@example.com' })
    await seedActivationCode(user.id)

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '123456' })

    expect(res.status).toBe(200)
    expect(res.body.user.active).toBe(true)
    expect(res.body.user.activationCode).toBeNull()

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.active).toBe(true)
    expect(dbUser!.activationCode).toBeNull()
  })

  it('activates an account whose code begins with zero', async () => {
    const user = await createTestUser(db, { email: 'leading-zero@example.com' })
    await seedActivationCode(user.id, '012345')

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '012345' })

    expect(res.status).toBe(200)
    expect(res.body.user.active).toBe(true)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.active).toBe(true)
    expect(dbUser!.activationCode).toBeNull()
  })

  it('returns 422 for a well-formed but unknown code', async () => {
    await createTestUser(db, { email: 'activate@example.com' })

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '999999' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBeTruthy()
  })

  it.each([
    ['too short', '12345'],
    ['too long', '1234567'],
    ['non-digit', '12a456'],
    ['a number', 123456],
  ])('rejects a code that is %s as malformed', async (_shape, code) => {
    await createTestUser(db, { email: 'activate@example.com' })

    const res = await request(app)
      .post('/auth/activate')
      .send({ code })

    expect(res.status).toBe(400)
    expect(res.body.fields.code).toBeTruthy()
  })
})

describe('POST /auth/resend_code', () => {
  it('issues a fresh activation code for the authenticated user', async () => {
    const user = await createTestUser(db, { email: 'resend@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/auth/resend_code')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.activationCode).toMatch(/^\d{6}$/)
    expect(dbUser!.activationCodeExpiresAt).not.toBeNull()
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/auth/resend_code')
    expect(res.status).toBe(401)
  })
})
