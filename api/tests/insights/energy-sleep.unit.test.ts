import { describe, it, expect } from 'vitest'
import {
  pearson,
  energySleepBody,
} from '@app/lib/queue/processors/insights/energySleep'

describe('pearson', () => {
  it('returns 1 for a perfect positive correlation', () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 12)
  })

  it('returns -1 for a perfect negative correlation', () => {
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1, 12)
  })

  it('returns 0 with fewer than two samples', () => {
    expect(pearson([], [])).toBe(0)
    expect(pearson([1], [2])).toBe(0)
  })

  it('returns 0 when either axis has zero variance', () => {
    expect(pearson([5, 5, 5], [1, 2, 3])).toBe(0)
    expect(pearson([1, 2, 3], [4, 4, 4])).toBe(0)
  })

  it('stays within [-1, 1] for a partial correlation', () => {
    const r = pearson([1, 2, 3, 4, 5], [2, 1, 3, 4, 6])

    expect(r).toBeGreaterThanOrEqual(-1)
    expect(r).toBeLessThanOrEqual(1)
    expect(r).toBeCloseTo(0.904, 3)
  })
})

describe('energySleepBody', () => {
  const limited = ' (dados limitados, continue registrando)'

  it('reads a strong positive correlation above 0.6', () => {
    expect(energySleepBody(0.8, 10)).toBe(
      'Seu sono tem forte impacto positivo na sua energia no dia seguinte.',
    )
  })

  it('reads a moderate correlation above 0.3', () => {
    expect(energySleepBody(0.4, 10)).toBe(
      'Seu sono tem impacto moderado na sua energia no dia seguinte.',
    )
  })

  it('reads a negative correlation below -0.3', () => {
    expect(energySleepBody(-0.5, 10)).toBe(
      'Curiosamente, mais sono está associado a menos energia — vale investigar.',
    )
  })

  it('reports no clear relation in the middle band', () => {
    expect(energySleepBody(0, 10)).toBe(
      'Não encontramos uma relação clara entre seu sono e energia ainda.',
    )
  })

  it('falls to the lower band exactly on each threshold', () => {
    expect(energySleepBody(0.6, 10)).toBe(
      'Seu sono tem impacto moderado na sua energia no dia seguinte.',
    )
    expect(energySleepBody(0.3, 10)).toBe(
      'Não encontramos uma relação clara entre seu sono e energia ainda.',
    )
    expect(energySleepBody(-0.3, 10)).toBe(
      'Não encontramos uma relação clara entre seu sono e energia ainda.',
    )
  })

  it('appends the low-sample footnote under five pairs', () => {
    expect(energySleepBody(0.8, 3)).toBe(
      'Seu sono tem forte impacto positivo na sua energia no dia seguinte.' +
        limited,
    )
  })

  it('drops the footnote at exactly five pairs', () => {
    expect(energySleepBody(0.8, 4)).toBe(
      'Seu sono tem forte impacto positivo na sua energia no dia seguinte.' +
        limited,
    )
    expect(energySleepBody(0.8, 5)).toBe(
      'Seu sono tem forte impacto positivo na sua energia no dia seguinte.',
    )
  })
})
