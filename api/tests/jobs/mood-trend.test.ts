import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import { processMoodTrend } from '@app/lib/queue/processors/insights/moodTrend'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

describe('processMoodTrend', () => {
  it('skips processing when fewer than 3 mood entries exist', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    await db.mood.create({
      data: {
        userId: user.id,
        selectedMood: 'GOOD',
        anxietyLevel: 2,
        stressLevel: 2,
        energyLevel: 7,
        moment: new Date(weekAgo.getTime() + 60_000),
        moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
      },
    })

    await processMoodTrend({
      userId: user.id,
      periodStart: weekAgo.toISOString(),
      periodEnd: now.toISOString(),
    })

    const insight = await db.insight.findFirst({ where: { userId: user.id } })
    expect(insight).toBeNull()
  })

  it('creates a MOOD_TREND insight when enough entries exist', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const moods = ['GREAT', 'GOOD', 'NEUTRAL', 'GOOD', 'GREAT'] as const
    for (let i = 0; i < moods.length; i++) {
      await db.mood.create({
        data: {
          userId: user.id,
          selectedMood: moods[i],
          anxietyLevel: 2,
          stressLevel: 2,
          energyLevel: 7,
          moment: new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000),
          moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
        },
      })
    }

    await processMoodTrend({
      userId: user.id,
      periodStart: weekAgo.toISOString(),
      periodEnd: now.toISOString(),
    })

    const insight = await db.insight.findFirst({ where: { userId: user.id, type: 'MOOD_TREND' } })
    expect(insight).not.toBeNull()
    expect(insight!.title).toBe('Tendência de Humor')
    expect(insight!.metadata).toMatchObject({
      dominantMood: expect.any(String),
      delta: expect.any(Number),
    })
  })

  it('upserts the insight on repeated calls for the same period', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    for (let i = 0; i < 4; i++) {
      await db.mood.create({
        data: {
          userId: user.id,
          selectedMood: 'GOOD',
          anxietyLevel: 2,
          stressLevel: 2,
          energyLevel: 6,
          moment: new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000),
          moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
        },
      })
    }

    const periodStart = weekAgo.toISOString()
    const periodEnd = now.toISOString()

    await processMoodTrend({ userId: user.id, periodStart, periodEnd })
    await processMoodTrend({ userId: user.id, periodStart, periodEnd })

    const count = await db.insight.count({ where: { userId: user.id, type: 'MOOD_TREND' } })
    expect(count).toBe(1)
  })
})
