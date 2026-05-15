import { prisma } from '@app/lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import {
  CreateUserInput,
  UpdateUserInput,
} from "@app/schemas";

export const createUser = async(input: CreateUserInput): Promise<User> => {
  const { password, ...data } = input;
  const encryptedPassword = bcrypt.hashSync(password, 10);

  return await prisma.user.create({
    data: {
      ...data, encryptedPassword
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
