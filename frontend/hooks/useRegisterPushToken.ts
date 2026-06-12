// hooks/useRegisterPushToken.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission denied");
    return null;
  }

  // TODO: Experiment with different vibration patterns
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  return token;
}
