import { z } from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  pushToken: z.string().optional(),
  acceptedTerms: z.literal(true),
});

export const UpdateUserSchema = CreateUserSchema.omit({ acceptedTerms: true })
  .partial()
  .extend({
    id: z.number(),
  });

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UpdateUserPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  dailyReminderTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  weeklyResumeEnabled: z.boolean().optional(),
});

export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
