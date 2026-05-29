import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native'
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { FilterPills } from '@/components/ui/FilterPills';
import { useAuth } from '@/context/AuthContext';
import { useHistoryFeed } from '@/hooks/useHistoryFeed';
import type { HistoryCategory } from '@/lib/history/types';
import { MoodHistoryCard } from '@/components/history/MoodHistoryCard'
import { SleepRecordCard } from '@/components/history/SleepRecordCard'

const FILTERS: { label: string; value: HistoryCategory | 'all' }[] = [
  { label: 'Tudo',          value: 'all'          },
  { label: 'Humor',         value: 'mood'         },
  { label: 'Sono',          value: 'sleep'        }
];

function HistoryCardRenderer({ card }: { card: HistoryCard }) {
  switch (card.category) {
    case 'mood':  return <MoodHistoryCard card={card as any} />
    case 'sleep': return <SleepRecordCard card={card as any} />
  }
}

export default function History() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<HistoryCategory | 'all'>('all');
  const grouped = useHistoryFeed(activeFilter);

  return (
    <ScreenLayout userName={user.firstName} userAvatar={user.avatarURL}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
      <ScrollView>
      <FilterPills active={activeFilter} onChange={setActiveFilter} />

        {Object.entries(grouped).map(([date, cards]) => (
          <Section key={date}>
            <SectionHeader title={date} />
            <View>
              {cards.map(card => (
                <HistoryCardRenderer key={card.id} card={card} />)
              )}
            </View>
          </Section>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
