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
} from "@/hooks/useTrigger.queries";
