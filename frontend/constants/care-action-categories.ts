import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import type { AppointmentType, ActivityType, CareAction } from "@/lib/api/types";

export type CareActionMeta = {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  iconBackground: string;
  label: string;
};

// Selectable options, shared by the creation screens and the edit screen so
// the two never drift apart. Icons are Ionicons names, resolved by the screen.
export const APPOINTMENT_TYPE_OPTIONS: {
  label: string;
  value: AppointmentType;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  iconBackground: string;
}[] = [
  { label: "Analista", value: "ANALYST", icon: "person-outline", color: "#6366f1", iconBackground: "#e0e7ff" },
  { label: "Psiquiatra", value: "PSYCHIATRIST", icon: "medical-outline", color: "#7c3aed", iconBackground: "#ede9fe" },
  { label: "Clínico", value: "GP", icon: "fitness-outline", color: "#2563eb", iconBackground: "#dbeafe" },
  { label: "Nutricionista", value: "NUTRITIONIST", icon: "nutrition-outline", color: "#059669", iconBackground: "#d1fae5" },
  { label: "Fisioterapeuta", value: "PHYSIOTHERAPIST", icon: "body-outline", color: "#d97706", iconBackground: "#fef3c7" },
  { label: "Outro", value: "OTHER", icon: "help-outline", color: "#6b7280", iconBackground: "#f3f4f6" },
];

export const ACTIVITY_TYPE_OPTIONS: {
  label: string;
  value: ActivityType;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Caminhada", value: "WALK", icon: "walk-outline" },
  { label: "Yoga", value: "YOGA", icon: "body-outline" },
  { label: "Academia", value: "GYM", icon: "barbell-outline" },
  { label: "Meditação", value: "MEDITATION", icon: "leaf-outline" },
  { label: "Social", value: "SOCIAL", icon: "people-outline" },
  { label: "Criativo", value: "CREATIVE", icon: "color-palette-outline" },
  { label: "Outro", value: "OTHER", icon: "help-outline" },
];

export const APPOINTMENT_DURATIONS = [30, 45, 50, 60];

export const ACTIVITY_CATEGORIES: Record<string, CareActionMeta> = {
  WALK:       { icon: "directions-walk",  color: "#059669", iconBackground: "#D1FAE5", label: "Caminhada" },
  YOGA:       { icon: "self-improvement", color: "#7C3AED", iconBackground: "#EDE9FE", label: "Yoga" },
  GYM:        { icon: "fitness-center",   color: "#DC2626", iconBackground: "#FEE2E2", label: "Academia" },
  MEDITATION: { icon: "self-improvement", color: "#0891B2", iconBackground: "#CFFAFE", label: "Meditação" },
  SOCIAL:     { icon: "people",           color: "#D97706", iconBackground: "#FEF3C7", label: "Social" },
  CREATIVE:   { icon: "brush",            color: "#DB2777", iconBackground: "#FCE7F3", label: "Criativo" },
  OTHER:      { icon: "star",             color: "#6B7280", iconBackground: "#F3F4F6", label: "Atividade" },
};

export function getActivityCategory(type?: string): CareActionMeta {
  return ACTIVITY_CATEGORIES[type ?? "OTHER"] ?? ACTIVITY_CATEGORIES.OTHER;
}

const APPOINTMENT_LABELS: Record<string, string> = {
  ANALYST:       'Analista',
  PSYCHIATRIST:  'Psiquiatra',
  GP:            'Clínico',
  NUTRITIONIST:  'Nutricionista',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  OTHER:         'Consulta',
};

export function getCareActionMeta(ca: CareAction): CareActionMeta {
  switch (ca.type) {
    case 'APPOINTMENT':
      return {
        icon: 'psychology',
        color: '#1D4ED8',
        iconBackground: '#DBEAFE',
        label: APPOINTMENT_LABELS[ca.appointment?.type ?? ''] ?? 'Consulta',
      };
    case 'MEDICINE':
      return {
        icon: 'medication',
        color: '#7C3AED',
        iconBackground: '#EDE9FE',
        label: ca.medicineLog?.regimen?.name ?? 'Medicação',
      };
    case 'ACTIVITY':
      return getActivityCategory(ca.activity?.type);
    default:
      return { icon: 'star', color: '#6B7280', iconBackground: '#F3F4F6', label: 'Cuidado' };
  }
}
