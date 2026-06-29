import React from "react";
import { Text, StyleSheet, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Cards";
import { ThemedText } from "@/components/misc/themed-text";
import { useInsight } from "@/hooks/useInsights.queries";
import { Spacing, Typography, Colors } from "@/constants/theme";
import { InsightCard, MetricAccent } from "./InsightCard";

export const EnergySleepWidget: React.FC = () => {
  const { data: insight, isLoading } = useInsight("ENERGY_SLEEP_CORRELATION");

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
        category="Energia"
        body={
          <Text style={styles.empty}>
            Registre sono e humor para ver correlações.
          </Text>
        }
        accent="neutral"
        metric="—"
      />
    );
  }

  const meta = insight.metadata as { correlationScore: number; sampleSize: number };
  const { label, accent } = resolveCorrelation(meta.correlationScore, meta.sampleSize);

  return (
    <InsightCard
      category="Energia"
      body={insight.body}
      metric={label}
      accent={accent}
    />
  );
};

function resolveCorrelation(
  score: number,
  sampleSize: number,
): { label: string; accent: MetricAccent } {
  const pct = Math.round(Math.abs(score) * 100);
  const lowData = sampleSize < 5;

  if (score > 0.6)
    return { label: lowData ? "Alta*" : `+${pct}%`, accent: "green" };
  if (score > 0.3)
    return { label: lowData ? "Média*" : `+${pct}%`, accent: "green" };
  if (score >= -0.3)
    return { label: "~0%", accent: "neutral" };
  return { label: `-${pct}%`, accent: "purple" };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.cardGap,
  },
  label: {
    ...Typography.labelSm,
    opacity: 0.6,
  },
  empty: {
    color: Colors.light.lightSlateGray,
    marginTop: 4,
  },
});
