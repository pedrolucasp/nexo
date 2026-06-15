import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Card } from '@/components/ui/Cards'
import { Badge } from '@/components/ui/Badge'
import type { SleepRecord } from '@/lib/api'
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router'

function sleepBadge(hours: number) {
  if (hours >= 7) return { label: 'Excelente', variant: 'green'  } as const
  if (hours >= 5) return { label: 'Regular', variant: 'yellow' } as const

  return {
    label: 'Ruim', variant: 'red'
  } as const
}

// TODO: Move this into the time utilities
function formatDuration(average: number) {
  const h = Math.floor(average)
  const m = Math.round((average - h) * 60)
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

type Props = { card: HistoryCard & { raw: SleepRecord } }

export function SleepRecordCard({ card }: Props) {
  const badge    = sleepBadge(card.raw.average)
  const duration = formatDuration(card.raw.average)

  const time     = new Date(card.timestamp)
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Card style={styles.card} onPress={() => router.push(`/sleep/${card.raw.id}`)}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: '#ede9fe' }]}>
          <MaterialIcons name="bedtime" size={22} color="#7c3aed" />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Sono</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <View style={styles.durationRow}>
            <Text style={styles.duration}>{duration}</Text>
          </View>
          {card.raw.annotations ? (
            <Text style={styles.summary} numberOfLines={2}>
              {card.raw.annotations.trim()}
            </Text>
          ) : null}
          <Badge label={badge.label} variant={badge.variant} style={styles.badge} />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.cardGap
  },
  row:         {
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
  body: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  title: {
    fontSize: 15,
    fontWeight: '600'
  },
  time: {
    fontSize: 13,
    opacity: 0.45
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  duration: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.75
  },
  summary: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic'
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    maxWidth: '50%'
  },
})
