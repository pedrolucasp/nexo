import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, Trigger, CreateTriggerPayload, UpdateTriggerPayload } from "@/lib/api";
import { insightKeys } from "@/hooks/useInsights.queries";
import { moodKeys } from "@/hooks/useMoodEntries.queries";

export const triggerKeys = {
  all: () => ["triggers"] as const,
  lists: () => [...triggerKeys.all(), "list"] as const,
  list: (filters?: TriggerFilters) =>
    [...triggerKeys.lists(), filters] as const,
  detail: (id: string) => [...triggerKeys.all(), "detail", id] as const,
};

interface TriggerFilters {
  from?: string; // ISO date
  to?: string; // ISO date
  limit?: number;
}

// Queries

// Fetch a paginated list of mood entries.
// On cold start, returns cached data instantly then revalidates.
export const useTriggers = (filters?: TriggerFilters) => {
  return useQuery({
    queryKey: triggerKeys.list(filters),
    queryFn: () => apiClient.getTriggers(filters),
  });
};

// Single entry detail
export const useTrigger = (id: string) => {
  return useQuery({
    queryKey: triggerKeys.detail(id),
    queryFn: () => apiClient.getTrigger(id),
    enabled: !!id,
  });
};

// MUTATIONS

// Create a new mood entry
// Optimistically adds to cache, rolls back on failure
export const useCreateTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTriggerPayload) =>
      apiClient.createTrigger(payload),

    // Optimistic update so that the UI reflects the new entry immediately
    onMutate: async (payload) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: triggerKeys.lists() });

      // Snapshot current cache so we can roll back
      const previous = queryClient.getQueryData(triggerKeys.list());

      // Inject a temporary optimistic record
      // TODO: might as well create a shared attrs that we're keeping it
      queryClient.setQueryData(triggerKeys.list(), (old: Trigger[] = []) => [
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
        queryClient.setQueryData(triggerKeys.list(), context.previous);
      }
    },

    // On success, replace optimistic record with real one from server
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.lists() });
      // Delay to allow the async queue job to finish writing the new insight row
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("TRIGGER_PATTERN") });
      }, 2000);
    },
  });
};

// Update a trigger
export const useUpdateTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTriggerPayload }) =>
      apiClient.updateTrigger(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: triggerKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: triggerKeys.lists() });

      const previousDetail = queryClient.getQueryData(triggerKeys.detail(id));
      const previousList = queryClient.getQueryData(triggerKeys.list());

      if (previousDetail) {
        queryClient.setQueryData(
          triggerKeys.detail(id),
          (old: Trigger) => ({ ...old, ...payload }),
        );
      }

      return { previousDetail, previousList };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(triggerKeys.detail(id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(triggerKeys.list(), context.previousList);
      }
    },

    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: triggerKeys.lists() });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("TRIGGER_PATTERN") });
      }, 2000);
    },
  });
};

export const useLinkMoodToTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ triggerId, moodId, perceivedImpact }: {
      triggerId: string;
      moodId: string;
      perceivedImpact: number
    }) =>
      apiClient.linkMoodToTrigger(triggerId, { moodId: Number(moodId), perceivedImpact }),

    onSuccess: (_data, { triggerId, moodId }) => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.detail(triggerId) });
      queryClient.invalidateQueries({ queryKey: moodKeys.detail(moodId) });
    },
  });
};

// Delete a mood entry with optimistic removal
export const useDeleteTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTrigger(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: triggerKeys.lists() });
      const previous = queryClient.getQueryData(triggerKeys.list());

      queryClient.setQueryData(triggerKeys.list(), (old: Trigger[] = []) =>
        old.filter((e) => e.id !== Number(id)),
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(triggerKeys.list(), context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: triggerKeys.lists() });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: insightKeys.byType("TRIGGER_PATTERN") });
      }, 2000);
    },
  });
};
