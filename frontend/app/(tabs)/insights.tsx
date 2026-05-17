import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader } from '@/components/ui/Cards'
import { Section, SectionHeader } from '@/components/ui/Sections'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Spacing, BorderRadius } from '@/constants/theme'
import { Grid } from '@/components/ui/LayoutHelpers'

export default function Insights() {
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background')
  const accentPurple = useThemeColor({}, 'accentPurple')

  return (
    <ScreenLayout userName={user.firstName}
      userAvatar={user.avatarURL}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
      <ThemedView>
        <Section>
          <SectionHeader
            title="Tendências da Semana"
            info="Últimos 7 dias"
          />
          <Card variant="default" style={{ height: 200 }} />
        </Section>

        <Section>
          <SectionHeader title="Insights de Saúde" />
          <Grid gap={8}>
            <Card style={{ height: 150, backgroundColor: accentPurple }} />
            <Card style={{ height: 150, backgroundColor: 'powderblue' }} />
          </Grid>
        </Section>
      </ThemedView>
    </ScreenLayout>
  )
}
