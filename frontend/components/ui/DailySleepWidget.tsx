import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Card } from "./Cards";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export const DailySleepWidget = () => {
  //const { data: insight, isLoading } = useInsight("DAILY_ENERGY", 0);
  const isLoading = false;
  const insight = null;

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
              7h 30m
            </Text>
            <Text style={styles.indicatorGreen}>+45min que ontem</Text>
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
    color: Colors.light.tint,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 16.5,
  },
  empty: {
    ...Typography.labelSm,
    opacity: 0.5,
  },
});
