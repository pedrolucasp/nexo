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
  DailyEnergy = "insight:daily-energy",
  DailySleep = "insight:daily-sleep",
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
  | { name: InsightJobName.TriggerPattern; data: InsightPeriodPayload }
  | { name: InsightJobName.DailyEnergy; data: InsightPeriodPayload }
  | { name: InsightJobName.DailySleep; data: InsightPeriodPayload };

// Medicine reminder queue
export enum MedicineReminderJobName {
  Send = "medicine-reminder:send",
}

export type MedicineReminderPayload = {
  userId: number;
  regimenId: number;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
};

// Daily reminder queue
export enum DailyReminderJobName {
  Send = "daily-reminder:send",
}

export type DailyReminderPayload = {
  userId: number;
};
