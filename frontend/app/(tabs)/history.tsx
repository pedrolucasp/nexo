import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';

export default function History() {
  const { user } = useAuth();

  return (
    <ScreenLayout userName={user.firstName} userAvatar={user.avatarURL}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
      <ThemedView>
        <ThemedText>
          History
        </ThemedText>
      </ThemedView>
    </ScreenLayout>
  )
}
