import { InsightMetricCard } from "@/components/insights/InsightMetricCard";
import { useInsight } from "@/hooks/useInsights.queries";
import { Colors } from "@/constants/theme";

const ENERGY_SCALE_MAX = 10;

export const DailyEnergyWidget = () => {
  const { data: insight, isLoading } = useInsight("DAILY_ENERGY");

  const metadata = insight?.metadata;
  const avgEnergy = metadata?.avgEnergy;
  const diffEnergy = metadata?.diffEnergy ?? null;

  return (
    <InsightMetricCard
      icon="flash"
      title="Energia"
      isLoading={isLoading}
      emptyMessage="Não há dados disponíveis para o dia de hoje"
      value={avgEnergy != null ? formatEnergy(avgEnergy) : undefined}
      windowLabel={metadata?.windowLabel}
      barRatio={
        avgEnergy != null
          ? Math.max(0, Math.min(1, avgEnergy / ENERGY_SCALE_MAX))
          : undefined
      }
      comparison={formatEnergyDiff(diffEnergy)}
      comparisonColor={energyDiffColor(diffEnergy)}
    />
  );
};

function formatEnergy(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

// Positive means more energy than yesterday; nothing to compare reads null
function formatEnergyDiff(diff: number | null): string | null {
  if (diff == null) return null;

  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";

  return `${sign}${Math.abs(diff).toFixed(1).replace(".", ",")} que ontem`;
}

function energyDiffColor(diff: number | null): string {
  if (diff == null || diff === 0) return Colors.light.textSecondary;

  return diff > 0 ? Colors.light.tint : Colors.light.danger;
}
