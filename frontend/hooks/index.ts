// Legacy shit from react native
export { useThemeColor } from "@/hooks/use-theme-color";

export { useColorScheme } from "@/hooks/use-color-scheme";

// Custom stuff
export {
  moodKeys,
  useMoodEntries,
  useMoodEntriesInfinite,
  useMoodEntry,
  useCreateMoodEntry,
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
  useCreateMedicineRegimen,
  useUpdateMedicineRegimen,
  useDeleteMedicineRegimen,
} from "@/hooks/useMedicineRegimen.queries";

export {
  careActionKeys,
  useCareActions,
  useCareAction,
  useCreateCareAction,
  usePatchCareAction,
  useDeleteCareAction,
} from "@/hooks/useCareAction.queries";
