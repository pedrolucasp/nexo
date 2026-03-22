import bcrypt from "bcryptjs";
import { prisma } from '../lib/prisma'

import {
  isValidEmail,
  isValidPassword,
  sanitizeString,
  validateRequiredFields
} from "@app/utils/validators";

import { InvalidEmailError, ShortPasswordError } from '@app/lib/errors/UserErrors'

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
    console.log(err)
    throw new Error("Something was off when creating user")
  }
}

const generateToken = (userId: number) => {
  return 'xxx' + userId
}

export {
  createUser,
  generateToken
}
