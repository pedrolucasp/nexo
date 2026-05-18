import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator
} from 'react-native';

import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Grid, Col, Row, Between } from '@/components/ui/LayoutHelpers';
import { Card } from '@/components/ui/Cards';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { MoodSelector } from '@/components/ui/EmojiSelectors';
import { Typography, Spacing, Shadows, Colors } from '@/constants/theme';
import { router } from 'expo-router';
import {
  MoodDefinition, MOODS
} from '@/constants/moods'

import {
  useThemeColor,
  useMoodEntries
} from '@/hooks';

import MoodEntryLog from '@/components/ui/MoodEntryLog';

export default function New() {
  const { user } = useAuth();
  const [mood, setMood] = useState<string>('good');
  const { data, isLoading } = useMoodEntries({ limit: 5 });
  const recentEntries = data?.entries ?? [];

  console.log("entries: ", data, recentEntries)

  const initQuickRegister = () => {
    // TODO: Set down on camelCase vs kebab case
    router.navigate(`/new/entry?initialMood=${mood}`)
  };

  return (
    <ScreenLayout userName={user.firstName} userAvatar={user.avatarURL}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
        <Section>
          <SectionHeader
            title="Como você está hoje?"
            subtitle="Sua jornada começa agora"
            >
          </SectionHeader>

          <Card style={{ minHeight: 200 }}>
            <Col gap={16}>
              <Between style={styles.quickRegisterHeader}>
                <ThemedText style={styles.quickRegisterTitle}>
                  Registro rápido
                </ThemedText>

                <ThemedText style={styles.quickRegisterBadge}>
                  HOJE
                </ThemedText>
              </Between>

              <MoodSelector
                style={{paddingLeft: 8, paddingRight: 8, paddingTop: 16 }}
                items={MOODS}
                value={mood}
                onSelect={setMood}
              />

              <Button
                title="Salvar Humor"
                onPress={initQuickRegister}
                style={styles.quickRegisterButton}
              />
            </Col>
          </Card>
        </Section>

        {/* TODO: Check whether we gonna have to generate these on demand */}
        <Section>
          <Grid gap={4}>
            <Card style={{minHeight: 150, backgroundColor: 'powderblue'}}>
            </Card>

            <Card style={{minHeight: 150, backgroundColor: 'tomato'}}>
            </Card>
          </Grid>
        </Section>

        <Section>
          <SectionHeader title="Registros recentes" />

          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Col gap={8}>
              {recentEntries.map((entry) => (
                <MoodEntryLog key={entry.id} entry={entry} />
              ))}
            </Col>
          )}
        </Section>
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  quickRegisterHeader: {
    marginTop: 16,
    paddingLeft: 16,
    paddingRight: 16
  },
  quickRegisterTitle: {
    ...Typography.bodyLg
  },
  // TODO: Replace when we have badges
  quickRegisterBadge: {
    fontSize: 12,
    lineHeight: 16
  },
  quickRegisterButton: {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 16,
    ...Shadows.lg
  }
});
