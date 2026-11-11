import { TZDate } from "@date-fns/tz";

import { APP_TIMEZONE_NAME } from "@app/lib/appTime";

export const HISTORY_KINDS = [
  "mood",
  "sleep",
  "trigger",
  "care_action",
] as const;

export type HistoryKind = (typeof HISTORY_KINDS)[number];

export const DEFAULT_HISTORY_LIMIT = 20;

// Stable ordinals: the list's tie-break is kind asc, so this order is the
// contract, not an implementation detail
const HISTORY_KIND_RANK: Record<HistoryKind, number> = {
  mood: 0,
  sleep: 1,
  trigger: 2,
  care_action: 3,
};

export type HistoryCursor = {
  sortAt: Date;
  kind: HistoryKind;
  id: number;
};

const isHistoryKind = (value: unknown): value is HistoryKind =>
  typeof value === "string" &&
  (HISTORY_KINDS as readonly string[]).includes(value);

export const historyKindRank = (kind: HistoryKind): number =>
  HISTORY_KIND_RANK[kind];

export const encodeHistoryCursor = ({
  sortAt,
  kind,
  id,
}: HistoryCursor): string =>
  Buffer.from(JSON.stringify({ sortAt: sortAt.toISOString(), kind, id })).toString(
    "base64url",
  );

export const decodeHistoryCursor = (value: string): HistoryCursor | null => {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (typeof parsed !== "object" || parsed === null) return null;

    const { sortAt, kind, id } = parsed as Record<string, unknown>;

    if (typeof sortAt !== "string" || !isHistoryKind(kind)) return null;
    if (!Number.isInteger(id) || (id as number) <= 0) return null;

    const date = new Date(sortAt);

    if (Number.isNaN(date.getTime())) return null;

    return { sortAt: date, kind, id: id as number };
  } catch {
    return null;
  }
};

// sortAt desc, kind asc, id desc. Negative when `a` comes first
export const compareHistoryItems = (
  a: { sortAt: Date; kind: HistoryKind; id: number },
  b: { sortAt: Date; kind: HistoryKind; id: number },
): number =>
  b.sortAt.getTime() - a.sortAt.getTime() ||
  historyKindRank(a.kind) - historyKindRank(b.kind) ||
  b.id - a.id;

const NOON_MINUTES = 12 * 60;

// A sleep record has no moment of its own, so the list anchors it at its wake
// time on its app-timezone day, falling back to noon when it has none
export const sleepSortAt = (
  date: Date,
  wakeMinutes?: number | null,
): Date => {
  const [year, month, day] = date
    .toISOString()
    .slice(0, 10)
    .split("-")
    .map(Number);

  const minutes = wakeMinutes ?? NOON_MINUTES;

  const anchored = new TZDate(
    year,
    month - 1,
    day,
    Math.floor(minutes / 60),
    minutes % 60,
    0,
    APP_TIMEZONE_NAME,
  );

  // TZDate overrides toISOString to render its own offset; the response wants
  // a plain instant so JSON and the cursor stay in UTC
  return new Date(anchored.getTime());
};
