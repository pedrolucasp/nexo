import { describe, it, expect } from 'vitest'
import { avg, formatHours, formatDiff, paginate } from '@app/utils/calc'

describe('avg', () => {
  it('averages a list of numbers', () => {
    expect(avg([2, 4, 6])).toBe(4)
  })

  it('yields NaN for an empty list', () => {
    expect(avg([])).toBeNaN()
  })
})

describe('formatHours', () => {
  it('drops the minutes for a whole hour', () => {
    expect(formatHours(7)).toBe('7h')
  })

  it('renders the remaining minutes', () => {
    expect(formatHours(7.5)).toBe('7h 30min')
  })

  it('carries a rounding of sixty minutes into the next hour', () => {
    expect(formatHours(7.999)).toBe('8h')
  })
})

describe('formatDiff', () => {
  it('signs a positive whole-hour difference', () => {
    expect(formatDiff(120)).toBe('+2h')
  })

  it('signs a negative whole-hour difference', () => {
    expect(formatDiff(-120)).toBe('-2h')
  })

  it('signs a positive difference with hours and minutes', () => {
    expect(formatDiff(90)).toBe('+1h 30min')
  })

  it('signs a negative difference with hours and minutes', () => {
    expect(formatDiff(-90)).toBe('-1h 30min')
  })

  it('renders a positive sub-hour difference in minutes only', () => {
    expect(formatDiff(30)).toBe('+30min')
  })

  it('renders a negative sub-hour difference in minutes only', () => {
    expect(formatDiff(-30)).toBe('-30min')
  })
})

describe('paginate', () => {
  it('points the first page at the next one', () => {
    expect(paginate(1, 10, 25)).toEqual({ page: 1, skip: 0, nextPage: 2 })
  })

  it('points a middle page at the next one', () => {
    expect(paginate(2, 10, 25)).toEqual({ page: 2, skip: 10, nextPage: 3 })
  })

  it('closes the chain on the last page', () => {
    expect(paginate(3, 10, 25)).toEqual({ page: 3, skip: 20, nextPage: null })
  })

  it('has no next page past the end', () => {
    expect(paginate(4, 10, 25)).toEqual({ page: 4, skip: 30, nextPage: null })
  })

  it('treats an exact division as the last page', () => {
    expect(paginate(2, 10, 20)).toEqual({ page: 2, skip: 10, nextPage: null })
  })

  it('has no next page for an empty result set', () => {
    expect(paginate(1, 10, 0)).toEqual({ page: 1, skip: 0, nextPage: null })
  })
})
