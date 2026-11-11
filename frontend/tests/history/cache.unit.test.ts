import { QueryClient } from "@tanstack/react-query";

import { historyKeys } from "@/hooks/useHistory.queries";
import {
  insertHistoryItem,
  insertHistoryItemInCache,
  removeHistoryItem,
  removeHistoryItemInCache,
  replaceHistoryItem,
  type HistoryData,
} from "@/lib/history/cache";
import type { HistoryItem, HistoryKind, HistoryPage } from "@/lib/api";

function item(kind: HistoryKind, id: number, sortAt: Date): HistoryItem {
  const base = { id, sortAt, createdAt: sortAt, updatedAt: sortAt };

  switch (kind) {
    case "mood":
      return {
        ...base,
        kind,
        moment: sortAt,
        annotation: "",
        selectedMood: "good",
        anxietyLevel: 2,
        energyLevel: 4,
        stressLevel: 1,
        moodComponents: [],
      };
    case "sleep":
      return { ...base, kind, date: sortAt, annotations: "", average: 8 };
    case "trigger":
      return {
        ...base,
        kind,
        moment: sortAt,
        comment: "",
        category: "Trabalho",
      };
    case "care_action":
      return { ...base, kind, moment: sortAt, type: "ACTIVITY", userId: 1 };
  }
}

const at = (day: number, hour = 12) => new Date(2025, 0, day, hour, 0);

function page(
  items: HistoryItem[],
  nextCursor: string | null = null,
): HistoryPage {
  return { items, nextCursor };
}

function historyData(...pages: HistoryPage[]): HistoryData {
  return { pages, pageParams: pages.map(() => undefined) };
}

const ids = (data: HistoryData) =>
  data.pages.flatMap((p) => p.items.map((i) => `${i.kind}-${i.id}`));

describe("insertHistoryItem", () => {
  it("inserts a newer item at the top", () => {
    const data = historyData(page([item("mood", 2, at(10))], "cursor"));

    const next = insertHistoryItem(data, item("sleep", 5, at(12)));

    expect(ids(next)).toEqual(["sleep-5", "mood-2"]);
    expect(next.pages[0].nextCursor).toBe("cursor");
  });

  it("puts a backdated item at its sorted position across pages", () => {
    const data = historyData(
      page([item("mood", 9, at(10)), item("trigger", 3, at(9))], "c1"),
      page([item("sleep", 1, at(8))], null),
    );

    const next = insertHistoryItem(data, item("mood", 4, at(9, 6)));

    expect(ids(next)).toEqual(["mood-9", "trigger-3", "mood-4", "sleep-1"]);
    expect(next.pages.map((p) => p.nextCursor)).toEqual(["c1", null]);
  });

  it("leaves an item older than the loaded tail for a later page", () => {
    const data = historyData(
      page([item("mood", 9, at(10))], "c1"),
      page([item("sleep", 1, at(8))], null),
    );

    expect(insertHistoryItem(data, item("trigger", 2, at(1)))).toBe(data);
  });

  it("opens an empty loaded history", () => {
    const data = historyData(page([], null));

    expect(ids(insertHistoryItem(data, item("mood", 1, at(10))))).toEqual([
      "mood-1",
    ]);
  });

  it("keeps one day together when the insert lands on a page seam", () => {
    const data = historyData(
      page([item("mood", 9, at(15, 18))], "c1"),
      page([item("sleep", 1, at(15, 8))], null),
    );

    const next = insertHistoryItem(data, item("trigger", 3, at(15, 12)));

    expect(ids(next)).toEqual(["mood-9", "trigger-3", "sleep-1"]);
  });

  it("breaks same-instant ties by kind, then by id desc", () => {
    const data = historyData(page([item("care_action", 1, at(10))], null));

    const withMood = insertHistoryItem(data, item("mood", 2, at(10)));
    expect(ids(withMood)).toEqual(["mood-2", "care_action-1"]);

    const withLaterId = insertHistoryItem(withMood, item("mood", 5, at(10)));
    expect(ids(withLaterId)).toEqual(["mood-5", "mood-2", "care_action-1"]);
  });
});

describe("removeHistoryItem", () => {
  it("removes the item from every loaded page", () => {
    const data = historyData(
      page([item("mood", 9, at(10))], "c1"),
      page([item("mood", 9, at(10)), item("sleep", 1, at(8))], null),
    );

    expect(ids(removeHistoryItem(data, "mood", 9))).toEqual(["sleep-1"]);
  });

  it("leaves an item of another kind with the same id", () => {
    const data = historyData(
      page([item("mood", 1, at(10)), item("sleep", 1, at(8))], null),
    );

    expect(ids(removeHistoryItem(data, "mood", 1))).toEqual(["sleep-1"]);
  });
});

describe("replaceHistoryItem", () => {
  it("replaces the matching item and leaves the rest untouched", () => {
    const data = historyData(
      page([item("mood", 1, at(10)), item("sleep", 2, at(8))], null),
    );
    const replacement = item("mood", 1, at(10));

    const next = replaceHistoryItem(data, replacement);

    expect(next.pages[0].items[0]).toBe(replacement);
    expect(next.pages[0].items[1]).toBe(data.pages[0].items[1]);
  });
});

describe("history cache write-through", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const read = (type?: HistoryKind) =>
    ids(queryClient.getQueryData<HistoryData>(historyKeys.infinite(type))!);

  it("inserts into the unfiltered stream and the matching filter only", () => {
    const existing = historyData(page([item("mood", 1, at(8))], null));

    queryClient.setQueryData(historyKeys.infinite(), existing);
    queryClient.setQueryData(historyKeys.infinite("mood"), existing);
    queryClient.setQueryData(historyKeys.infinite("sleep"), existing);

    insertHistoryItemInCache(queryClient, item("mood", 2, at(10)));

    expect(read()).toEqual(["mood-2", "mood-1"]);
    expect(read("mood")).toEqual(["mood-2", "mood-1"]);
    expect(read("sleep")).toEqual(["mood-1"]);
  });

  it("removes from the unfiltered stream and the matching filter only", () => {
    const existing = historyData(
      page([item("mood", 1, at(10)), item("sleep", 2, at(8))], null),
    );

    queryClient.setQueryData(historyKeys.infinite(), existing);
    queryClient.setQueryData(historyKeys.infinite("mood"), existing);
    queryClient.setQueryData(historyKeys.infinite("sleep"), existing);

    removeHistoryItemInCache(queryClient, "mood", 1);

    expect(read()).toEqual(["sleep-2"]);
    expect(read("mood")).toEqual(["sleep-2"]);
    expect(read("sleep")).toEqual(["mood-1", "sleep-2"]);
  });
});
