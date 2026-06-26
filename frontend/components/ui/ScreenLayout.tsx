import React from "react";

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
import { ThemedText } from "@/components/misc/themed-text";

interface ScreenLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  onNotificationPress?: () => void;
  showNotificationBadge?: boolean;
  scrollEnabled?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  userName = "Usuário",
  userAvatar,
  onNotificationPress,
  showNotificationBadge = false,
  scrollEnabled = true,
}) => {
  const router = useRouter();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const dividerColor = useThemeColor({}, "divider");
  const accentBlue = useThemeColor({}, "accentBlue");
  const tintColor = useThemeColor({}, "tint");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    safeAreaView: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      paddingHorizontal: Spacing.containerPadding,
      paddingVertical: 12,
      backgroundColor: surfaceColor,
      borderBottomWidth: 1,
      borderBottomColor: dividerColor,
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
      backgroundColor: accentBlue,
    },
    userName: {
      fontSize: Typography.bodyLg.fontSize,
      fontWeight: "600",
      color: textColor,
    },
    notificationButton: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      justifyContent: "center",
      alignItems: "center",
      activeOpacity: 0.7,
    },
    notificationBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: tintColor,
    },
    scrollContent: {
      paddingHorizontal: Spacing.containerPadding,
      paddingVertical: Spacing.sectionGap,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={surfaceColor} />
      <SafeAreaView
        style={styles.safeAreaView}
        edges={["top", "left", "right"]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View>
              <ThemedText style={styles.userName}>Olá, {userName}</ThemedText>
            </View>
          </View>

          <Pressable
            style={styles.notificationButton}
            onPress={onNotificationPress ?? (() => router.push("/notifications"))}
            hitSlop={8}
          >
            <View
              style={{
                fontSize: 24,
                color: textColor,
              }}
            >
              <IconSymbol size={24} name="notifications" color={textColor} />
            </View>
            {showNotificationBadge && <View style={styles.notificationBadge} />}
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

export default ScreenLayout;
