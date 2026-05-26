import { z } from 'zod';

export const CreateSleepRecordSchema = z.object({
  annotations: z.string().optional(),
  date: z.coerce.date(),
  average: z.number().min(0).max(15),
});

export type CreateSleepRecordInput = z.infer<typeof CreateSleepRecordSchema>;
