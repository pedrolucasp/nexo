import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  apiClient,
  MedicineRegimen,
  CreateMedicineRegimenPayload,
  UpdateMedicineRegimenPayload,
} from "@/lib/api";
import { medicineTodayKeys } from "@/hooks/useMedicineToday.queries";

export const medicineRegimenKeys = {
  all: () => ["medicineRegimens"] as const,
  lists: () => [...medicineRegimenKeys.all(), "list"] as const,
  list: () => [...medicineRegimenKeys.lists()] as const,
  detail: (id: string) => [...medicineRegimenKeys.all(), "detail", id] as const,
};

export const useMedicineRegimens = () => {
  return useQuery({
    queryKey: medicineRegimenKeys.list(),
    queryFn: () => apiClient.getMedicineRegimens(),
  });
};

export const useMedicineRegimen = (id: string) => {
  return useQuery({
    queryKey: medicineRegimenKeys.detail(id),
    queryFn: () => apiClient.getMedicineRegimen(id),
    enabled: !!id,
  });
};

export const useCreateMedicineRegimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMedicineRegimenPayload) =>
      apiClient.createMedicineRegimen(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.lists() });
    },
  });
};

export const useUpdateMedicineRegimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMedicineRegimenPayload }) =>
      apiClient.updateMedicineRegimen(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: medicineRegimenKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: medicineRegimenKeys.lists() });

      const previousDetail = queryClient.getQueryData(medicineRegimenKeys.detail(id));

      if (previousDetail) {
        queryClient.setQueryData(
          medicineRegimenKeys.detail(id),
          (old: MedicineRegimen) => ({ ...old, ...payload }),
        );
      }

      return { previousDetail };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(medicineRegimenKeys.detail(id), context.previousDetail);
      }
    },

    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineTodayKeys.list() });
    },
  });
};

export const useToggleMedicineRegimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.toggleMedicineRegimen(id, active),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.lists() });
      queryClient.invalidateQueries({ queryKey: medicineTodayKeys.list() });
    },
  });
};

export const useDeleteMedicineRegimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMedicineRegimen(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: medicineRegimenKeys.lists() });
      const previous = queryClient.getQueryData(medicineRegimenKeys.list());

      queryClient.setQueryData(
        medicineRegimenKeys.list(),
        (old: { regimens: MedicineRegimen[] } | undefined) =>
          old ? { ...old, regimens: old.regimens.filter((r) => r.id !== Number(id)) } : old,
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(medicineRegimenKeys.list(), context.previous);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineRegimenKeys.lists() });
    },
  });
};
