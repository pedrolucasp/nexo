import { prisma } from '@app/lib/prisma';
import { Prisma, User } from '@prisma/client';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { addMinutes } from "date-fns";

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
  PasswordResetInput,
  ActivateUserInput
} from '@app/schemas'

import { getQueue, MailJobName } from '@app/lib/queue';

class InvalidCredentialsError extends Error {
  constructor() { super('Invalid credentials') }
}

class InvalidOrExpiredTokenError extends Error {
  constructor() { super('Invalid or Expired reset token') }
}

export const login = async({ email, password }: LoginInput) => {
  const user = await findUserByEmail(email)!;

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

export const activateUser = async(user: User): Promise<User> => {
  return await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      active: true,
      activationCode: null,
      activationCodeExpiresAt: null
    }
  });
}

const ACTIVATION_CODE_LENGTH = 6;
const ACTIVATION_CODE_TTL_MINUTES = 5;
const ACTIVATION_CODE_MAX_ATTEMPTS = 5;

export const generateActivationCode = (): string =>
  Array.from({ length: ACTIVATION_CODE_LENGTH }, () => crypto.randomInt(0, 10)).join("");

const isUniqueConstraintViolation = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

export const issueActivationCode = async(userId: number): Promise<string> => {
  for (let attempt = 0; attempt < ACTIVATION_CODE_MAX_ATTEMPTS; attempt++) {
    const code = generateActivationCode();
    const expiresAt = addMinutes(new Date(), ACTIVATION_CODE_TTL_MINUTES);

    try {
      await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          activationCode: code,
          activationCodeExpiresAt: expiresAt
        }
      });

      return code;
    } catch (err) {
      if (!isUniqueConstraintViolation(err)) throw err;
    }
  }

  throw new Error("Could not issue a unique activation code");
}
