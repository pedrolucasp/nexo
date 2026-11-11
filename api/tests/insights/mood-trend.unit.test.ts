import { describe, it, expect } from 'vitest'
import { BaseMoodOption } from '@prisma/client'
import {
  computeMoodTrend,
  moodTrendBody,
} from '@app/lib/queue/processors/insights/moodTrend'

const periodStart = new Date('2026-01-05T00:00:00Z')
const periodEnd = new Date('2026-01-12T00:00:00Z')

const mood = (
  selectedMood: BaseMoodOption,
  moment: string,
  energyLevel = 6,
) => ({
  selectedMood,
  energyLevel,
  moment: new Date(moment),
})

describe('computeMoodTrend', () => {
  it('averages each time half, reports the point difference, and picks the dominant mood', () => {
    const trend = computeMoodTrend(
      [
        mood('SAD', '2026-01-05T10:00:00Z'),
        mood('NEUTRAL', '2026-01-06T10:00:00Z'),
        mood('GREAT', '2026-01-09T10:00:00Z'),
        mood('GREAT', '2026-01-10T10:00:00Z'),
      ],
      periodStart,
      periodEnd,
    )

    expect(trend).toEqual({
      delta: 100,
      deltaPoints: 2.5,
      avgFirst: 2.5,
      avgSecond: 5,
      dominantMood: 'GREAT',
      avgEnergy: 6,
    })
  })

  it('reports a negative difference when the second half dips', () => {
    const trend = computeMoodTrend(
      [
        mood('GREAT', '2026-01-05T10:00:00Z'),
        mood('GREAT', '2026-01-06T10:00:00Z'),
        mood('SAD', '2026-01-09T10:00:00Z'),
        mood('SAD', '2026-01-10T10:00:00Z'),
        mood('SAD', '2026-01-11T10:00:00Z'),
      ],
      periodStart,
      periodEnd,
    )

    expect(trend?.deltaPoints).toBe(-3)
    expect(trend?.delta).toBe(-60)
    expect(trend?.dominantMood).toBe('SAD')
  })

  it('reports a zero difference and the mean energy for a flat period', () => {
    const trend = computeMoodTrend(
      [
        mood('GOOD', '2026-01-05T10:00:00Z', 3),
        mood('GOOD', '2026-01-06T10:00:00Z', 9),
        mood('GOOD', '2026-01-09T10:00:00Z', 6),
        mood('GOOD', '2026-01-10T10:00:00Z', 6),
      ],
      periodStart,
      periodEnd,
    )

    expect(trend?.deltaPoints).toBe(0)
    expect(trend?.delta).toBe(0)
    expect(trend?.avgEnergy).toBe(6)
  })

  it('splits by timestamp rather than by entry count', () => {
    const trend = computeMoodTrend(
      [
        mood('GREAT', '2026-01-05T10:00:00Z'),
        mood('GREAT', '2026-01-06T10:00:00Z'),
        mood('GREAT', '2026-01-07T10:00:00Z'),
        mood('SAD', '2026-01-10T10:00:00Z'),
      ],
      periodStart,
      periodEnd,
    )

    expect(trend).toBeNull()
  })

  it('rounds the averages to one decimal so the pair matches the difference', () => {
    const trend = computeMoodTrend(
      [
        mood('NEUTRAL', '2026-01-05T10:00:00Z'),
        mood('NEUTRAL', '2026-01-06T10:00:00Z'),
        mood('GOOD', '2026-01-07T10:00:00Z'),
        mood('GOOD', '2026-01-09T10:00:00Z'),
        mood('GOOD', '2026-01-10T10:00:00Z'),
        mood('GREAT', '2026-01-11T10:00:00Z'),
      ],
      periodStart,
      periodEnd,
    )

    expect(trend?.avgFirst).toBe(3.3)
    expect(trend?.avgSecond).toBe(4.3)
    expect(trend?.deltaPoints).toBe(1)
  })
})

describe('moodTrendBody', () => {
  it('prints a positive difference with a plus sign', () => {
    expect(moodTrendBody(0.3)).toBe(
      'Média de humor nos últimos 7 dias. Diferença de +0,3 ponto.',
    )
  })

  it('prints a negative difference', () => {
    expect(moodTrendBody(-0.3)).toBe(
      'Média de humor nos últimos 7 dias. Diferença de -0,3 ponto.',
    )
  })

  it('prints a zero difference without a sign', () => {
    expect(moodTrendBody(0)).toBe(
      'Média de humor nos últimos 7 dias. Diferença de 0,0 ponto.',
    )
  })

  it('always prints one decimal place', () => {
    expect(moodTrendBody(2)).toBe(
      'Média de humor nos últimos 7 dias. Diferença de +2,0 ponto.',
    )
  })
})
