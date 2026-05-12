// Mail queue
export enum MailJobName {
  WelcomeEmail    = 'mail:welcome',
  PasswordReset   = 'mail:password-reset',
}

export type WelcomeEmailPayload    = { userId: string };
export type PasswordResetPayload   = { userId: string; token: string };

export type MailJobData =
  | { name: MailJobName.WelcomeEmail;  data: WelcomeEmailPayload }
  | { name: MailJobName.PasswordReset; data: PasswordResetPayload };
