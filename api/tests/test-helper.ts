import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
