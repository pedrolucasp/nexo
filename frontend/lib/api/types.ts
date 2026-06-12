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
  createdAt: Date;
  updatedAt: Date;
}

// Sleep Records

export interface SleepRecordPayload {
  average: number;
  annotations: string;
  date: Date;
}

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
}

export interface CreateTriggerPayload {
  comment: string;
  category: string;
  moment: Date;
}

// Insights

// types/insight.ts
// Gotta keep those in sync with the Prisma schema
export type InsightType =
  | "MOOD_TREND"
  | "ENERGY_SLEEP_CORRELATION"
  | "TRIGGER_PATTERN";

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
