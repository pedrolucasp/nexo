import type { MoodEntry, SleepRecord } from '@/lib/api';
export type HistoryCategory = 'mood' | 'sleep' | 'trigger' | 'intervention'

export type HistoryBadge = {
  label: string
  variant: 'neutral' | 'warning' | 'success' | 'danger' | 'info'
}

export type HistoryCard = {
  id: string // "<category>-<id>" to avoid collisions
  category: HistoryCategory
  timestamp: string // ISO string — used for sorting and display
  title: string
  summary: string
  badge?: HistoryBadge,
  raw: MoodEntry | SleepRecord
}
