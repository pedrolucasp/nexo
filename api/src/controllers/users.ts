import { Request, Response, NextFunction } from 'express';
import {
  findUserById,
  findUserByEmail,
  updateUser,
  generateToken
} from '@app/models/user';

import {
  validateRequiredFields
} from '@app/utils/validators'

import { getQueue, MailJobName } from '@app/lib/queue';
import {
  CreateUserSchema
} from '@app/schemas';

import {
  createUser
} from '@app/services/user.service';

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateUserSchema.safeParse(req.body.user);

      if (!parsed.success) {
        return res.status(422).json({
          errors: parsed.error!.issues
        })
      }

      const user = await createUser(parsed.data);
      const jwtToken = generateToken(user.id, user.email);

      const mailQueue = getQueue('mail');
      const job = await mailQueue.add(MailJobName.WelcomeEmail, { userId: user.id });

      res.status(201).json({
        token: jwtToken
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const { user: userParams } = req.body;

      if (userParams) {
        const { email, password, firstName, lastName } = userParams;

        const user = await findUserById(Number(id));

        if (!user) {
          return res.status(404).json({
            error: "Usuário não encontrado"
          })
        }

        if (email || password || firstName || lastName) {
          const response = await updateUser(user, {
            email, firstName, lastName, password
          })

          const updated = await findUserById(Number(id))

          // TODO: Drop encrypted password & token here
          return res.status(200).json({
            user: updated
          })
        } else {
          return res.status(200).json({
            user
          })
        }
      }
    } catch (err) {
      next(err);
    }
  }
};
