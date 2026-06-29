import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { router } from 'expo-router';

import { Card } from '@/components/ui/Cards';
import { Badge } from '@/components/ui/Badge';
import { getMood } from '@/constants/moods';
import { Colors, Spacing } from '@/constants/theme';
import { MoodEntry } from '@/lib/api';
import { getTimeBadge, formatMoment } from '@/lib/utils/time';

interface MoodEntryLogProps {
  entry: MoodEntry;
}

const MoodEntryLog = ({ entry }: MoodEntryLogProps) => {
  const moment = new Date(entry.moment);
  const moodDef = getMood(entry.selectedMood.toLowerCase());
  const badge = getTimeBadge(moment);

  const handlePress = () => router.push(`/entry/${entry.id}`);

  return (
    <Card style={styles.card} onPress={handlePress}>
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
