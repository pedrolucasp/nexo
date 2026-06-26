import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index'
};

export default function MoodLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="entry" options={{
        headerTitle: "Registrar humor",
        headerShown: true
      }} />
      <Stack.Screen name="post-mood" options={{ headerShown: false }} />
    </Stack>
  );
}
