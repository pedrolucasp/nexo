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

//test("GET /users/:id retrieves a user", async (t) => {
//  t.pass()
//  // Create a user first
//  const user = await prisma.user.create({
//    data: {
//      email: "get@example.com",
//      firstName: "Get",
//      lastName: "User",
//      encryptedPassword: bcrypt.hashSync("password", 10)
//    }
//  });
//
//  const response = await request(app)
//    .get(`/users/${user.id}`)
//    .expect('Content-Type', /json/)
//    .expect(200);
//
//  t.is(response.body.id, user.id);
//  t.is(response.body.email, user.email);
//  t.is(response.body.firstName, user.firstName);
//  t.is(response.body.lastName, user.lastName);
//  t.falsy(response.body.encryptedPassword); // Should not expose password
//});
//
//test("GET /users/:id returns 404 for non-existent user", async (t) => {
//  const response = await request(app)
//    .get('/users/999999')
//    .expect('Content-Type', /json/)
//    .expect(404);
//
//  t.truthy(response.body.error);
//});
