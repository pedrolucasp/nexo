import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'

const app = createApp()
const db = buildPrisma()

const moment = new Date().toISOString()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('POST /care-actions', () => {
  it('creates an ACTIVITY care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: {
          type: 'ACTIVITY',
          moment,
          activity: { type: 'WALK', duration: 30 },
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.careAction.type).toBe('ACTIVITY')
    expect(res.body.careAction.activity.type).toBe('WALK')
    expect(res.body.careAction.activity.duration).toBe(30)

    const dbRecord = await db.careAction.findFirst({ where: { userId: user.id } })
    expect(dbRecord).not.toBeNull()
  })

  it('creates an APPOINTMENT care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: {
          type: 'APPOINTMENT',
          moment,
          appointment: { type: 'ANALYST', duration: 50, note: 'Primeira sessão' },
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.careAction.type).toBe('APPOINTMENT')
    expect(res.body.careAction.appointment.type).toBe('ANALYST')
    expect(res.body.careAction.appointment.note).toBe('Primeira sessão')
  })

  it('creates a MEDICINE care action linked to an existing regimen', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const regimen = await db.medicineRegimen.create({
      data: {
        userId: user.id,
        name: 'Sertralina',
        dosage: '50mg',
        periodicity: 'DAILY',
        scheduledAt: [],
      },
    })

    const res = await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: {
          type: 'MEDICINE',
          moment,
          regimenId: regimen.id,
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.careAction.type).toBe('MEDICINE')
    expect(res.body.careAction.medicineLog.regimen.id).toBe(regimen.id)
  })

  it('creates a MEDICINE care action with inline medicine, creating a new regimen', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: {
          type: 'MEDICINE',
          moment,
          medicine: {
            name: 'Melatonina',
            dosage: '5mg',
            periodicity: 'DAILY',
            scheduledAt: ['22:00'],
          },
        },
      })

    expect(res.status).toBe(201)
    expect(res.body.careAction.medicineLog.regimen.name).toBe('Melatonina')

    const regimenCount = await db.medicineRegimen.count({ where: { userId: user.id } })
    expect(regimenCount).toBe(1)
  })

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/care-actions')
      .send({ careAction: { type: 'ACTIVITY', moment, activity: { type: 'WALK' } } })

    expect(res.status).toBe(401)
  })
})
