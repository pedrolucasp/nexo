import { z } from 'zod';
import {
  BaseMoodOption,
  MoodComponentOption,
  IntensityLevel
} from '@prisma/client';

export const MoodComponentSchema = z.object({
  component: z.nativeEnum(MoodComponentOption),
  intensity: z.nativeEnum(IntensityLevel)
});

export const CreateMoodSchema = z.object({
  annotation: z.string().optional(),
  moment: z.coerce.date(),
  selectedMood: z.nativeEnum(BaseMoodOption),
  anxietyLevel: z.number().int().min(0).max(10),
  stressLevel: z.number().int().min(0).max(10),
  energyLevel: z.number().int().min(0).max(10),
  moodComponents: z.array(MoodComponentSchema).min(1)
});

export type CreateMoodInput = z.infer<typeof CreateMoodSchema>;
