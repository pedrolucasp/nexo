import { useMutation } from "@tanstack/react-query";
import { apiClient, UserPreferencesPayload } from "@/lib/api";

export const usePatchUserMe = (onSuccess?: (user: any) => void) => {
  return useMutation({
    mutationFn: (payload: UserPreferencesPayload) => apiClient.patchUserMe(payload),
    onSuccess: (data) => {
      onSuccess?.(data.user);
    },
  });
};
