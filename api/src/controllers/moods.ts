import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import { User } from '@prisma/client';
import {
  createMood,
  getMoodsByUserId,
  getMoodById,
  destroyMoodById
} from '@app/services/mood.service';

import {
  findUsersElligibleForPush
} from '@app/services/user.service';

import {
  CreateMoodSchema
} from '@app/schemas'

export const MoodsController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateMoodSchema.safeParse(req.body.mood);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const mood = await createMood(req.userId!, parsed.data);

      return res.status(201).json({ mood });
    } catch (err) {
      next(err);
    }
  },

  index: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await getMoodsByUserId(Number(req.userId), {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page:  req.query.page  ? Number(req.query.page)  : undefined,
        from:  req.query.from  as string | undefined,
        to:    req.query.to    as string | undefined,
      });

      return res.status(200).json(
        result
      )
    } catch (err) {
      next(err);
    }
  },

  show: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const mood = await getMoodById(Number(req.params.id));

      if (!mood) {
        return res.status(404).json({ errors: "Mood was not found" });
      }

      return res.status(200).json(
        mood
      );
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await destroyMoodById(req.userId!, Number(req.params.id!));

      return res.status(200).json({})
    } catch (err) {
      next(err);
    }
  },

  sendNotification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await findUsersElligibleForPush();

      if (users) {
        users.forEach(async (user: User) => {
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST', headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: user.pushToken,
              title: 'Como você está?',
              body: 'Adicione mais registros de humor.',
              data: { screen: 'notifications' }, // Deep link payload
            })
          });

          const data = await response.json();

          req.log.info("Resposta %s", data)
          console.log("Resposta ", data)
        })
      }

      return res.status(200).json(users)
    } catch (err) {
      next(err);
    }
  }
};
