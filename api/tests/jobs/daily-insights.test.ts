import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import { processDailyEnergy } from '@app/lib/queue/processors/insights/dailyEnergy'
import { processDailySleep } from '@app/lib/queue/processors/insights/dailySleep'
import { appDayWindow } from '@app/lib/queue/processors/insights/utils'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

const HOUR = 60 * 60 * 1000

function createMood(userId: number, energyLevel: number, moment: Date) {
  return db.mood.create({
    data: {
      userId,
      selectedMood: 'GOOD',
      anxietyLevel: 2,
      stressLevel: 2,
      energyLevel,
      moment,
    },
  })
}

describe('processDailyEnergy', () => {
  it('averages only the mood entries logged inside today', async () => {
    const user = await createTestUser(db)
    const ref = new Date()
    const { start } = appDayWindow(ref)

    await createMood(user.id, 8, new Date(start.getTime() + HOUR))
    await createMood(user.id, 4, new Date(start.getTime() + 2 * HOUR))
    // one hour before the app day begins, so it belongs to yesterday
    await createMood(user.id, 10, new Date(start.getTime() - HOUR))

    await processDailyEnergy({
      userId: user.id,
      periodStart: ref.toISOString(),
      periodEnd: ref.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id, type: 'DAILY_ENERGY' },
    })

    expect(insight).not.toBeNull()
    expect(insight!.periodStart).toEqual(start)
    expect(insight!.metadata).toMatchObject({ avgEnergy: 6, entryCount: 2 })
  })

  it('writes nothing when no mood entry falls inside today', async () => {
    const user = await createTestUser(db)
    const ref = new Date()
    const { start } = appDayWindow(ref)

    await createMood(user.id, 9, new Date(start.getTime() - HOUR))

    await processDailyEnergy({
      userId: user.id,
      periodStart: ref.toISOString(),
      periodEnd: ref.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id, type: 'DAILY_ENERGY' },
    })

    expect(insight).toBeNull()
  })
})

describe('processDailySleep', () => {
  it('sums today and compares against yesterday', async () => {
    const user = await createTestUser(db)
    const ref = new Date()
    const { start: today } = appDayWindow(ref)
    const { start: yesterday } = appDayWindow(new Date(today.getTime() - 1))

    await db.sleepRecord.create({
      data: { userId: user.id, date: today, average: 8 },
    })
    await db.sleepRecord.create({
      data: { userId: user.id, date: yesterday, average: 6 },
    })

    await processDailySleep({
      userId: user.id,
      periodStart: ref.toISOString(),
      periodEnd: ref.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id, type: 'DAILY_SLEEP' },
    })

    expect(insight).not.toBeNull()
    expect(insight!.periodStart).toEqual(today)
    expect(insight!.metadata).toMatchObject({
      totalHours: 8,
      diffMinutes: 120,
    })
  })

  it('writes nothing when no sleep record falls inside today', async () => {
    const user = await createTestUser(db)
    const ref = new Date()
    const { start: today } = appDayWindow(ref)
    const { start: yesterday } = appDayWindow(new Date(today.getTime() - 1))

    await db.sleepRecord.create({
      data: { userId: user.id, date: yesterday, average: 7 },
    })

    await processDailySleep({
      userId: user.id,
      periodStart: ref.toISOString(),
      periodEnd: ref.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id, type: 'DAILY_SLEEP' },
    })

    expect(insight).toBeNull()
  })
})
