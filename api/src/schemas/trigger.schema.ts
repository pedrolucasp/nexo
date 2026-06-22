import { z } from 'zod';
import {
  TriggerType
} from '@prisma/client';

export const CreateTriggerSchema = z.object({
  comment: z.string().optional(),
  moment: z.coerce.date(),
  category: z.nativeEnum(TriggerType)
});

export type CreateTriggerInput = z.infer<typeof CreateTriggerSchema>;

export const UpdateTriggerSchema = CreateTriggerSchema.partial();

export type UpdateTriggerInput = z.infer<typeof UpdateTriggerSchema>;
