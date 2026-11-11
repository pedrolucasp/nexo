import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { historyFilterOf, historyKeys } from "@/hooks/useHistory.queries";
import type {
  CareAction,
  HistoryItem,
  HistoryKind,
  HistoryPage,
  MoodEntry,
  SleepRecord,
  Trigger,
} from "@/lib/api";
import { parseDateOnly } from "@/lib/utils/time";

export type HistoryData = InfiniteData<HistoryPage, string | undefined>;

// How each entity enters the history, including the sleep anchor. The server
// sends the same sortAt on its pages; this keeps local inserts in step
export const moodHistoryItem = (mood: MoodEntry): HistoryItem => ({
  ...mood,
  kind: "mood",
  sortAt: mood.moment,
});

export const sleepHistoryItem = (record: SleepRecord): HistoryItem => ({
  ...record,
  kind: "sleep",
  sortAt: parseDateOnly(record.date),
});

export const triggerHistoryItem = (trigger: Trigger): HistoryItem => ({
  ...trigger,
  kind: "trigger",
  sortAt: trigger.moment,
});

export const careActionHistoryItem = (action: CareAction): HistoryItem => ({
  ...action,
  kind: "care_action",
  sortAt: action.moment,
});

// Mirrors the API's ordinal so the client insert lands where the server would
const KIND_RANK: Record<HistoryKind, number> = {
  mood: 0,
  sleep: 1,
  trigger: 2,
  care_action: 3,
};

const instantOf = (item: HistoryItem): number => new Date(item.sortAt).getTime();

// The history's total order: sortAt desc, kind asc, id desc
const compareHistoryItems = (a: HistoryItem, b: HistoryItem): number =>
  instantOf(b) - instantOf(a) ||
  KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
  b.id - a.id;

// Places the item at its sorted position, but only while that position is
// inside the loaded window: an item older than the loaded tail is left for a
// later page or a refresh instead of stretching the accumulated pages
export function insertHistoryItem(
  data: HistoryData,
  item: HistoryItem,
): HistoryData {
  const pages = data.pages;

  if (pages.length === 0) return data;

  const total = pages.reduce((count, page) => count + page.items.length, 0);

  // An empty loaded history has no tail to sort against, so the item opens it
  if (total === 0) {
    return {
      ...data,
      pages: [{ ...pages[0], items: [item] }, ...pages.slice(1)],
    };
  }

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const items = pages[pageIndex].items;

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      if (compareHistoryItems(item, items[itemIndex]) >= 0) continue;

      return {
        ...data,
        pages: pages.map((page, index) => {
          if (index !== pageIndex) return page;

          const next = [...page.items];
          next.splice(itemIndex, 0, item);
          return { ...page, items: next };
        }),
      };
    }
  }

  return data;
}

export function removeHistoryItem(
  data: HistoryData,
  kind: HistoryKind,
  id: number,
): HistoryData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.kind !== kind || item.id !== id),
    })),
  };
}

export function replaceHistoryItem(
  data: HistoryData,
  item: HistoryItem,
): HistoryData {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((existing) =>
        existing.kind === item.kind && existing.id === item.id
          ? item
          : existing,
      ),
    })),
  };
}

const forEachHistoryQuery = (
  queryClient: QueryClient,
  kind: HistoryKind,
  update: (data: HistoryData) => HistoryData,
): void => {
  const queries = queryClient
    .getQueryCache()
    .findAll({ queryKey: historyKeys.lists() });

  for (const query of queries) {
    const filter = historyFilterOf(query.queryKey);

    if (filter && filter !== kind) continue;

    queryClient.setQueryData<HistoryData>(query.queryKey, (old) =>
      old ? update(old) : old,
    );
  }
};

export function insertHistoryItemInCache(
  queryClient: QueryClient,
  item: HistoryItem,
): void {
  forEachHistoryQuery(queryClient, item.kind, (data) =>
    insertHistoryItem(data, item),
  );
}

export function removeHistoryItemInCache(
  queryClient: QueryClient,
  kind: HistoryKind,
  id: number,
): void {
  forEachHistoryQuery(queryClient, kind, (data) =>
    removeHistoryItem(data, kind, id),
  );
}

// Edits rewrite relations the history does not carry, so the pages come back
// from the API instead of being patched in place
export const invalidateHistory = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: historyKeys.lists() });
};
