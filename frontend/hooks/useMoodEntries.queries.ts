import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { apiClient, MoodEntry, CreateMoodEntryPayload } from "@/lib/api";
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

// Infinite scroll version
export const useMoodEntriesInfinite = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: [...moodKeys.lists(), "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getMoodEntries({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
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
// Optimistically adds to cache, rolls back on failure
export const useCreateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMoodEntryPayload) =>
      apiClient.createMoodEntry(payload),

    // Optimistic update so that the UI reflects the new entry immediately
    onMutate: async (payload) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: moodKeys.lists() });

      // Snapshot current cache so we can roll back
      const previous = queryClient.getQueryData(moodKeys.list());

      // Inject a temporary optimistic record
      // TODO: might as well create a shared attrs that we're keeping it
      queryClient.setQueryData(moodKeys.list(), (old: MoodEntry[] = []) => [
        {
          ...payload,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          _optimistic: true,
        },
        ...old,
      ]);

      return { previous };
    },

    // On error, roll back to the snapshot
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(moodKeys.list(), context.previous);
      }
    },

    // On success, replace optimistic record with real one from server
    onSuccess: () => {
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

// Delete a mood entry with optimistic removal
export const useDeleteMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMoodEntry(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: moodKeys.lists() });
      const previous = queryClient.getQueryData(moodKeys.list());

      queryClient.setQueryData(moodKeys.list(), (old: MoodEntry[] = []) =>
        old.filter((e) => e.id !== Number(id)),
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(moodKeys.list(), context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodKeys.lists() });
    },
  });
};
