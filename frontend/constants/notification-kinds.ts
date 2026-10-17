import { MaterialIcons } from "@expo/vector-icons";
import type { NotificationKind } from "@/lib/api/types";

export type NotificationKindMeta = {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  iconBackground: string;
};

// The icon and pastel bubble that identify each kind at a glance; the title and
// body carry the rest
export const NOTIFICATION_KINDS: Record<NotificationKind, NotificationKindMeta> = {
  DAILY_REMINDER: {
    icon: "mood",
    color: "#0EA5E9",
    iconBackground: "#E0F2FE",
  },
  MEDICINE_REMINDER: {
    icon: "medication",
    color: "#7C3AED",
    iconBackground: "#EDE9FE",
  },
  INSIGHT_ALERT: {
    icon: "lightbulb-outline",
    color: "#D97706",
    iconBackground: "#FEF3C7",
  },
};
