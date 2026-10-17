import { View, StyleSheet } from "react-native";
import { router, type Href } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { Badge } from "@/components/ui/Badge";
import { NOTIFICATION_KINDS } from "@/constants/notification-kinds";
import { formatMoment } from "@/lib/utils/time";
import { Spacing } from "@/constants/theme";
import type { Notification } from "@/lib/api";

type Props = {
  notification: Notification;
};

// A row is history once its relevance window has closed; a notification with no
// window (an insight alert) never expires
const isExpired = (notification: Notification): boolean =>
  notification.expiresAt !== null &&
  new Date(notification.expiresAt).getTime() <= Date.now();

// The same deep-link shape the push observer uses: a pathname plus params
function destination(notification: Notification): Href {
  if (notification.kind === "MEDICINE_REMINDER" && notification.regimenId !== null) {
    return {
      pathname: "/medicine-regimens/[id]",
      params: { id: String(notification.regimenId) },
    } as Href;
  }

  if (notification.kind === "MEDICINE_REMINDER") {
    return { pathname: "/medicine-regimens" } as Href;
  }

  if (notification.kind === "DAILY_REMINDER") {
    return { pathname: "/new/entry" } as Href;
  }

  return { pathname: "/insights" } as Href;
}

export function NotificationRow({ notification }: Props) {
  const meta = NOTIFICATION_KINDS[notification.kind];
  const expired = isExpired(notification);

  return (
    <Card
      style={styles.card}
      testID={`notification-${notification.id}`}
      onPress={() => router.push(destination(notification))}
    >
      <View style={[styles.row, expired && styles.expired]}>
        <View style={[styles.iconWrap, { backgroundColor: meta.iconBackground }]}>
          <MaterialIcons name={meta.icon} size={22} color={meta.color} />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>

            {expired && <Badge label="Expirada" variant="gray" />}
          </View>

          <Text style={styles.summary} numberOfLines={2}>
            {notification.body}
          </Text>

          <Text style={styles.moment}>
            {formatMoment(new Date(notification.scheduledFor))}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.cardGap,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  expired: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  title: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  summary: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  moment: {
    fontSize: 12,
    opacity: 0.45,
    marginTop: 4,
  },
});
