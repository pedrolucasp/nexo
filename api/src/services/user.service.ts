import { prisma } from '@app/lib/prisma';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import {
  CreateUserInput
} from "@app/schemas";

export const createUser = async(input: CreateUserInput): Promise<User> => {
  const { password, ...data } = input;
  const encryptedPassword = bcrypt.hashSync(password, 10);

  return await prisma.user.create({
    data: {
      ...data, encryptedPassword
    }
  })
}
