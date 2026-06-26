export { apiClient } from "@/lib/api/client";

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
  CareActionResponse,
  CreateCareActionPayload,
  CreateCareActionMedicinePayload,
  CreateCareActionAppointmentPayload,
  CreateCareActionActivityPayload,
  // Medicine Regimens
  MedicineRegimen,
  MedicineRegimenResponse,
  CreateMedicineRegimenPayload,
  UpdateMedicineRegimenPayload,
  // Trigger-Mood linking
  TriggerMoodLink,
  LinkMoodPayload,
} from "@/lib/api/types";
