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

describe('PUT /users/:id', () => {
  it('updates the authenticated user without leaking secrets', async () => {
    const user = await createTestUser(db, {
      email: 'profile@example.com',
      firstName: 'Old',
    })

    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          id: user.id,
          firstName: 'New',
          lastName: 'Name',
        },
      })

    expect(res.status).toBe(200)
    expect(res.body.user.firstName).toBe('New')
    expect(res.body.user.lastName).toBe('Name')
    expect(res.body.user.encryptedPassword).toBeUndefined()
    expect(res.body.user.passwordResetToken).toBeUndefined()

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.firstName).toBe('New')
  })

  it('returns 401 without a token', async () => {
    const user = await createTestUser(db)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .send({ user: { id: user.id, firstName: 'Nope' } })

    expect(res.status).toBe(401)

    const dbUser = await db.user.findUnique({ where: { id: user.id } })
    expect(dbUser!.firstName).not.toBe('Nope')
  })

  it('forbids updating another user', async () => {
    const user = await createTestUser(db)
    const victim = await createTestUser(db, {
      email: 'victim@example.com',
      firstName: 'Victim',
    })

    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .put(`/users/${victim.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { id: victim.id, firstName: 'Hacked' } })

    expect(res.status).toBe(403)

    const dbVictim = await db.user.findUnique({ where: { id: victim.id } })

    expect(dbVictim!.firstName).toBe('Victim')
  })

  it('returns 404 when the user no longer exists', async () => {
    const token = generateTestToken(999999, 'ghost@example.com')

    const res = await request(app)
      .put('/users/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { id: 999999, firstName: 'Ghost' } })

    expect(res.status).toBe(404)
  })

  it('returns 400 for an invalid email', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { id: user.id, email: 'not-an-email' } })

    expect(res.status).toBe(400)
    expect(res.body.fields).toBeTruthy()
  })

  it('returns 409 when the email is already taken', async () => {
    const user = await createTestUser(db, { email: 'mine@example.com' })
    await createTestUser(db, { email: 'taken@example.com' })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user: { id: user.id, email: 'taken@example.com' } })

    expect(res.status).toBe(409)
  })
})
