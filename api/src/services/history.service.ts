import { format } from "date-fns";
import { Prisma, SleepRecord, Trigger } from "@prisma/client";

import { prisma } from "@app/lib/prisma";
import { APP_TIMEZONE } from "@app/lib/appTime";
import {
  DEFAULT_HISTORY_LIMIT,
  HistoryCursor,
  HistoryKind,
  compareHistoryItems,
  encodeHistoryCursor,
  historyKindRank,
  sleepSortAt,
} from "@app/lib/history";

const careActionIncludes = {
  medicineLog: { include: { regimen: true } },
  appointment: true,
  activity: true,
} satisfies Prisma.CareActionInclude;

type CareActionWithDetails = Prisma.CareActionGetPayload<{
  include: typeof careActionIncludes;
}>;

export type HistoryItem =
  | (Prisma.MoodGetPayload<{ include: { moodComponents: true } }> & {
      kind: "mood";
      sortAt: Date;
    })
  | (Trigger & { kind: "trigger"; sortAt: Date })
  | (SleepRecord & { kind: "sleep"; sortAt: Date })
  | (CareActionWithDetails & { kind: "care_action"; sortAt: Date });

export type HistoryPage = {
  items: HistoryItem[];
  nextCursor: string | null;
};

// The SQL cut is a superset of the cursor's slice: it keeps rows at or before
// the cursor's instant, and the in-memory comparator drops the rest. The
// id tie-break has to happen in SQL too, or a cluster of same-moment rows
// larger than the page would push the cursor's remaining rows out of reach
const momentCut = (kind: HistoryKind, cursor?: HistoryCursor) => {
  if (!cursor) return {};

  const rank = historyKindRank(kind);
  const cursorRank = historyKindRank(cursor.kind);

  if (rank > cursorRank) return { moment: { lte: cursor.sortAt } };
  if (rank < cursorRank) return { moment: { lt: cursor.sortAt } };

  return {
    OR: [
      { moment: { lt: cursor.sortAt } },
      { moment: cursor.sortAt, id: { lt: cursor.id } },
    ],
  };
};

// `date` is the record's day identity and has no moment of its own, so the cut
// compares the app-timezone day and, within it, the row's wake minute against
// the cursor's. A row with no wake time falls back to noon. The in-memory
// comparator still drops anything at or after the cursor, but doing the minute
// in SQL keeps a same-day cluster larger than the page reachable
const sleepCut = (cursor?: HistoryCursor): Prisma.SleepRecordWhereInput => {
  if (!cursor) return {};

  const day = appDayOf(cursor.sortAt);
  const minutes = appMinutesOf(cursor.sortAt);
  const rank = historyKindRank("sleep");
  const cursorRank = historyKindRank(cursor.kind);

  // At an equal instant sleep is rank 1: a lower-ranked cursor kind leaves it
  // after the cursor, a higher-ranked one puts it before, and the same kind
  // breaks the tie by id
  const keepsEqualInstant = cursorRank <= rank;
  const equalInstantId: Prisma.SleepRecordWhereInput =
    cursorRank === rank ? { id: { lt: cursor.id } } : {};

  const sameDayAt = (
    anchorMinutes: number | null,
  ): Prisma.SleepRecordWhereInput | null => {
    const anchor = sleepSortAt(day, anchorMinutes).getTime();

    if (anchor > cursor.sortAt.getTime()) return null;
    if (anchor < cursor.sortAt.getTime()) {
      return { date: day, wakeMinutes: anchorMinutes };
    }
    if (!keepsEqualInstant) return null;

    return { date: day, wakeMinutes: anchorMinutes, ...equalInstantId };
  };

  const branches: Prisma.SleepRecordWhereInput[] = [
    { date: { lt: day } },
    { date: day, wakeMinutes: { lt: minutes } },
  ];

  const atMinute = sameDayAt(minutes);
  if (atMinute) branches.push(atMinute);

  const atNoon = sameDayAt(null);
  if (atNoon) branches.push(atNoon);

  return { OR: branches };
};

// The app-timezone calendar day containing `instant`, in the UTC-midnight form
// Prisma uses for @db.Date columns
const appDayOf = (instant: Date): Date =>
  new Date(`${format(instant, "yyyy-MM-dd", { in: APP_TIMEZONE })}T00:00:00.000Z`);

// Minutes since midnight in the app timezone
const appMinutesOf = (instant: Date): number => {
  const [hours, minutes] = format(instant, "HH:mm", { in: APP_TIMEZONE })
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

// Within a day a sleep row sorts by its wake minute, with noon standing in for
// NULL. Prisma cannot order by that coalesced value, so timed and untimed rows
// are fetched separately; each keeps its own top `take`, which is enough to
// contain the union's top `take`
const fetchSleepRows = async (
  userId: number,
  cursor: HistoryCursor | undefined,
  take: number,
): Promise<SleepRecord[]> => {
  const cut = sleepCut(cursor);

  const [timed, untimed] = await Promise.all([
    prisma.sleepRecord.findMany({
      where: { userId, wakeMinutes: { not: null }, ...cut },
      orderBy: [{ date: "desc" }, { wakeMinutes: "desc" }, { id: "desc" }],
      take,
    }),
    prisma.sleepRecord.findMany({
      where: { userId, wakeMinutes: null, ...cut },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take,
    }),
  ]);

  return [...timed, ...untimed];
};

export const getHistoryByUserId = async (
  userId: number,
  params?: { limit?: number; type?: HistoryKind; cursor?: HistoryCursor },
): Promise<HistoryPage> => {
  const limit = params?.limit ?? DEFAULT_HISTORY_LIMIT;
  const { type, cursor } = params ?? {};
  const take = limit + 1;

  const wants = (kind: HistoryKind) => !type || type === kind;

  const [moods, triggers, sleepRecords, careActions] = await Promise.all([
    wants("mood")
      ? prisma.mood.findMany({
          where: { userId, ...momentCut("mood", cursor) },
          include: { moodComponents: true },
          orderBy: [{ moment: "desc" }, { id: "desc" }],
          take,
        })
      : [],
    wants("trigger")
      ? prisma.trigger.findMany({
          where: { userId, ...momentCut("trigger", cursor) },
          orderBy: [{ moment: "desc" }, { id: "desc" }],
          take,
        })
      : [],
    wants("sleep")
      ? fetchSleepRows(userId, cursor, take)
      : [],
    wants("care_action")
      ? prisma.careAction.findMany({
          where: { userId, ...momentCut("care_action", cursor) },
          include: careActionIncludes,
          orderBy: [{ moment: "desc" }, { id: "desc" }],
          take,
        })
      : [],
  ]);

  const items = [
    ...moods.map((mood) => ({
      ...mood,
      kind: "mood" as const,
      sortAt: mood.moment,
    })),
    ...triggers.map((trigger) => ({
      ...trigger,
      kind: "trigger" as const,
      sortAt: trigger.moment,
    })),
    ...sleepRecords.map((record) => ({
      ...record,
      kind: "sleep" as const,
      sortAt: sleepSortAt(record.date, record.wakeMinutes),
    })),
    ...careActions.map((careAction) => ({
      ...careAction,
      kind: "care_action" as const,
      sortAt: careAction.moment,
    })),
  ]
    .filter((item) => !cursor || compareHistoryItems(item, cursor) > 0)
    .sort(compareHistoryItems);

  const page = items.slice(0, limit);
  const hasMore = items.length > limit;

  return {
    items: page,
    nextCursor: hasMore
      ? encodeHistoryCursor(page[page.length - 1])
      : null,
  };
};
