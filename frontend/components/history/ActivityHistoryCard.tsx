import { Text, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import type { HistoryCard } from "@/lib/history/types";
import type { CareAction } from "@/lib/api";
import { Spacing } from "@/constants/theme";
import { getActivityCategory } from "@/constants/care-action-categories";
import { router } from "expo-router";

type Props = { card: HistoryCard & { raw: CareAction } };

export function ActivityHistoryCard({ card }: Props) {
  const meta = getActivityCategory(card.raw.activity?.type);
  const time = new Date(card.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      style={styles.card}
      onPress={() => (router.push as any)(`/care-actions/${card.raw.id}`)}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.iconBackground }]}>
          <MaterialIcons name={meta.icon as any} size={22} color={meta.color} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text style={styles.summary} numberOfLines={2}>
            {card.summary}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.cardGap },
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
  summary: { fontSize: 13, opacity: 0.6, lineHeight: 18 },
});
