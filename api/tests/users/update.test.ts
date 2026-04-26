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

test("PUT /users/:id updates user profile", async (t) => {
  // Create a user first
  const user = await prisma.user.create({
    data: {
      email: "update@example.com",
      firstName: "Original",
      lastName: "Name",
      encryptedPassword: bcrypt.hashSync("password", 10)
    }
  });

  const updateData = {
    firstName: "Updated",
    lastName: "Profile"
  };

  // TODO: Gotta check why its failing. Most likely due to the
  // cors/credentials: true line
  const response = await request(app)
    .put(`/users/${user.id}`)
    .send(updateData)
    .expect('Content-Type', /json/)
    .expect(200);

  t.is(response.body.user.firstName, updateData.firstName);
  t.is(response.body.user.lastName, updateData.lastName);
  t.is(response.body.user.email, user.email); // Should remain unchanged

  // Verify in database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  t.is(dbUser!.firstName, updateData.firstName);
  t.is(dbUser!.lastName, updateData.lastName);
});

test("PUT /users/:id returns 404 for non-existent user", async (t) => {
  const response = await request(app)
    .put('/users/999999')
    .send({
      firstName: "Updated",
      lastName: "Name"
    })
    .expect('Content-Type', /json/)
    .expect(404);

  t.truthy(response.body.error);
});
