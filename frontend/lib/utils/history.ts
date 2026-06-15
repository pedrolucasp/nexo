// TODO: add a barrel import here ffs
import type { HistoryCard, HistoryCategory } from '@/lib/history/types'

export function mergeAndSort(cards: HistoryCard[][]): HistoryCard[] {
  return cards
  .flat()
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function groupByDate(cards: HistoryCard[]): Record<string, HistoryCard[]> {
  return cards.reduce<Record<string, HistoryCard[]>>((acc, card) => {
    // If the key for this card is sleep, we have to set the hours to
    // mid day since sleep records dont have a specific time
    if (card.category === 'sleep') {
      const date = new Date(card.timestamp)
      date.setHours(12)
      card.timestamp = date.toISOString()
    }

    const key = new Date(card.timestamp).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    if (card.category === 'sleep') {
      console.log("Key for this sleep card", key, card.timestamp)
    }

    // XXX: Hacky as fuck
    (acc[key] ??= []).push(card)

    return acc
  }, {})
}

export function filterByCategory(
  cards: HistoryCard[],
  active: HistoryCategory | 'all',
): HistoryCard[] {
  if (active === 'all') return cards
    return cards.filter(c => c.category === active)
}
