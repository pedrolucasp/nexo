import { z } from 'zod';

export const LinkMoodSchema = z.object({
  moodId: z.number().int().positive(),
  perceivedImpact: z.number().int().min(1).max(5),
});

export type LinkMoodInput = z.infer<typeof LinkMoodSchema>;
