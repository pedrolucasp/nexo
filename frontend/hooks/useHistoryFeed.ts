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
  mapCareActionToHistoryCard,
} from "@/lib/history/mappers";
import type { HistoryCategory } from "@/lib/history/types";
import { useMoodEntries, useSleepRecords, useTriggers } from "@/hooks";
import { useCareActions } from "@/hooks/useCareAction.queries";

export function useHistoryFeed(activeFilter: HistoryCategory | "all") {
  const { data: moodsPage } = useMoodEntries({});
  const { data: sleepPage } = useSleepRecords({});
  const { data: triggersPage } = useTriggers({});
  const { data: careActionsPage } = useCareActions({});

  const moods = moodsPage?.entries ?? [];
  const sleepRecords = sleepPage?.entries ?? [];
  const triggers = triggersPage?.entries ?? [];
  const careActions = careActionsPage?.entries ?? [];

  const grouped = useMemo(() => {
    const merged = mergeAndSort([
      moods.map(mapMoodToHistoryCard),
      sleepRecords.map(mapSleepToHistoryCard),
      triggers.map(mapTriggerToHistoryCard),
      careActions.map(mapCareActionToHistoryCard),
    ]);

    const filtered = filterByCategory(merged, activeFilter);
    return groupByDate(filtered);
  }, [moods, sleepRecords, triggers, careActions, activeFilter]);

  return grouped;
}
