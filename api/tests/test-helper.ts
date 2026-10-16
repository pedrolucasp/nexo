import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { expect } from 'vitest'

export function buildPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export async function cleanupTestDb(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe('TRUNCATE users CASCADE')
}

export function generateTestToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: {
    email?: string
    firstName?: string
    lastName?: string
    password?: string
    pushToken?: string
    notificationsEnabled?: boolean
  } = {}
) {
  const { password, pushToken, notificationsEnabled, ...rest } = overrides
  return prisma.user.create({
    data: {
      email: rest.email ?? 'test@example.com',
      firstName: rest.firstName ?? 'Test',
      lastName: rest.lastName ?? 'User',
      encryptedPassword: await bcrypt.hash(password ?? 'password123', 10),
      ...(pushToken !== undefined && { pushToken }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
    },
  })
}

// Fields that must never leave the API. Asserting absence at every
// user-returning endpoint is the regression net for the raw-row leak: a failure
// means an endpoint started handing back a Prisma row again.
const SECRET_FIELDS = [
  'encryptedPassword',
  'passwordResetToken',
  'passwordResetExpires',
  'activationCode',
  'activationCodeExpiresAt',
  'pushToken',
] as const

export function expectPublicUser(user: Record<string, unknown> | undefined) {
  expect(user).toBeDefined()
  for (const field of SECRET_FIELDS) {
    expect(user).not.toHaveProperty(field)
  }
}
