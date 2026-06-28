import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken
} from '../test-helper'

const app = createApp()
const db = buildPrisma()

const moment = new Date().toISOString()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('Medicine logs (via POST /care-actions)', () => {
  it('creates a medicine log linked to an existing regimen', async () => {
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
        careAction: { type: 'MEDICINE', moment, regimenId: regimen.id },
      })

    expect(res.status).toBe(201)

    const log = await db.medicineLog.findFirst({
      where: { regimenId: regimen.id },
      include: { regimen: true },
    })

    expect(log).not.toBeNull()
    expect(log!.regimen.name).toBe('Sertralina')
    expect(log!.regimen.dosage).toBe('50mg')
  })

  it('creates a medicine log and a new regimen when sending inline medicine', async () => {
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

    const regimen = await db.medicineRegimen.findFirst({ where: { userId: user.id } })
    expect(regimen).not.toBeNull()
    expect(regimen!.name).toBe('Melatonina')

    const log = await db.medicineLog.findFirst({
      where: { regimenId: regimen!.id },
    })
    expect(log).not.toBeNull()
  })

  it('links the medicine log to the care action', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const regimen = await db.medicineRegimen.create({
      data: {
        userId: user.id,
        name: 'Ritalina',
        dosage: '10mg',
        periodicity: 'DAILY',
        scheduledAt: [],
      },
    })

    const res = await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: { type: 'MEDICINE', moment, regimenId: regimen.id },
      })

    expect(res.status).toBe(201)

    const careActionId = res.body.careAction.id
    const careAction = await db.careAction.findUnique({
      where: { id: careActionId },
      include: { medicineLog: { include: { regimen: true } } },
    })

    expect(careAction!.medicineLog).not.toBeNull()
    expect(careAction!.medicineLog!.regimenId).toBe(regimen.id)
  })

  it('records the taken time on the medicine log', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const regimen = await db.medicineRegimen.create({
      data: {
        userId: user.id,
        name: 'Clonazepam',
        dosage: '0.5mg',
        periodicity: 'DAILY',
        scheduledAt: [],
      },
    })

    const takenAt = new Date().toISOString()

    await request(app)
      .post('/care-actions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careAction: { type: 'MEDICINE', moment: takenAt, regimenId: regimen.id },
      })

    const log = await db.medicineLog.findFirst({ where: { regimenId: regimen.id } })
    expect(log).not.toBeNull()

    expect(
      new Date(log!.takenAt).getTime()
    ).toBeCloseTo(new Date(takenAt).getTime(), -3)
  })
})
