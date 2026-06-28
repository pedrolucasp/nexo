import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import { CreateMedicineRegimenSchema, UpdateMedicineRegimenSchema } from '@app/schemas';
import { ToggleMedicineRegimenSchema } from '@app/schemas/medicineRegimen.schema';
import { formatValidationError } from '@app/lib/errors/validationError';
import {
  getMedicineRegimensByUserId,
  getMedicineRegimenById,
  createMedicineRegimen,
  updateMedicineRegimen,
  deactivateMedicineRegimen,
  getTodayMedicineRegimens,
  toggleMedicineRegimen,
} from '@app/services/medicineRegimen.service';

export const MedicineRegimensController = {
  index: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const regimens = await getMedicineRegimensByUserId(Number(req.userId));

      return res.status(200).json({ regimens });
    } catch (err) {
      next(err);
    }
  },

  today: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const regimens = await getTodayMedicineRegimens(req.userId!);

      return res.status(200).json({ regimens });
    } catch (err) {
      next(err);
    }
  },

  show: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const regimen = await getMedicineRegimenById(req.userId!, Number(req.params.id));

      if (!regimen) return res.status(404).json({ error: 'Not found' });

      return res.status(200).json({ regimen });
    } catch (err) {
      next(err);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateMedicineRegimenSchema.safeParse(req.body.regimen);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const regimen = await createMedicineRegimen(req.userId!, parsed.data);

      return res.status(201).json({ regimen });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = UpdateMedicineRegimenSchema.safeParse(req.body.regimen);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const regimen = await updateMedicineRegimen(
        req.userId!,
        Number(req.params.id),
        parsed.data,
      );

      return res.status(200).json({ regimen });
    } catch (err) {
      next(err);
    }
  },

  toggle: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = ToggleMedicineRegimenSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json(formatValidationError(parsed.error!));
      }

      const regimen = await toggleMedicineRegimen(
        req.userId!,
        Number(req.params.id),
        parsed.data.active,
      );

      return res.status(200).json({ regimen });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await deactivateMedicineRegimen(req.userId!, Number(req.params.id));

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  },
};
