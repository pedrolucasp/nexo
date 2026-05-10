import { useState, useEffect } from 'react';
import {
  Link, router, useLocalSearchParams
} from 'expo-router';

import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Grid, Col, Row, Between, Center } from '@/components/ui/LayoutHelpers';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { Spacing, Typography, Colors } from '@/constants/theme';

export default function NewMoodEntry() {
  const { user } = useAuth();
  // TODO: transform this into a specific mood component
  const { initialMood } = useLocalSearchParams();

  return (
    <View>
      <ScrollView
        scrollEventThrottle={16}>
        <View style={styles.container}>
          <Center>
            <ThemedText style={styles.statusPrefix}>
              Como você está se sentindo agora?
            </ThemedText>

            <ThemedText style={styles.statusText}>
              Muito Bem
            </ThemedText>
          </Center>

          <Card style={styles.resumeCard}>
          </Card>

          <Card style={styles.annotationsCard}>
            <TextArea
              label="Notas sobre o dia"
              type="text"
              variant="darkGhost"
              onChangeText={(val) => console.log(val)}
              minRows={4}
              maxRows={6}
              placeholder="Escreva uma nota rápida sobre o seu dia..."
            />
          </Card>

          <Section>
            <SectionHeader title="Componentes do Humor" info="Editar" />
            <Grid gap={4}>
              <Card style={{height: 38}} />
              <Card style={{height: 38}} />
            </Grid>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  },
  statusText: {
    ...Typography.headlineXg,
  },
  statusPrefix: {
    ...Typography.bodyMd
  },
  annotationsCard: {
    padding: Spacing.cardGap
  },
  resumeCard: {
    height: 361
  }
});
