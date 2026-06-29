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
      footnote="Correlação de Pearson entre horas de sono e energia no dia seguinte."
    />
  );
};

function resolveCorrelation(
  score: number,
  sampleSize: number,
): { label: string; accent: MetricAccent } {
  const lowData = sampleSize < 5;
  const suffix = lowData ? "*" : "";

  if (score > 0.6)
    return { label: `Forte${suffix}`, accent: "green" };
  if (score > 0.3)
    return { label: `Moderada${suffix}`, accent: "green" };
  if (score >= -0.3)
    return { label: `Nenhuma${suffix}`, accent: "neutral" };

  return { label: `—`, accent: "purple" };
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
