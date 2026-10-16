import { useMutation } from "@tanstack/react-query";
import { apiClient, User, UserPreferencesPayload } from "@/lib/api";

export const usePatchUserMe = (onSuccess?: (user: User) => void) => {
  return useMutation({
    mutationFn: (payload: UserPreferencesPayload) => apiClient.patchUserMe(payload),
    onSuccess: (data) => {
      onSuccess?.(data.user);
    },
  });
};
