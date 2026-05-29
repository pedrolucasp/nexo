// TODO: add a barrel import here ffs
import type { HistoryCard, HistoryCategory } from '@/lib/history/types'

export function mergeAndSort(cards: HistoryCard[][]): HistoryCard[] {
  return cards
  .flat()
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function groupByDate(cards: HistoryCard[]): Record<string, HistoryCard[]> {
  return cards.reduce<Record<string, HistoryCard[]>>((acc, card) => {
    const key = new Date(card.timestamp).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

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
