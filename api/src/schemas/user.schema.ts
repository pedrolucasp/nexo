import { z } from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  pushToken: z.string().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.number(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UpdateUserPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  dailyReminderTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
});

export type UpdateUserPreferencesInput = z.infer<typeof UpdateUserPreferencesSchema>;
