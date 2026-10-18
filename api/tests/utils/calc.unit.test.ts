import { describe, it, expect } from 'vitest'
import { avg, formatHours, formatDiff } from '@app/utils/calc'

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
