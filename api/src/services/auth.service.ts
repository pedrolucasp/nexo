import { prisma } from '@app/lib/prisma';
import bcrypt from "bcryptjs";

import {
  generateToken as createJWT,
  generatePasswordResetToken,
  getPasswordResetExpiration,
  isTokenExpired
} from '@app/lib/jwt';

import {
  findUserByEmail
} from '@app/services/user.service'; // Replace with a barrel import

import {
  LoginInput,
  PasswordResetRequestInput,
  PasswordResetInput
} from '@app/schemas'

import { getQueue, MailJobName } from '@app/lib/queue';

class InvalidCredentialsError extends Error {
  constructor() { super('Invalid credentials') }
}

class InvalidOrExpiredTokenError extends Error {
  constructor() { super('Invalid or Expired reset token') }
}

export const login = async({ email, password }: LoginInput) => {
  const user = await findUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.encryptedPassword)) {
    throw new InvalidCredentialsError();
  }

  const token = generateToken(user.id, user.email);

  return { user, token };
};

export const requestPasswordReset = async ({ email }: PasswordResetRequestInput) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return { success: true };
  }

  const resetToken = generatePasswordResetToken();
  const resetExpires = getPasswordResetExpiration();

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    }
  });

  const mailQueue = getQueue('mail');
  const job = await mailQueue.add(MailJobName.PasswordReset, {
    userId: user.id,
    token: resetToken
  });

  return {
    success: true,
    token: resetToken
  };
};

export const resetPassword = async ({ token, newPassword }: PasswordResetInput) => {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { not: null }
    }
  });

  if (!user || !user.passwordResetExpires || isTokenExpired(user.passwordResetExpires)) {
    throw new InvalidOrExpiredTokenError();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      encryptedPassword: bcrypt.hashSync(newPassword, 10),
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  return {
    success: true
  };
};

export const generateToken = (userId: number, email: string) => {
  return createJWT(userId, email);
};
