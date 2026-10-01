import { describe, it, expect } from 'vitest'
import { generateActivationCode } from '@app/services/auth.service'

describe('generateActivationCode', () => {
  it('produces exactly six decimal digits on every draw', () => {
    const codes = Array.from({ length: 500 }, () => generateActivationCode())

    for (const code of codes) {
      expect(code).toMatch(/^\d{6}$/)
    }
  })

  it('reaches the digit nine', () => {
    const digits = Array.from({ length: 500 }, () => generateActivationCode()).join('')

    expect(digits).toContain('9')
  })
})
