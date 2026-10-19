import {
  filterByCategory,
  groupByDate,
  mergeAndSort,
} from "@/lib/utils/history";
import type { HistoryCard, HistoryCategory } from "@/lib/history/types";

function card(
  id: string,
  category: HistoryCategory,
  at: Date,
): HistoryCard {
  return {
    id,
    category,
    timestamp: at.toISOString(),
    title: id,
    summary: "",
  } as HistoryCard;
}

describe("mergeAndSort", () => {
  it("flattens the buckets into one descending list", () => {
    const oldest = card("oldest", "mood", new Date(2025, 0, 1, 10, 0));
    const newest = card("newest", "sleep", new Date(2025, 0, 3, 10, 0));
    const middle = card("middle", "trigger", new Date(2025, 0, 2, 10, 0));

    const merged = mergeAndSort([[oldest, middle], [newest]]);

    expect(merged.map((c) => c.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("returns an empty list for no buckets", () => {
    expect(mergeAndSort([])).toEqual([]);
  });
});

describe("groupByDate", () => {
  it("groups into fixed, ordered date buckets", () => {
    const morning = card("m1", "mood", new Date(2025, 0, 15, 9, 0));
    const evening = card("s1", "sleep", new Date(2025, 0, 15, 20, 0));
    const previous = card("t1", "trigger", new Date(2025, 0, 14, 12, 0));

    const grouped = groupByDate([morning, evening, previous]);

    expect(Object.keys(grouped)).toEqual([
      "quarta-feira, 15 de janeiro",
      "terça-feira, 14 de janeiro",
    ]);
    expect(grouped["quarta-feira, 15 de janeiro"].map((c) => c.id)).toEqual([
      "m1",
      "s1",
    ]);
    expect(grouped["terça-feira, 14 de janeiro"].map((c) => c.id)).toEqual([
      "t1",
    ]);
  });

  it("returns no buckets for an empty list", () => {
    expect(groupByDate([])).toEqual({});
  });
});

describe("filterByCategory", () => {
  const cards = [
    card("m", "mood", new Date(2025, 0, 1, 10, 0)),
    card("s", "sleep", new Date(2025, 0, 2, 10, 0)),
    card("t", "trigger", new Date(2025, 0, 3, 10, 0)),
    card("c", "care_action", new Date(2025, 0, 4, 10, 0)),
  ];

  it.each([
    ["mood", ["m"]],
    ["sleep", ["s"]],
    ["trigger", ["t"]],
    ["care_action", ["c"]],
  ] as const)("keeps only the %s cards", (category, ids) => {
    expect(filterByCategory(cards, category).map((c) => c.id)).toEqual(ids);
  });

  it("keeps everything for 'all'", () => {
    expect(filterByCategory(cards, "all").map((c) => c.id)).toEqual([
      "m",
      "s",
      "t",
      "c",
    ]);
  });
});
