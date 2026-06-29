import React from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import { useInsight } from "@/hooks/useInsights.queries";
import { Colors, Spacing } from "@/constants/theme";
import { getTriggerCategory } from "@/constants/trigger-categories";
import { InsightCard } from "./InsightCard";

export const TriggerPatternWidget: React.FC = () => {
  const { data: insight, isLoading } = useInsight("TRIGGER_PATTERN");

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <ActivityIndicator />
      </Card>
    );
  }

  if (!insight) {
    return (
      <InsightCard
        category="Gatilhos"
        body={
          <Text style={styles.empty}>
            Registre gatilhos com mais frequência para identificar padrões.
          </Text>
        }
        accent="neutral"
        metric="—"
      />
    );
  }

  const metadata = insight.metadata as {
    topCategory: string;
    topCount: number;
    total: number;
    distribution: Record<string, number>;
  };

  const pct =
    metadata.total > 0
      ? Math.round((metadata.topCount / metadata.total) * 100)
      : 0;

  const topMeta = getTriggerCategory(metadata.topCategory);

  return (
    <InsightCard
      category="Gatilhos"
      body={
        <View style={styles.bodyRow}>
          <Text style={styles.bodyText}>{insight.body}</Text>
        </View>
      }
      metric={`${pct}%`}
      accent="neutral"
      footnote="Percentual da categoria de gatilho mais frequente no período."
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.cardGap,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  empty: {
    color: Colors.light.lightSlateGray,
    marginTop: 4,
  },
});
