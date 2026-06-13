import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import {
  useState, useEffect
} from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from "@/context/AuthContext";

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const [expoPushToken, setExpoPushToken] = useState(user.pushToken);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {
    const notificationListener = Notifications
    .addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications
    .addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    setExpoPushToken(user.pushToken)
  }, [user]);

  async function sendPushNotification(expoPushToken: string) {
    if (expoPushToken) {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Oi meu querido',
        body: 'Vamo escutar um The Doors',
        data: { screen: 'notifications' },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={'dark'} />
      <KeyboardAvoidingView
        behavior='height'
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
        <View>
          <Text>
            Uma notificação!!!
          </Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>

        <Button
          title="Quer ver uma coisa?"
          onPress={async () => {
            await sendPushNotification(expoPushToken);
          }}
        />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'start',
    minHeight: '100%',
  },
  header: {
    alignItems: 'left',
    marginBottom: 40,
  },
});
