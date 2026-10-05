import {
  Activity,
  Appointment,
  CareAction,
  Insight,
  MedicineLog,
  MedicineRegimen,
  Mood,
  MoodComponent,
  SleepRecord,
  Trigger,
  TriggerMoodLink,
  User,
} from "@prisma/client";

import {
  activityCategoryLabel,
  appointmentTypeLabel,
  baseMoodLabel,
  careActionTypeLabel,
  insightPeriodLabel,
  insightTypeLabel,
  intensityLabel,
  medicinePeriodicityLabel,
  moodComponentLabel,
  triggerTypeLabel,
} from "@app/services/export/label.map";
import { CsvTable } from "@app/services/export/types";

const booleanLabel = (value: boolean): string => (value ? "Sim" : "Não");

const jsonValue = (value: Insight["metadata"]): string | null =>
  value === null ? null : JSON.stringify(value);

// Sleep records carry a day-granular date, so they drop the time and offset.
const dateOnly = (value: Date): string => value.toISOString().slice(0, 10);

export const profileTable: CsvTable<User> = {
  filename: "profile.csv",
  columns: [
    { header: "id", value: (user) => user.id },
    { header: "Nome", value: (user) => user.firstName },
    { header: "Sobrenome", value: (user) => user.lastName },
    { header: "Email", value: (user) => user.email },
    { header: "Ativo", value: (user) => booleanLabel(user.active) },
    {
      header: "Notificações",
      value: (user) => booleanLabel(user.notificationsEnabled),
    },
    { header: "Lembrete diário", value: (user) => user.dailyReminderTime },
    { header: "Criado em", value: (user) => user.createdAt },
    { header: "Atualizado em", value: (user) => user.updatedAt },
  ],
};

export const moodTable: CsvTable<Mood> = {
  filename: "moods.csv",
  columns: [
    { header: "id", value: (mood) => mood.id },
    { header: "Humor", value: (mood) => baseMoodLabel[mood.selectedMood] },
    { header: "Ansiedade", value: (mood) => mood.anxietyLevel },
    { header: "Estresse", value: (mood) => mood.stressLevel },
    { header: "Energia", value: (mood) => mood.energyLevel },
    { header: "Momento", value: (mood) => mood.moment },
    { header: "Anotação", value: (mood) => mood.annotation },
  ],
};

export const moodComponentTable: CsvTable<MoodComponent> = {
  filename: "mood_components.csv",
  columns: [
    { header: "id", value: (component) => component.id },
    { header: "mood_id", value: (component) => component.moodId },
    {
      header: "Sentimento",
      value: (component) => moodComponentLabel[component.component],
    },
    {
      header: "Intensidade",
      value: (component) => intensityLabel[component.intensity],
    },
  ],
};

export const sleepRecordTable: CsvTable<SleepRecord> = {
  filename: "sleep_records.csv",
  columns: [
    { header: "id", value: (record) => record.id },
    { header: "Data", value: (record) => dateOnly(record.date) },
    { header: "Média", value: (record) => record.average },
    { header: "Anotações", value: (record) => record.annotations },
    { header: "Criado em", value: (record) => record.createdAt },
    { header: "Atualizado em", value: (record) => record.updatedAt },
  ],
};

export const triggerTable: CsvTable<Trigger> = {
  filename: "triggers.csv",
  columns: [
    { header: "id", value: (trigger) => trigger.id },
    {
      header: "Categoria",
      value: (trigger) => triggerTypeLabel[trigger.category],
    },
    { header: "Momento", value: (trigger) => trigger.moment },
    { header: "Comentário", value: (trigger) => trigger.comment },
    { header: "Criado em", value: (trigger) => trigger.createdAt },
    { header: "Atualizado em", value: (trigger) => trigger.updatedAt },
  ],
};

export const triggerMoodLinkTable: CsvTable<TriggerMoodLink> = {
  filename: "trigger_mood_links.csv",
  columns: [
    { header: "id", value: (link) => link.id },
    { header: "trigger_id", value: (link) => link.triggerId },
    { header: "mood_id", value: (link) => link.moodId },
    { header: "Impacto percebido", value: (link) => link.perceivedImpact },
    { header: "Vinculado em", value: (link) => link.linkedAt },
  ],
};

export const careActionTable: CsvTable<CareAction> = {
  filename: "care_actions.csv",
  columns: [
    { header: "id", value: (action) => action.id },
    { header: "Tipo", value: (action) => careActionTypeLabel[action.type] },
    { header: "Momento", value: (action) => action.moment },
    { header: "trigger_id", value: (action) => action.triggerId },
    { header: "mood_id", value: (action) => action.moodId },
    { header: "Criado em", value: (action) => action.createdAt },
    { header: "Atualizado em", value: (action) => action.updatedAt },
  ],
};

export const medicineLogTable: CsvTable<MedicineLog> = {
  filename: "medicine_logs.csv",
  columns: [
    { header: "id", value: (log) => log.id },
    { header: "care_action_id", value: (log) => log.careActionId },
    { header: "regimen_id", value: (log) => log.regimenId },
    { header: "Tomado em", value: (log) => log.takenAt },
  ],
};

export const appointmentTable: CsvTable<Appointment> = {
  filename: "appointments.csv",
  columns: [
    { header: "id", value: (appointment) => appointment.id },
    {
      header: "care_action_id",
      value: (appointment) => appointment.careActionId,
    },
    {
      header: "Tipo",
      value: (appointment) => appointmentTypeLabel[appointment.type],
    },
    { header: "Duração", value: (appointment) => appointment.duration },
    { header: "Observação", value: (appointment) => appointment.note },
  ],
};

export const activityTable: CsvTable<Activity> = {
  filename: "activities.csv",
  columns: [
    { header: "id", value: (activity) => activity.id },
    { header: "care_action_id", value: (activity) => activity.careActionId },
    {
      header: "Tipo",
      value: (activity) => activityCategoryLabel[activity.type],
    },
    { header: "Duração", value: (activity) => activity.duration },
  ],
};

export const medicineRegimenTable: CsvTable<MedicineRegimen> = {
  filename: "medicine_regimens.csv",
  columns: [
    { header: "id", value: (regimen) => regimen.id },
    { header: "Nome", value: (regimen) => regimen.name },
    { header: "Dosagem", value: (regimen) => regimen.dosage },
    {
      header: "Periodicidade",
      value: (regimen) => medicinePeriodicityLabel[regimen.periodicity],
    },
    { header: "Horários", value: (regimen) => regimen.scheduledAt.join(" · ") },
    { header: "Ativo", value: (regimen) => booleanLabel(regimen.active) },
    { header: "Criado em", value: (regimen) => regimen.createdAt },
    { header: "Atualizado em", value: (regimen) => regimen.updatedAt },
  ],
};

export const insightTable: CsvTable<Insight> = {
  filename: "insights.csv",
  columns: [
    { header: "id", value: (insight) => insight.id },
    { header: "Tipo", value: (insight) => insightTypeLabel[insight.type] },
    { header: "Período", value: (insight) => insightPeriodLabel[insight.period] },
    { header: "Título", value: (insight) => insight.title },
    { header: "Corpo", value: (insight) => insight.body },
    { header: "Metadados", value: (insight) => jsonValue(insight.metadata) },
    { header: "Início do período", value: (insight) => insight.periodStart },
    { header: "Fim do período", value: (insight) => insight.periodEnd },
    { header: "Gerado em", value: (insight) => insight.generatedAt },
  ],
};
