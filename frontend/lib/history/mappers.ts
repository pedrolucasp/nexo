import type { HistoryCard } from "@/lib/history/types";
import type { MoodEntry, SleepRecord, Trigger } from "@/lib/api";
import { getMood } from "@/constants/moods";
import { parse, setHours } from "date-fns";

export function mapMoodToHistoryCard(mood: MoodEntry): HistoryCard {
  const moodLabel = getMood(mood.selectedMood);
  const components = mood.moodComponents
    .map((c) => c.component.charAt(0) + c.component.slice(1).toLowerCase())
    .join(", ");

  const summary = [components || null, mood.annotation || null]
    .filter(Boolean)
    .join(" · ");

  return {
    id: `mood-${mood.id}`,
    category: "mood",
    timestamp: mood.moment.toString(),
    title: moodLabel?.label ?? "Humor",
    summary: summary || "Sem detalhes",
    badge: undefined,
    raw: mood,
  };
}

// Sleep Records

function sleepQualityBadge(hours: number): HistoryCard["badge"] {
  if (hours >= 7) return { label: "Excelente", variant: "success" };
  if (hours >= 5) return { label: "Regular", variant: "warning" };

  return {
    label: "Ruim",
    variant: "danger",
  };
}

export function mapSleepToHistoryCard(record: SleepRecord): HistoryCard {
  const hours = Math.floor(record.average);
  const minutes = Math.round((record.average - hours) * 60);
  const duration = `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  // Force local noon so timezone shifts can't bleed into the previous day
  const dateStr = typeof record.date === 'string'
    ? record.date.slice(0, 10)           // "2026-05-24"
    : record.date.toISOString().slice(0, 10)

  const timestamp = `${dateStr}T12:00:00`  // local noon, no UTC funny business

  return {
    id: `sleep-${record.id}`,
    category: "sleep",
    timestamp,
    title: "Sono",
    summary: [duration, record.annotations].filter(Boolean).join(" · "),
    badge: sleepQualityBadge(record.average),
    raw: record,
  };
}

export function mapTriggerToHistoryCard(record: Trigger): HistoryCard {
  return {
    id: `trigger-${record.id}`,
    category: "trigger",
    timestamp: record.moment.toString(),
    title: "Gatilho",
    summary: [record.category, record.comment].filter(Boolean).join(" · "),
    badge: undefined,
    raw: record,
  };
}
