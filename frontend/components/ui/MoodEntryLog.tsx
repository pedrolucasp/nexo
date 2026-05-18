import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Cards';
import { Badge } from '@/components/ui/Badge';
import { getMood } from '@/constants/moods';
import { Colors, Spacing } from '@/constants/theme';
import { MoodEntry } from '@/lib/api';

type TimeBadgeVariant = 'morning' | 'afternoon' | 'night' | 'latenight';

const TIME_BADGES: Record<TimeBadgeVariant, { label: string; variant: string; }> = {
  morning:   { label: 'Manhã',     variant: 'green' },
  afternoon: { label: 'Tarde',     variant: 'orange' },
  night:     { label: 'Noite',     variant: 'blue' },
  latenight: { label: 'Madrugada', variant: 'purple' },
};

function getTimeBadge(date: Date) {
  const h = date.getHours();
  if (h >= 6  && h < 12) return TIME_BADGES.morning;
  if (h >= 12 && h < 18) return TIME_BADGES.afternoon;
  if (h >= 18 && h < 24) return TIME_BADGES.night;
  return TIME_BADGES.latenight;
}

function formatMoment(date: Date): string {
  if (isToday(date))     return `Hoje às ${format(date, "HH'h'mm")}`;
  if (isYesterday(date)) return `Ontem às ${format(date, "HH'h'mm")}`;
  return format(date, "d 'de' MMM 'às' HH'h'mm", { locale: ptBR });
}

interface MoodEntryLogProps {
  entry: MoodEntry;
}

const MoodEntryLog = ({ entry }: MoodEntryLogProps) => {
  const moment = new Date(entry.moment);
  const moodDef = getMood(entry.selectedMood.toLowerCase());
  const badge = getTimeBadge(moment);

  return (
    <Card style={styles.card}>
      <View style={styles.moodIcon}>
        <Text style={styles.moodIconEmoji}>{moodDef?.icon ?? '😐'}</Text>
      </View>

      <View style={styles.moodBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {moodDef?.label ?? entry.selectedMood}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {formatMoment(moment)}
        </Text>
      </View>

      <Badge
        label={badge.label}
        variant={badge.variant}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
    padding: Spacing.cardGap
  },
  moodIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moodIconEmoji: {
    fontSize: 26,
  },
  // Text
  moodBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    letterSpacing: 0.1,
  },
});

export default MoodEntryLog
