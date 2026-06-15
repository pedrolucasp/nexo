import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import {
  createSleepRecord,
  getSleepRecordsByUserId,
  destroySleepRecordById,
  getSleepRecordById
} from '@app/services/sleepRecord.service';

import {
  CreateSleepRecordSchema
} from '@app/schemas'

export const SleepRecordsController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateSleepRecordSchema.safeParse(req.body.sleepRecord);

      if (!parsed.success) {
        return res.status(400).json({
          errors: parsed.error!.issues
        });
      }

      const sleepRecord = await createSleepRecord(req.userId!, parsed.data);

      return res.status(201).json({ sleepRecord });
    } catch (err) {
      next(err);
    }
  },

  index: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await getSleepRecordsByUserId(Number(req.userId), {
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
      const sleepRecord = await getSleepRecordById(Number(req.userId!), Number(req.params.id!));

      return res.status(200).json(sleepRecord)
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await destroySleepRecordById(req.userId!, Number(req.params.id!));

      return res.status(200).json({})
    } catch (err) {
      next(err);
    }
  }
};
