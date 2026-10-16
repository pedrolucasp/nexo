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

// A single record is capped at 15h, but a day sums them, so guard the display
const MAX_SLEEP_HOURS = 24;

function formatHours(hours: number): string {
  if (hours >= MAX_SLEEP_HOURS) return `${MAX_SLEEP_HOURS}h+`;

  const minutes = Math.round(hours * 60);
  const h = Math.floor(minutes / 60);

  if (minutes % 60 === 0) return `${h}h`;

  return `${h}h ${minutes % 60}min`;
}
