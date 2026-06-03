// Mail queue
export enum MailJobName {
  WelcomeEmail         = 'mail:welcome',
  PasswordReset        = 'mail:password-reset',
  ActivateAccountEmail = 'mail:activate-account'
}

export type WelcomeEmailPayload    = { userId: number; code: string };
export type PasswordResetPayload   = { userId: number; token: string };
export type ActivateAccountEmailPayload = { userId: number; code: string };

export type MailJobData =
  | { name: MailJobName.WelcomeEmail;  data: WelcomeEmailPayload }
  | { name: MailJobName.PasswordReset; data: PasswordResetPayload }
  | { name: MailJobName.ActivateAccountEmail; data: ActivateAccountEmailPayload };
