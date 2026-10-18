import { describe, it, expect } from 'vitest'
import { isTokenExpired, getPasswordResetExpiration } from '@app/lib/jwt'

describe('isTokenExpired', () => {
  it('treats a past date as expired', () => {
    expect(isTokenExpired(new Date(Date.now() - 60_000))).toBe(true)
  })

  it('treats a future date as live', () => {
    expect(isTokenExpired(new Date(Date.now() + 60_000))).toBe(false)
  })
})

describe('getPasswordResetExpiration', () => {
  it('lands one hour ahead of now', () => {
    const oneHour = 60 * 60 * 1000
    const before = Date.now()
    const expiration = getPasswordResetExpiration()
    const after = Date.now()

    expect(expiration.getTime()).toBeGreaterThanOrEqual(before + oneHour)
    expect(expiration.getTime()).toBeLessThanOrEqual(after + oneHour)
  })
})
