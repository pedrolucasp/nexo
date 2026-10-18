import { describe, it, expect } from 'vitest'
import { TriggerType } from '@prisma/client'
import {
  countTriggerCategories,
  triggerPatternBody,
} from '@app/lib/queue/processors/insights/triggerPattern'

const trigger = (category: TriggerType) => ({ category })

describe('countTriggerCategories', () => {
  it('counts each category and sorts the most frequent first', () => {
    const sorted = countTriggerCategories([
      trigger('WORK'),
      trigger('SOCIAL'),
      trigger('WORK'),
      trigger('OTHER'),
      trigger('WORK'),
    ])

    expect(sorted).toEqual([
      ['WORK', 3],
      ['SOCIAL', 1],
      ['OTHER', 1],
    ])
  })

  it('leads with the top category', () => {
    const [top] = countTriggerCategories([
      trigger('HEALTH'),
      trigger('HEALTH'),
      trigger('SOCIAL'),
    ])

    expect(top).toEqual(['HEALTH', 2])
  })

  it('returns an empty distribution for no triggers', () => {
    expect(countTriggerCategories([])).toEqual([])
  })
})

describe('triggerPatternBody', () => {
  it('names the category and its share of the period', () => {
    expect(triggerPatternBody('WORK', 3, 6)).toBe(
      'Gatilhos de trabalho foram os mais frequentes, representando 50% dos registros do período.',
    )
  })

  it('wraps an OTHER category in the generic wording', () => {
    expect(triggerPatternBody('OTHER', 2, 4)).toBe(
      'Gatilhos do tipo "outros" foram os mais frequentes, ' +
        'representando 50% dos registros do período.',
    )
  })
})
