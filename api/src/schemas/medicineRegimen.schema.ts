import { z } from 'zod';
import { MedicinePeriodicity } from '@prisma/client';

export const CreateMedicineRegimenSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  periodicity: z.nativeEnum(MedicinePeriodicity),
  scheduledAt: z.array(z.string()).optional().default([]),
});

export type CreateMedicineRegimenInput = z.infer<typeof CreateMedicineRegimenSchema>;

export const UpdateMedicineRegimenSchema = z.object({
  name: z.string().min(1).optional(),
  dosage: z.string().min(1).optional(),
  periodicity: z.nativeEnum(MedicinePeriodicity).optional(),
  scheduledAt: z.array(z.string()).optional().default([]),
  active: z.boolean().optional(),
});

export type UpdateMedicineRegimenInput = z.infer<typeof UpdateMedicineRegimenSchema>;

export const ToggleMedicineRegimenSchema = z.object({
  active: z.boolean(),
});

export type ToggleMedicineRegimenInput = z.infer<typeof ToggleMedicineRegimenSchema>;
