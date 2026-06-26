import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useNotificationObserver } from "@/hooks/useNotificationObserver";
import { AuthProvider } from "@/context/AuthContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const AppBootstrap = () => {
  useNotificationObserver();
  return null;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <AppBootstrap />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />

            <Stack.Screen
              name="profile"
              options={{
                title: "Editar perfil",
              }}
            />

            <Stack.Screen
              name="entry/mood-components"
              options={{
                presentation: "formSheet",
                title: "Editar Componentes",
                sheetAllowedDetents: [0.25, 0.5, 1],
                sheetInitialDetentIndex: 1,
              }}
            />

            <Stack.Screen
              name="care-actions/post-appointment"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="sleep/new"
              options={{
                title: "Registrar Sono",
              }}
            />

            <Stack.Screen
              name="triggers/new"
              options={{
                title: "Registrar Gatilho",
              }}
            />

            <Stack.Screen
              name="care-actions/new"
              options={{
                presentation: "formSheet",
                title: "Registrar Ação de Cuidado",
                sheetAllowedDetents: [0.25, 0.5, 0.7],
                sheetInitialDetentIndex: 1,
              }}
            />
            <Stack.Screen
              name="care-actions/medicine"
              options={{ title: "Medicamento" }}
            />
            <Stack.Screen
              name="care-actions/medicine-new"
              options={{ title: "Novo Medicamento" }}
            />
            <Stack.Screen
              name="care-actions/appointment"
              options={{ title: "Consulta" }}
            />
            <Stack.Screen
              name="care-actions/activity"
              options={{ title: "Atividade" }}
            />

            <Stack.Screen
              name="notifications"
              options={{
                presentation: "modal",
                title: "Notificações",
              }}
            />

            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
