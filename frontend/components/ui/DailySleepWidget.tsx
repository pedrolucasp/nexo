import { InsightMetricCard } from "@/components/insights/InsightMetricCard";
import { useInsight } from "@/hooks/useInsights.queries";
import { Colors } from "@/constants/theme";

export const DailySleepWidget = () => {
  const { data: insight, isLoading } = useInsight("DAILY_SLEEP");

  const metadata = insight?.metadata;
  const diffMinutes = metadata?.diffMinutes ?? null;

  return (
    <InsightMetricCard
      icon="moon"
      title="Sono"
      iconColor={Colors.light.accentDarkPurple}
      iconBackground={Colors.light.accentPurple}
      isLoading={isLoading}
      emptyMessage="Não há dados disponíveis para o dia de hoje"
      value={
        metadata?.totalHours != null
          ? formatHours(metadata.totalHours)
          : undefined
      }
      windowLabel={metadata?.windowLabel}
      detail={metadata?.napStr || undefined}
      comparison={metadata?.diffStr || null}
      comparisonColor={
        diffMinutes != null && diffMinutes < 0
          ? Colors.light.danger
          : Colors.light.tint
      }
    />
  );
};

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) return `${h}h`;

  return `${h}h ${m}min`;
}
