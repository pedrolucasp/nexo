import { describe, it, expect } from 'vitest'
import {
  computeDailySleep,
  dailySleepBody,
} from '@app/lib/queue/processors/insights/dailySleep'

const record = (average: number) => ({ average })

describe('computeDailySleep', () => {
  it('sums today and compares it against yesterday', () => {
    const { metadata } = computeDailySleep([record(8)], [record(6)])

    expect(metadata).toEqual({
      totalHours: 8,
      diffMinutes: 120,
      diffStr: '+2h que ontem',
      sessionCount: 1,
      napStr: '',
      hadNaps: false,
      windowLabel: 'hoje',
    })
  })

  it('omits the difference when nothing was logged yesterday', () => {
    const { metadata } = computeDailySleep([record(6)], [])

    expect(metadata).toMatchObject({
      totalHours: 6,
      diffMinutes: null,
      diffStr: '',
    })
  })

  it('subtracts yesterday from today when yesterday was longer', () => {
    const { metadata } = computeDailySleep([record(4)], [record(9)])

    expect(metadata).toMatchObject({
      totalHours: 4,
      diffMinutes: -300,
      diffStr: '-5h que ontem',
    })
  })

  it('names the extra sessions as naps, pluralized past two', () => {
    const oneNap = computeDailySleep([record(5), record(2)], []).metadata
    const twoNaps = computeDailySleep(
      [record(5), record(2), record(1)],
      [],
    ).metadata

    expect(oneNap).toMatchObject({
      totalHours: 7,
      sessionCount: 2,
      napStr: 'incluindo 1 cochilo',
      hadNaps: true,
    })
    expect(twoNaps).toMatchObject({
      totalHours: 8,
      sessionCount: 3,
      napStr: 'incluindo 2 cochilos',
    })
  })

  it('drops the difference string under five minutes', () => {
    const under = computeDailySleep([record(6)], [record(6.05)]).metadata
    const at = computeDailySleep([record(6)], [record(5.9)]).metadata

    expect(under).toMatchObject({ diffMinutes: -3, diffStr: '' })
    expect(at).toMatchObject({ diffMinutes: 6, diffStr: '+6min que ontem' })
  })
})

describe('dailySleepBody', () => {
  it('formats a whole hour and a remainder', () => {
    expect(dailySleepBody(8)).toBe('8h de sono hoje')
    expect(dailySleepBody(7.5)).toBe('7h 30min de sono hoje')
  })

  it('renders a day with nothing logged as zero hours', () => {
    expect(dailySleepBody(0)).toBe('0h de sono hoje')
  })
})
