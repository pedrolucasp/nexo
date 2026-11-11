import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, SleepRecord, SleepRecordPayload, UpdateSleepRecordPayload } from "@/lib/api";
import {
  insertHistoryItemInCache,
  invalidateHistory,
  removeHistoryItemInCache,
  sleepHistoryItem,
} from "@/lib/history/cache";
import { insightKeys } from "./useInsights.queries";

export const sleepRecordKeys = {
  all: () => ["sleep-records"] as const,
  lists: () => [...sleepRecordKeys.all(), "list"] as const,
  list: (filters?: SleepRecordFilters) =>
    [...sleepRecordKeys.lists(), filters] as const,
  detail: (id: string) => [...sleepRecordKeys.all(), "detail", id] as const,
};

interface SleepRecordFilters {
  from?: string; // ISO date
  to?: string; // ISO date
  limit?: number;
}

export const useSleepRecords = (filters?: SleepRecordFilters) => {
  return useQuery({
    queryKey: sleepRecordKeys.list(filters),
    queryFn: () => apiClient.getSleepRecords(filters),
  });
};

// Single entry detail
export const useSleepRecord = (id: string) => {
  return useQuery({
    queryKey: sleepRecordKeys.detail(id),
    queryFn: () => apiClient.getSleepRecord(id),
    enabled: !!id,
  });
};

export const useCreateSleepRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SleepRecordPayload) =>
      apiClient.createSleepRecord(payload),

    onSuccess: ({ sleepRecord }) => {
      insertHistoryItemInCache(queryClient, sleepHistoryItem(sleepRecord));

      queryClient.invalidateQueries({ queryKey: sleepRecordKeys.lists() });

      // Invalidate insights, so we can force refresh
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION") });
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("DAILY_SLEEP") });
      }, 2000);
    },
  });
};

// Update a sleep record
export const useUpdateSleepRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSleepRecordPayload }) =>
      apiClient.updateSleepRecord(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: sleepRecordKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: sleepRecordKeys.lists() });

      const previousDetail = queryClient.getQueryData(sleepRecordKeys.detail(id));
      const previousList = queryClient.getQueryData(sleepRecordKeys.list());

      if (previousDetail) {
        queryClient.setQueryData(
          sleepRecordKeys.detail(id),
          (old: SleepRecord) => ({ ...old, ...payload }),
        );
      }

      return { previousDetail, previousList };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(sleepRecordKeys.detail(id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(sleepRecordKeys.list(), context.previousList);
      }
    },

    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: sleepRecordKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sleepRecordKeys.lists() });
      invalidateHistory(queryClient);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION") });
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("DAILY_SLEEP") });
      }, 2000);
    },
  });
};

// Delete a sleep record
export const useDeleteSleepRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSleepRecord(id),

    onSuccess: (_data, id) => {
      removeHistoryItemInCache(queryClient, "sleep", Number(id));
      queryClient.invalidateQueries({ queryKey: sleepRecordKeys.lists() });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("ENERGY_SLEEP_CORRELATION") });
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("DAILY_SLEEP") });
      }, 2000);
    },
  });
};
