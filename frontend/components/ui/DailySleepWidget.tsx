import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Card } from "./Cards";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useInsight } from "@/hooks/useInsights.queries";

export const DailySleepWidget = () => {
  const { data: insight, isLoading } = useInsight("DAILY_SLEEP");

  const metadata = insight?.metadata as
    | {
        diffStr: string;
        diffMinutes: number;
      }
    | undefined;

  const diffColor = metadata?.diffMinutes
    ? metadata.diffMinutes < 0
      ? Colors.light.danger
      : Colors.light.tint
    : Colors.light.tint;

  return (
    <Card style={{ padding: Spacing.cardGap }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexGrow: 0,
          paddingVertical: 10,
        }}
      >
        <Ionicons name="moon" size={20} color="#64748B" />

        <Text style={{ ...Typography.headlineMd, marginBottom: 10 }}>Sono</Text>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="small" style={{ paddingBottom: 50 }} />
          </View>
        ) : insight ? (
          <>
            <Text style={{ ...Typography.headlineMd, marginBottom: 10 }}>
              {insight.body}
            </Text>
            <Text style={{ ...styles.indicatorGreen, color: diffColor }}>
              {metadata?.diffStr}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.empty}>
              Não há dados disponíveis para o dia de hoje
            </Text>
          </>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.cardGap,
  },
  indicatorGreen: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 16.5,
  },
  empty: {
    ...Typography.labelSm,
    opacity: 0.5,
  },
});
