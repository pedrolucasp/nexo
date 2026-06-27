import type { HistoryCard } from "@/lib/history/types";
import type { MoodEntry, SleepRecord, Trigger, CareAction } from "@/lib/api";
import { getMood } from "@/constants/moods";


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
  console.log("mapping...", record)
  const hours = Math.floor(record.average);
  const minutes = Math.round((record.average - hours) * 60);
  const duration = `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  const timestamp = typeof record.createdAt === 'string'
    ? record.createdAt
    : record.createdAt.toISOString();

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

function activityLabel(type?: string): string {
  const labels: Record<string, string> = {
    WALK: "Caminhada",
    YOGA: "Yoga",
    GYM: "Academia",
    MEDITATION: "Meditação",
    SOCIAL: "Momento social",
    CREATIVE: "Atividade criativa",
    OTHER: "Atividade",
  };
  return type ? (labels[type] ?? "Atividade") : "Atividade";
}

function appointmentLabel(type?: string): string {
  const labels: Record<string, string> = {
    ANALYST: "Analista",
    PSYCHIATRIST: "Psiquiatra",
    GP: "Clínico geral",
    NUTRITIONIST: "Nutricionista",
    PHYSIOTHERAPIST: "Fisioterapeuta",
    OTHER: "Consulta",
  };
  return type ? (labels[type] ?? "Consulta") : "Consulta";
}

export function mapCareActionToHistoryCard(record: CareAction): HistoryCard {
  switch (record.type) {
    case "MEDICINE": {
      const log = record.medicineLog;
      const name = log?.regimen?.name ?? "Medicamento";
      const dosage = log?.regimen?.dosage;
      return {
        id: `care_action-${record.id}`,
        category: "care_action",
        subtype: "medicine",
        timestamp: record.moment.toString(),
        title: name,
        summary: dosage ?? "Sem dosagem registrada",
        raw: record,
      };
    }

    case "APPOINTMENT": {
      const appt = record.appointment;
      const parts = [
        appt?.duration ? `${appt.duration} min` : null,
        appt?.note ?? null,
      ].filter(Boolean);
      const linkedCount =
        (record.triggerId ? 1 : 0) + (record.moodId ? 1 : 0);
      return {
        id: `care_action-${record.id}`,
        category: "care_action",
        subtype: "appointment",
        timestamp: record.moment.toString(),
        title: `Consulta · ${appointmentLabel(appt?.type)}`,
        summary: parts.join(" · ") || "Sem anotações",
        badge:
          linkedCount > 0
            ? {
                label: `${linkedCount} vínculo${linkedCount > 1 ? "s" : ""}`,
                variant: "info",
              }
            : undefined,
        raw: record,
      };
    }

    case "ACTIVITY": {
      const act = record.activity;
      return {
        id: `care_action-${record.id}`,
        category: "care_action",
        subtype: "activity",
        timestamp: record.moment.toString(),
        title: activityLabel(act?.type),
        summary: act?.duration
          ? `${act.duration} min`
          : "Sem duração registrada",
        raw: record,
      };
    }

    default:
      return {
        id: `care_action-${record.id}`,
        category: "care_action",
        timestamp: record.moment.toString(),
        title: "Ação de cuidado",
        summary: "",
        raw: record,
      };
  }
}
