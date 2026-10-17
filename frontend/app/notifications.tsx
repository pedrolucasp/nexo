import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/Sections";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { useNotificationsInfinite } from "@/hooks";
import { Colors, Spacing } from "@/constants/theme";

export default function NotificationsInbox() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        testID="notifications-list"
        data={notifications}
        keyExtractor={(notification) => String(notification.id)}
        renderItem={({ item }) => <NotificationRow notification={item} />}
        ListHeaderComponent={
          notifications.length > 0 ? <SectionHeader title="Recentes" /> : null
        }
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.footer} color={Colors.light.tint} />
          ) : (
            <EmptyState
              title="Nenhuma notificação"
              subtitle="Avisaremos você quando algo chegar."
              icon="notifications-off-outline"
            />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={Colors.light.tint} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  },
  footer: {
    paddingVertical: Spacing.cardGap,
  },
});
