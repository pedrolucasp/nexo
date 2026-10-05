import {
  ActivityType,
  AppointmentType,
  BaseMoodOption,
  CareActionType,
  IntensityLevel,
  MedicinePeriodicity,
  MoodComponentOption,
  TriggerType,
} from "@prisma/client";

// Temporary copy of the labels the app shows. The app-wide map will eventually
// live with the i18n labels work; these are intentionally pt-BR only.
export const baseMoodLabel: Record<BaseMoodOption, string> = {
  SAD: "Triste",
  NEUTRAL: "Neutro",
  GOOD: "Bem",
  GREAT: "Ótimo",
  ANGRY: "Irritado",
};

export const moodComponentLabel: Record<MoodComponentOption, string> = {
  JOY: "Alegria",
  ANGER: "Raiva",
  SADNESS: "Tristeza",
  FEAR: "Medo",
  GUILT: "Culpa",
  FRUSTRATION: "Frustração",
  CALM: "Calmo",
  MOTIVATED: "Motivado",
  TIREDNESS: "Cansaço",
  GRATITUDE: "Gratidão",
  FOCUS: "Foco",
  RESTLESS: "Inquieto",
  RELAXED: "Relaxado",
  OVERWHELMED: "Sobrecarga",
};

export const intensityLabel: Record<IntensityLevel, string> = {
  LIGHT: "Suave",
  MODERATE: "Moderada",
  HIGH: "Intensa",
};

export const triggerTypeLabel: Record<TriggerType, string> = {
  SOCIAL: "Social",
  WORK: "Trabalho",
  HEALTH: "Saúde",
  PHYSICAL: "Físico",
  FAMILY: "Família",
  THERAPY: "Terapia",
  INTERNAL: "Interno",
  OTHER: "Outro",
};

export const careActionTypeLabel: Record<CareActionType, string> = {
  MEDICINE: "Medicação",
  APPOINTMENT: "Consulta",
  ACTIVITY: "Atividade",
};

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  ANALYST: "Analista",
  PSYCHIATRIST: "Psiquiatra",
  GP: "Clínico geral",
  NUTRITIONIST: "Nutricionista",
  PHYSIOTHERAPIST: "Fisioterapeuta",
  OTHER: "Consulta",
};

export const activityCategoryLabel: Record<ActivityType, string> = {
  WALK: "Caminhada",
  YOGA: "Yoga",
  GYM: "Academia",
  MEDITATION: "Meditação",
  SOCIAL: "Momento social",
  CREATIVE: "Atividade criativa",
  OTHER: "Atividade",
};

export const medicinePeriodicityLabel: Record<MedicinePeriodicity, string> = {
  ONCE: "Uma vez",
  DAILY: "Diário",
  TWICE_DAILY: "2x ao dia",
  THREE_TIMES_DAILY: "3x ao dia",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};
