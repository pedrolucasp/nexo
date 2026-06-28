import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import { LinkMoodSchema } from '@app/schemas';
import { formatValidationError } from '@app/lib/errors/validationError';
import {
  linkTriggerToMood,
  unlinkTriggerFromMood,
} from '@app/services/triggerMoodLink.service';

export const TriggerMoodLinksController = {
  linkMood: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = LinkMoodSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const triggerId = Number(req.params.triggerId);
      const { moodId, perceivedImpact } = parsed.data;

      const link = await linkTriggerToMood(triggerId, moodId, perceivedImpact);

      return res.status(201).json({ link });
    } catch (err) {
      next(err);
    }
  },

  unlinkMood: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const triggerId = Number(req.params.triggerId);
      const moodId = Number(req.params.moodId);

      await unlinkTriggerFromMood(triggerId, moodId);

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  },
};
