// components/history/cards/MoodHistoryCard.tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Cards';
import { Badge } from '@/components/ui/Badge';
import type { HistoryCard } from '@/lib/history/types';
import type { MoodEntry } from '@/lib/api';
import { Spacing } from '@/constants/theme';
import { getMood } from '@/constants/moods';
import { format } from 'date-fns';
import { router } from 'expo-router';

function inferBadge(anxiety: number, stress: number, energy: number) {
  if (anxiety >= 7) return { label: 'Ansiedade alta', variant: 'red'    } as const
  if (stress  >= 7) return { label: 'Estresse alto',  variant: 'orange' } as const
  if (energy  <= 3) return { label: 'Energia baixa',  variant: 'yellow' } as const
  if (energy  >= 7) return { label: 'Energia alta', variant: 'green' } as const

  return undefined
}

// TODO: Perhaps we could move these into the constants instead and use it everywhere?
const MOOD_META: Record<string, { color: string; bg: string }> = {
  GREAT:   { color: '#16a34a', bg: '#dcfce7' },
  GOOD:    { color: '#2563eb', bg: '#dbeafe' },
  NEUTRAL: { color: '#d97706', bg: '#fef3c7' },
  SAD:     { color: '#7c3aed', bg: '#ede9fe' },
  ANGRY:   { color: '#dc2626', bg: '#fee2e2' },
}

type Props = { card: HistoryCard & { raw: MoodEntry } }

export function MoodHistoryCard({ card }: Props) {
  const meta = MOOD_META[card.raw.selectedMood] ?? MOOD_META.NEUTRAL
  const badge = inferBadge(card.raw.anxietyLevel, card.raw.stressLevel, card.raw.energyLevel)
  const time = format(card.timestamp, 'HH:mm')
  const moodDef = getMood(card.raw.selectedMood.toLowerCase());

  return (
    <Card style={styles.card} onPress={() => router.push(`/entry/${card.raw.id}`)}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Text style={styles.moodIconEmoji}>{moodDef?.icon ?? '😐'}</Text>

          {false && (<MaterialIcons name={meta.icon} size={22} color={meta.color} />)}
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{moodDef.label}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          {card.raw.annotation ? (
            <Text style={styles.summary} numberOfLines={2}>
              {card.raw.annotation?.trim()}
            </Text>
          ) : null}
          {(badge ? (<Badge label={badge.label} variant={badge.variant} style={styles.badge}/>) : null)}
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.cardGap
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  title: {
    fontSize: 15,
    fontWeight: '600'
  },
  moodIconEmoji: {
    fontSize: 26,
  },
  time: {
    fontSize: 13,
    opacity: 0.45
  },
  summary: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
    marginBottom: 6,
    fontStyle: 'italic'
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    maxWidth: '50%'
  }
})
