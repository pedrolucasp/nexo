import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  generateToken
} from '@app/models/user';

import {
  validateRequiredFields
} from '@app/utils/validators'

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, first_name: firstName, last_name: lastName } = req.body;

      // Validate required fields
      const requiredValidation = validateRequiredFields(req.body, [
        'email', 'password', 'first_name'
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

      const jwtToken = generateToken(user.id);

      res.status(201).json({ token: jwtToken });
    } catch (err) {
      next(err);
    }
  }
};
