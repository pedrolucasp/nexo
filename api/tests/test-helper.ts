import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

let prismaTestClient: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (!prismaTestClient) {
    // Use test database URL
    const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5430/orbit_test';
    const adapter = new PrismaPg({ connectionString });
    prismaTestClient = new PrismaClient({ adapter });
  }
  return prismaTestClient;
}

export async function cleanupTestDb() {
  const prisma = getTestPrisma();

  // Delete in correct order due to foreign keys
  // Add more tables as they're added to schema
  try {
    // When we add more models, delete them here in reverse order of dependencies
    await prisma.user.deleteMany({});
  } catch (err) {
    console.error('Error cleaning test DB:', err);
  }
}

export async function disconnectTestDb() {
  if (prismaTestClient) {
    await prismaTestClient.$disconnect();
    prismaTestClient = null;
  }
}

// Helper to create test users
export async function createTestUser(data?: {
  email?: string;
  firstName?: string;
  lastName?: string;
  encryptedPassword?: string;
}) {
  const prisma = getTestPrisma();
  return await prisma.user.create({
    data: {
      email: data?.email || 'test@example.com',
      firstName: data?.firstName || 'Test',
      lastName: data?.lastName || 'User',
      encryptedPassword: data?.encryptedPassword || '$2a$10$test'
    }
  });
}