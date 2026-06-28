export { apiClient, ApiError } from "@/lib/api/client";

export type {
  User,
  AuthResponse,
  PaginatedResponse,
  // Mood
  MoodEntry,
  CreateMoodEntryPayload,
  MoodComponentPayload,
  // User
  UserUpdateResponse,
  // Sleep
  SleepRecordPayload,
  SleepRecord,
  // Trigger
  Trigger,
  CreateTriggerPayload,
  // Insights
  Insight,
  InsightType,
  InsightPeriod,
  // Care Actions
  CareAction,
  CareActionType,
  AppointmentType,
  ActivityType,
  CareActionResponse,
  CreateCareActionPayload,
  CreateCareActionMedicinePayload,
  CreateCareActionAppointmentPayload,
  CreateCareActionActivityPayload,
  PatchCareActionPayload,
  // Medicine Regimens
  MedicineRegimen,
  MedicinePeriodicity,
  MedicineRegimenResponse,
  CreateMedicineRegimenPayload,
  UpdateMedicineRegimenPayload,
  TodayMedicineEntry,
  UserPreferencesPayload,
  UpdateTriggerPayload,
  // Trigger-Mood linking
  TriggerMoodLink,
  TriggerMoodLinkWithMood,
  TriggerMoodLinkWithTrigger,
  LinkMoodPayload,
} from "@/lib/api/types";
