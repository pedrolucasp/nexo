export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  updatedAt: Date;
  avatarKey?: string;
  avatarURL?: string;
  active: boolean;
  pushToken?: string;
  notificationsEnabled?: boolean;
  dailyReminderTime?: string;
}

// Auth
export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerifyTokenResponse {
  valid: boolean;
  userId?: number;
  email?: string;
  user: Pick<User, "firstName" | "lastName">;
}

export interface SignUpPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequestResponse {
  message: string;
  token?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ActivateResponse {
  activated: boolean;
}

// User
export interface UserUpdatePayload extends Partial<User> {
  id: number;
}

export interface UserUpdateResponse {
  user: User;
}

export interface UserPreferencesPayload {
  notificationsEnabled?: boolean;
  dailyReminderTime?: string | null;
}

// Mood entries
export interface MoodComponentPayload {
  component: string;
  intensity: string;
}

export interface CreateMoodEntryPayload {
  annotation: string;
  moment: Date;
  selectedMood: string;
  anxietyLevel: number;
  energyLevel: number;
  stressLevel: number;
  moodComponents: MoodComponentPayload[];
}

export interface MoodComponent {
  id: number;
  component: string;
  intensity: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodEntry {
  id: number;
  annotation: string;
  moment: Date;
  selectedMood: string;
  anxietyLevel: number;
  energyLevel: number;
  stressLevel: number;
  moodComponents: MoodComponent[];
  triggerLinks?: TriggerMoodLinkWithTrigger[];
  careActions?: CareAction[];
  createdAt: Date;
  updatedAt: Date;
}

// Sleep Records

export interface SleepRecordPayload {
  average: number;
  annotations: string;
  date: Date;
}

export interface UpdateSleepRecordPayload extends Partial<SleepRecordPayload> {}

export interface SleepRecord {
  id: number;
  annotations: string;
  date: Date;
  average: number;
  createdAt: Date;
  updatedAt: Date;
}

// Trigger

export interface Trigger {
  id: number;
  comment: string;
  category: string;
  moment: Date;
  createdAt: Date;
  updatedAt: Date;
  moodLinks?: TriggerMoodLinkWithMood[];
  careActions?: CareAction[];
}

export interface CreateTriggerPayload {
  comment: string;
  category: string;
  moment: Date;
}

export interface UpdateTriggerPayload extends Partial<CreateTriggerPayload> {}

// Insights

// types/insight.ts
// Gotta keep those in sync with the Prisma schema
export type InsightType =
  | "MOOD_TREND"
  | "ENERGY_SLEEP_CORRELATION"
  | "TRIGGER_PATTERN"
  | "DAILY_ENERGY"
  | "DAILY_SLEEP";

export type InsightPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export type InsightMetadata =
  | {
      type: "MOOD_TREND";
      delta: number;
      avgFirst: number;
      avgSecond: number;
      dominantMood: string;
      avgEnergy: number;
    }
  | {
      type: "ENERGY_SLEEP_CORRELATION";
      correlationScore: number;
      sampleSize: number;
    }
  | {
      type: "TRIGGER_PATTERN";
      topCategory: string;
      topCount: number;
      total: number;
      distribution: Record<string, number>;
    }
  | {
      type: "DAILY_ENERGY";
      avgEnergy: number;
      dayTrend: number | null;
      peak: number;
      trough: number;
      entryCount: number;
    }
  | {
      type: "DAILY_SLEEP";
      totalHours: number;
      diffMinutes: number;
      sessionCount: number;
      hadNaps: boolean;
    };

export type Insight = {
  id: number;
  type: InsightType;
  period: InsightPeriod;
  title: string;
  body: string;
  metadata: InsightMetadata;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
};

// Generic stuff
export interface PaginatedResponse<T> {
  entries: T[];
  total: number;
  page: number;
  nextPage: number | null;
}

export interface MoodEntryResponse {
  moodEntry: MoodEntry;
}

export interface SleepRecordResponse {
  sleepRecord: SleepRecord;
}

export interface TriggerResponse {
  trigger: Trigger;
}

// Care Actions
export type CareActionType = 'MEDICINE' | 'APPOINTMENT' | 'ACTIVITY';
export type AppointmentType =
  | 'ANALYST'
  | 'PSYCHIATRIST'
  | 'GP'
  | 'NUTRITIONIST'
  | 'PHYSIOTHERAPIST'
  | 'OTHER';

export type ActivityType =
  | 'WALK'
  | 'YOGA'
  | 'GYM'
  | 'MEDITATION'
  | 'SOCIAL'
  | 'CREATIVE'
  | 'OTHER';

  export type MedicinePeriodicity =
  | 'ONCE'
  | 'DAILY'
  | 'TWICE_DAILY'
  | 'THREE_TIMES_DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY';

export interface MedicineRegimen {
  id: number;
  name: string;
  dosage: string;
  periodicity: MedicinePeriodicity;
  scheduledAt: string[];
  active: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodayMedicineEntry {
  regimen: Pick<MedicineRegimen, 'id' | 'name' | 'dosage' | 'scheduledAt'>;
  logs: { id: number; takenAt: Date }[];
}

export interface MedicineLog {
  id: number;
  regimenId?: number;
  careActionId: number;
  takenAt: Date;
  regimen?: MedicineRegimen;
}

export interface AppointmentDetail {
  id: number;
  careActionId: number;
  type: AppointmentType;
  duration: number;
  note?: string;
}

export interface ActivityDetail {
  id: number;
  careActionId: number;
  type: ActivityType;
  duration?: number;
}

export interface CareAction {
  id: number;
  type: CareActionType;
  moment: Date;
  userId: number;
  triggerId?: number;
  moodId?: number;
  medicineLog?: MedicineLog;
  appointment?: AppointmentDetail;
  activity?: ActivityDetail;
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerMoodLink {
  id: number;
  triggerId: number;
  moodId: number;
  perceivedImpact: number;
  linkedAt: Date;
}

export interface TriggerMoodLinkWithMood extends TriggerMoodLink {
  mood: MoodEntry;
}

export interface TriggerMoodLinkWithTrigger extends TriggerMoodLink {
  trigger: Trigger;
}

// Payloads
export interface CreateMedicineRegimenPayload {
  name: string;
  dosage: string;
  periodicity: MedicinePeriodicity;
  scheduledAt?: string[];
}

export interface UpdateMedicineRegimenPayload extends Partial<CreateMedicineRegimenPayload> {
  active?: boolean;
}

export interface CreateCareActionMedicinePayload {
  type: 'MEDICINE';
  moment: Date;
  regimenId?: number;
  medicine?: {
    name: string;
    dosage: string;
    periodicity: MedicinePeriodicity;
    scheduledAt?: string[];
  };
  triggerId?: number;
  moodId?: number;
}

export interface CreateCareActionAppointmentPayload {
  type: 'APPOINTMENT';
  moment: Date;
  appointment: { type: AppointmentType; duration: number; note?: string };
  triggerId?: number;
  moodId?: number;
}

export interface CreateCareActionActivityPayload {
  type: 'ACTIVITY';
  moment: Date;
  activity: { type: ActivityType; duration?: number };
  triggerId?: number;
  moodId?: number;
}

export type CreateCareActionPayload =
  | CreateCareActionMedicinePayload
  | CreateCareActionAppointmentPayload
  | CreateCareActionActivityPayload;

export interface CareActionResponse { careAction: CareAction; }
export interface PatchCareActionPayload {
  triggerId?: number;
  moodId?: number;
}
export interface MedicineRegimenResponse { regimen: MedicineRegimen; }

export interface LinkMoodPayload { moodId: number; perceivedImpact: number; }
