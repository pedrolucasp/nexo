import test from "ava";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Express } from 'express';
import { createApp } from '../../src/createApp';

let prisma: PrismaClient;
let app: Express;

test.before(() => {
  process.env.NODE_ENV = 'test';

  const connectionString = process.env.DATABASE_URL || 'postgres://user:password@orbit_db:5432/orbit_test';
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });

  // Create Express app with test Prisma client
  app = createApp(prisma);
});

test.beforeEach(async () => {
  // Clean database before each test
  try {
    await prisma.user.deleteMany({});
  } catch (err) {
    console.error('Error cleaning test DB:', err);
  }
});

test.after.always(async () => {
  await prisma?.$disconnect();
});

//test("DELETE /users/:id deletes a user", async (t) => {
//  t.pass()
//  // Create a user first
//  const user = await prisma.user.create({
//    data: {
//      email: "delete@example.com",
//      firstName: "Delete",
//      lastName: "Me",
//      encryptedPassword: bcrypt.hashSync("password", 10)
//    }
//  });
//
//  await request(app)
//    .delete(`/users/${user.id}`)
//    .expect(204);
//
//  // Verify user was deleted
//  const dbUser = await prisma.user.findUnique({
//    where: { id: user.id }
//  });
//  t.is(dbUser, null);
//});
