import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native'

import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />

          <Stack.Screen
            name="profile"
            options={{
              title: 'Editar perfil',
            }}
          />

          <Stack.Screen
            name="entry/mood-components"
            options={{
              presentation: 'formSheet',
              title: 'Editar Componentes',
              sheetAllowedDetents: [0.25, 0.5, 1],
              sheetInitialDetentIndex: 1
            }}
          />

          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
