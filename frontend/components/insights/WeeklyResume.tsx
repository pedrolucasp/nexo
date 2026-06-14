import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";

interface WeeklyResumeProps {
  avgMood: string;
  stats: { label: string; value: string }[];
}

export const WeeklyResume: React.FC<WeeklyResumeProps> = ({
  avgMood,
  stats,
}) => {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Resumo Semanal</Text>

      <View style={styles.heroScoreRow}>
        <Text style={styles.heroScore}>{avgMood}</Text>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroStats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>{stat.label}</Text>
            <Text style={styles.heroStatValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.light.black,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: Spacing.sectionGap,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.light.tint,
    marginBottom: 8,
  },
  heroScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroScore: {
    ...Typography.headlineXg,
    fontSize: 52,
    color: "#ffffff",
  },
  heroTrendIcon: {
    marginTop: 6,
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 16,
  },
  heroStats: {
    flexDirection: "row",
    gap: Spacing.sectionGap,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    marginBottom: 4,
  },
  heroStatValue: {
    ...Typography.bodyLg,
    fontSize: 20,
    color: "#ffffff",
  },
});
