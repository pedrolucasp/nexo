import { useQuery } from "@tanstack/react-query";
import { apiClient, Insight, InsightType, InsightPeriod } from "@/lib/api";

export const insightKeys = {
  all: () => ["insights"] as const,
  lists: () => [...insightKeys.all(), "list"] as const,
  list: (filters?: InsightFilters) =>
    [...insightKeys.lists(), filters] as const,
  byType: (type: InsightType) => [...insightKeys.all(), "type", type] as const,
};

interface InsightFilters {
  type?: InsightType;
  period?: InsightPeriod;
  limit?: number;
}

// All insights — for the insights page
export const useInsights = (filters?: InsightFilters) => {
  return useQuery({
    queryKey: insightKeys.list(filters),
    queryFn: () => apiClient.getInsights(filters),
    staleTime: 1000 * 60 * 15,
  });
};

// Single type — for widgets that only care about one insight
// Each call caches independently, so mood log page doesn't blow
// away what the insights page already fetched
export const useInsight = (type: InsightType) => {
  return useQuery({
    queryKey: insightKeys.byType(type),
    queryFn: () =>
      apiClient.getInsights({ type, limit: 1 }).then((res) => res[0] ?? null),
    staleTime: 1000 * 60 * 15,
  });
};
