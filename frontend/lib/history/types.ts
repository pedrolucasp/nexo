import type {
  HistoryKind,
  MoodEntry,
  SleepRecord,
  Trigger,
  CareAction,
} from "@/lib/api";
import type { BadgeVariant } from "@/components/ui/Badge";

export type HistoryCategory = HistoryKind;

export type CareActionSubtype = "medicine" | "appointment" | "activity";

export type HistoryBadge = {
  label: string;
  variant: BadgeVariant;
};

type HistoryCardBase = {
  id: string; // "<category>-<id>" to avoid collisions
  timestamp: string; // ISO string — used for sorting and display
  title: string;
  summary: string;
  badge?: HistoryBadge;
};

export type HistoryCard =
  | (HistoryCardBase & { category: "mood"; raw: MoodEntry })
  | (HistoryCardBase & { category: "sleep"; raw: SleepRecord })
  | (HistoryCardBase & { category: "trigger"; raw: Trigger })
  | (HistoryCardBase & {
      category: "care_action";
      subtype?: CareActionSubtype; // only set when category === "care_action"
      raw: CareAction;
    });
