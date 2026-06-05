import { Text, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import { Badge } from "@/components/ui/Badge";
import { HistoryCard } from "@/lib/history/types";
import { Trigger } from "@/lib/api";
import { Spacing } from "@/constants/theme";

// TODO: Move these to a constant as well
const TRIGGER_META: Record<
  string,
  { label: string; variant: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  SOCIAL: { label: "Social", variant: "blue", icon: "diversity-1" },
  FAMILY: { label: "Familiar", variant: "green", icon: "family-restroom" },
  HEALTH: { label: "Emocional", variant: "purple", icon: "healing" },
  PHYSICAL: { label: "Físico", variant: "orange", icon: "fitness-center" },
  WORK: { label: "Trabalho", variant: "blue", icon: "work" },
  OTHER: { label: "Outro", variant: "gray", icon: "help-outline" },
};

type Props = { card: HistoryCard & { raw: Trigger } };

export function TriggerHistoryCard({ card }: Props) {
  const meta = TRIGGER_META[card.raw.category] ?? TRIGGER_META.OTHER;
  const time = new Date(card.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: "#fff7ed" }]}>
          <MaterialIcons name={meta.icon} size={22} color="#f97316" />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Gatilho Identificado</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          {card.raw.comment ? (
            <Text style={styles.summary} numberOfLines={2}>
              {card.raw.comment}
            </Text>
          ) : null}
          <Badge
            label={meta.label}
            variant={meta.variant as any}
            style={styles.badge}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.cardGap,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  title: { fontSize: 15, fontWeight: "600" },
  time: { fontSize: 13, opacity: 0.45 },
  summary: { fontSize: 13, opacity: 0.6, lineHeight: 18, marginBottom: 6 },
  badge: { alignSelf: "flex-start", marginTop: 4 },
});
