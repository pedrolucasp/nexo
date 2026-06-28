import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

async function seedRegimen(
  userId: number,
  overrides: { name?: string; active?: boolean } = {}
) {
  return db.medicineRegimen.create({
    data: {
      userId,
      name: overrides.name ?? 'Sertralina',
      dosage: '50mg',
      periodicity: 'DAILY',
      scheduledAt: [],
      active: overrides.active ?? true,
    },
  })
}

describe('POST /medicine-regimens', () => {
  it('creates a regimen and returns it', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/medicine-regimens')
      .set('Authorization', `Bearer ${token}`)
      .send({
        regimen: {
          name: 'Clonazepam',
          dosage: '0.5mg',
          periodicity: 'DAILY',
          scheduledAt: ['08:00', '20:00'],
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.regimen.name).toBe('Clonazepam')
    expect(res.body.regimen.active).toBe(true)
    expect(res.body.regimen.scheduledAt).toEqual(['08:00', '20:00'])

    const dbRecord = await db.medicineRegimen.findFirst({
      where: { userId: user.id }
    })

    expect(dbRecord).not.toBeNull()
  })

  it('returns 400 for missing required fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/medicine-regimens')
      .set('Authorization', `Bearer ${token}`)
      .send({ regimen: { name: 'X' } })

    expect(res.status).toBe(400)
  })
})

describe('GET /medicine-regimens', () => {
  it('returns all regimens for the user', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)

    await seedRegimen(user.id, { name: 'Sertralina' })
    await seedRegimen(user.id, { name: 'Ritalina' })
    await seedRegimen(other.id, { name: 'OutroMed' })

    const res = await request(app)
      .get('/medicine-regimens')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.regimens).toHaveLength(2)
    expect(res.body.regimens.every((r: any) => r.userId === user.id)).toBe(true)
  })
})

describe('GET /medicine-regimens/:id', () => {
  it('returns a single regimen', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const regimen = await seedRegimen(user.id)

    const res = await request(app)
      .get(`/medicine-regimens/${regimen.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.regimen.id).toBe(regimen.id)
    expect(res.body.regimen.name).toBe('Sertralina')
  })

  it('returns 404 for a regimen belonging to another user', async () => {
    const user = await createTestUser(db)
    const other = await createTestUser(db, { email: 'other@example.com' })
    const token = generateTestToken(user.id, user.email)
    const regimen = await seedRegimen(other.id)

    const res = await request(app)
      .get(`/medicine-regimens/${regimen.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('PATCH /medicine-regimens/:id', () => {
  it('updates regimen fields', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const regimen = await seedRegimen(user.id)

    const res = await request(app)
      .patch(`/medicine-regimens/${regimen.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ regimen: { dosage: '100mg', scheduledAt: ['09:00'] } })

    expect(res.status).toBe(200)
    expect(res.body.regimen.dosage).toBe('100mg')
    expect(res.body.regimen.scheduledAt).toEqual(['09:00'])
  })
})

describe('PATCH /medicine-regimens/:id/active', () => {
  it('deactivates a regimen', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const regimen = await seedRegimen(user.id, { active: true })

    const res = await request(app)
      .patch(`/medicine-regimens/${regimen.id}/active`)
      .set('Authorization', `Bearer ${token}`)
      .send({ active: false })

    expect(res.status).toBe(200)
    expect(res.body.regimen.active).toBe(false)

    const dbRecord = await db.medicineRegimen.findUnique({
      where: { id: regimen.id }
    })

    expect(dbRecord!.active).toBe(false)
  })
})

describe('DELETE /medicine-regimens/:id', () => {
  it('deactivates (soft-deletes) the regimen', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)
    const regimen = await seedRegimen(user.id, { active: true })

    const res = await request(app)
      .delete(`/medicine-regimens/${regimen.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const dbRecord = await db.medicineRegimen.findUnique({
      where: { id: regimen.id }
    })

    expect(dbRecord).not.toBeNull()
    expect(dbRecord!.active).toBe(false)
  })
})

describe('GET /medicine-regimens/today', () => {
  it('returns active regimens with their logs', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    await seedRegimen(user.id, { name: 'Melatonina', active: true })
    await seedRegimen(user.id, { name: 'Inativa', active: false })

    const res = await request(app)
      .get('/medicine-regimens/today')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.regimens).toHaveLength(1)
    expect(res.body.regimens[0].regimen.name).toBe('Melatonina')
    expect(res.body.regimens[0].logs).toBeInstanceOf(Array)
  })
})
