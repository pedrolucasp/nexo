import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SectionHeader } from "@/components/ui/Sections";
import { FilterPills } from "@/components/ui/FilterPills";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { historyKeys, useHistory } from "@/hooks";
import type { HistoryCard, HistoryCategory } from "@/lib/history/types";
import { mapHistoryItemToCard } from "@/lib/history/mappers";
import { groupByDate } from "@/lib/utils/history";
import { Colors, Spacing } from "@/constants/theme";
import { MoodHistoryCard } from "@/components/history/MoodHistoryCard";
import { SleepRecordCard } from "@/components/history/SleepRecordCard";
import { TriggerHistoryCard } from "@/components/history/TriggerCard";
import { MedicineHistoryCard } from "@/components/history/MedicineHistoryCard";
import { AppointmentHistoryCard } from "@/components/history/AppointmentHistoryCard";
import { ActivityHistoryCard } from "@/components/history/ActivityHistoryCard";

function HistoryCardRenderer({ card }: { card: HistoryCard }) {
  switch (card.category) {
    case "mood":
      return <MoodHistoryCard card={card} />;
    case "sleep":
      return <SleepRecordCard card={card} />;
    case "trigger":
      return <TriggerHistoryCard card={card} />;
    case "care_action":
      switch (card.subtype) {
        case "medicine":
          return <MedicineHistoryCard card={card} />;
        case "appointment":
          return <AppointmentHistoryCard card={card} />;
        case "activity":
          return <ActivityHistoryCard card={card} />;
        default:
          return null;
      }
  }
}

export default function History() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<HistoryCategory | "all">(
    "all",
  );
  const [refreshing, setRefreshing] = useState(false);

  const kind = activeFilter === "all" ? undefined : activeFilter;

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useHistory(kind);

  const sections = useMemo(() => {
    const cards = (data?.pages ?? [])
      .flatMap((page) => page.items)
      .map(mapHistoryItemToCard);

    return Object.entries(groupByDate(cards)).map(([title, items]) => ({
      title,
      data: items,
    }));
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      fetchNextPage();
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.resetQueries({ queryKey: historyKeys.infinite(kind) });
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmpty = () => {
    if (isLoading) {
      return refreshing ? null : (
        <View style={styles.state}>
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.state}>
          <Button
            title="Tentar novamente"
            variant="outline"
            size="small"
            onPress={() => refetch()}
          />
        </View>
      );
    }

    return (
      <EmptyState
        title="Nenhum registro encontrado"
        subtitle="Tente mudar o filtro ou adicione um novo registro."
        icon="time-outline"
      />
    );
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      );
    }

    if (isFetchNextPageError) {
      return (
        <View style={styles.footer}>
          <Button
            title="Tentar novamente"
            variant="outline"
            size="small"
            onPress={() => fetchNextPage()}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenLayout
      userName={user?.firstName}
      userAvatar={user?.avatarURL}
      scrollable={false}
    >
      {/* Prefetch the next page about one card before the end */}
      <SectionList
        testID="history-list"
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        renderItem={({ item, index, section }) => (
          <View
            style={[index === section.data.length - 1 && styles.sectionEnd]}
          >
            <HistoryCardRenderer card={item} />
          </View>
        )}
        ListHeaderComponent={
          <FilterPills active={activeFilter} onChange={setActiveFilter} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.2}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    flexGrow: 1,
  },
  state: {
    paddingVertical: Spacing.sectionGap,
    alignItems: "center",
  },
  footer: {
    paddingVertical: Spacing.cardGap,
    alignItems: "center",
  },
  sectionEnd: {
    marginBottom: Spacing.sectionGap,
  },
});
