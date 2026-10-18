import { describe, it, expect } from 'vitest'
import { BaseMoodOption } from '@prisma/client'
import {
  computeMoodTrend,
  moodTrendBody,
} from '@app/lib/queue/processors/insights/moodTrend'

const mood = (selectedMood: BaseMoodOption, energyLevel: number) => ({
  selectedMood,
  energyLevel,
})

describe('computeMoodTrend', () => {
  it('averages each half, scales the delta, and picks the dominant mood', () => {
    const trend = computeMoodTrend([
      mood('SAD', 6),
      mood('NEUTRAL', 6),
      mood('GREAT', 6),
      mood('GREAT', 6),
      mood('GREAT', 6),
    ])

    expect(trend).toEqual({
      delta: 100,
      avgFirst: 2.5,
      avgSecond: 5,
      dominantMood: 'GREAT',
      avgEnergy: 6,
    })
  })

  it('reports a negative delta when the second half dips', () => {
    const trend = computeMoodTrend([
      mood('GREAT', 6),
      mood('GREAT', 6),
      mood('SAD', 6),
      mood('SAD', 6),
      mood('SAD', 6),
    ])

    expect(trend.delta).toBe(-60)
    expect(trend.dominantMood).toBe('SAD')
  })

  it('reports a zero delta and the mean energy for a flat period', () => {
    const trend = computeMoodTrend([
      mood('GOOD', 3),
      mood('GOOD', 9),
      mood('GOOD', 6),
    ])

    expect(trend.delta).toBe(0)
    expect(trend.avgEnergy).toBe(6)
  })
})

describe('moodTrendBody', () => {
  it('celebrates an improving delta', () => {
    expect(moodTrendBody(100)).toBe(
      'Seu humor melhorou 100% em relação ao início do período.',
    )
  })

  it('names a worsening delta by its magnitude', () => {
    expect(moodTrendBody(-60)).toBe(
      'Seu humor caiu 60% em relação ao início do período.',
    )
  })

  it('calls a small delta stable', () => {
    expect(moodTrendBody(5)).toBe(
      'Seu humor se manteve estável durante o período.',
    )
  })

  it('treats a delta of exactly ten as stable and eleven as a change', () => {
    expect(moodTrendBody(10)).toBe(
      'Seu humor se manteve estável durante o período.',
    )
    expect(moodTrendBody(-10)).toBe(
      'Seu humor se manteve estável durante o período.',
    )
    expect(moodTrendBody(11)).toContain('melhorou')
    expect(moodTrendBody(-11)).toContain('caiu')
  })
})
