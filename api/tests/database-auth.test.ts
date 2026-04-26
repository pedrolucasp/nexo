import test from "ava";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

let prisma: PrismaClient;

test.before(() => {
  process.env.NODE_ENV = 'test';

  const connectionString = process.env.DATABASE_URL || 'postgres://user:password@orbit_db:5432/orbit_test';
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
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
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteUsers
  ])

  await prisma?.$disconnect();
});

// Basic database connectivity test
test("database connection works", async (t) => {
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  t.truthy(result);
});

// User creation and authentication tests
test("can create user with encrypted password", async (t) => {
  const encryptedPassword = bcrypt.hashSync("testPassword123", 10);

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      encryptedPassword: encryptedPassword
    }
  });

  t.is(user.email, "test@example.com");
  t.is(user.firstName, "Test");
  t.truthy(user.id);

  // Verify password can be validated
  t.true(bcrypt.compareSync("testPassword123", user.encryptedPassword));
  t.false(bcrypt.compareSync("wrongPassword", user.encryptedPassword));
});

test("can find user by email for authentication", async (t) => {
  // Create user
  await prisma.user.create({
    data: {
      email: "login@example.com",
      firstName: "Login",
      lastName: "User",
      encryptedPassword: bcrypt.hashSync("password123", 10)
    }
  });

  // Simulate login lookup
  const foundUser = await prisma.user.findUnique({
    where: { email: "login@example.com" }
  });

  t.truthy(foundUser);
  t.is(foundUser!.email, "login@example.com");
  t.true(bcrypt.compareSync("password123", foundUser!.encryptedPassword));
  t.false(bcrypt.compareSync("wrongPassword", foundUser!.encryptedPassword));
});

test("email uniqueness constraint prevents duplicate registrations", async (t) => {
  const email = "duplicate@example.com";

  // Create first user
  await prisma.user.create({
    data: {
      email,
      firstName: "First",
      lastName: "User",
      encryptedPassword: bcrypt.hashSync("password", 10)
    }
  });

  // Try to create second user with same email - should fail
  await t.throwsAsync(
    async () => {
      await prisma.user.create({
        data: {
          email,
          firstName: "Second",
          lastName: "User",
          encryptedPassword: bcrypt.hashSync("password", 10)
        }
      });
    }
  );
});

test("password reset flow works with database", async (t) => {
  const resetToken = "reset-token-123";
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

  // Create user
  const user = await prisma.user.create({
    data: {
      email: "reset@example.com",
      firstName: "Reset",
      lastName: "User",
      encryptedPassword: bcrypt.hashSync("oldPassword", 10)
    }
  });

  // Step 1: Set reset token (forgot password)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    }
  });

  // Step 2: Find user by reset token
  const userWithToken = await prisma.user.findFirst({
    where: {
      passwordResetToken: resetToken,
      passwordResetExpires: { gte: new Date() } // Token not expired
    }
  });

  t.truthy(userWithToken);
  t.is(userWithToken!.email, "reset@example.com");

  // Step 3: Reset password
  const newPassword = bcrypt.hashSync("newPassword123", 10);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      encryptedPassword: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  // Verify new password works and reset fields are cleared
  t.true(bcrypt.compareSync("newPassword123", updatedUser.encryptedPassword));
  t.false(bcrypt.compareSync("oldPassword", updatedUser.encryptedPassword));
  t.is(updatedUser.passwordResetToken, null);
  t.is(updatedUser.passwordResetExpires, null);
});

test("expired reset tokens are not found", async (t) => {
  const expiredResetToken = "expired-token";
  const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

  // Create user with expired token
  const user = await prisma.user.create({
    data: {
      email: "expired@example.com",
      firstName: "Expired",
      lastName: "User",
      encryptedPassword: bcrypt.hashSync("password", 10),
      passwordResetToken: expiredResetToken,
      passwordResetExpires: pastDate
    }
  });

  // Try to find user by expired token
  const foundUser = await prisma.user.findFirst({
    where: {
      passwordResetToken: expiredResetToken,
      passwordResetExpires: { gte: new Date() } // Token not expired
    }
  });

  // Should not find the user because token is expired
  t.is(foundUser, null);

  // But user still exists
  const stillExists = await prisma.user.findUnique({ where: { id: user.id } });
  t.truthy(stillExists);
});

test("user profile update works", async (t) => {
  // Create user
  const user = await prisma.user.create({
    data: {
      email: "profile@example.com",
      firstName: "Original",
      lastName: "Name",
      encryptedPassword: bcrypt.hashSync("password", 10)
    }
  });

  // Update profile
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: "Updated",
      lastName: "Profile"
    }
  });

  t.is(updatedUser.firstName, "Updated");
  t.is(updatedUser.lastName, "Profile");
  t.is(updatedUser.email, "profile@example.com"); // Should remain unchanged
  t.true(updatedUser.updatedAt > user.updatedAt); // updatedAt should be newer
});

test("timestamps are automatically managed", async (t) => {
  const beforeCreate = new Date();

  const user = await prisma.user.create({
    data: {
      email: "timestamps@example.com",
      firstName: "Time",
      lastName: "Stamps",
      encryptedPassword: bcrypt.hashSync("password", 10)
    }
  });

  const afterCreate = new Date();

  // Check creation timestamps
  t.true(user.createdAt >= beforeCreate);
  t.true(user.createdAt <= afterCreate);
  t.true(user.updatedAt >= beforeCreate);
  t.true(user.updatedAt <= afterCreate);

  // Wait and update to test updatedAt behavior
  await new Promise(resolve => setTimeout(resolve, 100));
  const beforeUpdate = new Date();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { firstName: "Updated" }
  });

  const afterUpdate = new Date();

  // createdAt should remain the same, updatedAt should be newer
  t.deepEqual(updatedUser.createdAt, user.createdAt);
  t.true(updatedUser.updatedAt >= beforeUpdate);
  t.true(updatedUser.updatedAt <= afterUpdate);
  t.true(updatedUser.updatedAt > user.updatedAt);
});
