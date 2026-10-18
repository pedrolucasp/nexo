import { describe, it, expect } from 'vitest'
import {
  computeDailyEnergy,
  dailyEnergyBody,
} from '@app/lib/queue/processors/insights/dailyEnergy'

const mood = (energyLevel: number, stressLevel: number, anxietyLevel: number) => ({
  energyLevel,
  stressLevel,
  anxietyLevel,
})

describe('computeDailyEnergy', () => {
  it('averages the levels, finds the peaks, and trends the day', () => {
    const { metadata, dayTrend } = computeDailyEnergy(
      [mood(8, 2, 1), mood(4, 4, 3), mood(6, 6, 5)],
      [],
    )

    expect(metadata).toEqual({
      avgEnergy: 6,
      avgStress: 4,
      avgAnxiety: 3,
      peak: 8,
      trough: 4,
      dayTrend: -37.5,
      entryCount: 3,
      yesterdayAvg: null,
      diffEnergy: null,
      windowLabel: 'hoje',
    })
    expect(dayTrend).toBe(-37.5)
  })

  it('rounds the averages to two decimals', () => {
    const { metadata } = computeDailyEnergy(
      [mood(7, 7, 7), mood(8, 8, 8), mood(8, 8, 8)],
      [],
    )

    expect(metadata).toMatchObject({
      avgEnergy: 7.67,
      avgStress: 7.67,
      avgAnxiety: 7.67,
      peak: 8,
      trough: 7,
    })
  })

  it('has no day trend with a single entry', () => {
    const { metadata, dayTrend } = computeDailyEnergy([mood(5, 1, 1)], [])

    expect(dayTrend).toBeNull()
    expect(metadata).toMatchObject({
      dayTrend: null,
      entryCount: 1,
      peak: 5,
      trough: 5,
    })
  })

  it('subtracts yesterday from the rounded today average, either way', () => {
    const up = computeDailyEnergy(
      [mood(6, 1, 1), mood(6, 1, 1)],
      [{ energyLevel: 4 }, { energyLevel: 4 }],
    ).metadata

    const down = computeDailyEnergy(
      [mood(4, 1, 1), mood(4, 1, 1)],
      [{ energyLevel: 9 }, { energyLevel: 9 }],
    ).metadata

    expect(up).toMatchObject({
      avgEnergy: 6,
      yesterdayAvg: 4,
      diffEnergy: 2,
      dayTrend: 0,
    })
    expect(down).toMatchObject({
      avgEnergy: 4,
      yesterdayAvg: 9,
      diffEnergy: -5,
    })
  })
})

describe('dailyEnergyBody', () => {
  it('picks the level from the average energy', () => {
    expect(dailyEnergyBody(7, null)).toBe('Energia alta hoje.')
    expect(dailyEnergyBody(4, null)).toBe('Energia moderada hoje.')
    expect(dailyEnergyBody(3, null)).toBe('Energia baixa hoje.')
  })

  it('adds the day trend when there is one', () => {
    expect(dailyEnergyBody(5, 20)).toBe(
      'Energia moderada hoje, com melhora ao longo do dia.',
    )
    expect(dailyEnergyBody(5, -20)).toBe(
      'Energia moderada hoje, com queda ao longo do dia.',
    )
    expect(dailyEnergyBody(5, 0)).toBe(
      'Energia moderada e estável ao longo do dia.',
    )
  })

  it('treats a trend of exactly ten as stable', () => {
    expect(dailyEnergyBody(5, 10)).toBe(
      'Energia moderada e estável ao longo do dia.',
    )
    expect(dailyEnergyBody(5, -10)).toBe(
      'Energia moderada e estável ao longo do dia.',
    )
    expect(dailyEnergyBody(5, 11)).toBe(
      'Energia moderada hoje, com melhora ao longo do dia.',
    )
    expect(dailyEnergyBody(5, -11)).toBe(
      'Energia moderada hoje, com queda ao longo do dia.',
    )
  })
})
