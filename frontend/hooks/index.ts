export {
  useEditingWindow,
  editingWindowAt,
  EDITING_WINDOW_MS,
} from "@/hooks/useEditingWindow";

// Legacy shit from react native
export { useThemeColor } from "@/hooks/use-theme-color";

export { useColorScheme } from "@/hooks/use-color-scheme";

// Custom stuff
export {
  moodKeys,
  useMoodEntries,
  useMoodEntry,
  useCreateMoodEntry,
  useUpdateMoodEntry,
  useDeleteMoodEntry,
} from "@/hooks/useMoodEntries.queries";

export {
  useSleepRecords,
  useSleepRecord,
  useCreateSleepRecord,
  useUpdateSleepRecord,
  useDeleteSleepRecord,
} from "@/hooks/useSleepRecord.queries";

export {
  useTriggers,
  useTrigger,
  useCreateTrigger,
  useUpdateTrigger,
  useDeleteTrigger,
  useLinkMoodToTrigger,
} from "@/hooks/useTrigger.queries";

export {
  medicineRegimenKeys,
  useMedicineRegimens,
  useMedicineRegimen,
  useCreateMedicineRegimen,
  useUpdateMedicineRegimen,
  useToggleMedicineRegimen,
} from "@/hooks/useMedicineRegimen.queries";

export {
  medicineTodayKeys,
  useMedicineToday,
} from "@/hooks/useMedicineToday.queries";

export { usePatchUserMe } from "@/hooks/useUserPreferences.queries";

export {
  notificationKeys,
  useNotificationsInfinite,
} from "@/hooks/useNotifications.queries";

export { historyKeys, useHistory } from "@/hooks/useHistory.queries";

export {
  careActionKeys,
  useCareActions,
  useCareAction,
  useCreateCareAction,
  usePatchCareAction,
  useDeleteCareAction,
} from "@/hooks/useCareAction.queries";
