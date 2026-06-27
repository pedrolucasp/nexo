import type { CareAction } from "@/lib/api/types";

export type CareActionMeta = {
  icon: string;
  color: string;
  iconBackground: string;
  label: string;
};

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
