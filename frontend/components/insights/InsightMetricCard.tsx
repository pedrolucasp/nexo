import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface InsightMetricCardProps {
  icon: IoniconName;
  title: string;
  iconColor?: string;
  iconBackground?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  value?: string;
  windowLabel?: string;
  detail?: string;
  barRatio?: number;
  comparison?: string | null;
  comparisonColor?: string;
}

// One card for the daily insight pair: a tinted icon beside the title, a hero
// number with its window, an optional bounded bar, and the comparison line
export const InsightMetricCard: React.FC<InsightMetricCardProps> = ({
  icon,
  title,
  iconColor = Colors.light.tint,
  iconBackground = Colors.light.tint + "1A",
  isLoading = false,
  emptyMessage,
  value,
  windowLabel,
  detail,
  barRatio,
  comparison,
  comparisonColor = Colors.light.textSecondary,
}) => (
  <Card style={styles.container}>
    <View style={styles.header}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>

    <View style={styles.body}>
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : value == null ? (
        <Text style={styles.empty}>{emptyMessage}</Text>
      ) : (
        <>
          <View style={styles.heroRow}>
            <Text style={styles.value}>{value}</Text>
            {windowLabel && <Text style={styles.window}>{windowLabel}</Text>}
          </View>

          {barRatio != null && (
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.round(barRatio * 100)}%`,
                    backgroundColor: iconColor,
                  },
                ]}
              />
            </View>
          )}

          {detail && <Text style={styles.detail}>{detail}</Text>}

          {comparison && (
            <Text style={[styles.comparison, { color: comparisonColor }]}>
              {comparison}
            </Text>
          )}
        </>
      )}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.inlineGapSm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...Typography.bodyMd,
    fontWeight: "700",
    color: Colors.light.text,
  },
  body: {
    marginTop: 10,
    gap: 6,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  value: {
    ...Typography.headlineXg,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.light.text,
  },
  window: {
    ...Typography.labelSm,
    fontWeight: "500",
    color: Colors.light.textSecondary,
  },
  track: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.divider,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  detail: {
    ...Typography.labelXs,
    color: Colors.light.textSecondary,
  },
  comparison: {
    ...Typography.labelSm,
    fontWeight: "600",
  },
  empty: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
    opacity: 0.6,
  },
});
