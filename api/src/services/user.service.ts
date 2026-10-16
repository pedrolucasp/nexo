import { prisma } from '@app/lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import {
  CreateUserInput,
  UpdateUserInput
} from "@app/schemas";

import { CURRENT_TERMS_VERSION } from '@app/lib/constants';

export const createUser = async(input: CreateUserInput): Promise<User> => {
  const { password, acceptedTerms, ...data } = input;
  const encryptedPassword = bcrypt.hashSync(password, 10);

  return await prisma.user.create({
    data: {
      ...data,
      encryptedPassword,
      termsAcceptedAt: acceptedTerms ? new Date() : undefined,
      termsVersion: acceptedTerms ? CURRENT_TERMS_VERSION : undefined,
    }
  })
};

export const findUserById = async(id: number): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: {
      id
    }
  });
};

export const findUserByEmail = async(email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: {
      email
    }
  });
};

export const findUserByActivationCode = async(code: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: {
      activationCode: code,
      activationCodeExpiresAt: { gt: new Date() }
    }
  });
}

export const updateUser = async (input: UpdateUserInput): Promise<User> => {
  const { password, ...data } = input;

  const updateData = {
    ...data,
    ...(password && { encryptedPassword: bcrypt.hashSync(password, 10) })
  };

  return await prisma.user.update({
    where: {
      id: input.id
    },
    data: updateData
  })
}

export const findUsersElligibleForPush = async (): Promise<User[]> => {
  return await prisma.user.findMany({
    where: {
      pushToken: {
        not: null
      }
    }
  });
}
