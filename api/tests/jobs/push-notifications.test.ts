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
  it('sends a push notification to a user with a push token', async () => {
    const user = await createTestUser(db, { pushToken: 'ExponentPushToken[abc123]' })

    await medicineReminderProcessor({
      data: {
        userId: user.id,
        regimenId: 1,
        medicineName: 'Sertralina',
        dosage: '50mg',
        scheduledTime: '08:00',
      },
    } as any)

    expect(mockedSend).toHaveBeenCalledOnce()
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'ExponentPushToken[abc123]',
        title: 'Hora de tomar Sertralina',
        body: '50mg',
        data: expect.objectContaining({ screen: 'medicine-regimens' }),
      })
    )
  })

  it('skips when the user has no push token', async () => {
    const user = await createTestUser(db) // no pushToken

    await medicineReminderProcessor({
      data: {
        userId: user.id,
        regimenId: 1,
        medicineName: 'Ritalina',
        dosage: '10mg',
        scheduledTime: '12:00'
      },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('skips when the user does not exist', async () => {
    await medicineReminderProcessor({
      data: {
        userId: 999999,
        regimenId: 1,
        medicineName: 'X',
        dosage: 'Y',
        scheduledTime: '08:00'
      },
    } as any)

    expect(mockedSend).not.toHaveBeenCalled()
  })
})

describe('dailyReminderProcessor', () => {
  it('sends a notification when user allows it and token is present', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[daily123]',
      notificationsEnabled: true,
    })

    await dailyReminderProcessor({ data: { userId: user.id } } as any)

    expect(mockedSend).toHaveBeenCalledOnce()
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'ExponentPushToken[daily123]',
        title: 'Como você está?',
        data: expect.objectContaining({ screen: 'moods' }),
      })
    )
  })

  it('skips when notifications are disabled', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[disabled]',
      notificationsEnabled: false,
    })

    await dailyReminderProcessor({ data: { userId: user.id } } as any)

    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('skips when the user has no push token', async () => {
    const user = await createTestUser(db, { notificationsEnabled: true })

    await dailyReminderProcessor({ data: { userId: user.id } } as any)

    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('skips when the user does not exist', async () => {
    await dailyReminderProcessor({ data: { userId: 999999 } } as any)

    expect(mockedSend).not.toHaveBeenCalled()
  })
})
