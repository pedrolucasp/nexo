import type { MoodEntry, SleepRecord, Trigger, CareAction } from "@/lib/api";

export type HistoryCategory = "mood" | "sleep" | "trigger" | "care_action";

export type CareActionSubtype = "medicine" | "appointment" | "activity";

export type HistoryBadge = {
  label: string;
  variant: "neutral" | "warning" | "success" | "danger" | "info";
};

export type HistoryCard = {
  id: string; // "<category>-<id>" to avoid collisions
  category: HistoryCategory;
  subtype?: CareActionSubtype; // only set when category === "care_action"
  timestamp: string; // ISO string — used for sorting and display
  title: string;
  summary: string;
  badge?: HistoryBadge;
  raw: MoodEntry | SleepRecord | Trigger | CareAction;
};
