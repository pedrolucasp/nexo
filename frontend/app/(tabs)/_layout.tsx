import { Tabs, Redirect, router } from "expo-router";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import { HapticTab } from "@/components/misc/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading]);

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
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="history" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Jornada",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="new"
        options={{
          title: "Novo",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="add-circle" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="actions"
        options={{
          title: "Ações",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bolt" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="settings.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
