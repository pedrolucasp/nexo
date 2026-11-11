import React from "react";
import { StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { useInsight } from "@/hooks/useInsights.queries";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { InsightCard } from "./InsightCard";

const formatDecimal = (value: number): string =>
  value.toFixed(1).replace(".", ",");

const FOOTNOTE =
  "Primeira e segunda metade dos últimos 7 dias. " +
  "Escala 1–5: 1 Irritado · 2 Triste · 3 Neutro · 4 Bem · 5 Ótimo. " +
  "Variações abaixo de 0,5 ponto ficam dentro de meio degrau; " +
  "1,0 ponto equivale a uma opção inteira.";

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
        accent="neutral"
        metric="—"
      />
    );
  }

  const metadata = insight.metadata as {
    avgFirst: number;
    avgSecond: number;
  };

  const first = formatDecimal(metadata.avgFirst);
  const second = formatDecimal(metadata.avgSecond);

  return (
    <InsightCard
      category="Humor"
      body={insight.body}
      metric={`${first} → ${second}`}
      accent="neutral"
      footnote={FOOTNOTE}
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
