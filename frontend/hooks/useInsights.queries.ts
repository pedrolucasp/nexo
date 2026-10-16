import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiClient, Insight, InsightType, InsightPeriod } from "@/lib/api";

// The device's local calendar day, used only to roll the cache over at midnight
// so the pair refetches; the server still resolves the actual day boundary
function localDay(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const insightKeys = {
  all: () => ["insights"] as const,
  lists: () => [...insightKeys.all(), "list"] as const,
  list: (filters?: InsightFilters) =>
    [...insightKeys.lists(), filters] as const,
  byType: (type: InsightType) =>
    [...insightKeys.all(), "type", type, localDay()] as const,
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
  DAILY_SLEEP: "DAILY",
};

export const useInsight = <T extends InsightType>(type: T) => {
  const period = INSIGHT_PERIOD[type];
  const staleTime = INSIGHT_STALE_TIMES[period];

  return useQuery({
    queryKey: insightKeys.byType(type),
    queryFn: () =>
      apiClient
        .getInsights<T>({ type, limit: 1 })
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
