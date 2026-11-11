import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import { processMoodTrend } from '@app/lib/queue/processors/insights/moodTrend'
import { buildPrisma, cleanupTestDb, createTestUser } from '../test-helper'

const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(() => cleanupTestDb(db))

const DAY = 24 * 60 * 60 * 1000

type MoodOption = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'SAD' | 'ANGRY'

const at = (base: Date, days: number) =>
  new Date(base.getTime() + days * DAY)

const createMood = (
  userId: number,
  selectedMood: MoodOption,
  moment: Date,
) =>
  db.mood.create({
    data: {
      userId,
      selectedMood,
      anxietyLevel: 2,
      stressLevel: 2,
      energyLevel: 7,
      moment,
      moodComponents: { create: [{ component: 'JOY', intensity: 'LIGHT' }] },
    },
  })

describe('processMoodTrend', () => {
  it('skips processing when a half has fewer than two entries', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * DAY)

    await createMood(user.id, 'GOOD', at(weekAgo, 0))
    await createMood(user.id, 'GOOD', at(weekAgo, 1))
    await createMood(user.id, 'GOOD', at(weekAgo, 5))

    await processMoodTrend({
      userId: user.id,
      periodStart: weekAgo.toISOString(),
      periodEnd: now.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id },
    })
    expect(insight).toBeNull()
  })

  it('creates a MOOD_TREND insight when both halves have enough entries', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * DAY)

    const moods: MoodOption[] = ['GREAT', 'GOOD', 'NEUTRAL', 'GOOD']
    const offsets = [0, 1, 5, 6]

    for (let i = 0; i < moods.length; i++) {
      await createMood(user.id, moods[i], at(weekAgo, offsets[i]))
    }

    await processMoodTrend({
      userId: user.id,
      periodStart: weekAgo.toISOString(),
      periodEnd: now.toISOString(),
    })

    const insight = await db.insight.findFirst({
      where: { userId: user.id, type: 'MOOD_TREND' },
    })
    expect(insight).not.toBeNull()
    expect(insight!.title).toBe('Tendência de Humor')
    expect(insight!.body).toBe(
      'Média de humor nos últimos 7 dias. Diferença de -1,0 ponto.',
    )
    expect(insight!.metadata).toMatchObject({
      avgFirst: 4.5,
      avgSecond: 3.5,
      deltaPoints: -1,
      dominantMood: 'GOOD',
    })
  })

  it('upserts the insight on repeated calls for the same period', async () => {
    const user = await createTestUser(db)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * DAY)

    for (const offset of [0, 1, 5, 6]) {
      await createMood(user.id, 'GOOD', at(weekAgo, offset))
    }

    const periodStart = weekAgo.toISOString()
    const periodEnd = now.toISOString()

    await processMoodTrend({ userId: user.id, periodStart, periodEnd })
    await processMoodTrend({ userId: user.id, periodStart, periodEnd })

    const count = await db.insight.count({
      where: { userId: user.id, type: 'MOOD_TREND' },
    })
    expect(count).toBe(1)
  })
})
