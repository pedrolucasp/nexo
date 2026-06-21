import { MaterialIcons } from "@expo/vector-icons";
import { TriggerCategory } from "@/constants/triggers";

export interface TriggerCategoryDefinition {
  id: TriggerCategory;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  iconBackground: string;
  variant: string;
}

export const TRIGGER_CATEGORY_DEFINITIONS: TriggerCategoryDefinition[] = [
  { id: "WORK",     label: "Trabalho", icon: "work",            color: "#3b82f6", iconBackground: "#dbeafe", variant: "blue" },
  { id: "SOCIAL",   label: "Social",   icon: "diversity-1",     color: "#8b5cf6", iconBackground: "#ede9fe", variant: "purple" },
  { id: "HEALTH",   label: "Saúde",    icon: "healing",         color: "#34c272", iconBackground: "#d4f5e2", variant: "green" },
  { id: "FAMILY",   label: "Família",  icon: "family-restroom", color: "#f97316", iconBackground: "#ffedd5", variant: "orange" },
  { id: "PHYSICAL", label: "Físico",   icon: "fitness-center",  color: "#f97316", iconBackground: "#ffedd5", variant: "orange" },
  { id: "OTHER",    label: "Outro",    icon: "help-outline",    color: "#94a3b8", iconBackground: "#f1f5f9", variant: "gray" },
];

export const getTriggerCategory = (id: string): TriggerCategoryDefinition =>
  TRIGGER_CATEGORY_DEFINITIONS.find((c) => c.id === id) ??
  TRIGGER_CATEGORY_DEFINITIONS.find((c) => c.id === "OTHER")!;
