import { describe, it, expect } from 'vitest'
import {
  compareHistoryItems,
  decodeHistoryCursor,
  encodeHistoryCursor,
  sleepSortAt,
} from '@app/lib/history'

describe('history cursor', () => {
  it('round-trips a cursor', () => {
    const cursor = {
      sortAt: new Date('2026-11-10T15:00:00.000Z'),
      kind: 'sleep' as const,
      id: 42,
    }

    expect(decodeHistoryCursor(encodeHistoryCursor(cursor))).toEqual(cursor)
  })

  it.each([
    ['a non-cursor string', 'not-a-cursor'],
    ['an array', Buffer.from('[]').toString('base64url')],
    [
      'an unknown kind',
      Buffer.from(
        JSON.stringify({
          sortAt: '2026-11-10T15:00:00.000Z',
          kind: 'insight',
          id: 1,
        }),
      ).toString('base64url'),
    ],
    [
      'an invalid date',
      Buffer.from(
        JSON.stringify({ sortAt: 'yesterday', kind: 'mood', id: 1 }),
      ).toString('base64url'),
    ],
    [
      'a non-positive id',
      Buffer.from(
        JSON.stringify({
          sortAt: '2026-11-10T15:00:00.000Z',
          kind: 'mood',
          id: 0,
        }),
      ).toString('base64url'),
    ],
    [
      'a missing id',
      Buffer.from(
        JSON.stringify({ sortAt: '2026-11-10T15:00:00.000Z', kind: 'mood' }),
      ).toString('base64url'),
    ],
  ])('rejects %s', (_label, value) => {
    expect(decodeHistoryCursor(value)).toBeNull()
  })
})

describe('history ordering', () => {
  it('orders by sortAt desc, then kind asc, then id desc', () => {
    const at = new Date('2026-11-10T15:00:00.000Z')

    const items = [
      { sortAt: at, kind: 'care_action' as const, id: 9 },
      { sortAt: at, kind: 'mood' as const, id: 3 },
      { sortAt: at, kind: 'trigger' as const, id: 5 },
      { sortAt: at, kind: 'sleep' as const, id: 1 },
      { sortAt: at, kind: 'mood' as const, id: 7 },
      {
        sortAt: new Date('2026-11-10T16:00:00.000Z'),
        kind: 'sleep' as const,
        id: 2,
      },
    ]

    expect([...items].sort(compareHistoryItems).map((i) => `${i.kind}-${i.id}`)).toEqual([
      'sleep-2',
      'mood-7',
      'mood-3',
      'sleep-1',
      'trigger-5',
      'care_action-9',
    ])
  })
})

describe('sleepSortAt', () => {
  it('anchors a date-only record at noon in the app timezone', () => {
    expect(
      sleepSortAt(new Date('2026-11-10T00:00:00.000Z')).toISOString(),
    ).toBe('2026-11-10T15:00:00.000Z')
  })
})
