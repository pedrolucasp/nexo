import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import type { HistoryCard } from "@/lib/history/types";
import type { CareAction } from "@/lib/api";
import { Spacing } from "@/constants/theme";
import { router } from "expo-router";

type Props = { card: HistoryCard & { raw: CareAction } };

export function MedicineHistoryCard({ card }: Props) {
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
        <View style={[styles.iconWrap, styles.iconBg]}>
          <MaterialIcons name="medication" size={22} color="#7C3AED" />
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
  iconBg: { backgroundColor: "#EDE9FE" },
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
