import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export const medicineTodayKeys = {
  all: () => ["medicineToday"] as const,
  list: () => [...medicineTodayKeys.all(), "list"] as const,
};

export const useMedicineToday = () => {
  return useQuery({
    queryKey: medicineTodayKeys.list(),
    queryFn: () => apiClient.getMedicineRegimensToday(),
    staleTime: 2 * 60 * 1000,
  });
};
