import bcrypt from "bcryptjs";
import { prisma } from '../lib/prisma'
import {
  generateToken as createJWT,
  generatePasswordResetToken,
  getPasswordResetExpiration,
  isTokenExpired
} from '@app/lib/jwt';

import {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  validateRequiredFields
} from "@app/utils/validators";

import { InvalidEmailError, ShortPasswordError } from '@app/lib/errors/UserErrors'

type UserOptions = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  encryptedPassword?: string;
};

const createUser = async (email: string, firstName: string, lastName: string, password: string) => {
  // Validate email format
  if (!isValidEmail(email)) {
    throw new InvalidEmailError()
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    throw new ShortPasswordError()
  }

  const encryptedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        encryptedPassword
      }
    });

    return user;
  } catch (err: any) {
    throw err;
  }
}

const generateToken = (userId: number, email: string) => {
  return createJWT(userId, email);
}

const findUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

const authenticateUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = bcrypt.compareSync(password, user.encryptedPassword);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return user;
};

const initiatePasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    // Don't reveal whether email exists
    return { success: true };
  }

  const resetToken = generatePasswordResetToken();
  const resetExpires = getPasswordResetExpiration();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    }
  });

  // In production, send email with reset link
  // For now, return token for testing
  return {
    success: true,
    token: resetToken,
    email: user.email
  };
};

const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { not: null }
    }
  });

  if (!user || !user.passwordResetExpires) {
    throw new Error('Invalid or expired reset token');
  }

  if (isTokenExpired(user.passwordResetExpires)) {
    throw new Error('Reset token has expired');
  }

  if (!isValidPassword(newPassword)) {
    throw new ShortPasswordError();
  }

  const encryptedPassword = bcrypt.hashSync(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      encryptedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  return { success: true };
};

const updateUser = async (user: any, data: UserOptions) => {
  const { password } = data;

  if (password) {
    const encryptedPassword = bcrypt.hashSync(password, 10);

    delete data.password;
    data = { ...data, encryptedPassword }
  }

  return await prisma.user.update({
    where: { id: user.id },
    data
  });
}

export {
  createUser,
  findUserById,
  generateToken,
  findUserByEmail,
  authenticateUser,
  initiatePasswordReset,
  resetPassword,
  updateUser
}
