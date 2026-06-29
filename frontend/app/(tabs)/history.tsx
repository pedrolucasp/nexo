import { useState } from "react";
import { ScrollView, View } from "react-native";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { FilterPills } from "@/components/ui/FilterPills";
import { useAuth } from "@/context/AuthContext";
import { useHistoryFeed } from "@/hooks/useHistoryFeed";
import type { HistoryCard, HistoryCategory } from "@/lib/history/types";
import { MoodHistoryCard } from "@/components/history/MoodHistoryCard";
import { SleepRecordCard } from "@/components/history/SleepRecordCard";
import { TriggerHistoryCard } from "@/components/history/TriggerCard";
import { MedicineHistoryCard } from "@/components/history/MedicineHistoryCard";
import { AppointmentHistoryCard } from "@/components/history/AppointmentHistoryCard";
import { ActivityHistoryCard } from "@/components/history/ActivityHistoryCard";
import { EmptyState } from "@/components/ui/EmptyState";

function HistoryCardRenderer({ card }: { card: HistoryCard }) {
  switch (card.category) {
    case "mood":
      return <MoodHistoryCard card={card as any} />;
    case "sleep":
      return <SleepRecordCard card={card as any} />;
    case "trigger":
      return <TriggerHistoryCard card={card as any} />;
    case "care_action":
      switch (card.subtype) {
        case "medicine":
          return <MedicineHistoryCard card={card as any} />;
        case "appointment":
          return <AppointmentHistoryCard card={card as any} />;
        case "activity":
          return <ActivityHistoryCard card={card as any} />;
        default:
          return null;
      }
  }
}

export default function History() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<HistoryCategory | "all">(
    "all",
  );
  const grouped = useHistoryFeed(activeFilter);

  return (
    <ScreenLayout
      userName={user.firstName}
      userAvatar={user.avatarURL}
      showNotificationBadge={true}
    >
      <ScrollView>
        <FilterPills active={activeFilter} onChange={setActiveFilter} />

        {Object.keys(grouped).length === 0 ? (
          <EmptyState
            title="Nenhum registro encontrado"
            subtitle="Tente mudar o filtro ou adicione um novo registro."
            icon="time-outline"
          />
        ) : (
          Object.entries(grouped).map(([date, cards]) => (
            <Section key={date}>
              <SectionHeader title={date} />
              <View>
                {cards.map((card) => (
                  <HistoryCardRenderer key={card.id} card={card} />
                ))}
              </View>
            </Section>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
