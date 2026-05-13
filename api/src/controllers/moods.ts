import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import {
  createMood,
  getMoodsByUserId
} from '@app/services/mood.service';

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

  index: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moods = await getMoodsByUserId(Number(req.params.id));

      return res.status(200).json({
        moods
      })
    } catch (err) {
      next(err);
    }
  },
};
