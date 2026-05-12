// Mail queue
export enum MailJobName {
  WelcomeEmail    = 'mail:welcome',
  PasswordReset   = 'mail:password-reset',
}

export type WelcomeEmailPayload    = { userId: number };
export type PasswordResetPayload   = { userId: number; token: string };

export type MailJobData =
  | { name: MailJobName.WelcomeEmail;  data: WelcomeEmailPayload }
  | { name: MailJobName.PasswordReset; data: PasswordResetPayload };
