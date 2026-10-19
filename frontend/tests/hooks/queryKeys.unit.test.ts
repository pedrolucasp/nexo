import { careActionKeys } from "@/hooks/useCareAction.queries";
import { insightKeys } from "@/hooks/useInsights.queries";
import { medicineRegimenKeys } from "@/hooks/useMedicineRegimen.queries";
import { medicineTodayKeys } from "@/hooks/useMedicineToday.queries";
import { moodKeys } from "@/hooks/useMoodEntries.queries";
import { notificationKeys } from "@/hooks/useNotifications.queries";
import { sleepRecordKeys } from "@/hooks/useSleepRecord.queries";
import { triggerKeys } from "@/hooks/useTrigger.queries";

const nested = [
  { name: "moodKeys", keys: moodKeys, base: "mood-entries" },
  { name: "triggerKeys", keys: triggerKeys, base: "triggers" },
  { name: "sleepRecordKeys", keys: sleepRecordKeys, base: "sleep-records" },
  { name: "careActionKeys", keys: careActionKeys, base: "careActions" },
];

describe.each(nested)("$name", ({ keys, base }) => {
  it("nests the list and detail builders under the base", () => {
    expect(keys.all()).toStrictEqual([base]);
    expect(keys.lists()).toStrictEqual([base, "list"]);
    expect(keys.detail("9")).toStrictEqual([base, "detail", "9"]);
  });

  it("carries the filters into the list key", () => {
    expect(keys.list({ limit: 10 })).toStrictEqual([
      base,
      "list",
      { limit: 10 },
    ]);
    expect(keys.list()).toStrictEqual([base, "list", undefined]);
  });
});

describe("medicineRegimenKeys", () => {
  it("nests the unfiltered list and detail builders under the base", () => {
    expect(medicineRegimenKeys.all()).toStrictEqual(["medicineRegimens"]);
    expect(medicineRegimenKeys.lists()).toStrictEqual([
      "medicineRegimens",
      "list",
    ]);
    expect(medicineRegimenKeys.list()).toStrictEqual([
      "medicineRegimens",
      "list",
    ]);
    expect(medicineRegimenKeys.detail("2")).toStrictEqual([
      "medicineRegimens",
      "detail",
      "2",
    ]);
  });
});

describe("medicineTodayKeys", () => {
  it("nests a single list builder under the base", () => {
    expect(medicineTodayKeys.all()).toStrictEqual(["medicineToday"]);
    expect(medicineTodayKeys.list()).toStrictEqual(["medicineToday", "list"]);
  });
});

describe("notificationKeys", () => {
  it("nests the infinite builder under the list segment", () => {
    expect(notificationKeys.all()).toStrictEqual(["notifications"]);
    expect(notificationKeys.lists()).toStrictEqual(["notifications", "list"]);
    expect(notificationKeys.infinite()).toStrictEqual([
      "notifications",
      "list",
      "infinite",
    ]);
  });
});

describe("insightKeys", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("nests the list builder under the base", () => {
    expect(insightKeys.all()).toStrictEqual(["insights"]);
    expect(insightKeys.lists()).toStrictEqual(["insights", "list"]);
    expect(insightKeys.list({ period: "DAILY" })).toStrictEqual([
      "insights",
      "list",
      { period: "DAILY" },
    ]);
  });

  it("scopes a type key to the local day and rolls it over at midnight", () => {
    jest.setSystemTime(new Date(2025, 0, 15, 23, 59));

    expect(insightKeys.byType("DAILY_SLEEP")).toStrictEqual([
      "insights",
      "type",
      "DAILY_SLEEP",
      "2025-01-15",
    ]);

    jest.setSystemTime(new Date(2025, 0, 16, 0, 1));

    expect(insightKeys.byType("DAILY_SLEEP")).toStrictEqual([
      "insights",
      "type",
      "DAILY_SLEEP",
      "2025-01-16",
    ]);
  });
});
