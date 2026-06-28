import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import { CareActionType } from '@prisma/client';
import { CreateCareActionSchema, PatchCareActionSchema } from '@app/schemas';
import { formatValidationError } from '@app/lib/errors/validationError';
import {
  getCareActionsByUserId,
  getCareActionById,
  createCareAction,
  destroyCareActionById,
  patchCareActionById,
} from '@app/services/careAction.service';

export const CareActionsController = {
  index: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await getCareActionsByUserId(Number(req.userId), {
        type: req.query.type as CareActionType | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
      });

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  show: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const careAction = await getCareActionById(
        Number(req.userId),
        Number(req.params.id),
      );

      if (!careAction) {
        return res.status(404).json({ errors: 'Care action was not found' });
      }

      return res.status(200).json(careAction);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateCareActionSchema.safeParse(req.body.careAction);

      req.log.info("Params: %s", req.body.careAction)
      req.log.info("Care action: %s", parsed.error)

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const careAction = await createCareAction(req.userId!, parsed.data);

      return res.status(201).json({ careAction });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await destroyCareActionById(req.userId!, Number(req.params.id));

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  },

  patch: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = PatchCareActionSchema.safeParse(req.body.careAction);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const careAction = await patchCareActionById(
        req.userId!,
        Number(req.params.id),
        parsed.data,
      );

      if (!careAction) {
        return res.status(404).json({ errors: 'Care action was not found' });
      }

      return res.status(200).json(careAction);
    } catch (err) {
      next(err);
    }
  },
};
