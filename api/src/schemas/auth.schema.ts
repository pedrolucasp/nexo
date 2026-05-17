import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email()
});

export const PasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
})

export type LoginInput = z.infer<typeof LoginSchema>;
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;
