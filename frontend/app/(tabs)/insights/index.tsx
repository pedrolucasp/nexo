import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';

export default function Insights() {
  const { user } = useAuth();

  return (
    <ScreenLayout userName={user.firstName}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
      <ThemedView>
        <ThemedText>
          Insights
        </ThemedText>
      </ThemedView>
    </ScreenLayout>
  )
}
