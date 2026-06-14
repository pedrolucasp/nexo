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

const INSIGHT_STALE_TIMES: Record<InsightPeriod, number> = {
  DAILY: 1000 * 60 * 30, // 30 min, regenerates during the day
  WEEKLY: 1000 * 60 * 60 * 4, // 4h only changes on cron or mutations
  MONTHLY: 1000 * 60 * 60 * 24, // 24h
};

const INSIGHT_PERIOD: Record<InsightType, InsightPeriod> = {
  DAILY_ENERGY: "DAILY",
  MOOD_TREND: "WEEKLY",
  ENERGY_SLEEP_CORRELATION: "WEEKLY",
  TRIGGER_PATTERN: "WEEKLY",
};

export const useInsight = (type: InsightType) => {
  const period = INSIGHT_PERIOD[type];
  const staleTime = INSIGHT_STALE_TIMES[period];

  return useQuery({
    queryKey: insightKeys.byType(type),
    queryFn: () =>
      apiClient
        .getInsights({ type, limit: 1 })
        .then((res) => res.insights[0] ?? null),
    staleTime,
  });
};

export const useInsights = (filters?: InsightFilters) => {
  return useQuery({
    queryKey: insightKeys.list(filters),
    queryFn: () => apiClient.getInsights(filters).then((res) => res.insights),
    staleTime: 1000 * 60 * 15,
  });
};
