import { Tabs } from "expo-router/js-tabs";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

import { HapticTab } from "@/components/misc/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors["light"].tabIconDefault,
        tabBarActiveTintColor: Colors["light"].tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="history" color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} testID="tab-history" />,
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Jornada",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book" color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} testID="tab-journey" />,
        }}
      />

      <Tabs.Screen
        name="new"
        options={{
          title: "Novo",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="add-circle" color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} testID="tab-new" />,
        }}
      />

      <Tabs.Screen
        name="actions"
        options={{
          title: "Ações",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bolt" color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} testID="tab-actions" />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="settings.fill" color={color} />
          ),
          tabBarButton: (props) => <HapticTab {...props} testID="tab-settings" />,
        }}
      />
    </Tabs>
  );
}
