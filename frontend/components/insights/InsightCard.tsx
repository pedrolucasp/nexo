import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Card } from "@/components/ui/Cards";
import { Colors, Spacing, Typography } from "@/constants/theme";

export type MetricAccent = "green" | "purple" | "neutral";

const metricColor: Record<MetricAccent, string> = {
  green: Colors.light.tint,
  purple: Colors.light.accentDarkPurple,
  neutral: Colors.light.text,
};

interface InsightCardProps {
  category: string;
  body: React.ReactNode;
  metric: string;
  accent?: MetricAccent;
  footnote?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  category,
  body,
  metric,
  accent = "neutral",
  footnote,
}) => (
  <Card style={styles.cardContainer}>
    <View style={styles.inner}>
      <View style={styles.left}>
        <Text style={styles.category}>{category}</Text>
        {typeof body === "string" ? (
          <Text style={styles.body}>{body}</Text>
        ) : (
          body
        )}
      </View>
      <Text style={[styles.metric, { color: metricColor[accent] }]}>
        {metric}
      </Text>
    </View>
    {footnote && (
      <>
        <View style={styles.divider} />
        <Text style={styles.footnote}>{footnote}</Text>
      </>
    )}
  </Card>
);

interface HighlightProps {
  children: React.ReactNode;
  color?: string;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  color = Colors.light.tint,
}) => <Text style={{ color, fontWeight: "700" }}>{children}</Text>;

const styles = StyleSheet.create({
  cardContainer: {
    padding: Spacing.cardGap,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.light.textSecondary,
  },
  body: {
    ...Typography.bodyMd,
    color: Colors.light.text,
  },
  metric: {
    ...Typography.headlineLg,
    fontSize: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.divider,
    marginTop: Spacing.cardGap,
    marginBottom: 8,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
  },
});
