import { Request, Response, NextFunction } from 'express';
import {
  generateToken
} from '@app/services/auth.service';

import { getQueue, MailJobName } from '@app/lib/queue';
import {
  CreateUserSchema,
  UpdateUserSchema
} from '@app/schemas';

import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser
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
      const { id } = req.params;

      const parsed = UpdateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const user = await findUserById(Number(id));

      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado"
        });
      }

      const updated = await updateUser(parsed.data);

      // TODO: Drop encrypted password & token here
      return res.status(200).json({
        user: updated
      });
    } catch (err) {
      next(err);
    }
  }
};
