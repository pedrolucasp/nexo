import { describe, it, expect } from 'vitest'
import { CreateMoodSchema } from '@app/schemas/mood.schema'
import { CreateSleepRecordSchema } from '@app/schemas/sleepRecord.schema'
import { UpdateUserPreferencesSchema } from '@app/schemas/user.schema'
import { ActivateUserSchema } from '@app/schemas/auth.schema'
import { InsightsQuerySchema } from '@app/schemas/insight.schema'
import { LinkMoodSchema } from '@app/schemas/triggerMoodLink.schema'

const moodEntry = {
  moment: '2026-10-17T12:00:00.000Z',
  selectedMood: 'GOOD',
  anxietyLevel: 5,
  stressLevel: 5,
  energyLevel: 5,
  moodComponents: [{ component: 'JOY', intensity: 'LIGHT' }],
}

const sleepRecord = { date: '2026-10-17T00:00:00.000Z', average: 7 }

describe('mood level bounds', () => {
  it('accepts zero and ten on every level', () => {
    for (const level of ['anxietyLevel', 'stressLevel', 'energyLevel'] as const) {
      expect(CreateMoodSchema.safeParse({ ...moodEntry, [level]: 0 }).success).toBe(true)
      expect(CreateMoodSchema.safeParse({ ...moodEntry, [level]: 10 }).success).toBe(true)
    }
  })

  it('rejects a level above ten or below zero', () => {
    expect(CreateMoodSchema.safeParse({ ...moodEntry, energyLevel: 11 }).success).toBe(false)
    expect(CreateMoodSchema.safeParse({ ...moodEntry, energyLevel: -1 }).success).toBe(false)
  })
})

describe('sleep record average bounds', () => {
  it('accepts zero and fifteen hours', () => {
    expect(CreateSleepRecordSchema.safeParse({ ...sleepRecord, average: 0 }).success).toBe(true)
    expect(CreateSleepRecordSchema.safeParse({ ...sleepRecord, average: 15 }).success).toBe(true)
  })

  it('rejects an average outside the range', () => {
    expect(CreateSleepRecordSchema.safeParse({ ...sleepRecord, average: -0.5 }).success).toBe(false)
    expect(CreateSleepRecordSchema.safeParse({ ...sleepRecord, average: 15.5 }).success).toBe(false)
  })
})

describe('daily reminder time format', () => {
  it('accepts a two-digit hour and minute, and null to clear it', () => {
    expect(UpdateUserPreferencesSchema.safeParse({ dailyReminderTime: '08:30' }).success).toBe(true)
    expect(UpdateUserPreferencesSchema.safeParse({ dailyReminderTime: null }).success).toBe(true)
  })

  it('rejects a one-digit hour or a trailing seconds segment', () => {
    expect(UpdateUserPreferencesSchema.safeParse({ dailyReminderTime: '8:30' }).success).toBe(false)
    expect(
      UpdateUserPreferencesSchema.safeParse({ dailyReminderTime: '08:30:00' })
        .success,
    ).toBe(false)
  })
})

describe('activation code format', () => {
  it('accepts exactly six digits', () => {
    expect(ActivateUserSchema.safeParse({ code: '000123' }).success).toBe(true)
  })

  it('rejects the wrong length or non-digits', () => {
    for (const code of ['12345', '1234567', '12345a', 'abcdef']) {
      expect(ActivateUserSchema.safeParse({ code }).success).toBe(false)
    }
  })
})

describe('insights day string', () => {
  it('accepts a real yyyy-MM-dd day', () => {
    expect(InsightsQuerySchema.safeParse({ day: '2026-10-17' }).success).toBe(true)
  })

  it('rejects an unpadded, month-out-of-range, or impossible day', () => {
    expect(InsightsQuerySchema.safeParse({ day: '2026-10-7' }).success).toBe(false)
    expect(InsightsQuerySchema.safeParse({ day: '2026-13-01' }).success).toBe(false)
    expect(InsightsQuerySchema.safeParse({ day: '2026-02-30' }).success).toBe(false)
  })
})

describe('trigger link perceived impact', () => {
  it('accepts the one-to-five boundaries', () => {
    expect(LinkMoodSchema.safeParse({ moodId: 1, perceivedImpact: 1 }).success).toBe(true)
    expect(LinkMoodSchema.safeParse({ moodId: 1, perceivedImpact: 5 }).success).toBe(true)
  })

  it('rejects an impact off the scale or a non-positive mood', () => {
    expect(LinkMoodSchema.safeParse({ moodId: 1, perceivedImpact: 0 }).success).toBe(false)
    expect(LinkMoodSchema.safeParse({ moodId: 1, perceivedImpact: 6 }).success).toBe(false)
    expect(LinkMoodSchema.safeParse({ moodId: 0, perceivedImpact: 3 }).success).toBe(false)
  })
})
