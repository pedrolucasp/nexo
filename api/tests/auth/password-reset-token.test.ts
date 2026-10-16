import { describe, it, expect } from 'vitest'
import { generatePasswordResetToken } from '@app/lib/jwt'

describe('generatePasswordResetToken', () => {
  it('produces an opaque 64-character hex token', () => {
    expect(generatePasswordResetToken()).toMatch(/^[0-9a-f]{64}$/)
  })

  it('does not repeat across draws', () => {
    const tokens = new Set(
      Array.from({ length: 100 }, () => generatePasswordResetToken()),
    )

    expect(tokens.size).toBe(100)
  })
})
