import { describe, it, expect } from 'vitest'
import { User } from '@prisma/client'
import { publicUser } from '@app/lib/serializers/user'

const row = {
  id: 7,
  firstName: 'Pedro',
  lastName: 'Silva',
  email: 'pedro@example.com',
  encryptedPassword: 'bcrypt-hash',
  passwordResetToken: 'reset-secret',
  passwordResetExpires: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarKey: 'avatars/pedro.png',
  avatarURL: 'https://cdn.example.com/avatars/pedro.png',
  activationCode: '123456',
  activationCodeExpiresAt: new Date(),
  active: true,
  pushToken: 'device-token',
  notificationsEnabled: true,
  dailyReminderTime: '08:30',
  weeklyResumeEnabled: false,
  onboardingSeenAt: null,
  termsAcceptedAt: new Date(),
  termsVersion: '1',
} as User

describe('publicUser', () => {
  it('keeps the profile fields the client needs', () => {
    expect(publicUser(row)).toMatchObject({
      id: 7,
      email: 'pedro@example.com',
      firstName: 'Pedro',
      active: true,
      weeklyResumeEnabled: false,
      onboardingSeenAt: null,
    })
  })

  it('never carries a secret off the server', () => {
    const safe = publicUser(row) as Record<string, unknown>

    for (const field of [
      'encryptedPassword',
      'passwordResetToken',
      'passwordResetExpires',
      'activationCode',
      'activationCodeExpiresAt',
      'pushToken',
      'termsAcceptedAt',
      'termsVersion',
    ]) {
      expect(safe).not.toHaveProperty(field)
    }
  })
})
