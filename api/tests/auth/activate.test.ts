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
    expect(dbUser!.activationCodeExpiresAt).toBeNull()
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

  it('rejects a correctly issued code past its expiry', async () => {
    const user = await createTestUser(db, { email: 'expired@example.com' })
    await seedActivationCode(user.id, '123456', -1000)

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '123456' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBeTruthy()
  })

  it('rejects a code recorded without an expiry', async () => {
    const user = await createTestUser(db, { email: 'no-expiry@example.com' })
    await db.user.update({
      where: { id: user.id },
      data: { activationCode: '123456', activationCodeExpiresAt: null },
    })

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '123456' })

    expect(res.status).toBe(422)
  })

  it('returns 422 for a well-formed but unknown code', async () => {
    await createTestUser(db, { email: 'activate@example.com' })

    const res = await request(app)
      .post('/auth/activate')
      .send({ code: '999999' })

    expect(res.status).toBe(422)
    expect(res.body.error).toBeTruthy()
  })

  it('cannot tell an expired code from an unknown one', async () => {
    const user = await createTestUser(db, { email: 'indistinct@example.com' })
    await seedActivationCode(user.id, '123456', -1000)

    const expired = await request(app)
      .post('/auth/activate')
      .send({ code: '123456' })

    const unknown = await request(app)
      .post('/auth/activate')
      .send({ code: '654321' })

    expect(expired.status).toBe(unknown.status)
    expect(expired.body).toEqual(unknown.body)
  })

  it('leaves the stored code in place when an expired code is rejected', async () => {
    const user = await createTestUser(db, { email: 'no-reissue@example.com' })
    await seedActivationCode(user.id, '123456', -1000)

    await request(app).post('/auth/activate').send({ code: '123456' })

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.active).toBe(false)
    expect(dbUser!.activationCode).toBe('123456')
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
