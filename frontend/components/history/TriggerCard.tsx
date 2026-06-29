import { View, StyleSheet } from "react-native";
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import { Badge } from "@/components/ui/Badge";
import { HistoryCard } from "@/lib/history/types";
import { Trigger } from "@/lib/api";
import { Spacing } from "@/constants/theme";
import { router } from 'expo-router';
import { getTriggerCategory } from "@/constants/trigger-categories";

type Props = { card: HistoryCard & { raw: Trigger } };

export function TriggerHistoryCard({ card }: Props) {
  const meta = getTriggerCategory(card.raw.category);
  const time = new Date(card.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card style={styles.card} onPress={() => router.push(`/triggers/${card.raw.id}`) }>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.iconBackground }]}>
          <MaterialIcons name={meta.icon} size={22} color={meta.color} />
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
