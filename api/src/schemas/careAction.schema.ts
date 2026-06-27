import { z } from 'zod';
import {
  CareActionType,
  AppointmentType,
  ActivityType,
  MedicinePeriodicity,
} from '@prisma/client';

const MedicineInlineSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  periodicity: z.nativeEnum(MedicinePeriodicity),
  scheduledAt: z.array(z.string()).optional().default([]),
});

export const CreateCareActionSchema = z.object({
  type: z.nativeEnum(CareActionType),
  moment: z.coerce.date(),
  triggerId: z.number().int().positive().optional(),
  moodId: z.number().int().positive().optional(),

  // MEDICINE fields
  regimenId: z.number().int().positive().optional(),
  medicine: MedicineInlineSchema.optional(),

  // APPOINTMENT fields
  appointment: z
    .object({
      type: z.nativeEnum(AppointmentType),
      duration: z.number().int().positive(),
      note: z.string().optional(),
    })
    .optional(),

  // ACTIVITY fields
  activity: z
    .object({
      type: z.nativeEnum(ActivityType),
      duration: z.number().int().positive().optional(),
    })
    .optional(),
});

export type CreateCareActionInput = z.infer<typeof CreateCareActionSchema>;

export const PatchCareActionSchema = z.object({
  triggerId: z.number().int().positive().optional(),
  moodId: z.number().int().positive().optional(),
}).strict();

export type PatchCareActionInput = z.infer<typeof PatchCareActionSchema>;
