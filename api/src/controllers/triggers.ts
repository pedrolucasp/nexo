import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import {
  createTrigger,
  getTriggersByUserId,
  destroyTriggerById,
  getTriggerById,
  updateTriggerById
} from '@app/services/trigger.service';
import {
  linkTriggerToMood,
  unlinkTriggerFromMood,
} from '@app/services/triggerMoodLink.service';

import {
  CreateTriggerSchema,
  UpdateTriggerSchema,
  LinkMoodSchema,
} from '@app/schemas'

export const TriggersController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateTriggerSchema.safeParse(req.body.trigger);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const trigger = await createTrigger(req.userId!, parsed.data);

      return res.status(201).json({ trigger });
    } catch (err) {
      next(err);
    }
  },

  index: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await getTriggersByUserId(Number(req.userId), {
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

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await destroyTriggerById(req.userId!, Number(req.params.id!));

      return res.status(200).json({})
    } catch (err) {
      next(err);
    }
  },

  show: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const trigger = await getTriggerById(Number(req.userId!), Number(req.params.id!));

      return res.status(200).json(trigger)
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = UpdateTriggerSchema.safeParse(req.body.trigger);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const trigger = await updateTriggerById(req.userId!, Number(req.params.id!), parsed.data);

      return res.status(200).json({ trigger });
    } catch (err) {
      next(err);
    }
  },

  linkMood: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = LinkMoodSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error!.issues });
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
