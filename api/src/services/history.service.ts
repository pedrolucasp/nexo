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

// `date` is day-granular and has no moment of its own, so the cut compares
// the app-timezone day against the anchor the sort uses
const sleepCut = (cursor?: HistoryCursor) => {
  if (!cursor) return {};

  const day = appDayOf(cursor.sortAt);
  const noon = sleepSortAt(day);
  const at = cursor.sortAt.getTime();

  if (at < noon.getTime()) return { date: { lt: day } };
  if (at > noon.getTime()) return { date: { lte: day } };

  const rank = historyKindRank("sleep");
  const cursorRank = historyKindRank(cursor.kind);

  if (rank > cursorRank) return { date: { lte: day } };
  if (rank < cursorRank) return { date: { lt: day } };

  return {
    OR: [{ date: { lt: day } }, { date: day, id: { lt: cursor.id } }],
  };
};

// The app-timezone calendar day containing `instant`, in the UTC-midnight form
// Prisma uses for @db.Date columns
const appDayOf = (instant: Date): Date =>
  new Date(`${format(instant, "yyyy-MM-dd", { in: APP_TIMEZONE })}T00:00:00.000Z`);

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
      ? prisma.sleepRecord.findMany({
          where: { userId, ...sleepCut(cursor) },
          orderBy: [{ date: "desc" }, { id: "desc" }],
          take,
        })
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
      sortAt: sleepSortAt(record.date),
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
