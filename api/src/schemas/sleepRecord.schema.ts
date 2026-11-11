import { z } from 'zod';

export const CreateSleepRecordSchema = z.object({
  annotations: z.string().optional(),
  date: z.coerce.date(),
  average: z.number().min(0).max(15),
  wakeMinutes: z.number().int().min(0).max(1439).optional(),
});

export type CreateSleepRecordInput = z.infer<typeof CreateSleepRecordSchema>;

export const UpdateSleepRecordSchema = CreateSleepRecordSchema.partial();

export type UpdateSleepRecordInput = z.infer<typeof UpdateSleepRecordSchema>;
