import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { formatValidationError } from '@app/lib/errors/validationError'

describe('formatValidationError', () => {
  it('keys a single field by its name', () => {
    const schema = z.object({ email: z.string().email() })
    const parsed = schema.safeParse({ email: 'nope' })

    if (parsed.success) throw new Error('expected validation to fail')

    const { error, fields } = formatValidationError(parsed.error)

    expect(Object.keys(fields)).toEqual(['email'])
    expect(typeof fields.email).toBe('string')
    expect(fields.email.length).toBeGreaterThan(0)
    expect(error).toContain(fields.email)
  })

  it('joins the segments of a nested path with dots', () => {
    const schema = z.object({ profile: z.object({ age: z.number() }) })
    const parsed = schema.safeParse({ profile: { age: 'x' } })

    if (parsed.success) throw new Error('expected validation to fail')

    const { fields } = formatValidationError(parsed.error)

    expect(Object.keys(fields)).toEqual(['profile.age'])
  })

  it('keeps only the first message for a field', () => {
    const schema = z.object({ code: z.string().min(5).regex(/^a/) })
    const parsed = schema.safeParse({ code: 'b' })

    if (parsed.success) throw new Error('expected validation to fail')

    const { fields } = formatValidationError(parsed.error)

    expect(parsed.error.issues.length).toBeGreaterThan(1)
    expect(fields.code).toBe(parsed.error.issues[0].message)
    expect(fields.code).not.toBe(parsed.error.issues[1].message)
  })
})
