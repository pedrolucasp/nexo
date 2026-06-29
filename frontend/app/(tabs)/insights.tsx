import { View, Text, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/misc/themed-text";
import { ThemedView } from "@/components/misc/themed-view";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Cards";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { WeeklyResume } from "@/components/insights/WeeklyResume";
import { InsightCard, Highlight } from "@/components/insights/InsightCard";
import { MoodTrendWidget } from "@/components/insights/MoodTrendWidget";
import { EnergySleepWidget } from "@/components/insights/EnergySleepWidget";
import { TriggerPatternWidget } from "@/components/insights/TriggerPatternWidget";

export default function Insights() {
  const { user } = useAuth();

  return (
    <ScreenLayout
      userName={user.firstName}
      userAvatar={user.avatarURL}
      showNotificationBadge={true}
    >
      <WeeklyResume
        avgMood="Neutro"
        stats={[
          { label: "Média de Sono", value: "7.2h" },
          { label: "Humor Estável", value: "92%" },
        ]}
      />

      <Section>
        <SectionHeader title="Indicadores" subtitle="Baseado nos últimos 7 dias" />

        <EnergySleepWidget />

        <MoodTrendWidget />

        <TriggerPatternWidget />
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: Spacing.containerPadding,
    paddingBottom: 40,
  },

  // Hero card
  heroCard: {
    backgroundColor: Colors.light.textBlack,
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

  // Insight cards
  insightCardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  insightCardLeft: {
    flex: 1,
    gap: 6,
  },
  insightCategory: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: Colors.light.textSecondary,
  },
  insightBody: {
    ...Typography.bodyMd,
    color: Colors.light.text,
  },
  insightMetric: {
    ...Typography.headlineLg,
    fontSize: 22,
  },
});
