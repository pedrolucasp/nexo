import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, SleepRecord, SleepRecordPayload } from "@/lib/api";

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

export const useCreateSleepRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SleepRecordPayload) =>
      apiClient.createSleepRecord(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: sleepRecordKeys.lists() });

      const previous = queryClient.getQueryData(sleepRecordKeys.list());

      // TODO: might as well create a shared attrs that we're keeping it
      queryClient.setQueryData(
        sleepRecordKeys.list(),
        (old: SleepRecord[] = []) => [
          {
            ...payload,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            _optimistic: true,
          },
          ...old,
        ],
      );

      return { previous };
    },

    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(sleepRecordKeys.list(), context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sleepRecordKeys.lists() });
    },
  });
};
