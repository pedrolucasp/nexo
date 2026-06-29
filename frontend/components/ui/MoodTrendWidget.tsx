import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import { useInsight } from "@/hooks/useInsights.queries";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

export const MoodTrendWidget: React.FC = () => {
  const { data: insight, isLoading } = useInsight("MOOD_TREND", 0);

  const successColor = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "danger");
  const textSecondary = useThemeColor({}, "textSecondary");

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <ActivityIndicator />
      </Card>
    );
  }

  if (!insight) {
    return (
      <Card style={styles.container}>
        <Text style={styles.label}>Humor</Text>
        <Text style={styles.empty}>
          Registre mais humores para ver tendências.
        </Text>
      </Card>
    );
  }

  const meta = insight.metadata as {
    delta: number;
    dominantMood: string;
    avgEnergy: number;
  };

  const isPositive = meta.delta > 0;
  const isNeutral = meta.delta === 0;
  const deltaColor = isNeutral
    ? textSecondary
    : isPositive
      ? successColor
      : errorColor;
  const iconName = isNeutral
    ? "remove-outline"
    : isPositive
      ? "trending-up-outline"
      : "trending-down-outline";

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="partly-sunny-outline" size={14} color={textSecondary} />
        <Text style={styles.label}>Humor</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {MOOD_LABEL[meta.dominantMood] ?? meta.dominantMood}
        </Text>
        <Ionicons name={iconName} size={18} color={deltaColor} />
      </View>

      {!isNeutral && (
        <Text style={[styles.delta, { color: deltaColor }]}>
          {isPositive ? "+" : ""}
          {meta.delta}% vs período anterior
        </Text>
      )}
    </Card>
  );
};

const MOOD_LABEL: Record<string, string> = {
  GREAT: "Ótimo",
  GOOD: "Bom",
  NEUTRAL: "Neutro",
  SAD: "Triste",
  ANGRY: "Irritado",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  label: {
    ...Typography.labelXs,
    opacity: 0.6,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    ...Typography.bodyLg,
  },
  delta: {
    ...Typography.labelSm,
    marginTop: 2,
  },
  empty: {
    ...Typography.labelXs,
    opacity: 0.5,
    marginTop: 4,
  },
});
