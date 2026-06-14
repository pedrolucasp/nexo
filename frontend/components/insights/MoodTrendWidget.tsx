import React from "react";
import { Text, StyleSheet, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Cards";
import { useInsight } from "@/hooks/useInsights.queries";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { InsightCard } from "./InsightCard";

export const MoodTrendWidget: React.FC = () => {
  const { data: insight, isLoading } = useInsight("MOOD_TREND");

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
        category="Humor"
        body={
          <Text style={styles.empty}>
            Registre seu humor com mais frequência para acompanhar suas
            tendências.
          </Text>
        }
        accent="green"
        metric="—"
      />
    );
  }

  const metadata = insight.metadata as {
    delta: number;
    dominantMood: string;
    avgEnergy: number;
  };

  const metric = metadata?.delta
    ? `+${Math.round(metadata.delta * 100)}%`
    : "N/A";

  const accent = metadata?.delta
    ? metadata.delta < 0
      ? "green"
      : "purple"
    : "green";

  return (
    <InsightCard
      category="Humor"
      body={insight.body}
      metric={metric}
      accent={accent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.cardGap,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },
  label: {
    ...Typography.labelSm,
    opacity: 0.6,
  },
  value: {
    ...Typography.labelSm,
    fontWeight: "600" as const,
  },
  delta: {
    ...Typography.labelSm,
    opacity: 0.6,
    marginTop: 2,
  },
  empty: {
    color: Colors.light.lightSlateGray,
    marginTop: 4,
  },
});
