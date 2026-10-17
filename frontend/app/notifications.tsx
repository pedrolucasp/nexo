import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Text } from "@/components/ui/Text";

import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing } from "@/constants/theme";
import { Card } from "@/components/ui/Cards";
import { Section, SectionHeader } from "@/components/ui/Sections";

type NotificationParams = {
  title?: string;
  body?: string;
  notificationId?: string;
};

type ReceivedNotification = {
  title?: string;
  body?: string;
};

export default function NotificationsPage() {
  const params = useLocalSearchParams<NotificationParams>();
  const [liveNotification, setLiveNotification] = useState<ReceivedNotification | null>(null);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      setLiveNotification({
        title: n.request.content.title ?? undefined,
        body: n.request.content.body ?? undefined,
      });
    });
    return () => sub.remove();
  }, []);

  const displayed = liveNotification ?? (params.title || params.body ? { title: params.title, body: params.body } : null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={"dark"} />
      <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Section>
            <SectionHeader title="Recebidas" />

            {displayed ? (
              <Card style={{ padding: Spacing.cardGap }}>
                <Text>Title: {displayed.title}</Text>
                <Text>Body: {displayed.body}</Text>
              </Card>
            ) : (
              <Card style={{ padding: Spacing.cardGap }}>
                <Text>Nenhuma notificação recebida.</Text>
              </Card>
            )}
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
    minHeight: "100%",
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 40,
  },
});
