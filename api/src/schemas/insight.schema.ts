import { z } from 'zod';
import { InsightPeriod, InsightType } from '@prisma/client';

export const InsightsQuerySchema = z.object({
  type: z.nativeEnum(InsightType).optional(),
  period: z.nativeEnum(InsightPeriod).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type InsightsQueryInput = z.infer<typeof InsightsQuerySchema>;
