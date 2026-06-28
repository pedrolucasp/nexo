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
  overrides: { email?: string; firstName?: string; lastName?: string; password?: string } = {}
) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? 'test@example.com',
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      encryptedPassword: await bcrypt.hash(overrides.password ?? 'password123', 10),
    },
  })
}
