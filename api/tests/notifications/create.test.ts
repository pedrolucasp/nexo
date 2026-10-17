import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest'
import { NotificationKind } from '@prisma/client'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

vi.mock('@app/lib/sendPushNotification', () => ({
  sendPushNotification: vi.fn().mockResolvedValue(undefined),
}))

import { sendPushNotification } from '@app/lib/sendPushNotification'
import { createNotification } from '@app/services/notification.service'

const mockedSend = vi.mocked(sendPushNotification)

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)
  mockedSend.mockClear()
  mockedSend.mockResolvedValue(undefined)
})

// São Paulo is UTC-3 year round, so this instant is midday in the app timezone
const midday = new Date('2026-03-10T12:00:00-03:00')

const dailyInput = (userId: number) => ({
  userId,
  kind: NotificationKind.DAILY_REMINDER,
  title: 'Como você está?',
  body: 'Registre seu humor para acompanhar sua saúde.',
  scheduledFor: midday,
})

describe('createNotification', () => {
  it('stores a notification whose window ends at the end of the app day', async () => {
    const user = await createTestUser(db)

    await createNotification(dailyInput(user.id))

    const row = await db.notification.findFirst()
    expect(row).toMatchObject({
      userId: user.id,
      kind: 'DAILY_REMINDER',
      title: 'Como você está?',
      regimenId: null,
    })
    expect(row?.scheduledFor.toISOString()).toBe(midday.toISOString())
    expect(row?.expiresAt?.toISOString()).toBe('2026-03-11T02:59:59.999Z')
  })

  it('stores a timeless notification without a window', async () => {
    const user = await createTestUser(db)

    await createNotification({
      userId: user.id,
      kind: NotificationKind.INSIGHT_ALERT,
      title: 'Trabalho aparece muito',
      body: 'Trabalho tem aparecido bastante nos seus gatilhos.',
      scheduledFor: midday,
    })

    const row = await db.notification.findFirst()
    expect(row?.kind).toBe('INSIGHT_ALERT')
    expect(row?.expiresAt).toBeNull()
  })

  it('records when a push was dispatched', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[abc123]',
      notificationsEnabled: true,
    })

    await createNotification(dailyInput(user.id))

    expect(mockedSend).toHaveBeenCalledOnce()
    const row = await db.notification.findFirst()
    expect(row?.pushedAt).not.toBeNull()
  })

  it('stores the notification but does not push when notifications are disabled', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[disabled]',
      notificationsEnabled: false,
    })

    await createNotification(dailyInput(user.id))

    expect(mockedSend).not.toHaveBeenCalled()
    const row = await db.notification.findFirst()
    expect(row).not.toBeNull()
    expect(row?.pushedAt).toBeNull()
  })

  it('stores the notification but does not push without a push token', async () => {
    const user = await createTestUser(db, { notificationsEnabled: true })

    await createNotification(dailyInput(user.id))

    expect(mockedSend).not.toHaveBeenCalled()
    const row = await db.notification.findFirst()
    expect(row).not.toBeNull()
    expect(row?.pushedAt).toBeNull()
  })

  it('keeps an unpushed record when the push fails', async () => {
    const user = await createTestUser(db, {
      pushToken: 'ExponentPushToken[boom]',
      notificationsEnabled: true,
    })
    mockedSend.mockRejectedValueOnce(new Error('Expo push API returned 500'))

    await expect(createNotification(dailyInput(user.id))).resolves.toBeDefined()

    const row = await db.notification.findFirst()
    expect(row).not.toBeNull()
    expect(row?.pushedAt).toBeNull()
  })

  it('stores nothing when the user does not exist', async () => {
    const result = await createNotification(dailyInput(999999))

    expect(result).toBeNull()
    expect(await db.notification.count()).toBe(0)
    expect(mockedSend).not.toHaveBeenCalled()
  })
})
