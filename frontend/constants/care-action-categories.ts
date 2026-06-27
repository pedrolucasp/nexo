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
