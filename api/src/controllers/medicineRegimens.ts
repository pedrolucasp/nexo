import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@app/middleware/auth';
import { CreateMedicineRegimenSchema, UpdateMedicineRegimenSchema } from '@app/schemas';
import {
  getMedicineRegimensByUserId,
  createMedicineRegimen,
  updateMedicineRegimen,
  deactivateMedicineRegimen,
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

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateMedicineRegimenSchema.safeParse(req.body.regimen);

      if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error!.issues });
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
        return res.status(400).json({ errors: parsed.error!.issues });
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

  destroy: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await deactivateMedicineRegimen(req.userId!, Number(req.params.id));

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  },
};
