import { z } from 'zod';

export const NotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.coerce.number().int().positive().optional(),
});

export type NotificationsQueryInput = z.infer<typeof NotificationsQuerySchema>;
