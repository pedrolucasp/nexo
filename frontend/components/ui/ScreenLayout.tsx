import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Typography, Spacing, BorderRadius } from "@/constants/theme";
import { Text } from "@/components/ui/Text";

interface ScreenLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  onNotificationPress?: () => void;
  scrollEnabled?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  userName = "Usuário",
  userAvatar,
  onNotificationPress,
  scrollEnabled = true,
}) => {
  const router = useRouter();
  const textColor = useThemeColor({}, "text") as string;
  const backgroundColor = useThemeColor({}, "background") as string;
  const surfaceColor = useThemeColor({}, "surface") as string;
  const dividerColor = useThemeColor({}, "divider") as string;
  const accentBlue = useThemeColor({}, "accentBlue") as string;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={[styles.safeAreaView, { backgroundColor }]}
        edges={["top", "left", "right"]}
      >
        <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: dividerColor }]}>
          <View style={styles.headerLeft}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={[styles.avatar, { backgroundColor: accentBlue }]} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: accentBlue }]} />
            )}
            <View>
              <Text style={[styles.userName, { color: textColor }]}>Olá, {userName}</Text>
            </View>
          </View>

          <Pressable
            style={styles.notificationButton}
            onPress={onNotificationPress ?? (() => router.push("/notifications"))}
            hitSlop={8}
          >
            <IconSymbol size={24} name="notifications" color={textColor} />
          </Pressable>
        </View>

        <ScrollView
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollEnabled ? undefined : { flex: 1 }}
          scrollEventThrottle={16}
        >
          <View style={styles.scrollContent}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.inlineGapSm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: Typography.bodyLg.fontSize,
    fontWeight: "600",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  },
});

export default ScreenLayout;
