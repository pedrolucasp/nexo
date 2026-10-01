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

  it('reissues an activation code when an inactive user logs in with an expired one', async () => {
    const user = await createTestUser(db, { email: 'inactive@example.com', password: 'senha123' })
    await db.user.update({
      where: { id: user.id },
      data: {
        activationCode: '111111',
        activationCodeExpiresAt: new Date(Date.now() - 1000),
      },
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'inactive@example.com', password: 'senha123' })

    expect(res.status).toBe(200)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.activationCode).toMatch(/^\d{6}$/)
    expect(dbUser!.activationCode).not.toBe('111111')
    expect(dbUser!.activationCodeExpiresAt!.getTime()).toBeGreaterThan(Date.now())

    expect(recordedJobs).toContainEqual(
      expect.objectContaining({
        queue: 'mail',
        name: 'mail:activate-account',
        data: { userId: user.id, code: dbUser!.activationCode },
      })
    )
  })
})
