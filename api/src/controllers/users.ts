import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  generateToken
} from '@app/models/user';

import {
  validateRequiredFields
} from '@app/utils/validators'

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate required fields
      const requiredValidation = validateRequiredFields(req.body, [
        'email', 'password', 'firstName'
      ]);

      if (!requiredValidation.valid) {
        return res.status(400).json({
          error: "Campos faltantes",
          missing: requiredValidation.missing
        });
      }

      const user = await createUser(
        email, firstName, lastName, password
      );

      const jwtToken = generateToken(user.id, user.email);

      res.status(201).json({ token: jwtToken });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { email, password, firstName, lastName } = req.body;

      const user = await findUserById(Number(id));

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado"
        })
      }

      if (email || password || firstName || lastName) {
        const response = await updateUser(user, {
          email, firstName, lastName
        })
      }

      const updated = await findUserById(Number(id))

      // TODO: Drop encrypted password & token here
      return res.status(200).json({
        user: updated
      })
    } catch (err) {
      next(err);
    }
  }
};
