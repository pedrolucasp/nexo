import { describe, it, expect } from 'vitest'
import {
  startOfAppDay,
  previousAppDay,
  parseAppDay,
  appDayWindow,
  appDayPeriod,
} from '@app/lib/queue/processors/insights/utils'

// America/Sao_Paulo is UTC-3 all year (Brazil dropped daylight saving in 2019),
// so the app's local day starts at 03:00Z; the trailing 3 is that offset.
const saoPauloMidnight = (year: number, month: number, day: number) =>
  Date.UTC(year, month - 1, day, 3, 0, 0)

describe('startOfAppDay', () => {
  it('floors a mid-day instant to the start of the local day', () => {
    expect(startOfAppDay(new Date('2026-10-17T12:00:00.000Z')).getTime()).toBe(
      saoPauloMidnight(2026, 10, 17),
    )
  })

  it('keeps an instant just before local midnight on the same day', () => {
    expect(
      startOfAppDay(new Date('2026-10-18T02:59:59.999Z')).getTime(),
    ).toBe(saoPauloMidnight(2026, 10, 17))
  })

  it('rolls over to the next day at local midnight', () => {
    expect(
      startOfAppDay(new Date('2026-10-18T03:00:00.000Z')).getTime(),
    ).toBe(saoPauloMidnight(2026, 10, 18))
  })
})

describe('previousAppDay', () => {
  it('returns the start of the day before', () => {
    expect(previousAppDay(new Date('2026-10-17T12:00:00.000Z')).getTime()).toBe(
      saoPauloMidnight(2026, 10, 16),
    )
  })
})

describe('parseAppDay', () => {
  it('parses a day string at the local midnight', () => {
    expect(parseAppDay('2026-10-17').getTime()).toBe(
      saoPauloMidnight(2026, 10, 17),
    )
  })
})

describe('appDayWindow', () => {
  it('spans from one local day start to the next', () => {
    const { start, end } = appDayWindow(new Date('2026-10-17T12:00:00.000Z'))

    expect(start.getTime()).toBe(saoPauloMidnight(2026, 10, 17))
    expect(end.getTime()).toBe(saoPauloMidnight(2026, 10, 18))
  })

  it('rolls the whole window over at local midnight', () => {
    const before = appDayWindow(new Date('2026-10-18T02:59:59.999Z'))
    const after = appDayWindow(new Date('2026-10-18T03:00:00.000Z'))

    expect(before.start.getTime()).toBe(saoPauloMidnight(2026, 10, 17))
    expect(before.end.getTime()).toBe(saoPauloMidnight(2026, 10, 18))
    expect(after.start.getTime()).toBe(saoPauloMidnight(2026, 10, 18))
    expect(after.end.getTime()).toBe(saoPauloMidnight(2026, 10, 19))
  })
})

describe('appDayPeriod', () => {
  it('serializes the window as offset ISO strings', () => {
    expect(appDayPeriod(new Date('2026-10-17T12:00:00.000Z'))).toEqual({
      periodStart: '2026-10-17T00:00:00.000-03:00',
      periodEnd: '2026-10-18T00:00:00.000-03:00',
    })
  })
})
