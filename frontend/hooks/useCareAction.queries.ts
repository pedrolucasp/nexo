import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  CareAction,
  CareActionType,
  CreateCareActionPayload,
  PatchCareActionPayload,
} from "@/lib/api";
import {
  careActionHistoryItem,
  insertHistoryItemInCache,
  invalidateHistory,
  removeHistoryItemInCache,
} from "@/lib/history/cache";
import { invalidateLinkedEntities } from "@/lib/cache/links";
import { QUERY_NAMESPACES } from "@/lib/cache/namespaces";
import { medicineTodayKeys } from "@/hooks/useMedicineToday.queries";
import { medicineRegimenKeys } from "@/hooks/useMedicineRegimen.queries";

interface CareActionFilters {
  type?: CareActionType;
  from?: string;
  to?: string;
  limit?: number;
}

export const careActionKeys = {
  all: () => [QUERY_NAMESPACES.careAction] as const,
  lists: () => [...careActionKeys.all(), "list"] as const,
  list: (filters?: CareActionFilters) => [...careActionKeys.lists(), filters] as const,
  detail: (id: string) => [...careActionKeys.all(), "detail", id] as const,
};

export const useCareActions = (filters?: CareActionFilters) => {
  return useQuery({
    queryKey: careActionKeys.list(filters),
    queryFn: () => apiClient.getCareActions(filters),
  });
};

export const useCareAction = (id: string) => {
  return useQuery({
    queryKey: careActionKeys.detail(id),
    queryFn: () => apiClient.getCareAction(id),
    enabled: !!id,
  });
};

export const useCreateCareAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCareActionPayload) =>
      apiClient.createCareAction(payload),

    onSuccess: ({ careAction }) => {
      insertHistoryItemInCache(queryClient, careActionHistoryItem(careAction));

      queryClient.invalidateQueries({ queryKey: careActionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineTodayKeys.list() });
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.lists() });
    },
  });
};

export const usePatchCareAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchCareActionPayload }) =>
      apiClient.patchCareAction(id, data),

    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: careActionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: careActionKeys.lists() });
      invalidateHistory(queryClient);

      // A link change also lands on the mood or trigger that now points back
      invalidateLinkedEntities(queryClient, "careAction");
    },
  });
};

export const useDeleteCareAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCareAction(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: careActionKeys.lists() });
      const previous = queryClient.getQueryData(careActionKeys.list());

      queryClient.setQueryData(
        careActionKeys.list(),
        (old: { entries: CareAction[] } | undefined) =>
          old ? { ...old, entries: old.entries.filter((e) => e.id !== Number(id)) } : old,
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(careActionKeys.list(), context.previous);
      }
    },

    onSuccess: (_data, id) => {
      removeHistoryItemInCache(queryClient, "care_action", Number(id));
      queryClient.invalidateQueries({ queryKey: careActionKeys.lists() });
      // The mood entry and trigger screens embed this care action while linked
      invalidateLinkedEntities(queryClient, "careAction");
    },
  });
};
