import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Cards";
import { useInsight } from "@/hooks/useInsights.queries";
import { Ionicons } from "@expo/vector-icons";
import { Typography, Spacing, Colors, BorderRadius } from "@/constants/theme";

export const DailyEnergyWidget = () => {
  const { data: insight, isLoading } = useInsight("DAILY_ENERGY", 0);

  const metadata = insight?.metadata as {
    peak: number;
    trough: number;
    entryCount: number;
    avgEnergy: number;
  };

  const avgEnergy = metadata?.avgEnergy;
  const peak = metadata?.peak;

  const energyWidth = (avgEnergy / peak) * 100;
  const energySummary = () => {
    if (avgEnergy < 3) return "Energia baixa";
    if (avgEnergy < 5) return "Media baixa";
    if (avgEnergy < 7.5) return "Média Alta";
    return "Energia alta";
  };

  return (
    <Card style={styles.container}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexGrow: 0,
          paddingVertical: 10,
        }}
      >
        <Ionicons name="flash" size={20} color="#64748B" />

        <Text style={{ ...Typography.headlineMd, marginBottom: 10 }}>
          Energia
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="small" style={{ paddingBottom: 50 }} />
          </View>
        ) : insight ? (
          <>
            <Text style={{ ...Typography.headlineMd, marginBottom: 10 }}>
              {energySummary()}
            </Text>

            <View style={styles.lineTrack}>
              <View style={[styles.lineFill, { width: `${energyWidth}%` }]} />
            </View>
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
  empty: {
    ...Typography.labelSm,
    opacity: 0.5,
  },
  lineTrack: {
    height: 6,
    backgroundColor: Colors.light.divider,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
    overflow: "hidden",
  },
  lineFill: {
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: BorderRadius.full,
  },
  indicatorGreen: {
    color: Colors.light.tint,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 16.5,
  },
});
