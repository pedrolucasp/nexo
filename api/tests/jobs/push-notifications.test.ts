import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest'
import { medicineReminderProcessor } from '@app/lib/queue/processors/medicineReminders'
import { dailyReminderProcessor } from '@app/lib/queue/processors/dailyReminders'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

// Prevent any Expo push API calls
vi.mock('@app/lib/sendPushNotification', () => ({
  sendPushNotification: vi.fn().mockResolvedValue(undefined),
}))

import { sendPushNotification } from '@app/lib/sendPushNotification'
const mockedSend = vi.mocked(sendPushNotification)

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)
  mockedSend.mockClear()
})

describe('medicineReminderProcessor', () => {
  it('stores a medicine notification for the dose time and pushes it', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[abc123]',
    })
    const regimen = await db.medicineRegimen.create({
      data: {
        name: 'Sertralina',
        dosage: '50mg',
        periodicity: 'DAILY',
        scheduledAt: ['08:00'],
        userId: user.id,
      },
    })

    await medicineReminderProcessor({
      data: {
        userId: user.id,
        regimenId: regimen.id,
        medicineName: 'Sertralina',
        dosage: '50mg',
        scheduledTime: '08:00',
      },
    } as any)

    const row = await db.notification.findFirst()
    expect(row).toMatchObject({
      userId: user.id,
      kind: 'MEDICINE_REMINDER',
      title: 'Hora de tomar Sertralina',
      body: '50mg',
      regimenId: regimen.id,
    })
    // 08:00 in São Paulo (UTC-3)
    expect(row?.scheduledFor.getUTCHours()).toBe(11)
    expect(row?.scheduledFor.getUTCMinutes()).toBe(0)
    expect(row?.pushedAt).not.toBeNull()

    expect(mockedSend).toHaveBeenCalledOnce()
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'ExponentPushToken[abc123]',
        title: 'Hora de tomar Sertralina',
        body: '50mg',
        data: expect.objectContaining({
          screen: 'medicine-regimens',
          regimenId: regimen.id,
          notificationId: row!.id,
        }),
      })
    )
  })

  it('stores the notification without pushing when the user has no token', async () => {
    const user = await createTestUser(db) // no pushToken
    const regimen = await db.medicineRegimen.create({
      data: {
        name: 'Ritalina',
        dosage: '10mg',
        periodicity: 'DAILY',
        scheduledAt: ['12:00'],
        userId: user.id,
      },
    })

    await medicineReminderProcessor({
      data: {
        userId: user.id,
        regimenId: regimen.id,
        medicineName: 'Ritalina',
        dosage: '10mg',
        scheduledTime: '12:00',
      },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
    const row = await db.notification.findFirst()
    expect(row?.kind).toBe('MEDICINE_REMINDER')
    expect(row?.pushedAt).toBeNull()
  })

  it('stores nothing when the user does not exist', async () => {
    await medicineReminderProcessor({
      data: {
        userId: 999999,
        regimenId: 1,
        medicineName: 'X',
        dosage: 'Y',
        scheduledTime: '08:00',
      },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
    expect(await db.notification.count()).toBe(0)
  })
})

describe('dailyReminderProcessor', () => {
  it('stores a daily notification for the reminder time and pushes it', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[daily123]',
      pushEnabled: true,
    })

    await dailyReminderProcessor({
      data: { userId: user.id, scheduledTime: '20:00' },
    } as any)

    const row = await db.notification.findFirst()
    expect(row).toMatchObject({
      userId: user.id,
      kind: 'DAILY_REMINDER',
      title: 'Como você está?',
      body: 'Registre seu humor para acompanhar sua saúde.',
    })
    // 20:00 in São Paulo (UTC-3)
    expect(row?.scheduledFor.getUTCHours()).toBe(23)
    expect(row?.scheduledFor.getUTCMinutes()).toBe(0)
    expect(row?.pushedAt).not.toBeNull()

    expect(mockedSend).toHaveBeenCalledOnce()
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'ExponentPushToken[daily123]',
        title: 'Como você está?',
        data: expect.objectContaining({
          screen: 'moods',
          notificationId: row!.id,
        }),
      })
    )
  })

  it('stores the notification without pushing when notifications are disabled', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[disabled]',
      pushEnabled: false,
    })

    await dailyReminderProcessor({
      data: { userId: user.id, scheduledTime: '20:00' },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
    const row = await db.notification.findFirst()
    expect(row?.kind).toBe('DAILY_REMINDER')
    expect(row?.pushedAt).toBeNull()
  })

  it('stores nothing when the user does not exist', async () => {
    await dailyReminderProcessor({
      data: { userId: 999999, scheduledTime: '20:00' },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
    expect(await db.notification.count()).toBe(0)
  })
})
