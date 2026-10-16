import { z } from 'zod';
import { isMatch } from 'date-fns';
import { InsightPeriod, InsightType } from '@prisma/client';

export const InsightsQuerySchema = z.object({
  type: z.nativeEnum(InsightType).optional(),
  period: z.nativeEnum(InsightPeriod).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => isMatch(value, 'yyyy-MM-dd'))
    .optional(),
});

export type InsightsQueryInput = z.infer<typeof InsightsQuerySchema>;
