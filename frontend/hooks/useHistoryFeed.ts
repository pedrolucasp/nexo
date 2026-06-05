// hooks/useHistoryFeed.ts
import { useMemo } from "react";
import {
  mergeAndSort,
  filterByCategory,
  groupByDate,
} from "@/lib/utils/history";
import {
  mapMoodToHistoryCard,
  mapSleepToHistoryCard,
  mapTriggerToHistoryCard,
} from "@/lib/history/mappers";
import type { HistoryCategory } from "@/lib/history/types";
import { useMoodEntries, useSleepRecords, useTriggers } from "@/hooks";

export function useHistoryFeed(activeFilter: HistoryCategory | "all") {
  const { data: moodsPage } = useMoodEntries({});
  const { data: sleepPage } = useSleepRecords({});
  const { data: triggersPage } = useTriggers({});

  const moods = moodsPage?.entries ?? [];
  const sleepRecords = sleepPage?.entries ?? [];
  const triggers = triggersPage?.entries ?? [];

  const grouped = useMemo(() => {
    const merged = mergeAndSort([
      moods.map(mapMoodToHistoryCard),
      sleepRecords.map(mapSleepToHistoryCard),
      triggers.map(mapTriggerToHistoryCard),
    ]);
    const filtered = filterByCategory(merged, activeFilter);
    return groupByDate(filtered);
  }, [moods, sleepRecords, triggers, activeFilter]);

  // TODO: expose the isLoading here
  return grouped;
}
