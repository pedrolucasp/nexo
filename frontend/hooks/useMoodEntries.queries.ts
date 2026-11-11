import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { apiClient, CreateMoodEntryPayload, UpdateMoodEntryPayload } from "@/lib/api";
import {
  insertHistoryItemInCache,
  invalidateHistory,
  moodHistoryItem,
  removeHistoryItemInCache,
} from "@/lib/history/cache";
import { insightKeys } from "./useInsights.queries";

export const moodKeys = {
  all: () => ["mood-entries"] as const,
  lists: () => [...moodKeys.all(), "list"] as const,
  list: (filters?: MoodEntryFilters) => [...moodKeys.lists(), filters] as const,
  detail: (id: string) => [...moodKeys.all(), "detail", id] as const,
};

interface MoodEntryFilters {
  from?: string; // ISO date
  to?: string; // ISO date
  limit?: number;
}

// Queries

// Fetch a paginated list of mood entries.
// On cold start, returns cached data instantly then revalidates.
export const useMoodEntries = (filters?: MoodEntryFilters) => {
  return useQuery({
    queryKey: moodKeys.list(filters),
    queryFn: () => apiClient.getMoodEntries(filters),
  });
};

// Single entry detail
export const useMoodEntry = (id: string) => {
  return useQuery({
    queryKey: moodKeys.detail(id),
    queryFn: () => apiClient.getMoodEntry(id),
    enabled: !!id,
  });
};

// MUTATIONS

// Create a new mood entry
export const useCreateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMoodEntryPayload) =>
      apiClient.createMoodEntry(payload),

    onSuccess: ({ mood }) => {
      insertHistoryItemInCache(queryClient, moodHistoryItem(mood));

      queryClient.invalidateQueries({ queryKey: moodKeys.lists() });

      // Invalidate insights, so we can force refresh
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("DAILY_ENERGY"),
        });
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("MOOD_TREND"),
        });
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION"),
        });
      }, 2000);
    },
  });
};

// Update a mood entry
// Components are replaced wholesale on the server, so the detail and every list
// have to come back from the API rather than being patched in place.
export const useUpdateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMoodEntryPayload }) =>
      apiClient.updateMoodEntry(id, payload),

    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: moodKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() });
      invalidateHistory(queryClient);

      // Trigger detail embeds the full mood in its links, so an edited mood
      // would otherwise keep its old levels there. The literal prefix is used
      // instead of triggerKeys to avoid a circular import between the hooks.
      queryClient.invalidateQueries({ queryKey: ["triggers"] });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("DAILY_ENERGY"),
        });
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("MOOD_TREND"),
        });
        queryClient.invalidateQueries({
          queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION"),
        });
      }, 2000);
    },
  });
};

// Delete a mood entry
export const useDeleteMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMoodEntry(id),

    onSuccess: (_data, id) => {
      removeHistoryItemInCache(queryClient, "mood", Number(id));
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("MOOD_TREND") });
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION") });
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("DAILY_ENERGY") });
      }, 2000);
    },
  });
};
