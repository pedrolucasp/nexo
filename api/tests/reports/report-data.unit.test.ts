import { describe, it, expect } from 'vitest'
import {
  BaseMoodOption,
  MoodComponentOption,
  IntensityLevel,
} from '@prisma/client'
import {
  buildMoodDistribution,
  buildDailyMoods,
  buildTopComponents,
  buildCheckinLog,
} from '@app/reports/report.data'

const mood = (selectedMood: BaseMoodOption) => ({ selectedMood })

// Local-noon instants keep the yyyy-MM-dd grouping stable across timezones
const at = (year: number, month: number, day: number, hour = 12) =>
  new Date(year, month - 1, day, hour)

describe('buildMoodDistribution', () => {
  it('counts each base mood and computes its share of the period', () => {
    const distribution = buildMoodDistribution(
      [mood('GREAT'), mood('GREAT'), mood('GOOD')],
      3,
    )

    expect(distribution).toEqual([
      { mood: 'GREAT', count: 2, pct: 66.7 },
      { mood: 'GOOD', count: 1, pct: 33.3 },
      { mood: 'NEUTRAL', count: 0, pct: 0 },
      { mood: 'SAD', count: 0, pct: 0 },
      { mood: 'ANGRY', count: 0, pct: 0 },
    ])
  })

  it('reports all zeros for an empty period', () => {
    const order: BaseMoodOption[] = [
      'GREAT',
      'GOOD',
      'NEUTRAL',
      'SAD',
      'ANGRY',
    ]

    expect(buildMoodDistribution([], 0)).toEqual(
      order.map(mood => ({ mood, count: 0, pct: 0 })),
    )
  })
})

describe('buildDailyMoods', () => {
  it('keeps the latest Mood Entry of each day, whatever the order', () => {
    const daily = buildDailyMoods(
      [
        { moment: at(2026, 10, 17, 20), selectedMood: 'GREAT' },
        { moment: at(2026, 10, 17, 8), selectedMood: 'SAD' },
      ],
      [at(2026, 10, 17)],
    )

    expect(daily).toEqual([{ date: '2026-10-17', mood: 'GREAT' }])
  })

  it('yields a null mood for a day with no entry', () => {
    const daily = buildDailyMoods(
      [{ moment: at(2026, 10, 17, 9), selectedMood: 'GOOD' }],
      [at(2026, 10, 16), at(2026, 10, 17), at(2026, 10, 18)],
    )

    expect(daily).toEqual([
      { date: '2026-10-16', mood: null },
      { date: '2026-10-17', mood: 'GOOD' },
      { date: '2026-10-18', mood: null },
    ])
  })
})

describe('buildTopComponents', () => {
  it('counts each component and keeps the most frequent intensity', () => {
    const components = buildTopComponents([
      {
        moodComponents: [
          { component: 'JOY', intensity: 'LIGHT' },
          { component: 'CALM', intensity: 'HIGH' },
        ],
      },
      {
        moodComponents: [
          { component: 'JOY', intensity: 'LIGHT' },
          { component: 'JOY', intensity: 'HIGH' },
        ],
      },
    ])

    expect(components).toEqual([
      { component: 'JOY', count: 3, avgIntensity: 'LIGHT' },
      { component: 'CALM', count: 1, avgIntensity: 'HIGH' },
    ])
  })

  it('keeps only the ten most frequent components', () => {
    const components: MoodComponentOption[] = [
      'JOY', 'ANGER', 'SADNESS', 'FEAR', 'GUILT', 'FRUSTRATION',
      'CALM', 'MOTIVATED', 'TIREDNESS', 'GRATITUDE', 'FOCUS',
    ]

    const moods = components.flatMap((component, i) =>
      Array.from({ length: 11 - i }, () => ({
        moodComponents: [{ component, intensity: 'LIGHT' as IntensityLevel }],
      })),
    )

    const top = buildTopComponents(moods)

    expect(top).toHaveLength(10)
    expect(top[0]).toEqual({
      component: 'JOY',
      count: 11,
      avgIntensity: 'LIGHT',
    })
    expect(top.map(c => c.component)).not.toContain('FOCUS')
  })
})

describe('buildCheckinLog', () => {
  it('projects the log fields and renames the mood', () => {
    const moment = at(2026, 10, 17, 8)

    const log = buildCheckinLog([
      {
        moment,
        selectedMood: 'GOOD',
        anxietyLevel: 2,
        stressLevel: 3,
        energyLevel: 7,
        annotation: 'manhã calma',
      },
    ])

    expect(log).toEqual([
      {
        moment,
        mood: 'GOOD',
        anxietyLevel: 2,
        stressLevel: 3,
        energyLevel: 7,
        annotation: 'manhã calma',
      },
    ])
  })

  it('keeps at most the fifty most recent entries', () => {
    const entry = (i: number) => ({
      moment: at(2026, 10, 1, 0),
      selectedMood: 'GOOD' as BaseMoodOption,
      anxietyLevel: 1,
      stressLevel: 1,
      energyLevel: 1,
      annotation: `n${i}`,
    })

    const log = buildCheckinLog(Array.from({ length: 51 }, (_, i) => entry(i)))

    expect(log).toHaveLength(50)
    expect(log[0].annotation).toBe('n0')
    expect(log[49].annotation).toBe('n49')
  })
})
