// Mail queue
export enum MailJobName {
  WelcomeEmail = "mail:welcome",
  PasswordReset = "mail:password-reset",
  ActivateAccountEmail = "mail:activate-account",
}

export type WelcomeEmailPayload = { userId: number; code: string };
export type PasswordResetPayload = { userId: number; token: string };
export type ActivateAccountEmailPayload = { userId: number; code: string };

export type MailJobData =
  | { name: MailJobName.WelcomeEmail; data: WelcomeEmailPayload }
  | { name: MailJobName.PasswordReset; data: PasswordResetPayload }
  | {
      name: MailJobName.ActivateAccountEmail;
      data: ActivateAccountEmailPayload;
    };

// Insight queue
export enum InsightJobName {
  FanOut = "insight:fan-out",
  MoodTrend = "insight:mood-trend",
  EnergySleep = "insight:energy-sleep",
  TriggerPattern = "insight:trigger-pattern",
}

export type InsightPeriodPayload = {
  userId: number;
  periodStart: string;
  periodEnd: string;
};

export type InsightFanOutPayload = Record<string, never>; // no data, just triggers

export type InsightJobData =
  | { name: InsightJobName.FanOut; data: InsightFanOutPayload }
  | { name: InsightJobName.MoodTrend; data: InsightPeriodPayload }
  | { name: InsightJobName.EnergySleep; data: InsightPeriodPayload }
  | { name: InsightJobName.TriggerPattern; data: InsightPeriodPayload };
