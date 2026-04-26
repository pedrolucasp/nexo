import test from "ava";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { Express } from 'express';
import { createApp } from '../../src/createApp';

let prisma: PrismaClient;
let app: Express;

test.before(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';

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

test("POST /users creates a new user and returns JWT token", async (t) => {
  const userData = {
    email: "falamansa@example.com",
    firstName: "Fala",
    lastName: "Mansa",
    password: "IscreviSeuNomeNaAreia"
  };

  const response = await request(app)
    .post('/users')
    .send(userData)
    .expect('Content-Type', /json/)
    .expect(201);

  // Should return a JWT token
  t.truthy(response.body.token);

  // Verify the token is valid
  const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
  t.is(decoded.email, userData.email);
  t.truthy(decoded.userId);

  // Verify user was created in database
  const dbUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });
  t.truthy(dbUser);
  t.is(dbUser!.email, userData.email);
  t.is(dbUser!.firstName, userData.firstName);
  t.is(dbUser!.lastName, userData.lastName);
});

test("POST /users returns 400 for missing required fields", async (t) => {
  const response = await request(app)
    .post('/users')
    .send({
      email: "invalid@example.com"
      // Missing firstName and password
    })
    .expect('Content-Type', /json/)
    .expect(400);

  t.truthy(response.body.error);
  t.is(response.body.error, "Campos faltantes"); // TODO: i18n?
  t.truthy(response.body.missing);
  t.true(response.body.missing.includes('password'));
  t.true(response.body.missing.includes('firstName'));
});

test("POST /users returns 409 for duplicate email", async (t) => {
  const email = "duplicate@example.com";

  // Create first user
  await prisma.user.create({
    data: {
      email,
      firstName: "First",
      lastName: "User",
      encryptedPassword: "$2a$10$test"
    }
  });

  // Try to create second user with same email
  const response = await request(app)
    .post('/users')
    .send({
      email,
      firstName: "Second",
      lastName: "User",
      password: "hunter2"
    })
    .expect('Content-Type', /json/)
    .expect(409);

  t.truthy(response.body.error);
});

test("createApp successfully integrates with Prisma and Express", async (t) => {
  // Test that the app factory works correctly
  const testApp = createApp(prisma);

  t.truthy(testApp);
  t.is(typeof testApp.use, 'function');
  t.is(typeof testApp.listen, 'function');

  // Verify the app has the prisma client in locals
  t.is(testApp.locals.prisma, prisma);
});
